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
    list.push
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
    }
}