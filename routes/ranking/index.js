const ranking = require('../../Nim/Ranking')

module.exports = {
    hasValidInfo: (req, res, next) => {
        if(req.body.size === undefined) {
            res.writeHead(400)
            res.end(JSON.stringify({error: "Undefined size"}))
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
        var top = ranking.getTop(req.body.size)
        res.end(JSON.stringify({ranking: top}))
    }
}