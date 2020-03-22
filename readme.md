# Thorne's Fed2 Bot

Built for the MUD [Federation II](https://federation2.com), this is a bot that hauls commodities between planets belonging to a planet owner. Cross-platform on anything that can run Node.js (including Windows, macOS, and Linux.)

## Features

🍕 Ensures your character eats when stamina is low to avoid death by starvation.

🚀 Calculates how many cargo bays your ship has (and refuels periodically!)

🧪 Validates configuration and outputs any problems found.

😍 Detailed output (with cute emoji!)

## Setup

If you don't have them already, install Node.js & npm. There are plenty of guides online on how to do this.

Next, install the dependencies with ```npm install``` (or ```yarn install``` if you prefer yarn like me).

Your username and password data is loaded from a file named ```.env``` not present in the repository for security reasons. Either copy or rename ```template.env``` and edit it to contain your login information.

Planet data is defined in ```planets.js``` and steps are defined in ```steps.js```. I've included my personal configuration for the Enso system as an 
example to help understand how these files should be configured.

Now, finally, you can run the bot by typing ```npm start```.

## Notes

* Your character **must** be in the exchange of the first step's planet when beginning the bot
* All step data requires the following fields: type, to, from
* Step type must be either "MOVE" or "TRADE"
* Steps with type "TRADE" put you back on the "from" planet at the end, so the next step should have the same "from" value
* The last step should put you back on the planet where you started
* All planet data requires the following fields: toExchange, fromExchange, toLink, fromLink
* If the planet's orbit is the same as the interstellar link, just provide an empty array: ```[]```
* You must define restaurant info for at least one planet to replenish stamina

## License

MIT License

Copyright (c) 2020 Thorne Melcher

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
