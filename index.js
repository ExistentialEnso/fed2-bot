const Telnet = require('telnet-client')
const _ = require('lodash')
const chalk = require('chalk')

const emoji = require('./lib/emoji')
const logger = require('./lib/logger')
const validator = require('./lib/validator')
const exchange = require('./lib/exchange')
const score = require('./lib/score')

// Load in our .env file
require('dotenv').config()

// What is the maximum cutoff to determine current commodity deficits?
const DEFICIT_MAX = -500

// What is the minimum cutoff to determine current commodity surpluses?
const SURPLUS_MIN = 19500

// How many minutes to sleep between each cycle?
const SLEEP_MINUTES = 15

// How low should stamina go before we buy food?
const STAMINA_MIN = 25

// Information for connection to Fed2's servers
const connectionParams = {
    host: 'play.federation2.com',
    port: 30003,
    negotiationMandatory: false
}

// Useful regexes for pulling out data from game output
let commodRegex = new RegExp("([A-Z,a-z]*): value ([0-9]*)ig/ton  Spread: ([0-9]*)%   Stock: current ([-0-9]*)")
let staminaRegex = new RegExp("Stamina      max:  ([0-9]*) current:  ([0-9]*)")
let bankBalanceRegex = new RegExp("([0-9,\,]*)ig")
let cargoSpaceRegex = new RegExp("Cargo space:    ([0-9]*)/([0-9]*)")
let currentPlanetRegex = new RegExp("You are currently on ([A-Z,a-z,0-9]*) in the")

// Import our planet and step configuration
const planets = require("./planets")
const steps = require("./steps")

// Holds our Telnet connection into the Fed2 server
const connection = new Telnet()

// Info we want to track as we go along
let lastBankBalance = 0
let cargoBays = 0
let cycleNum = 1

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
    logger.output("Validating step & planet data for errors...")
    const stepsValid = validator.validateSteps(steps)
    const planetValid = validator.validatePlanets(planets)

    if(!planetValid || !stepsValid) {
        logger.output(chalk.red("Please fix the errors with your configuration and run again."))
        process.exit(0)
    }

    logger.output(chalk.green("No issues found!"))

    logger.output("Connecting to Federation 2 servers...")

    try {
        await connection.connect(connectionParams)
    } catch(error) {
        logger.output(chalk.red("ERROR! Could not connect to Fed2."))
        process.exit(0)
    }

    // Authenticate the user
    await connection.send(process.env.FED_USERNAME)
    await connection.send(process.env.FED_PASSWORD)

    await sleep(2000)

    logger.output("Bot is powering up. BEEP-BOOP! 🤖")

    await calculateCargoBays()

    while(true) {
        await runCycle()

        logger.output(`Bot is sleeping for ${SLEEP_MINUTES} minutes. 😴`)

        // Sleep until we need to repeat the cycle again
        await sleep(1000 * 60 * SLEEP_MINUTES)
    }
}

/**
 * Determine how many cargo bays the player's ship has
 */
async function calculateCargoBays() {
    let status = await connection.send("st")

    let match = cargoSpaceRegex.exec(status)

    let tonnage = parseInt(match[2])

    // Save this info for use elsewhere
    cargoBays = Math.trunc(tonnage/75)

    logger.output(`Your ship has ${cargoBays} cargo bays. 📦`)
}

/**
 * Ensure we don't have anything in our cargo hold
 */
async function checkCargoHold() {
    let status = await connection.send("st")

    let match = cargoSpaceRegex.exec(status)

    if(match[1] !== match[2]) {
        logger.output(chalk.red("ERROR! Cargo detected in hold."))
        process.exit(0)
    }
}

/**
 * Ensures the player is on this planet at its exchange
 * 
 * @param {String} planet 
 */
async function verifyAtPlanetExchange(planet) {
    let score = await connection.send("sc")

    let match = currentPlanetRegex.exec(score)

    if(match[1] !== planet) {
        logger.output(chalk.red(`ERROR! You're not on the right starting planet, ${planet}. Cannot run.`));
        process.exit(0)
    }

    let priceTest = await connection.send("c price arts")

    if(priceTest.indexOf("need to be in an exchange") > -1) {
        logger.output(chalk.red(`ERROR! You're not at ${planet}'s exchange. Cannot run.`));
        process.exit(0)
    }
}

/**
 * Run a single cycle of our hauling steps defined in steps.js
 */
async function runCycle() {
    await logger.balances(connection)

    logger.output(`Cycle #${cycleNum} starting.`)

    let startingPlanet = steps[0].from
    
    await verifyAtPlanetExchange(startingPlanet)

    for(let step of steps) {
        await runStep(step)
    }

    logger.output(`Cycle #${cycleNum} finished all steps.`)
    cycleNum++
}

/**
 * Runs a single of the steps defined in steps.js
 * 
 * @param {Object} step 
 */
async function runStep(step) {
    if(step.type === "TRADE") {
        await tradeBetween(step.from, step.to)
    } else if(step.type === "MOVE") {
        await navigate(step.from, step.to)
    } else if(step.type === "WALK_UP") {
        await exchange.walkUpStockpiles(connection)
    } else {
        logger.output(chalk.red(`Invalid step type: ${step.type}. Skipping.`))
    }
}

