/**
 * This liberary has functions that enable collection of data from the player's score info.
 */

const chalk = require("chalk")

const balanceRegex = new RegExp("([-0-9\,]+)ig")

async function getBankBalance(connection) {
    let score = await connection.send("sc")

    let match = balanceRegex.exec(score)

    if(!match) {
        console.log(chalk.yellow("WARN! Could not parse out personal balance."))
        console.log("RegEx: " + JSON.stringify(match))
        console.log("Score data: " + score)
    }

    // Strip out commas and conver to an int
    const personalBalance = parseInt(match[1].replace(/,/g, ""))

    return personalBalance
}

module.exports = {
    getBankBalance: getBankBalance
}