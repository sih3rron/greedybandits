// Rules or Fallthrough?
module.exports = {
	rules: function findRules(rules){
		let ruleRoll = [];
		let ruleRollIdx;
		var ruleMap = rules.map((rule, i) => {
			if(rule.rollout !== undefined) {
				ruleRoll = rule.rollout
				ruleRollIdx = i
				console.log(ruleRoll.hasOwnProperty("experimentAllocation"))
				if(ruleRoll.hasOwnProperty("experimentAllocation") === true) return ruleRollIdx 	
			}

		})
		return ruleMap[ruleRollIdx]
	}
}
