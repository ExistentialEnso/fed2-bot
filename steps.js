/**
 * This file defines the steps that are taken each cycle the bot runs.
 * 
 * Each step needs a 'type' that is one of: TRADE, MOVE, WALK_UP
 * 
 * TRADE and MOVE steps need a 'to' and 'from' that are planet names defined in planets.js
 */

const athenaSteps = [
    {
        type: "HAUL_IN",
        from: "Olympus"
    },
    {
        type: "WALK_UP"
    }
]

const thorneSteps = [
    {
        type: "HAUL_IN",
        from: "Sakura"
    },
    {
        type: "WALK_UP"
    },
    /*{
        type: "HAUL_OUT",
        from: "Sakura"
    },*/
    {
        type: "MOVE",
        from: "Sakura",
        to: "Phoenix"
    },
    {
        type: "HAUL_IN",
        from: "Phoenix"
    },
    {
        type: "WALK_UP"
    },
    /*{
        type: "HAUL_OUT",
        from: "Phoenix"
    },*/
    {
        type: "MOVE",
        from: "Phoenix",
        to: "Zen"
    },
    {
        type: "HAUL_IN",
        from: "Zen"
    },
    {
        type: "WALK_UP"
    },
    /*{
        type: "HAUL_OUT",
        from: "Zen"
    },*/
    {
        type: "MOVE",
        from: "Zen",
        to: "Sakura"
    },

    /*
    {
        type: "MOVE",
        from: "Sakura",
        to: "Zen"
    },
    {
        type: "WALK_UP"
    },
    {
        type: "MOVE",
        from: "Zen",
        to: "Sakura"
    },

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
    },
    {
        type: "HAUL_IN",
        from: "Sakura"
    },
    {
        type: "MOVE",
        from: "Sakura",
        to: "Phoenix"
    },
    {
        type: "HAUL_IN",
        from: "Phoenix"
    },
    {
        type: "MOVE",
        from: "Phoenix",
        to: "Zen"
    },
    {
        type: "HAUL_IN",
        from: "Zen"
    },
    {
        type: "MOVE",
        from: "Zen",
        to: "Sakura"
    },*/
    
]

module.exports = {
    Thorne: thorneSteps,
    Athena: athenaSteps
}