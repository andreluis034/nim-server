const user = require('../../Nim/User')

function validateInput(req, res, next) {
    if(req.body.nick === undefined || req.body.pass === undefined) {
        res.writeHead(400)
        res.end(JSON.stringify({error: 'Missing nick or pass field'}))
        return
    }
    next()
}

function validateUser(req, res, next) {
    var us = user.getUser(req.body.nick)
    if(us === undefined) {
        us = user.createUser(req.body.nick, req.body.pass)
    } else if(!us.passwordMatches(req.body.pass)) {
        res.end(JSON.stringify({error: "User registered with a different password"}))
        return
    }
    req.user = us
    next()
    
}

module.exports = function(req, res) {
    res.write("{}")
}