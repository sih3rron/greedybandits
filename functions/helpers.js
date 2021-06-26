require('dotenv').config()
const fetch = require('node-fetch');

module.exports = {
	runPatch: function runPatch(index){
		const target = `https://app.launchdarkly.com/api/v2/flags/${process.env.PROJECT}/${process.env.FLAG}`;
		let patchConfig = {
			"method": "PATCH",
			"headers": {
				"Content-Type": "application/json",
				"authorization": process.env.API_TOKEN,
				"LD-API-Version": "beta"
			},
			"body": JSON.stringify({
				"comment": "This is an Automated MABs allocation",
				"patch": [{ 
					"op": "replace",
					"path": "/environments/production/fallthrough/rollout/experimentAllocation/defaultVariation",
					"value": index
				}]
			})
		}
		fetch(target, patchConfig)
		.then(response => {response.status === 200 ? console.log("Fine.") : console.error(`We have a ${response.status}`)})
		.catch((error) => {console.log(error)})
	
	}
}