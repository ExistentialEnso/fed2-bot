const Telnet = require('telnet-client')
const _ = require('lodash')
const chalk = require('chalk')

require('dotenv').config()

// How many cargo bays are in your ship?
const CARGO_BAYS = 12

// What is the cutoff to determine deficits?
const DEFICIT_MAX = -500

// What is the cutoff to determine surpluses?
const SURPLUS_MIN = 19000

// How many minutes to sleep between each cycle?
const SLEEP_MINUTES = 15

// Load in account data from .env
const account = {
    username: process.env.FED_USERNAME,
    password: process.env.FED_PASSWORD
}

// Useful regexes for pulling out data
let commodRegex = new RegExp("([A-Z,a-z]*): value ([0-9]*)ig/ton  Spread: ([0-9]*)%   Stock: current ([-0-9]*)")
let staminaRegex = new RegExp("Stamina      max:  ([0-9]*) current:  ([0-9]*)")
let bankBalanceRegex = new RegExp("Bank Balance: ([0-9,\,]*)ig")
let cargoSpaceRegex = new RegExp("Cargo space:    ([0-9]*)/([0-9]*)")

let lastBankBalance = 0

const planets = {
    Sakura: {
        system: "Enso",
        toExchange: "n",
        fromExchange: "s",
        toLink: "l"
    },
    Phoenix: {
        system: "Enso",
        toExchange: "n",
        fromExchange: "s",
        toLink: "n",
        fromLink: "s"
    },
    Zen: {
        system: "Enso",
        toExchange: "s",
        fromExchange: "n",
        toLink: "nw",
        fromLink: "se"
    }
}

/**
* Easily lets us wait for a specified period of time with await
*/
function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
}   

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

    console.log("Connected to Federation 2!")

    // Authenticate the user
    await connection.send(account.username)
    await connection.send(account.password)

    await sleep(2000)

    let res = await connection.send("l")

    if(res.indexOf('Sakura Shuttle') > -1) {
        console.log("Started on Sakura Shuttle Hangar.")

        await connection.send("n")
    } else if(res.indexOf('Exchange Floor') == -1) {
        console.log("You're not in a valid starting location.")
        console.log("Ending session.")
        return
    }

    while(true) {
        await runCycle(connection)

        console.log(`Sleeping for ${SLEEP_MINUTES} minutes.`)

        // Sleep until we need to repeat the cycle again
        await sleep(1000 * 60 * SLEEP_MINUTES)
    }
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

/**
 * Run a single cycle of our hauling
 */
async function runCycle(connection) {
    let score = await connection.send("sc")
    let match = staminaRegex.exec(score)
    if(!match) {
        console.log(chalk.red("Can't get stamina info."))
        console.log("Ending session for safety reasons.")
        return
    } else {
        console.log("Current stamina: " + chalk.bold.white(match[2]))
        
        let stam = parseInt(match[2])

        if(stam < 30) {
            console.log(chalk.red("Stamina less than 30. Buying food from the Meditation Tea Bar."))

            await connection.send("e")
            await connection.send("buy food")
            await connection.send("w")
        }
    }

    await tradeBetween(connection, "Sakura", "Phoenix")
    await tradeBetween(connection, "Sakura", "Zen")

    await navigate(connection, "Sakura", "Phoenix")

    await tradeBetween(connection, "Phoenix", "Zen")

    await navigate(connection, "Phoenix", "Sakura")

    console.log("Run complete!")
}

/**
 * Determines two planets available imports & exports and runs any possible 
 * routes between them.
 * 
 * @param {String} planetA Name of the first planet
 * @param {String} planetB Name of the second plent
 */
async function tradeBetween(connection, planetA, planetB) {
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
        console.log(`Still have routes from ${planetB} to ${planetA}.`)

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

/**
 * Navigates from the exchange on one planet to another
 */
async function navigate(connection, from, to) {
    console.log(chalk.blue("Moving from " + from + " to " + to + "."))

    let fromPlanet = planets[from]
    let toPlanet = planets[to]

    await connection.send(fromPlanet.fromExchange)
    await connection.send("board")
    await connection.send(fromPlanet.toLink)
    await connection.send(toPlanet.fromLink)
    await connection.send("board")
    await connection.send(toPlanet.toExchange)
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