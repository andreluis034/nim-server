const game = require('../../Nim/Game')

module.exports = {
    hasValidInfo: (req, res, next) => {
        if(req.body.group === undefined || req.body.size === undefined) {
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

    getGameLobby: (req, res, next) => {
        req.game = game.getGameLobby(req.body.size, req.body.group)
        next()
    },
    final: (req, res) => {
        req.game.addPlayer(req.user)
        res.end(JSON.stringify({game: req.game.gameID}))
    }
}