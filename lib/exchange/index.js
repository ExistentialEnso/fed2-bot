const chalk = require("chalk")
const emoji = require("../emoji")

const commodInfoRegex = new RegExp("([A-Z,a-z]*): value ([0-9]*)ig/ton  Spread: ([0-9]*)%   Stock: current ([-0-9]*)/min ([-0-9]*)/max ([-0-9]*)")

/**
 * New exchanges benefit from being "walked up." That is surplus goods slowly have their max stockpile raised to avoid 
 * causing excessive express to the planet. This scans the exchange for goods still needing to be walked up that are 
 * currently at their current max stockpile.
 */
async function walkUpStockpiles(connection) {
    console.log(chalk.blue("Walking up exchange. 📈"))

    let data = await connection.send("di exchange")

    let commods = data.split("\n")

    for(let c of commods) {
        const match = commodInfoRegex.exec(c)

        if(match) {
            const commod = match[1]
            const stock = parseInt(match[4])
            const max = parseInt(match[6])

            if(max < 20000 && max == stock) {
                let newMax = Math.trunc(max * 1.1)
                if(newMax > 20000)
                    newMax = 20000

                console.log(`${emoji.formatCommod(commod)}  is ready to be walked up more. New max: ${newMax}`)

                await connection.send("set stockpile max " + newMax + " " + commod)
            }
        }
    }
}

module.exports = {
    walkUpStockpiles: walkUpStockpiles
}