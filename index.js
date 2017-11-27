const http = require('http')
const URL = require('url')
const routes = require('./routes')
const server = http.createServer(routes)

server.listen(8008)