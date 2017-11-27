
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
    for(var i = 0; i < size; ++i) {
        this.rack.push(i + 1)
    }
}

game.prototype.addPlayer = function(user) {
    if(this.hasUser(user))
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

game.prototype.hasUser = function(user) {
    for(var i = 0; i < this.players.length; ++i) 
        if(user === this.players[i].user)
            return true
    return false
}

game.prototype.ready = function() {
    delete waitingLobby[this.groupID]
    activeGames[this.gameID] = this
}

game.prototype.start = function() {

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
    if(play.pieces < 1)
        return "you must remove at least one piece"
    if(this.rack[play.stack] < play.pieces)
        return "Stack cannot have a negative numver of pieces"
    return true
}

game.prototype.makePlay = function(play) {
    this.rack[play.stack] -= play.pieces
    this.switchTurn()
    //TODO send data
}

game.prototype.switchTurn = function() {
    if(this.currentTurn === this.players[0])
        this.currentTurn = this.players[1]
    else
        this.currentTurn = this.players[0]
}

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
     */
    getActiveGame: function(gameID) {
        return activeGames[gameID]
    }
}