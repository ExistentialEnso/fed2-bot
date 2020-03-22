/**
 * This file defines the steps that are taken each cycle the bot runs.
 * 
 * Each step needs a 'type' that is one of: TRADE, MOVE, WALK_UP
 * 
 * TRADE and MOVE steps need a 'to' and 'from' that are planet names defined in planets.js
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
        to: "Zen"
    },
    {
        type: "WALK_UP"
    },
    {
        type: "MOVE",
        from: "Zen",
        to: "Sakura"
    }
]

module.exports = steps