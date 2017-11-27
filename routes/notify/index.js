module.exports = {
    hasValidInfo: (req, res, next) => {
        if(req.body.game === undefined || req.body.stack === undefined || req.body.pieces === undefined) {
            res.writeHead(400)
            res.end(JSON.stringify({error: "missing arguments"}))
            return
        }
        var number = +req.body.stack
        if(Number.isNaN(number) || !Number.isInteger(number)) {
            res.writeHead(400)
            res.end(JSON.stringify({error: "Invalid stack " +req.body.stack}))
            return
        }
        req.body.stack = number
        number = +req.body.pieces
        if(Number.isNaN(number) || !Number.isInteger(number)) {
            res.writeHead(400)
            res.end(JSON.stringify({error: "Invalid pieces " +req.body.pieces}))
            return
        }
        req.body.pieces = number
        next()
    },
    getGame: (req, res, next) => {
        req.game = ranking.getActiveGame(req.body.game)
        if(req.game === undefined) {
            res.writeHead(400)
            res.end(JSON.stringify({error: `The game ${req.game} doesn't exist`}))
            return
        }
        next()
    },
    isValidPlay: (req, res, next) => {
        var result = req.game.isValidPlay(req.body)
        if(result !== true) {
            res.writeHead(400)
            res.end(JSON.stringify({error: result}))
            return
        }
        next()
    },
    final: (req, res) => {
        res.end("{}")
        req.game.makePlay(req.body)
    }
}