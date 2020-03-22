const Telnet = require('telnet-client')
const _ = require('lodash')
const chalk = require('chalk')

// Load in our .env file
require('dotenv').config()

// How many cargo bays are in your ship?
const CARGO_BAYS = 12

// What is the cutoff to determine deficits?
const DEFICIT_MAX = -500

// What is the cutoff to determine surpluses?
const SURPLUS_MIN = 19000

// How many minutes to sleep between each cycle?
const SLEEP_MINUTES = 15

// How low should stamina go before we buy food?
const STAMINA_MIN = 25

// Useful regexes for pulling out data
let commodRegex = new RegExp("([A-Z,a-z]*): value ([0-9]*)ig/ton  Spread: ([0-9]*)%   Stock: current ([-0-9]*)")
let staminaRegex = new RegExp("Stamina      max:  ([0-9]*) current:  ([0-9]*)")
let bankBalanceRegex = new RegExp("Bank Balance: ([0-9,\,]*)ig")
let cargoSpaceRegex = new RegExp("Cargo space:    ([0-9]*)/([0-9]*)")
let currentPlanetRegex = new RegExp("You are currently on ([A-Z,a-z,0-9]*) in the")

let lastBankBalance = 0

const planets = require("./planets")
const steps = require("./steps")

/**
* Easily lets us wait for a specified period of time with await
*/
function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
}   

/**
 * The main function that starts up everything else
 */
async function run() {
    const connection = new Telnet()

    let params = {
        host: 'play.federation2.com',
        port: 30003,
        negotiationMandatory: false
    }

    try {
        await connection.connect(params)
    } catch(error) {
        console.log("Error!")
        console.log(error)
    }

    console.log("Validating steps data for errors.")
    validateSteps(steps)

    console.log("Validating planets data for errors.")
    validatePlanets(planets)

    console.log("Connected to Federation 2!")

    // Authenticate the user
    await connection.send(process.env.FED_USERNAME)
    await connection.send(process.env.FED_PASSWORD)

    await sleep(2000)

    while(true) {
        await runCycle(connection)

        console.log(`Sleeping for ${SLEEP_MINUTES} minutes.`)

        // Sleep until we need to repeat the cycle again
        await sleep(1000 * 60 * SLEEP_MINUTES)
    }
}

function validateSteps() {
    let startingPlanet = steps[0].from
    let previousEndsAt = "NONE"

    for(let step of steps) {
        if(!step.from || !step.to || step.planet) {
            console.log(chalk.red("ERROR! Step missing required field(s): " + JSON.stringify(step)))
            process.exit(0)
        }

        if(previousEndsAt !== "NONE" && previousEndsAt !== step.from) {
            console.log(chalk.red("ERROR! Previous step ended at a different planet: " + JSON.stringify(step)))
            process.exit(0)
        }

        if(step.type === "TRADE") {
            previousEndsAt = step.from
        } else {
            previousEndsAt = step.to
        }
    }

    if(startingPlanet !== previousEndsAt) {
        console.log(chalk.red("ERROR! The last step does not put you back on the starting planet."))
        process.exit(0)
    }
}

function validatePlanets() {
    // Innocent until proven guilty
    let valid = true

    // Make sure at least one planet has a restaurant
    let foundRestaurant = false

    for(let planet in planets) {
        const planetData = planets[planet]

        if(!planetData.toExchange) {
            console.log(chalk.red(`No path to exchange provided for planet ${planet}.`))
            valid = false
        }

        if(!planetData.fromExchange) {
            console.log(chalk.red(`No path from exchange provided for planet ${planet}.`))
            valid = false
        }

        if(!planetData.toLink) {
            console.log(chalk.red(`No path to link provided for planet ${planet}.`))
            valid = false
        }

        if(!planetData.fromLink) {
            console.log(chalk.red(`No path from link provided for planet ${planet}.`))
            valid = false
        }

        if(planetData.toRestaurant)
            foundRestaurant = true
    }

    if(!foundRestaurant) {
        console.log(chalk.red("No planets have restaurants defined. Need at least one restaurant."))
        valid = false
    }

    if(!valid)
        process.exit(0)
}

