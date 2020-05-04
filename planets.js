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
    Paper: {
        system: "Flight",

        toExchange: ["e"],
        fromExchange: ["w"],

        toLink: ["n"],
        fromLink: ["s"]
    },
    Cirrus: {
        system: "Flight",

        toExchange: ["e"],
        fromExchange: ["w"],

        toLink: ["e"],
        fromLink: ["w"]
    },

    Oudars: {
        system: "The Star Galaxy",

        toExchange: ["s", "w"],
        fromExchange: ["e", "n"],

        toLink: [],
        fromLink: []
    },

    Memory: {
        system: "Trial",

        toExchange: ["e"],
        fromExchange: ["w"],

        toLink: [],
        fromLink: []
    },

    Olympus: {
        system: "Mythic",

        toExchange: ["e"],
        fromExchange: ["w"],

        toLink: [],
        fromLink: []
    },

    Romulus: {
        system: "Rihansu",

        toExchange: ["e"],
        fromExchange: ["w"],

        toLink: [],
        fromLink: []
    },

    Starbase: {
        system: "Tinkle",

        toExchange: ["e"],
        fromExchange: ["w"],

        toLink: [],
        fromLink: []
    },

    Tennica: {
        system: "Vee",

        toExchange: ["s", "w"],
        fromExchange: ["e", "n"],

        toLink: [],
        fromLink: []
    },

    Sierra: {
        system: "Wyld",

        toExchange: ["s", "w"],
        fromExchange: ["e", "n"],

        toLink: [],
        fromLink: []
    }
}

module.exports = planets