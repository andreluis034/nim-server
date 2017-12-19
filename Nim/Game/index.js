const ranking = require('../Ranking')
var crypto = require('crypto');

var waitingLobby = {
    
}
var activeGames = {
    
}
/**
* Creates an instance of a game
* @param {Number} size 
* @param {*} groupID 
*/
function game(size, groupID) {
    const hash = crypto.createHash('md5');    
    this.size = size
    this.groupID = groupID
    this.gameID = hash.update(`${Date.now()}_${this.groupID}_${this.size}`).digest('hex');//(gameId++).toString(16)
    this.players = []
    this.currentTurn = null
    this.rack = []
    this.clientsConnected = 0
    this.playing = false
    this.timeout = undefined
    for(var i = 0; i < size; ++i) {
        this.rack.push(i + 1)
    }
    activeGames[this.gameID] = this
}

game.prototype.addPlayer = function(user) {
    this.clearTimeout()
    if(this.hasUser(user.nick))
        return;
    if(this.players.length === 2)
        throw new Error(`${this.gameID} already contains 2 players, tried to add ${JSON.stringify(user)}`)
    var player = {user: user, SSEClient: undefined}
    user.setActiveGame(this)
    if(this.currentTurn === null) 
        this.currentTurn = player
    this.players.push(player)
    if(this.players.length === 2)
        this.ready()
    else 
        this.setTimeout()
}

/**
* Checks if a given nick is playing
* @param {String} nick 
* @returns {Boolean}
*/
game.prototype.hasUser = function(nick) {
    for(var i = 0; i < this.players.length; ++i) {
        if(nick === this.players[i].user.nick){
            return true
        }
    }
    return false
    
}

/**
 * Marks the lobby as ready, no other players can join
 */
game.prototype.ready = function() {
    delete waitingLobby[this.groupID]
}

/**
* 
* @param {String} nick 
* @param {SSEClient} sseclient 
*/
game.prototype.bindClient = function(nick, sseclient){
    for(var i = 0; i < this.players.length; ++i) {
        if(nick === this.players[i].user.nick){
            this.players[i].SSEClient = sseclient
            break;            
        }
    }
    this.clientsConnected++
    if(this.clientsConnected == 2) {
        this.start()
    }
}

/**
* Sends the specified message to all users
* @param {String} msg 
*/
game.prototype.broadcast = function(msg) {
    for(var i = 0; i < this.players.length; ++i) {
        this.players[i].SSEClient.send(msg)
    }
}

game.prototype.start = function() {
    this.clearTimeout()
    this.playing = true
    this.broadcast(JSON.stringify({
        turn: this.currentTurn.user.nick,
        rack: this.rack
    }))
    this.setTimeout()
}

/**
* 
* @param {*} play
* @returns {String|Number} 
*/
game.prototype.validPlay = function(play) {
    if(play.nick !== this.currentTurn.user.nick)
        return "Not your turn to play"
    if(play.stack >= this.rack.length || play.stack < 0)
        return "Invalid stack " + play.stack
    if(play.pieces < 0)
        return "Stack cannot have a negative number of pieces"
    if(play.pieces > this.rack[play.stack]) 
        return "You cannot add pieces to the stack"
    if(this.rack[play.stack] == 0)
        return "You cannot make a play on an empty stack"
    return true
}

game.prototype.clearTimeout = function() {
    if(this.timeout !== undefined) {
        clearTimeout(this.timeout)
        this.timeout = undefined
    }
}

game.prototype.setTimeout = function() {
    var self = this
    this.timeout = setTimeout(() => {
        self.currentTurn.user.giveUp()
    }, 2 * 60 * 1000)
}

/**
* @param {*} play 
*/
game.prototype.makePlay = function(play) {
    this.clearTimeout()
    this.rack[play.stack] = play.pieces
    if(this.finalState()){
        this.broadcast(JSON.stringify({
            winner: this.currentTurn.user.nick,
            rack: this.rack,
            stack: play.stack,
            pieces: play.pieces
        }))
        this.gameFinished()
        return;
    }
    this.switchTurn()
    this.broadcast(JSON.stringify({
        turn: this.currentTurn.user.nick,
        rack: this.rack,
        stack: play.stack,
        pieces: play.pieces
    }))
    this.setTimeout()
}

game.prototype.gameFinished = function(){
    for(var i = 0; i < this.players.length; ++i) {
        if(this.currentTurn == this.players[i]) {
            ranking.addWin(this.players[i].user.nick, this.size)
        } else {
            ranking.addGame(this.players[i].user.nick, this.size)
        }
    }
    this.finishCleanup()
}

/**
* Changes the turn to the next player
*/
game.prototype.switchTurn = function() {
    if(this.currentTurn === this.players[0])
        this.currentTurn = this.players[1]
    else
        this.currentTurn = this.players[0]
    var self = this;
}

/**
* returns true if the game is in its final state
* @returns {Boolean}
*/
game.prototype.finalState = function() {
    for(var i = 0; i < this.rack.length; ++i){
        if(this.rack[i] !== 0)
        return false
    }
    return true
}

game.prototype.finishCleanup = function () {
    this.clearTimeout()
    delete activeGames[this.gameID]
    if(!this.playing) {
        delete waitingLobby[this.groupID]
    }
    for(var i = 0; i < this.players.length; ++i) {
        this.players[i].user.setActiveGame(null)
        this.players[i].SSEClient.close()
    }
}

/**
 * Makes the specified user give up
 * @param {user} user 
 */
game.prototype.giveUp = function(user) {
    if(!this.playing) {
        this.broadcast(JSON.stringify({
            winner: null
        }))
        this.finishCleanup()
        return;
    }

    var winner = null
    for(var i = 0; i < this.players.length; ++i) {
        if(this.players[i].user !== user) {
            winner = this.players[i].user.nick
        }
    }
    this.broadcast(JSON.stringify({
        winner: winner
    }))
    this.gameFinished()
}

module.exports = {
    /**
    * @param {Number} size
    * @param {*} groupID
    * @returns {game}
    */
    getGameLobby: function(size, groupID) {
        var id = `${size}+${groupID}`
        if(waitingLobby[id] === undefined)
        waitingLobby[id] = new game(size, id)
        return waitingLobby[id]
    },
    /**
    * @param {String} gameID
    * @returns {game}
    */
    getActiveGame: function(gameID) {
        return activeGames[gameID]
    }
}