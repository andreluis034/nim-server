const http = require('http')
const URL = require('url')
const middleware = require('./middleware')
const register = require('./register')
const ranking = require('./ranking')
const join = require('./join')
const notify = require('./notify')
const update = require('./update')
const leave = require('./leave')

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

addRoute('POST', new Route('/register', middleware.parseJSON, 
    middleware.hasUser, middleware.validateUser, register.final))
addRoute('POST', new Route('/ranking', middleware.parseJSON, 
    ranking.hasValidInfo, ranking.final))
addRoute('POST', new Route('/join', middleware.parseJSON, 
    middleware.hasUser, middleware.validateUser, middleware.checkIfActiveGame,
    join.hasValidInfo, join.getGameLobby, join.final))
addRoute('POST', new Route('/notify', middleware.parseJSON, 
    middleware.hasUser, middleware.validateUser, notify.hasValidInfo, 
    notify.getGame, notify.isValidPlay, notify.final))
addRoute('POST', new Route('/leave', middleware.parseJSON, 
    middleware.hasUser, middleware.validateUser, leave.final))
addRoute('GET', new Route('/update', update.hasValidInfo, update.final))

/**
 * Handles the incoming request
 * @param {IncomingMessage} request 
 * @param {ServerResponse} response 
 */
module.exports = function(request, response){
    response.setHeader("Content-Type", "application/json")
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Cache-Control", "no-cache");

    request.url = URL.parse(request.url, true)
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
        callback = callbacks.pop();
        callback(request, response, next)
    }
    callbacks.pop()(request, response, next)    
}