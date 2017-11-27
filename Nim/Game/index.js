
var gameId = 0;
var waitingLobby = {
    
}
var activeGames = {
    
}
/**
* 
* @param {Number} size 
* @param {*} groupID 
*/
function game(size, groupID) {
    this.groupID = groupID
    this.gameID = (gameId++).toString(16)
    this.players = []
    this.currentTurn = null
    this.rack = []
    this.clientsConnected = 0
    for(var i = 0; i < size; ++i) {
        this.rack.push(i + 1)
    }
    activeGames[this.gameID] = this
}

game.prototype.addPlayer = function(user) {
    if(this.hasUser(user.nick))
    return;
    if(this.players.length === 2)
    throw new Error(`${this.gameID} already contains 2 players, tried to add ${JSON.stringify(user)}`)
    var player = {user: user, SSEClient: undefined}
    if(this.currentTurn === null) 
    this.currentTurn = player
    this.players.push(player)
    if(this.players.length === 2)
    this.ready()
}

/**
* 
* @param {String} nick 
* @returns {Boolean}
*/
game.prototype.hasUser = function(nick) {
    for(var i = 0; i < this.players.length; ++i) 
    if(nick === this.players[i].user.nick)
    return true
    return false
}

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
* 
* @param {String} msg 
*/
game.prototype.broadcast = function(msg) {
    for(var i = 0; i < this.players.length; ++i) {
        this.players[i].SSEClient.send(msg)
    }
}

game.prototype.start = function() {
    this.broadcast(JSON.stringify({
        turn: this.currentTurn.user.nick,
        rack: this.rack
    }))
}

/**
* 
* @param {*} play
* @returns {String|Number} 
*/
game.prototype.validPlay = function(play) {
    console.log(play)
    if(play.nick !== this.currentTurn.user.nick)
        return "Not your turn to play"
    if(play.stack >= this.rack.length || play.stack < 0)
        return "Invalid stack " + play.stack
    if(play.pieces < 0)
        return "Stack cannot have a negative number of pieces"
    if(this.rack[play.stack] == 0)
        return "You cannot make a play on an empty stack"
    return true
}

/**
* 
* @param {*} play 
*/
game.prototype.makePlay = function(play) {
    this.rack[play.stack] = play.pieces
    if(this.finalState()){
        this.broadcast(JSON.stringify({
            winner: this.currentTurn.user.nick,
            rack: this.rack,
            stack: play.stack,
            pieces: play.pieces
        }))
        //TODO save victories
        return;
    }
    this.switchTurn()
    this.broadcast(JSON.stringify({
        turn: this.currentTurn.user.nick,
        rack: this.rack,
        stack: play.stack,
        pieces: play.pieces
    }))
    //TODO end game
}

/**
* Changes the turn to the next player
*/
game.prototype.switchTurn = function() {
    if(this.currentTurn === this.players[0])
    this.currentTurn = this.players[1]
    else
    this.currentTurn = this.players[0]
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