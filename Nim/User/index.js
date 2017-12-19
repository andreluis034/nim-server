var crypto = require('crypto');
const saltLength = 32;
/**
 * Returns a random alpha numeric string with the specified length
 * @param {Number} length 
 * @returns {String}
 */
function randomString(length) 
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
}
//Stores the usernames
var usernames = {

}
/**
 * Creates a new instance of user
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
 * Checks if the given password is valid
 * @param {String} password 
 * @returns {Boolean} - True if the given password is correct
 */
user.prototype.passwordMatches = function(password) {
    return this.password === password
}

/**
 * Sets the player's active game
 * @param {Game} game 
 */
user.prototype.setActiveGame = function(game) {
    this.activeGame = game
}

/**
 * Gets the player's active game, undefined means no game
 * @param {Game} returns the active game
 */
user.prototype.getActiveGame = function() {
    return this.activeGame
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