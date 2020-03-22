/*
 * This file defines needed information about any of the planets 
 * the bot will visit during its runs.
 */

const planets = {
    Sakura: {
        system: "Enso",

        toExchange: ["n"],
        fromExchange: ["s"],

        // Sakura's orbit is the same as the link
        toLink: [],
        fromLink: [],

        toRestaurant: ["n", "e"],
        fromRestaurant: ["w", "s"]
    },
    Phoenix: {
        system: "Enso",

        toExchange: ["n"],
        fromExchange: ["s"],

        toLink: ["n"],
        fromLink: ["s"],

        toRestaurant: ["e"],
        fromRestaurant: ["w"]
    },
    Zen: {
        system: "Enso",

        toExchange: ["s"],
        fromExchange: ["n"],

        toLink: ["nw"],
        fromLink: ["se"]
    }
}

module.exports = planets