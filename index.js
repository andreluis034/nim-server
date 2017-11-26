const http = require('http')
const URL = require('url')
const server = http.createServer((request, response) => {
    const { headers, method, url } = request
    console.log(method)
    response.end(JSON.stringify(URL.parse(url)))
})

server.listen(8008)