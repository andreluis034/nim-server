const config = require('./config.json')
const http = require('http')
const URL = require('url')
const routes = require('./routes')
const server = http.createServer(routes)
server.on('listening', () => {
    console.log(`Listening on http://127.0.0.1:${config.port}`)
})
server.listen(config.port)