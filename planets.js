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
    },

    Faa: {
        system: "Gov",

        toExchange: ["s", "w"],
        fromExchange: ["e", "n"],

        toLink: [],
        fromLink: []
    },

    Guardian: {
        system: "Fight",
        
        toExchange: ["sw"],
        fromExchange: ["ne"],

        toLink: [],
        fromLink: []
    },

    Cessna: {
        system: "Flight",

        toExchange: ["e"],
        fromExchange: ["w"],

        toLink: [],
        fromLink: []
    },
    Diamond: {
        system: "Flight",

        toExchange: ["e"],
        fromExchange: ["w"],

        toLink: ["sw"],
        fromLink: ["ne"]
    },
    Piper: {
        system: "Flight",

        toExchange: ["e"],
        fromExchange: ["w"],

        toLink: ["w"],
        fromLink: ["e"]
    },
    Cirrus: {
        system: "Flight",

        toExchange: ["e"],
        fromExchange: ["w"],

        toLink: ["e"],
        fromLink: ["w"]
    }

}

module.exports = planets