/**
 * This is a library that enables interaction with planet's exchanges
 */

const chalk = require("chalk")
const emoji = require("../emoji")

/**
 * How much do we walk up exchanges by when the stockpile hits the max? Needs to be > 1.
 */
const WALK_UP_AMT = 1.05

const commodInfoRegex = new RegExp("([A-Z,a-z]*): value ([0-9]*)ig/ton  Spread: ([0-9]*)%   Stock: current ([-0-9]*)/min ([-0-9]*)/max ([-0-9]*)")
const cPriceRegex = new RegExp("([A-Z,a-z]+): ([A-Z,a-z]+) is ([A-Z,a-z]+) ([0-9]+) tons at ([0-9]+)ig")

/**
 * Finds the best place in the current cartel to sell a commodity
 */
async function findBestSeller(connection, commod) {
    let data = await connection.send("c price " + commod + " cartel")

    let lowestPrice = 999999
    let lowestPlanet = null

    for(let p of data.split("\n")) {
        let match = cPriceRegex.exec(p)

        if(match) {
            if(match[3] !== "selling")
                continue

            let planet = match[2]

            let price = parseInt(match[5])

            if(price < lowestPrice) {
                lowestPrice = price
                lowestPlanet = planet
            }

        }
    }

    return lowestPlanet
}

/**
 * Finds the best place in the current cartel to buy a commodity
 */
async function findBestBuyer(connection, commod) {
    let data = await connection.send("c price " + commod + " cartel")

    let highestPrice = 0
    let highestPlanet = null

    for(let p of data.split("\n")) {
        let match = cPriceRegex.exec(p)

        if(match) {
            if(match[3] !== "buying")
                continue

            let planet = match[2]

            let price = parseInt(match[5])

            if(price > highestPrice) {
                highestPrice = price
                highestPlanet = planet
            }

        }
    }

    return highestPlanet
}

/**
 * New exchanges benefit from being "walked up." That is surplus goods slowly have their max stockpile raised to avoid 
 * causing excessive express to the planet. This scans the exchange for goods still needing to be walked up that are 
 * currently at their current max stockpile.
 */
async function walkUpStockpiles(connection) {
    console.log(chalk.blue("Walking up exchange. 📈"))

    // Pull all details from exchange
    let data = await connection.send("di exchange")

    let commods = data.split("\n")

    for(let c of commods) {
        const match = commodInfoRegex.exec(c)

        if(match) {
            const commod = match[1]
            const stock = parseInt(match[4])
            const max = parseInt(match[6])

            // We want to walk up if the max isn't maxed out (how meta) and the stock has hit the max
            if(max < 20000 && max == stock) {
                let newMax = Math.trunc(max * WALK_UP_AMT)

                // Stockpiles can't be greater than 20k
                if(newMax > 20000)
                    newMax = 20000

                console.log(`${emoji.formatCommod(commod)} is ready to be walked up more. New max: ${newMax}`)

                await connection.send("set stockpile max " + newMax + " " + commod)
            }
        }
    }
}

module.exports = {
    findBestBuyer: findBestBuyer,
    findBestSeller: findBestSeller,
    walkUpStockpiles: walkUpStockpiles
}