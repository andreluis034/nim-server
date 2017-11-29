const game = require('../../Nim/Game')

module.exports = {
    hasValidInfo: (req, res, next) => {
        if(req.body.size === undefined) {
            res.writeHead(400)
            res.end(JSON.stringify({error: "missing arguments"}))
            return
        }
        var number = +req.body.size
        if(Number.isNaN(number) || !Number.isInteger(number)) {
            res.writeHead(400)
            res.end(JSON.stringify({error: "Invalid size"}))
            return
        }
        req.body.size = number
        next()
    },

    final: (req, res) => {
        var game = req.user.getActiveGame()
        if(req.user.getActiveGame() === null) {
            res.writeHead(400)
            res.end(JSON.stringify({error: "You're not in a game"}))
            return
        }
        req.user.giveUp()
        res.end("{}")
    }
}