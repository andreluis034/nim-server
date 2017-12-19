const crypto = require('crypto');
const game = require('../Game')
const fs = require('fs');
const config = require('../../config.json')
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
    const hash = crypto.createHash('sha256');
    
    this.nick = nick
    this.salt = randomString(saltLength);
    this.password = hash.update(password+this.salt).digest('hex');
    this.victories = 0
    this.games = 0
    this.activeGameId = ""
}

/**
* Checks if the given password is valid
* @param {String} password 
* @returns {Boolean} - True if the given password is correct
*/
user.prototype.passwordMatches = function(password) {
    const hash = crypto.createHash('sha256');
    
    return this.password === hash.update(password+this.salt).digest('hex')
}

/**
* Sets the player's active game
* @param {Game} game 
*/
user.prototype.setActiveGame = function(game) {
    if(game === null){
        this.activeGameId = ""
        return;
    }
    this.activeGameId = game.gameID;
}

/**
* Gets the player's active game, undefined means no game
* @param {Game} returns the active game
*/
user.prototype.getActiveGame = function() {

    if(this.activeGameId === "")
        return null;
    return game.getActiveGame(this.activeGameId);
}

/**
* Gives up the current activeGame
*/
user.prototype.giveUp = function() {
    this.activeGame.giveUp(this)
}

/**
* Loads the usernames from the config file
*/
function restoreUsers(){
    console.log("INFO: Loading users from: " + config.storage.user)
    fs.readFile(config.storage.user, (err, data) => {
        if(err){
            console.log("WARNING: Failed to load saved users file\n" + err.message);
            return;
        }
        else{
            try {
                var users = JSON.parse(data);
                for(var key in users)
                {
                    usernames[key] = Object.assign(new user, users[key])
                }
                
            } catch (error) {
                console.log("WARNING: Failed to parse saved users, ignoring file\n"+ error.message)
                return;
            }
        }
        console.log("INFO: Loaded users from: " + config.storage.user)
    })
}

function saveUsers()
{
    console.log("INFO: Saving users to: " + config.storage.user)
    fs.writeFile(config.storage.user, JSON.stringify(usernames), (err) => {
        if(err) {
            console.log("WARNING: Failed to save users\n"+err.message)
            return;
        }
        console.log("INFO: Saved users to: " + config.storage.user)
    })    
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
        saveUsers();
        return s
    }
}

restoreUsers();
