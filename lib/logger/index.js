const fs = require("fs")
const moment = require("moment")
const stripAnsi = require("strip-ansi")

const treasuryRegex = /Treasury: ([-0-9\,]*)ig/g
const balanceRegex = /([-0-9\,]*)ig/g

const timestampFormat = "YYYY-MM-DD HH:mm"

/*
 * Private function to create balances.csv if it doesn't exist. appendFile() will create a 
 * new file if it doesn't exist, but we want csv headers.
 */
function createBalanceLogIfDoesntExist() {
    let exists = fs.existsSync("./logs/balances.csv")

    if(!exists) {
        fs.writeFileSync("./logs/balances.csv", "Time,Personal,System\r\n")
    }
}

function output(message) {
    console.log(message)

    // Append to file with no callback
    fs.appendFile("./logs/output.txt", stripAnsi(message) + "\r\n", () => {})
}

async function balances(connection) {
    createBalanceLogIfDoesntExist()

    let score = await connection.send("sc")

    let match = balanceRegex.exec(score)
    const personalBalance = parseInt(match[1].replace(/,/g, ""))

    let system = await connection.send("di system")

    let systemBalance = 0

    while ((sysMatch = treasuryRegex.exec(system)) !== null) {
        const planetBalance = parseInt(sysMatch[1].replace(/,/g, ""))

        systemBalance += planetBalance
    }

    fs.appendFileSync("./logs/balances.csv", moment().format(timestampFormat) + "," + personalBalance + "," + systemBalance + "\r\n")
}

module.exports = {
    balances: balances,
    output: output
}