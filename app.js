//Package imports
require('dotenv').config()
const express = require('express')
const path = require('path');
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');
const LaunchDarkly = require('launchdarkly-node-server-sdk');
const { runPatch } = require('./functions/helpers');
var app = express();
var patchCall = require('./functions/helpers')

const port = process.env.PORT || 8080

//URI
const getResults = `https://app.launchdarkly.com/api/v2/flags/${process.env.PROJECT}/${process.env.FLAG}/experiments/${process.env.ENV}/${process.env.METRIC_KEY}`;
const targetFlag = `https://app.launchdarkly.com/api/v2/flags/${process.env.PROJECT}/${process.env.FLAG}?env=${process.env.ENV}`;

//Container Variables for MABs data retrieval
let treatments = []
let totals = []
let flagData = []

//Fetch header config
let getConfig = {
	"method": "GET",
	"headers": {
		"Content-Type": "application/json",
		"authorization": process.env.API_TOKEN,
		"LD-API-Version": "beta"
	}
}

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

//LD Flag Logic and experiment 'stuff - this is so I had an active experiment to work with.
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
//Responses parsed into:
// 1. Data on the entire flag.
// 2. All of the Flag variations.
// 3. The cumulative totals for each variation (or treatment)

	flagData = json[1]
	metadata = json[0].metadata
	totals = json[0].totals

// Is the flag on ? true : false
	let on = flagData.environments.production.on
	console.log(on ? true : false);

// Is the experiment live ? true : false
	let isExperimentActive = flagData.experiments.items[0].environments
	console.log(Array.isArray(isExperimentActive)  && isExperimentActive.length > 0 ? true : false)

//Combining the Cumulative Treatment data with the metadata so we have a clear picture of optimal variant and the variants indices.
	let wholeMetadata = metadata.map((item, i) => Object.assign({}, item, totals[i]));
	let completeMetadata = wholeMetadata.map((item, idx) => ({idx, ...item}));

//Your maximum conversion rate
	let maxConversion = Math.max.apply(Math, completeMetadata.map((variant) => { 
		return variant.cumulativeConversionRate.toFixed(3) * 100;
	}))

//Output the best performer for 'now'
	let highestPerformer = completeMetadata.find((variant) => { return variant.cumulativeConversionRate.toFixed(3) * 100 == maxConversion })
	console.log(highestPerformer.idx)
	patchCall.runPatch(highestPerformer.idx)

})
.catch(error => {
	console.warn(error);
})
