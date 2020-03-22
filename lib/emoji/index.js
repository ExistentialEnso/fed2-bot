/**
 * This provides emoji that give extra flair to commodity names
 */

const emoji = {
    Cereals: "🌾",
    Fruit: "🍒",
    Furs: "🧥",
    //Hides: "",
    Livestock: "🐑",
    Meats: "🍖",
    //Soya: "",
    //Spices: "🧄", -- newer emoji not working in terminal yet
    Textiles: "👘",
    Woods: "🌲",

    //Alloys: "",
    Clays: "🧱",
    Crystals: "💎",
    Gold: "🥇",
    Monopoles: "🧲",
    //Nickel: "",
    //Petrochemicals: "",
    Radioactives: "☢️",
    //Semiconductors: "",
    //Xmetals: "",

    Explosives: "💣",
    Generators: "⚡",
    //LanzariK: "",
    LubOils: "🛢️",
    Mechparts: "⚙️",
    //Munitions: "",
    //Nitros: "",
    Pharmaceuticals: "💊",
    //Polymers: "",
    //Propellants: "",
    RNA: "🧬",

    //AntiMatter: "",
    Controllers: "🎮",
    Droids: "🤖",
    //Electros: "",
    //GAsChips: "",
    //Lasers: "",
    //NanoFabrics: "",
    //Nanos: "",
    Powerpacks: "🔋",
    //Synths: "",
    Tools: "🛠️",
    //TQuarks: "",
    Vidicasters: "📺",
    Weapons: "🔫",

    //BioChips: "",
    BioComponents: "🦠",
    Clinics: "🏥",
    Laboratories: "🔬",
    MicroScalpels: "🔪",
    //Probes: "",
    //Proteins: "",
    Sensors: "📡",
    ToxicMunchers: "☣️",
    //Tracers: "",

    Artifacts: "🏺",
    Firewalls: "🔥",
    Games: "🕹️",
    //Holos: "",
    Hypnotapes: "🥱",
    Katydidics: "🦗",
    Libraries: "📚",
    Musiks: "🎸",
    //Sensamps: "",
    //Simulations: "",
    Studios: "🎙️",
    //Univators: ""
}

module.exports = {
    /**
     * Formats a commodity's name for output. Tacks on an emoji if one is available.
     * 
     * @param {String} commod
     */
    formatCommod: (commod) => {
        if(emoji[commod]) {
            return commod + " " + emoji[commod] + " "
        } else {
            return commod
        }
    }
}