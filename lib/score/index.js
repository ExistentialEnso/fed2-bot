const logger = require("../logger")
const chalk = require("chalk")

const balanceRegex = /([-0-9\,]*)ig/g

async function getBankBalance(connection) {
    let score = await connection.send("sc")

    let match = balanceRegex.exec(score)

    if(!match) {
        logger.output(chalk.yellow("WARN! Could not parse out personal balance."))
        logger.output("RegEx: " + JSON.stringify(match))
        logger.output("Score data: " + score)
    }

    const personalBalance = parseInt(match[1].replace(/,/g, ""))

    return personalBalance
}

module.exports = {
    getBankBalance: getBankBalance
}