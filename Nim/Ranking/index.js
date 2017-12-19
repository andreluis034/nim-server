const config = require('../../config.json')
const fs = require('fs');

var ranking = {
}

/**
 * 
 * @param {String} nick 
 * @param {[*]} list 
 * @returns {Number} The index of the nick
 */
function addUser(nick, list)  {
    var index = list.push({
        nick: nick,
        victories: 0,
        games: 0
    }) - 1
    return index 
}

/**
 * @param {String} nick
 * @param {[*]} list 
 * @returns {Number} The index of the nick
 */
function findUser(nick, list) {
    for(var i = 0; i < list.length; ++i) {
        if(list[i].nick === nick)
            return i
    }
    return addUser(nick,list);
}

/**
 * 
 * @param {Number} size 
 * @returns {[*]}
 */
function getSize(size) {
    if(ranking[size] === undefined)
        ranking[size] = []
    return ranking[size]
}

/**
 * 
 * @param {[*]} list 
 */
function sortList(list) {
    list.sort((a,b) => {
        return b.victories - a.victories;
    })
}

/**
* Loads the usernames from the config file
*/
function restoreRanking(){
    console.log("INFO: Loading ranking from: " + config.storage.ranking)
    fs.readFile(config.storage.ranking, (err, data) => {
        if(err){
            console.log("WARNING: Failed to load ranking file\n" + err.message);
            return;
        }
        else{
            try {
                ranking = JSON.parse(data);
            } catch (error) {
                console.log("WARNING: Failed to parse saved ranking, ignoring file\n"+ error.message)
                return;
            }
        }
        console.log("INFO: Loaded ranking from: " + config.storage.ranking)
    })
}

function saveRanking()
{
    console.log("INFO: Saving ranking to: " + config.storage.ranking)
    fs.writeFile(config.storage.ranking, JSON.stringify(ranking), (err) => {
        if(err) {
            console.log("WARNING: Failed to save ranking\n"+err.message)
            return;
        }
        console.log("INFO: Saved ranking to: " + config.storage.ranking)
    })    
}

module.exports = {
    /**
     * @param {Number} size
     * @returns {[*]} The top 10 players for the given size
     */
    getTop: function(size) {
        if(ranking[size] === undefined)
            return []
        return ranking[size].slice(0, 10)
    },
    /**
     * Adds a win to the given user on the specified size, also adds a game 
     * Reorders the list
     * @param {String} nick
     * @param {Number} size
     */
    addWin: function(nick, size) {
        var lb = getSize(size)
        var index = findUser(nick, ranking[size])
        lb[index].victories++
        lb[index].games++
        sortList(lb)
        //saveRanking()
    },
    /**
     * Adds a game to the given user on the specified size
     * @param {String} nick
     * @param {Number} size
     */
    addGame: function(nick, size) {
        var lb = getSize(size)
        var index = findUser(nick, ranking[size])
        lb[index].games++
        //saveRanking()
    },
    saveRanking: saveRanking
}
restoreRanking()