require('dotenv').config()
const fetch = require('node-fetch');

module.exports = {
	runFallthroughPatch: function runFallThroughPatch(index){
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
		.then(response => {response.status === 200 ? console.log("FT: Fine.") : console.error(`FT: We have a ${response.status}`)})
		.catch((error) => {console.log(error)})
	
	},
	runRulesPatch: function runRulesPatch(index, findExperiment){
		const target = `https://app.launchdarkly.com/api/v2/flags/${process.env.PROJECT}/${process.env.FLAG}`;
		let config = {
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
						"path": "/environments/production/rules/"+findExperiment+"/rollout/experimentAllocation/defaultVariation",
						"value": index
					}]
			})
		}
		fetch(target, config)
		.then(response => {response.status === 200 ? console.log("R: Fine.") : console.error(`R: We have a ${response.status}`)})
		.catch((error) => {console.log(error)})
	}
}