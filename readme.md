# Thorne's Fed2 Bot

Built for the MUD [Federation II](https://federation2.com), this is a bot that hauls commodities between planets belonging to a planet owner. Cross-platform on anything that can run Node.js (including Windows, macOS, and Linux.)

This is currently setup to work with my star system and would require minor code changes to work for others needs.

## Setup

This assumes you already have Node setup on your machine. If not, plenty of guides already exist for that task.

Install the dependencies with ```npm install``` or ```yarn install```.

Username and password data is loaded from a file named ```.env``` not present in the repository for security reasons. Either copy or rename ```template.env``` and edit it to contain your login information.

Planet information is defined in ```planets.js``` and steps are defined in ```steps.js```. The repository contains the configuration I use in the Enso system These should be edited to suit your particular needs. Note that "TRADE" steps are two-way despite having a "from" and "to" value, though you need to be in the 
exchange of the "from" planet at the beginning of that step.

Now, finally, you can run the bot by typing ```npm start```.

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