/**
 * Determines two planets available imports & exports and runs any possible 
 * routes between them.
 * 
 * @param {String} planetA Name of the first planet
 * @param {String} planetB Name of the second plent
 */
async function tradeBetween(planetA, planetB) {
    // If planet A has a restaurant defined, we should check our stamina
    if(planets[planetA].toRestaurant) {
        await checkStamina(planetA)
    }

    logger.output(chalk.blue(`Auto-trading: ${planetA} <=> ${planetB}.`))

    await connection.send("buy fuel")

    // Gather info about planet A
    logger.output(`Scanning ${planetA} exchange.`)
    let planetAExc = await connection.send("di exchange")
    let planetAImpEx = parseExData(planetAExc)

    await navigate(planetA, planetB)

    // Gather info about planet B
    logger.output(`Scanning ${planetB} exchange.`)
    let planetBExc = await connection.send("di exchange")
    let planetBImpEx = parseExData(planetBExc)

    // Determine available trade routes
    let routesAtoB = _.intersection(planetAImpEx.exp, planetBImpEx.imp)
    let routesBtoA = _.intersection(planetBImpEx.exp, planetAImpEx.imp)

    if(routesAtoB.length > 0) {
        logger.output(`Routes from ${planetA} => ${planetB} (${routesAtoB.length}): ${routesAtoB.join(", ")}`)
    } else {
        logger.output(`No available routes from ${planetA} => ${planetB}`)
    }

    if(routesBtoA.length > 0) {
        logger.output(`Routes from ${planetB} => ${planetA} (${routesBtoA.length}): ${routesBtoA.join(", ")}`)
    } else {
        logger.output(`No available routes from ${planetB} => ${planetA}`)
    }

    await navigate(planetB, planetA)

    while(routesAtoB.length > 0) {
        let commod = routesAtoB[0]

        await buyCommod(commod)
        await navigate(planetA, planetB)
        await sellCommod(commod)

        // Remove this from our list
        routesAtoB = routesAtoB.slice(1)

        let returnLoad = routesBtoA.length > 0
        let returnCommod = returnLoad ? routesBtoA[0] : ""

        if(returnLoad)
            await buyCommod(returnCommod)

        await navigate(planetB, planetA)

        if(returnLoad) {
            await sellCommod(returnCommod)
            routesBtoA = routesBtoA.slice(1)
        }

        await connection.send("buy fuel")
    }

    if(routesBtoA.length > 0) {
        while(routesBtoA.length > 0) {
            navigate(planetA, planetB)

            let commod = routesBtoA[0]

            await buyCommod(commod)
            await navigate(planetB, planetA)
            await sellCommod(commod)

            routesBtoA = routesBtoA.slice(1)

            await connection.send("buy fuel")
        }
    }
}

/**
 * Ensure the player is staying well-fed
 * 
 * @param {String} planet The planet the player is currently on
 */
async function checkStamina(planet) {
    let score = await connection.send("sc")
    let match = staminaRegex.exec(score)

    if(!match) {
        logger.output(chalk.red("ERROR! Unable to get stamina info."))
        process.exit(0)
    } else {
        logger.output("Current stamina: " + chalk.bold.white(match[2]))
        
        let stamina = parseInt(match[2])

        if(stamina < STAMINA_MIN) {
            logger.output(chalk.yellow(`Stamina less than ${STAMINA_MIN}. Buying food from the planet's restaurant.`))

            const planetInfo = planets[planet]

            for(let cmd of planetInfo.fromExchange) {
                await connection.send(cmd)
            }

            for(let cmd of planetInfo.toRestaurant) {
                await connection.send(cmd)
            }

            await connection.send("buy food")

            logger.output("Food purchased. Itadakimasu! 🍕")

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
 * 
 * @param {String} from 
 * @param {String} to 
 */
async function navigate(from, to) {
    logger.output(chalk.blue("Moving from " + from + " to " + to + ". ") + "🚀")

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

 /**
  * Fills our cargo bay with the specified commodity
  * 
  * @param {String} commod 
  */
async function buyCommod(commod) {
    lastBankBalance = await score.getBankBalance(connection)

    logger.output("Buying " + cargoBays + " bays of " + emoji.formatCommod(commod))

    for(i = 0; i < cargoBays; i++) {
        await connection.send("buy " + commod)
    }
}

/**
 * Sells off all of the commodity we are hauling
 * 
 * @param {String} commod 
 */
async function sellCommod(commod) {
    logger.output("Selling " + cargoBays + " bays of " + emoji.formatCommod(commod))

    for(i = 0; i < cargoBays; i++) {
        await connection.send("sell " + commod)
    }

    const newBankBalance = await score.getBankBalance(connection)
    const profit = newBankBalance - lastBankBalance

    logger.output(`Personal profit of ${chalk.bold.white(profit)}ig made from the sale. 🤑`)

    // Ensure everything sold properly
    await checkCargoHold()
}

/**
 * Parses exchange data in order to determine current surpluses and deficits
 * 
 * @param {String} commod Output from command: di exchange
 */
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

    logger.output("Exchange has " + exp.length + " surpluses and " + imp.length + " deficits.")

    return {
        exp: exp,
        imp: imp
    }
}

run()