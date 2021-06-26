require('dotenv').config()
const fetch = require('node-fetch');

module.exports = {
	runPatch: function runPatch(index){
		const target = `https://app.launchdarkly.com/api/v2/flags/${process.env.PROJECT}/${process.env.FLAG}?env=${process.env.ENV}`;
		let patchConfig = {
			"method": "PATCH",
			"headers": {
				"Content-Type": "application/json; domain-model=launchdarkly.semanticpatch",
				"authorization": process.env.API_TOKEN,
				"LD-API-Version": "beta"
			},
			"body": [{
				"comment": "This is an Automated MABs allocation",
				"patch": [{ 
					"op": "replace",
					"path": "/environments/production/fallthrough/rollout/experimentAllocation/defaultVariation",
					"value": 0
				}]
			}]
		}

		fetch(target, patchConfig).then(response => {console.log(response.status)}).catch((error) => {console.log(error)})
	
	}
}



