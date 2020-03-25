const chalk = require('chalk')

const planets = require('../../planets')
const logger = require('../logger')

/**
 * Navigates the player from one planet's exchange to another.
 * 
 * @param {*} connection 
 * @param {String} from 
 * @param {String} to 
 */
async function navigateBetweenExchanges(connection, from, to) {
    if(!planets[from]) {
        logger.output(chalk.red(`ERROR! From planet (${from}) does not exist in planet files`))
        return
    }

    if(!planets[to]) {
        logger.output(chalk.red(`ERROR! To planet (${to}) does not exist in planet files`))
        return
    }

    logger.output(chalk.blue("Moving from " + from + " to " + to + ". ") + "🚀")

    let fromPlanet = planets[from]
    let toPlanet = planets[to]

    // Go from exchange => landing pad
    for(let cmd of fromPlanet.fromExchange) {
        await connection.send(cmd)
    }

    // Go into space
    await connection.send("board")
    
    // Go from orbit => link
    for(let cmd of fromPlanet.toLink) {
        await connection.send(cmd)
    }

    if(fromPlanet.system !== toPlanet.system) {
        await connection.send("j " + toPlanet.system)
    }

    // Go from link => destination orbit
    for(let cmd of toPlanet.fromLink) {
        await connection.send(cmd)
    }

    // Land on the planet
    await connection.send("board")
    
    // Go from destination landing pad => destination exchange
    for(let cmd of toPlanet.toExchange) {
        await connection.send(cmd)
    }
}

module.exports = {
    navigateBetweenExchanges: navigateBetweenExchanges
}