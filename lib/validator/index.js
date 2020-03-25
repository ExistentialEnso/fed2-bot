/**
 * This library can validate the user's bot configuration to ensure that it doesn't have obvious 
 * errors. It is not fool-proof, as it cannot do things like verify the to/from paths in the planet 
 * data, but it catches a lot of obvious problems.
 */

const chalk = require('chalk')

const stepTypes = [
    "MOVE",
    "TRADE",
    "WALK_UP",
    "HAUL_OUT",
    "HAUL_IN"
]

/**
 * Ensure the steps.js file doesn't have obvious errors
 */
function validateSteps(steps) {
    let startingPlanet = steps[0].from
    let previousEndsAt = "NONE"

    let valid = true

    for(let step of steps) {
        if(!step.type) {
            console.log(chalk.red("ERROR! Steps require a type: " + JSON.stringify(step)))
            valid = false
        }

        if(!step.from && (step.type === "MOVE" || step.type === "TRADE")) {
            console.log(chalk.red("ERROR! Steps of this type require a from: " + JSON.stringify(step)))
            valid = false
        }

        if(!step.to && (step.type === "MOVE" || step.type === "TRADE")) {
            console.log(chalk.red("ERROR! Steps of this type require a to: " + JSON.stringify(step)))
            valid = false
        }

        if(stepTypes.indexOf(step.type) == -1) {
            console.log(chalk.red("ERROR! Invalid step type: " + step.type))
            valid = false
        }

        if(step.from && step.to && step.from === step.to) {
            console.log(chalk.red("ERROR! A step can't have the same from & to values: " + JSON.stringify(step)))
        }

        if(previousEndsAt !== "NONE" && previousEndsAt !== step.from && step.type !== "WALK_UP") {
            console.log(chalk.red("ERROR! Previous step ended at a different planet: " + JSON.stringify(step)))
            valid = false
        }

        if(step.type === "TRADE" || step.type === "HAUL_OUT") {
            previousEndsAt = step.from
        } else if(step.type === "MOVE") {
            previousEndsAt = step.to
        }
    }

    if(startingPlanet !== previousEndsAt) {
        console.log(chalk.red("ERROR! The last step does not put you back on the starting planet."))
        valid = false
    }

    return valid
}

/**
 * Ensure the planets.js file doesn't have obvious errors
 */
function validatePlanets(planets) {
    // Innocent until proven guilty
    let valid = true

    // Make sure at least one planet has a restaurant
    let foundRestaurant = false

    for(let planet in planets) {
        const planetData = planets[planet]

        if(!planetData.toExchange) {
            console.log(chalk.red(`ERROR! Planet ${planet} is missing required field toExchange.`))
            valid = false
        }

        if(!planetData.fromExchange) {
            console.log(chalk.red(`ERROR! Planet ${planet} is missing required field fromExchange.`))
            valid = false
        }

        if(!planetData.toLink) {
            console.log(chalk.red(`ERROR! Planet ${planet} is missing required field toLink.`))
            valid = false
        }

        if(!planetData.fromLink) {
            console.log(chalk.red(`ERROR! Planet ${planet} is missing required field fromLink.`))
            valid = false
        }

        if(planetData.toRestaurant && planetData.fromRestaurant)
            foundRestaurant = true
    }

    if(!foundRestaurant) {
        console.log(chalk.red("ERROR! No planets have restaurants defined. Need at least one restaurant."))
        valid = false
    }

    return valid
}

module.exports = {
    validatePlanets: validatePlanets,
    validateSteps: validateSteps
}