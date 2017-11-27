const http = require('http')
const URL = require('url')
const middleware = require('./middleware')
const register = require('./register')

var routes = {}

function Route() {
    this.path = arguments[0]
    this.callbacks = []
    for(var i = arguments.length - 1 ; i >= 1; --i) {
        this.callbacks.push(arguments[i])
    }
}

/**
 * 
 * @param {String} method 
 * @param {Route} route 
 */
function addRoute(method, route){
    if(routes[method] === undefined)
        routes[method] = {}
    routes[method][route.path] = route
}

addRoute('POST', new Route('/register', middleware.parseJSON, register))

/**
 * Handles the incoming request
 * @param {IncomingMessage} request 
 * @param {ServerResponse} response 
 */
module.exports = function(request, response){
    request.url = URL.parse(request.url)
    if(routes[request.method] === undefined) {
        response.end(JSON.stringify({error: `unknown ${request.method} request`}))
        return
    }
    var path = routes[request.method][request.url.pathname]
    if(path === undefined) {
        response.end(JSON.stringify({error: `unknown ${request.method} request`}))
        return
    }
    var callbacks = path.callbacks.slice()
    function next() {
        console.log('hi')
        callback = callbacks.pop();
        callback(request, response, next)
    }
    callbacks.pop()(request, response, next)    
}