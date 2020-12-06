//server.js
const http = require('http');
const app = require('./main');

require('dotenv').config()

const port = process.env.PORT || 2021;

const server = http.createServer(app);

server.listen(port);

console.log("server running on:" + port);