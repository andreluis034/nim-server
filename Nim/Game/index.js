
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
}

game.prototype.addPlayer = function(user) {
    if(this.hasUser(user))
        return;
    if(this.players.length === 2)
        throw new Error(`${this.gameID} already contains 2 players, tried to add ${JSON.stringify(user)}`)
    if(this.currentTurn === null) 
        this.currentTurn = user
    this.players.push(user)
    if(this.players.length === 2)
        this.start()
}

game.prototype.hasUser = function(user) {
    for(var i = 0; i < this.players.length; ++i) 
        if(user === this.players[i])
            return true
    return false
}
game.prototype.start = function() {
    delete waitingLobby[this.groupID]
    activeGames[this.gameID] = this
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