const ranking = require('../../Nim/Game')

function SSEClient(req, res) {
    this.req = req;
    this.res = res;
    this.req.socket.setNoDelay(true);
    this.res.writeHead(200, {
      'Content-Type': 'text/event-stream', //TODO this might be wrong
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
  });
  this.res.write(':ok\n\n')
  this.id = 0
  this.send("{}")
}

/**
 * 
 * @param {String} data 
 */
SSEClient.prototype.send = function(data) {
    var toSend = `id: ${this.id++}\n\n`
    toSend += "data: " + data + "\n\n"
    this.res.write(toSend)
}

SSEClient.prototype.close = function() {
    this.res.end()
}

module.exports = {
    hasValidInfo: function(req, res, next) {
        if(req.url.query === undefined || req.url.query.nick === undefined || req.url.query.game === undefined) {
            res.writeHead(400)
            res.end(JSON.stringify({error: "Missing arguments"}))
            return
        }
        req.game = ranking.getActiveGame(req.url.query.game)
        if(req.game === undefined) {
            res.writeHead(400)
            res.end(JSON.stringify({error: `No active game with id ${req.url.query.game}`}))
            return
        }
        if(!req.game.hasUser(req.url.query.nick)) {
            res.writeHead(400)
            res.end(JSON.stringify({error: `You don't belong in this game go away`}))
            return
        }
        next()
    },
    final: function(req, res) {
        req.game.bindClient(req.url.query.nick, new SSEClient(req, res))
    }
}