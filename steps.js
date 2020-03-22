/**
 * This file defines the steps that are taken each cycle the bot runs.
 */

const steps = [
    {
        type: "TRADE",
        from: "Sakura",
        to: "Phoenix"
    },
    {
        type: "TRADE",
        from: "Sakura",
        to: "Zen"
    },
    {
        type: "MOVE",
        from: "Sakura",
        to: "Phoenix"
    },
    {
        type: "TRADE",
        from: "Phoenix",
        to: "Zen"
    },
    {
        type: "MOVE",
        from: "Phoenix",
        to: "Sakura"
    }
]

module.exports = steps