/**
 * Ensure we don't have anything in our cargo hold
 */
async function checkCargoHold(connection) {
    let status = await connection.send("st")

    let match = cargoSpaceRegex.exec(status)

    if(match[1] !== match[2]) {
        console.log(chalk.red("Cargo detected in hold."))

        process.exit(0)
    }
}

/**
 * Determine how much money is in our bank account
 */
async function checkBankBalance(connection) {
    let score = await connection.send("sc")

    let match = bankBalanceRegex.exec(score)

    let balance = match[1].replace(/,/g, "")

    return parseInt(balance)
}

async function verifyAtPlanetExchange(connection, planet) {
    let score = await connection.send("sc")

    let match = currentPlanetRegex.exec(score)

    if(match[1] !== planet) {
        console.log(chalk.red(`You're not on the right starting planet, ${planet}. Cannot run.`));
        process.exit(0)
    }

    let priceTest = await connection.send("c price arts")

    if(priceTest.indexOf("need to be in an exchange") > -1) {
        console.log(chalk.red(`You're not at ${planet}'s exchange. Cannot run.`));
        process.exit(0)
    }
}

/**
 * Run a single cycle of our hauling steps defined in steps.js
 */
async function runCycle(connection) {
    let startingPlanet = steps[0].from
    
    await verifyAtPlanetExchange(connection, startingPlanet)

    for(let step of steps) {
        await runStep(connection, step)
    }

    console.log("Run complete!")
}

/**
 * Runs a single of the steps defined in steps.js
 */
async function runStep(connection, step) {
    if(step.type === "TRADE") {
        await tradeBetween(connection, step.from, step.to)
    } else if(step.type === "MOVE") {
        await navigate(connection, step.from, step.to)
    } else {
        console.log(chalk.red(`Invalid step type: ${step.type}. Skipping.`))
    }
}

/**
 * Determines two planets available imports & exports and runs any possible 
 * routes between them.
 * 
 * @param {String} planetA Name of the first planet
 * @param {String} planetB Name of the second plent
 */
async function tradeBetween(connection, planetA, planetB) {
    // If planet A has a restaurant defined, we should check our stamina
    if(planets[planetA].toRestaurant) {
        await checkStamina(connection, planetA)
    }

    console.log(chalk.green(`Running routes ${planetA} <=> ${planetB}.`))

    await connection.send("buy fuel")

    console.log(`Scanning ${planetA} exchange.`)
    let planetAExc = await connection.send("di exchange")
    let planetAImpEx = parseExData(planetAExc)

    await navigate(connection, planetA, planetB)

    console.log(`Scanning ${planetB} exchange.`)
    let planetBExc = await connection.send("di exchange")
    let planetBImpEx = parseExData(planetBExc)

    let routesAtoB = _.intersection(planetAImpEx.exp, planetBImpEx.imp)
    let routesBtoA = _.intersection(planetBImpEx.exp, planetAImpEx.imp)

    console.log(`Routes from ${planetA} to ${planetB} (${routesAtoB.length}): ${routesAtoB.join(", ")}`)
    console.log(`Routes from ${planetB} to ${planetA} (${routesBtoA.length}): ${routesBtoA.join(", ")}`)

    await navigate(connection, planetB, planetA)

    while(routesAtoB.length > 0) {
        let commod = routesAtoB[0]

        await buyCommod(connection, commod)
        await navigate(connection, planetA, planetB)
        await sellCommod(connection, commod)

        // Remove this from our list
        routesAtoB = routesAtoB.slice(1)

        let returnLoad = routesBtoA.length > 0
        let returnCommod = returnLoad ? routesBtoA[0] : ""

        if(returnLoad)
            await buyCommod(connection, returnCommod)

        await navigate(connection, planetB, planetA)

        if(returnLoad) {
            await sellCommod(connection, returnCommod)
            routesBtoA = routesBtoA.slice(1)
        }

        await connection.send("buy fuel")
    }

    if(routesBtoA.length > 0) {
        console.log(`No ${planetB} => ${planetA} routes left.`)

        while(routesBtoA.length > 0) {
            navigate(connection, planetA, planetB)

            let commod = routesBtoA[0]

            await buyCommod(connection, commod)
            await navigate(connection, planetB, planetA)
            await sellCommod(connection, commod)

            routesBtoA = routesBtoA.slice(1)

            await connection.send("buy fuel")
        }
    }
}

