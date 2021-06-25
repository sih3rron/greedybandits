## Epsilon Greedy - Multi-Arm Bandits.

In the world of hypothesis testing there are many kinds of Bandits algorithms. The code in this repo is a start towards demonstrating how you can run an **Epsilon Greedy** version of a Bandit with LaunchDarkly's experimentation product.

#### Brief Synopsis

Bandits algorithms are used as a means to exploit particular situations where you don't want to wait for your experiments to complete before you can capitalise on their value. The idea is to focus on manipulating a specific variable in order to gain more of a specific outcome. 

Some good examples might be: 

* eCommerce offers that have a very small window of promotion.
* Experimentation on sites with very little traffic.
* Optimising for the best performing data stream.

> **NOTE**: Statistical concepts such as 'Significance' are less relevant with this style of bandit as we are looking to capitalise on an outcome in as near-term as possible.

#### OK, so what are we actually doing?

In this instance we would we looking to do the following: 

1. Portion off a small subset of our audience (_whatever that audience may look like_) to experiment on. 
2. We divide that into our variations/treatments as we would do with any other experiment.
3. Assign our metrics, noting our Primary metric of focus. This is very important as this primary metric will be our barometer for changes.

For now, lets say we have an experiment comprised of three variations and each variation has 5% of our audience assigned too it.

- 85% of our total audience remains unexposed to our experiment. At this time they will be exposed to the same experience as our control group.
- 15% of our total audience is participating in our experiment.  
-- 5% to our **control**.   
-- 5% to our **B variation**.   
-- 5% to our **C variation**.   


|Everyone Else| Control | Variation B| Variation C|
|:----------|:----------|:----------|:----------|
|85%|5%|5%|5%|

