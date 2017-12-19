var leaderboard = [

]
var supportStorage = ((typeof window.localStorage) !== 'undefined')

var isOfflineActive = true
/**
 * Creates a leaderboard on the given div(tbody)
 * @param {HTMLTableSectionElement} div 
 * @param {*} leadeboar
 */
function buildLeaderboard(div, leadeboar)
{
	while(div.firstChild)
		div.removeChild(div.firstChild)
		
	console.log(leadeboar.length)
	for(var i = 0; i < leadeboar.length; ++i) {
		console.log(i)
		var elem = document.createElement('tr')
		var user = document.createElement('th')
		var np = document.createElement('th')
		user.className = 'user'
		user.textContent = leadeboar[i].nick
		np.className = 'victories'
		np.textContent = isOfflineActive ? leadeboar[i].np : leadeboar[i].victories
		elem.appendChild(user)
		elem.appendChild(np)
		div.appendChild(elem)
	}
		
}

/**
 * @param {NimGame} game
 * @param {String} username 
 * @param {Number} pointsWon
 * @param {Boolean} iGaveup
 */
function OnGameFinished(game, username, pointsWon, iGaveUp){
	if(!game.isOffline || iGaveUp)
		return
	var foundUser = false;
	for(var i = 0; i < leaderboard.length; i++) {
		console.log(leaderboard[i])
		if(leaderboard[i].nick === username) {
			leaderboard[i].np = parseFloat(leaderboard[i].np) +  pointsWon
			foundUser = true;
			break;
		}
	}
	if(!foundUser) {
		leaderboard.push({nick: username, np: pointsWon})
	}
	leaderboard.sort((a,b) => {
		return b.np-a.np
	})
	if(supportStorage)
		window.localStorage.setItem('leaderboard', JSON.stringify(leaderboard))
}

/**
 * Handles the load of the leaderboard page
 */
function OnLeaderBoardPageLoad() {
	var leaderboardElement = document.getElementById('big-leaderboard');
	if(isOfflineActive) {
		document.getElementById('rankingSize').style.display = "none"
		buildLeaderboard(leaderboardElement, leaderboard)
	}
	else {
		makeRequest("ranking", "POST", {size: document.getElementById('rankingSize').value}, (status, data) => {
			console.log(data.ranking)
			if(data.error)
				return
			buildLeaderboard(leaderboardElement, data.ranking)
		})
	}
}

function OnChangeLeaderboardType(type) {
	if(type === "offline") {
		document.getElementById('rankingSize').style.display = "none"
		document.getElementById('offline-lb').className = "mode active"
		document.getElementById('online-lb').className = "mode"
		isOfflineActive = true
	}
	else {
		document.getElementById('rankingSize').style.display = "block"
		document.getElementById('offline-lb').className = "mode"
		document.getElementById('online-lb').className = "mode active"
		isOfflineActive = false
	}
	console.log('HELLO')
	navigate("#/leaderboard")
}

if(supportStorage) {
	var temp = window.localStorage.getItem('leaderboard')
	if(temp === null){
		window.localStorage.setItem('leaderboard', JSON.stringify(leaderboard))
	} else {
		leaderboard = JSON.parse(temp)
	}
}