async function checkStamina(connection, planet) {
    let score = await connection.send("sc")
    let match = staminaRegex.exec(score)

    if(!match) {
        console.log(chalk.red("Unable to get stamina info."))
        console.log("Ending session for safety reasons.")
        process.exit(0)
    } else {
        console.log("Current stamina: " + chalk.bold.white(match[2]))
        
        let stamina = parseInt(match[2])

        if(stamina < STAMINA_MIN) {
            console.log(chalk.red(`Stamina less than ${STAMINA_MIN}. Buying food from the planet's restaurant.`))

            const planetInfo = planets[planet]

            for(let cmd of planetInfo.fromExchange) {
                await connection.send(cmd)
            }

            for(let cmd of planetInfo.toRestaurant) {
                await connection.send(cmd)
            }

            await connection.send("buy food")

            console.log("Food purchased. Itadakimasu!")

            for(let cmd of planetInfo.fromRestaurant) {
                await connection.send(cmd)
            }

            for(let cmd of planetInfo.toExchange) {
                await connection.send(cmd)
            }
        }
    }
}

/**
 * Navigates from the exchange on one planet to another
 */
async function navigate(connection, from, to) {
    console.log(chalk.blue("Moving from " + from + " to " + to + "."))

    let fromPlanet = planets[from]
    let toPlanet = planets[to]

    // Go from exchange => landing pad
    for(let cmd of fromPlanet.fromExchange) {
        await connection.send(cmd)
    }

    await connection.send("board")
    
    for(let cmd of fromPlanet.toLink) {
        await connection.send(cmd)
    }

    for(let cmd of toPlanet.fromLink) {
        await connection.send(cmd)
    }

    await connection.send("board")
    
    for(let cmd of toPlanet.toExchange) {
        await connection.send(cmd)
    }
}

async function buyCommod(connection, commod) {
    lastBankBalance = await checkBankBalance(connection)

    console.log("Buying " + CARGO_BAYS + " bays of " + commod + ".")

    for(i = 0; i < CARGO_BAYS; i++) {
        await connection.send("buy " + commod)
    }
}

async function sellCommod(connection, commod) {
    console.log("Selling " + CARGO_BAYS + " bays of " + commod + ".")

    for(i = 0; i < CARGO_BAYS; i++) {
        await connection.send("sell " + commod)
    }

    const newBankBalance = await checkBankBalance(connection)
    const profit = newBankBalance - lastBankBalance

    console.log(`Personal profit of ${chalk.bold.white(profit)}ig made from the sale.`)

    // Ensure everything sold properly
    await checkCargoHold(connection)
}

function parseExData(data) {
    let commods = data.split("\n")

    let exp = []
    let imp = []

    for(let c of commods) {
        let match = commodRegex.exec(c)

        if(match) {
            let stock = parseInt(match[4])

            if(stock >= SURPLUS_MIN) {
                exp.push(match[1])
            } else if(stock <= DEFICIT_MAX) {
                imp.push(match[1])
            }

        }
    }

    console.log("This exchange has " + exp.length + " available exports and " + imp.length + " available imports.")

    return {
        exp: exp,
        imp: imp
    }
}

run()