var usernames = {

}
/**
 * 
 * @param {String} nick 
 * @param {String} password 
 */
function user(nick, password){
    this.nick = nick
    this.password = password
    this.victories = 0
    this.games = 0
    this.activeGame = null
}

/**
 * 
 * @param {String} password 
 */
user.prototype.passwordMatches = function(password) {
    return this.password === password
}

/**
 * 
 * @param {Game} game 
 */
user.prototype.setActiveGame = function(game) {
    this.activeGame = game
}

/**
 * Gives up the current activeGame
 */
user.prototype.giveUp = function() {
    this.activeGame.giveUp(this)
}

module.exports = {
    /**
     * gets the user with the given nick
     * @param {String} nick 
     * @returns {user}
     */
    getUser: function(nick) {
        return usernames[nick]
    },
    /**
     * 
     * @param {String} nick 
     * @param {String} pass 
     * @returns {user}
     */
    createUser: function(nick, pass) {
        var s  =  new user(nick, pass)
        usernames[nick] = s
        return s
    }
}