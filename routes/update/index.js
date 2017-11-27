const ranking = require('../../Nim/Game')

function SSEClient(req, res) {
    this.req = req;
    this.res = res;
    this.req.socket.setNoDelay(true);
    this.res.writeHead(200, {
      'Content-Type': 'application/json', //TODO this might be wrong
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
  });
}

SSEClient.prototype.send = function(data) {
    this.res.write(JSON.stringify(data))
}

SSEClient.prototype.close = function() {
    this.res.end()
}

module.exports = {
    hasValidInfo: function(req, res, next) {
        console.log(req.query)
        console.log(req.query.nick)
        console.log(req.query.game)
        if(req.query === undefined || req.query.nick === undefined || req.query.game === undefined) {
            res.writeHead(400)
            res.end(JSON.stringify({error: "Missing arguments"}))
            return
        }
        req.game = ranking.getActiveGame(req.query.game)
        if(req.game === undefined) {
            res.writeHead(400)
            res.end(JSON.stringify({error: `No active game with id ${req.query.game}`}))
            return
        }
        if(!req.game.hasUser(req.query.nick)) {
            res.writeHead(400)
            res.end(JSON.stringify({error: `You don't belong in this game go away`}))
            return
        }
        next()
    },
    final: function(req, res) {
        req.game.bindClient(req.query.nick, new SSEClient(req, res))
    }
}