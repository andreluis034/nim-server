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
}

/**
 * 
 * @param {String} password 
 */
user.prototype.passwordMatches = function(password) {
    return this.password === password
}

module.exports = {
    /**
     * gets the user with the given nick
     * @param {String} nick 
     * @returns {user}
     */
    getUser(nick) {
        return usernames[nick]
    },
    /**
     * 
     * @param {String} nick 
     * @param {String} pass 
     * @returns {user}
     */
    createUser(nick, pass) {
        var s  =  new user(nick, pass)
        usernames[nick] = s
        return s
    }
}