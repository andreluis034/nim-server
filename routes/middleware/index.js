const user = require('../../Nim/User')
const ranking = require('../../Nim/Game')


module.exports = {
    parseJSON: function(req, res, next) {
        var str = ''
        req.on('data', function(chunk) {
            str += chunk;
        })
        req.on('end', function() {
            try {
                req.body = JSON.parse(str)
            } catch (e) {
                res.writeHead(400)
                res.end(JSON.stringify({ error: e.message }))
                return;
            }
            next()
        })
    },
    hasUser: function(req, res, next) {
        if(req.body.nick === undefined || req.body.pass === undefined) {
            res.writeHead(400)
            res.end(JSON.stringify({error: 'Missing nick or pass field'}))
            return
        }
        next()
    },
    validateUser: function (req, res, next) {
        var us = user.getUser(req.body.nick)
        if(us === undefined) {
            us = user.createUser(req.body.nick, req.body.pass)
        } else if(!us.passwordMatches(req.body.pass)) {
            res.end(JSON.stringify({error: "User registered with a different password"}))
            return
        }
        req.user = us
        next()
    },


}