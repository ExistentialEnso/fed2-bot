# Thorne's Fed2 Bot

Built for the text-based online game [Federation II](https://federation2.com), this is a bot that automates useful tasks for planet owners.

Cross-platform on anything that can run Node.js (including Windows, macOS, and Linux.)

## Features

🍕 Ensures your character eats when stamina is low to avoid death by starvation

📈 Able to "walk up" new exchanges, i.e. slowly increasing stockpiles to 20k tons over time

🚀 Calculates how many cargo bays your ship has (and refuels periodically!)

🧪 Validates configuration and tells you any problems found

📒 Logs useful information automatically

😍 Detailed output (with cute emoji!)

## Setup

If you don't have them already, install Node.js & npm. There are plenty of guides online on how to do this. You will need a terminal open to the directory where you have cloned or downloaded this repository.

Next, install the dependencies with ```npm install``` (or ```yarn install``` if you prefer yarn like me).

Your username and password data is loaded from a file named ```.env``` not present in the repository for security reasons. Either copy or rename ```template.env``` and edit it to contain your login information.

Planet data is defined in ```planets.js``` and steps are defined in ```steps.js```. I've included my personal configuration for the Enso system as an 
example to help understand how these files should be configured.

Now, finally, you can run the bot by typing ```npm start```.

## Notes

* Your character needs to be in the exchange of the first step's planet when beginning the bot
* Steps must have a type, which must be one of: ```MOVE```, ```TRADE```, ```WALK_UP```
* ```MOVE``` and ```TRADE``` steps require the following planet names: to, from
* ```TRADE``` steps are two way: if the ```to``` planet has surpluses that are deficits on the ```from``` planet, they are hauled
* ```TRADE``` steps put you back on the ```from``` planet when they finish
* The last step should ensure you are back on the planet where the first step starts
* All planet data requires the following arrays: ```toExchange```, ```fromExchange```, ```toLink```, ```fromLink```
* If the planet's orbit is the same as the interstellar link, just provide an empty array: ```[]```
* At least one planet must have ```toRestaurant``` and ```fromRestaurant``` defined to replenish stamina

## Logging

The bot automatically generates the following logs found in the ```logs``` folder:

* ```balances.csv``` - At the start of each cycle, this records your bank balance and the sum of your system's balances
* ```output.txt``` - All terminal output is saved here (minus the color/bold effects -- but it keeps the emoji!)

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
