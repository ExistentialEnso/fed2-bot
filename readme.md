# Thorne's Fed2 Bot

Built for the MUD [Federation II](https://federation2.com), this is a Node-powered bot that hauls commodities between planets belonging to a planet owner.

This is currently setup to work with my star system and would require minor code changes to work for others needs.

## Setup

Install the dependencies:

```bash
npm install
```

Username and password data is loaded from a file named ```.env``` not present in the repository. Either copy or rename ```template.env``` and edit it to contain your login information.

Now you can run the bot by typing:

```bash
npm start
```

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