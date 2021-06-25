//Package includes
require('dotenv').config()
const express = require('express')
const path = require('path');
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');
const LaunchDarkly = require('launchdarkly-node-server-sdk');
var app = express();
const flagPatch = require('./flagPatch.json')

//variable assignments
const port = process.env.PORT || 8080
const getResults = `https://app.launchdarkly.com/api/v2/flags/${process.env.PROJECT}/${process.env.FLAG}/experiments/${process.env.ENV}/${process.env.METRIC_KEY}`;
const targetFlag = `https://app.launchdarkly.com/api/v2/flags/${process.env.PROJECT}/${process.env.FLAG}?env=${process.env.ENV}`;

// User Context for Experiment.
var context = {
	key: uuidv4(),
	country: "UK",
	city: "London",
	ip: "127.0.0.1",
	privateAttributeNames: ["ip", "LTV"],
	custom: {
	  groups: ["Beta", "Internal", "High Volume"],
	  loyaltyMember: false,
	  requestTime: Math.round(new Date().getTime() / 1000),
	  LTV: "Z142456",
	  platformBrand: "Samsung",
	  platform: "Roku",
	  version: "4.3.8"
	}
  }
console.log(context.key)

//Container Variables for MABs data retrieval
let totals = []
let flagData = []

//Fetch configs
let getConfig = {
	"method": "GET",
	"headers": {
		"Content-Type": "application/json",
		"authorization": process.env.API_TOKEN,
		"LD-API-Version": "beta"
	}
}

let patchConfig = {
	"method": "PATCH",
	"headers": {
		"Content-Type": "application/json; domain-model=launchdarkly.semanticpatch",
		"authorization": process.env.API_TOKEN,
		"LD-API-Version": "beta"
	},
	"body": JSON.stringify(flagPatch)
}

//LD Flag Logic.
const ldClient = LaunchDarkly.init(process.env.SDK_KEY);
ldClient.once('ready', () => {
ldClient.variation(process.env.FLAG, context, ", something is wrong?!?", 
	(err, feature) => {
			app.set('view engine', 'pug');
			app.set('views', path.join(__dirname, `views`));
			app.get('/', (req, res) => {
				console.log(feature)
				res.render('index', {
					feature: feature,
					context: JSON.stringify(context)
				});
			})
			app.listen(port, () => {
				console.log(`${feature} is available on port ${port}!`)
			})
		ldClient.flush()
		})
	})

// MABs Data retrieval logic.

Promise.all([
	fetch(getResults, getConfig).then(response => response.json()),
	fetch(targetFlag, getConfig).then(response => response.json())
])
.then(json => {
	totals = json[0].totals
	flagData = json[1]
	let on = flagData.environments.production.on
	console.log(on ? "I'm on." : "I'm off.");
	//console.log(flagData.environments.production.fallthrough.rollout.variations)
	//flagData.experiments.baselineIdx = '0';
	//console.log(flagData.experiments);
	//The optimal rate for right now.
	//Math.max.apply(Math, totals.map(function(total) { 
	//	return total.cumulativeConversionRate.toFixed(3) * 100;
	//}))
})
.catch(error => {
	console.warn(error);
})

fetch(targetFlag, patchConfig)