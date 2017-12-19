"use strict";

var playingGame = false;
const someRandomNumberWeDontKnow = 700;
const aiThinkTime = 2000; //think time of the ai in ms
//const host = "twserver.alunos.dcc.fc.up.pt";
//const port = 8008;

function IsEven(n) {
	return n % 2 == 0
}

/**
* 
* @param {Number} min 
* @param {Number} max 
*/
function randomBetween(min, max) {
	return Math.floor(Math.random() * (max - min)) + min
}

/**
* @param {Number} column - The Column on which the balls will be removed
* @param {Number} removeCount - Number of balls to remove in the specified column
*/
function NimPlay(column, removeCount) {
	this.column = column
	this.removeCount = removeCount
}


/**
* @param {Number} size - The size of the ball in pixels
*/
function Ball(size){
	this.element = document.createElement('div');
	this.element.className = "ball";
	var size_px = size + "px"
	this.element.style.height=size_px;
	this.element.style.width=size_px;
}	


/**
* @param {HTMLElement} whereTo - The element where to append this ball to
*/
Ball.prototype.appendBall = function(whereTo){
	whereTo.appendChild(this.element);
}

Ball.prototype.hideBall = function(){
	this.element.style.visibility = "hidden";
}

Ball.prototype.paintBall = function(color){
	this.element.style.backgroundColor = color;
}

function Stack(width,height,gameContext,index){
	
	this.index = index;
	this.gameContext = gameContext;
	this.element = document.createElement('div');
	this.element.className = "stack";
	this.element.style.height = height;
	this.element.style.width = width;
	
	this.balls = [];
}

Stack.prototype.hoverStack = function(index){
	for(var i=this.balls.length-1;i>=index;i--){
		this.balls[i].paintBall("#7bb3f7");
	}
}

Stack.prototype.unHoverStack = function(index){
	for(var i=this.balls.length-1;i>=index;i--){
		this.balls[i].paintBall("#3889EA");
	}
}

Stack.prototype.pushToStack = function(ball) {
	
	var length = this.balls.length;
	var context = this;
	
	ball.element.addEventListener('mouseover', function() {
		context.hoverStack(length);
	}, false);
	
	ball.element.addEventListener('mouseout', function() {
		context.unHoverStack(length);
	}, false);
	
	ball.element.addEventListener('click', function() { 
		context.removeBallsByIndex(length);
	}, false);
	
	this.balls.push(ball);
	this.element.appendChild(ball.element);
}

Stack.prototype.appendStack = function(whereTo) {
	whereTo.appendChild(this.element);
}

Stack.prototype.removeBallsByIndex = function(index) {
	switch(this.gameContext.mode){
		case "Human":
		console.log("notifying...");
		this.gameContext.notifyPlay(new NimPlay(this.index, this.balls.length-index));
		break;
		case "Computer":
		if(!this.gameContext.myTurn)
		{
			this.gameContext.showAlert("Please Wait for the opponent to play");		
		}
		else
		{
			this.gameContext.makePlay(new NimPlay(this.index, this.balls.length-index));
		}
		break;
	}
	
}

Stack.prototype.removeBalls = function(removeCount){
	for(var i = 0; i<removeCount; i++){
		var ball = this.balls.pop();
		ball.hideBall();
	}
}

/**
* 
* @param {Number} columnCount - The Number of columns in the game
* @param {String} difficultyName - The difficulty name
* @param {String} mode - Playing vsAi or vsPlayer
* @param {Bool} meFirst - If the player in the current session plays first
*/

function NimGame(mode,columnCount, difficultyName, meFirst, domElement,userName,groupNumber,password) {	
	
	//new NimGame(mode,columns,undefined,undefined,domElement,loginInfo.username,group,loginInfo.password)
	domElement.innerHTML = ""
	playingGame = true;
	this.opponentName = "The opponent"
	this.isConnected = false;
	this.mode = mode;
	this.isOffline = this.mode === "Computer";
	this.userName = userName;
	this.columnNumber = columnCount;
	console.log(columnCount)
	this.verboseMode = false;
	this.columns = Array(columnCount).fill(0);
	this.limits = Array(columnCount).fill(0);
	this.maxBalls = (columnCount - 1) * 2 + 3;
	//this.myPlays = 0;
	//this.hisPlays = 0;
	this.initializeColumns();
	this.ballSize = (someRandomNumberWeDontKnow/this.maxBalls); //in pxs
	this.table_width = (columnCount*(this.ballSize)) + 5;
	this.events = {
		gameFinish: [],
		switchTurn: []
	}
	this.domElement = domElement;
	this.drawGame();
	
	if(!this.isOffline) {
		this.groupNumber = groupNumber;
		this.password = password;
		this.createConnecting();
		this.joinGame();
	}else {
		this.meFirst = meFirst;
		(this.meFirst == "enemyFirst") ? this.myTurn = false : this.myTurn = true;
		this.howManyPlays = 0;
		this.difficultyName = difficultyName;
		this.difficulty = this.difficulties[difficultyName];
		this.writeTurn();
		if(!this.myTurn){
			var context = this;
			setTimeout(function(){context.makePlay(context.getAiPlay());}, aiThinkTime);
		}
	}
	
	
}

NimGame.prototype.notifyPlay = function(play){
	
	var tmpPieces = this.columns[play.column].balls.length-play.removeCount;
	
	makeRequest("notify", "POST", {nick: loginInfo.username, pass: loginInfo.password,game: this.gameId, stack: play.column, pieces: tmpPieces}, (status, data) => {
		if(data.error){
			this.showAlert(data.error);
		}
	})
	
}

/**
* Writes the play that was made to the verbose div
* @param {NimPlay} play - the play that was made
* @param {String} name - The name of the players that played 
* @param {String} color - The color of the text
*/
NimGame.prototype.writePlay = function(play, name, color)  {
	this.appendVerbose(`${name} played in the column ${play.column} and removed ${play.removeCount} balls`, color)	
}

NimGame.prototype.onReceiveUpdate = function(data){

	if(data.error){
		console.log(data);
	}
	else
	{		
		
		if(data.turn !== undefined && data.turn !== this.userName){
			this.opponentName = data.turn;
		}
		this.myTurn = data.turn === this.userName
		this.writeTurn()
		if(!this.myTurn){
			this.timer.freeze();
		}
		else{
			this.timer.unFreeze();
		}
		console.log(data.turn)
		console.log(this.userName)
		if(data.stack !== undefined && data.pieces !== undefined){
			//new play update being received
			var ballsRemoved = this.columns[data.stack].balls.length-data.pieces;
			var play = new NimPlay(data.stack,ballsRemoved);
			this.myTurn = !this.myTurn;
			this.makePlay(play);
		}
		
		if(data.winner !== undefined){
			this.OnlineGameFinished(data);
		}
	}
}

/**
 * Joins the online game
 */
NimGame.prototype.joinGame = function(){
	makeRequest("join", "POST", {group: this.groupNumber, nick: this.userName, pass: this.password, size: this.columnNumber},(status, data) => {
		if(data.error){
			playingGame = false;
			navigate("#");
			alert(data.error);
			//console.log(data.error);
		}
		else{
			this.gameId = data.game;
			this.initializeServerEventListener(data.game);	
		}
	})
}

NimGame.prototype.initializeServerEventListener = function(gameId){
	//we wait for updates to do stuff
	this.eventSource = new EventSource(`http://${host}:${port}/update?nick=${this.userName}&game=${gameId}`);
	var context = this;
	this.eventSource.onmessage = function(event) {
		console.log("RECEIVED AN UPDATE!")
		console.log(event)
		if(event.data == "{}")
			return
		if(!this.isConnected){
			//here we let the user know somebody is ready to play.
				this.isConnected = true;
				context.toggleConnecting();		
		}

		var data = JSON.parse(event.data);
		context.onReceiveUpdate(data);
	}
}

NimGame.prototype.showOnlineEnding = function(message,color){
	
	console.log(message);
	playingGame = false;
	this.boardContainer.style.display = "none";
	var onlineEnding = document.createElement('div');
	var h1 = document.createElement('div');
	var buttonPlayAgain = document.createElement('div');
	var buttonLeaderboards = document.createElement('div');
	buttonPlayAgain.className = "button";
	buttonPlayAgain.innerHTML = "Play Again";
	buttonLeaderboards.className = "button";
	buttonLeaderboards.innerHTML = "Leaderboards";
	
	buttonPlayAgain.addEventListener('click', () => {
		navigate("#")
	})
	
	buttonLeaderboards.addEventListener('click', () => {
		navigate("#/leaderboard")
	})
	
	h1.className = "onlineEndingH1";
	h1.innerHTML = message;
	h1.style.color = color;
	onlineEnding.className = "onlineEnding";
	
	onlineEnding.appendChild(h1);
	onlineEnding.appendChild(buttonPlayAgain);
	onlineEnding.appendChild(buttonLeaderboards);
	
	this.domElement.appendChild(onlineEnding);
}

/**
 * Handles the online game finish
 * @param {*} data - The Online data representing the game
 */
NimGame.prototype.OnlineGameFinished = function(data){
	
	this.eventSource.close();
	
	if(data.stack !== undefined){
		//smooth ending
		if(data.winner == this.userName){
			this.showOnlineEnding("you won! congratulations!","#3889EA");
		}
		else{
			this.showOnlineEnding("you lost. try harder next time!","#b4b4b4");
		}
	}
	else{
		//somebody gave up.
		if(data.winner == this.userName){
			this.showOnlineEnding("The enemy gave up. You won!","#3889EA");
		}
		else{
			this.showOnlineEnding("what a fool. already giving up?","#b4b4b4");
		}
	}
	console.log("ACABOU.");
}

/**
 * Shows the points earned by the player in the offline game
 * @param {Boolean} iWon 
 * @param {Boolean} iGaveUp 
 */
NimGame.prototype.showOfflinePoints = function(iWon, iGaveUp) {
	var multiplier = {
		Difficulty: {
			value: iGaveUp ? 0 : (this.difficulties[this.difficultyName]/10),
			element: document.createElement('h3')
		},
		Plays: {
			value:  iGaveUp ? 0 : (1 + this.columns.length/(this.howManyPlays)),
			element: document.createElement('h3')
		},
		Columns: {
			value:  iGaveUp ? 0 : (1 + this.columns.length/10),
			element: document.createElement('h3')
		},
		gameFinished: {
			value: iGaveUp ? 0 : (iWon ? 1 : 0.1),
			element: document.createElement('h3')
		}
	}
	playingGame = false;
	this.boardContainer.style.display = "none";
	this.pointsBoard.style.display = "block";
	var finalText = document.createElement('h1');
	var totalPoints = 1;
	
	
	if(iGaveUp){
		this.pointsBoardTitle.innerHTML = "you gave up. the ai won the game.";
	}
	else{
		if(!iWon){
			this.pointsBoardTitle.innerHTML = "the ai won the game.";
			multiplier.gameFinished.element.innerHTML = "Defeated multiplier = <b>0.1</b>";
		}
		else{
			this.pointsBoardTitle.innerHTML = "congratulations, you won the game!";
			this.pointsBoardTitle.style.color = "#3889EA";
			multiplier.gameFinished.element.innerHTML = "Victorious multiplier = <b>1</b>";
		}
	}
	for(var prop in multiplier) {
		if(prop !== "gameFinished") {
			multiplier[prop].element.innerHTML = `${prop} multiplier = <b>${multiplier[prop].value}</b>`
		}
		totalPoints = totalPoints *  multiplier[prop].value;
		this.pointsBoard.appendChild(multiplier[prop].element)
	}
	totalPoints = totalPoints.toFixed(2);
	finalText.innerHTML = `Total points = <b>${totalPoints}</b>` // "Total points = "+"<b>"+totalPoints+"</b>";
	this.pointsBoard.appendChild(finalText);
	
	var buttonContainer = document.createElement('div');
	buttonContainer.className = "buttons";
	var changeSettignsButton = document.createElement('input');
	changeSettignsButton.className = "button right";
	changeSettignsButton.type = "submit";
	changeSettignsButton.value = "Change settings";
	changeSettignsButton.addEventListener('click' , () => {
		navigate("#")
	})
	var playAgainButton = document.createElement('input');
	playAgainButton.className = "button left";
	playAgainButton.type = "submit";
	playAgainButton.value = "Play again";
	playAgainButton.addEventListener('click', () => {
		navigate("#/game")
	})
	buttonContainer.appendChild(changeSettignsButton)
	buttonContainer.appendChild(playAgainButton)
	this.pointsBoard.appendChild(buttonContainer)
	return totalPoints
}


/**
 * Handles the game finish event
 * @param {Boolean} iWon 
 * @param {Boolean} iGaveUp 
 * @param {*} data - The Online data representing the game
 * @param {String} winner - The winning player
 */
NimGame.prototype.gameFinished = function(iWon, iGaveUp, data, winner){
	var points = 0
	if(this.isOffline){
		points = this.showOfflinePoints(iWon, iGaveUp);
	}
	
	else{
		if(iGaveUp) {
			makeRequest("leave", "POST", {game: this.gameId, nick: this.userName, pass: this.password},(status, data) => {
			})
		}
		else {
			this.OnlineGameFinished(data)
		}

	}
	
	
	for(var i = this.events.gameFinish.length - 1; i >= 0; --i){
		this.events.gameFinish[i](this, winner, points, iGaveUp)
	}
	
}

NimGame.prototype.cancelMatchMaking = function(){
	makeRequest("leave", "POST", {game: this.gameId, nick: this.userName, pass: this.password},(status, data) => {
		console.log("matchmaking was canceled");
		console.log(data);
		playingGame = false;
		navigate("#")
	})
}

NimGame.prototype.createConnecting = function(){
	var gameContent = document.getElementById("game-content");
	this.spanner = document.createElement('div');
	var prompt = document.createElement('div');
	var title = document.createElement('h2');
	var subtitle = document.createElement('h3');
	var button = document.createElement('div');
	var context = this;
	button.addEventListener('click', function() {
		context.cancelMatchMaking();
	}, false);
	button.className = "button";
	button.innerHTML = "Cancel matchmaking"
	subtitle.className = "promptH3";
	subtitle.innerHTML = "Your group id: "+this.groupNumber;
	title.className = "promptH2";
	title.innerHTML = "Waiting for opponent";
	this.spanner.className = "spanner";
	prompt.className = "prompt";
	prompt.appendChild(title);
	prompt.appendChild(subtitle);
	prompt.appendChild(button);
	this.spanner.appendChild(prompt);
	gameContent.appendChild(this.spanner);
}

NimGame.prototype.toggleConnecting = function(){
	this.timer = new Timer(2,0,this.timerCanvas,75);
	this.spanner.style.display = "none";
	this.timerCanvas.style.display = "block";
}

NimGame.prototype.showAlert = function(message){
	this.alert.innerHTML = message;
}

NimGame.prototype.cleanAlert = function(){
	this.alert.innerHTML = "&nbsp";
}

NimGame.prototype.writeTurn = function(){
	this.turn.innerHTML = this.myTurn ? "your turn" : "opponent's turn";
}

NimGame.prototype.showGiveUp = function(){
	this.confirmationContainer.style.visibility = "visible";
}

NimGame.prototype.hideGiveUp = function(){
	this.confirmationContainer.style.visibility = "hidden";
}

NimGame.prototype.appendVerbose = function(message,color){
	var text = document.createElement('p');	
	text.innerHTML = message;		
	text.style.color = color;			
	this.verboseText.appendChild(text);	
	this.verboseText.scrollTop = this.verboseText.scrollHeight;	
}

/**
* Makes the specified played
* @param {NimPlay} play 
*/
NimGame.prototype.makePlay = function(play){
	
	this.columns[play.column].removeBalls(play.removeCount);
	this.cleanAlert();
	
	if(this.isOffline && this.isOver()) {
		this.gameFinished(this.myTurn,false,undefined, this.userName);
		return;
	}
	
	
	if(!this.myTurn) {
		if(!this.isOffline){
			this.timer.resetTimer();
		}
		this.writePlay(play,this.opponentName,"#b4b4b4")
	}
	else {

		this.howManyPlays++
		this.writePlay(play,'You',"#3889EA")
		if(this.isOffline) {
			var context = this;
			setTimeout(function(){context.makePlay(context.getAiPlay());}, aiThinkTime);
		}
	}	
	this.myTurn = !this.myTurn;
	this.writeTurn();
	
}

NimGame.prototype.initializeDOM = function(){
	this.turn = document.createElement('h1');
	this.turn.className = "turn"
	this.alert = document.createElement('div');
	this.alert.innerHTML= "&nbsp";
	this.alert.className = "alert";
	this.canvas = document.createElement('div');
	this.canvas.className = "canvas";
	var width_px = this.table_width+"px";
	this.canvas.style.width = width_px;
	this.canvas.style.height = this.ballSize*this.maxBalls;
	this.boardContainer = document.createElement('div');
	
	//Verbose container:
	
	this.verboseCanvas = document.createElement('div');
	this.verboseCanvas.className = "verbose"
	this.verboseText = document.createElement('div');
	this.verboseCanvas.className = "canvas";
	this.verboseCanvas.style.width = this.table_width + "px";
	this.verboseText.className = "verbose_text";
	this.verboseCanvas.style.display = "none";
	
	//Verbose button
	this.verboseButton = document.createElement('div');
	this.verboseButton.className = "button verbose";
	this.verboseButton.innerHTML = "Verbose Mode";
	this.verboseButton.style.width = this.table_width + "px";
	
	var context = this;
	
	this.verboseButton.addEventListener('click', function() {
		(context.verboseMode) ? context.verboseCanvas.style.display = "none" : context.verboseCanvas.style.display = "block";
		context.verboseMode = !context.verboseMode;
	}, false);
	
	// -------------------- //
	
	//Give up button:
	
	this.giveUpButton = document.createElement('div');
	this.giveUpButton.className = "button giveup";
	this.giveUpButton.innerHTML = "Give up";
	this.giveUpButton.style.width = this.table_width + "px";
	this.giveUpButton.addEventListener("click", function() {
		context.showGiveUp();
	}, false);
	
	// -------------------- //
	
	//Give up container:
	
	this.confirmationContainer = document.createElement('div');
	this.confirmationContainer.style.visibility = "hidden";
	this.confirmationContainer.className = "spanner";
	
	
	var confirmation = document.createElement('div');
	confirmation.className = "giveUpPrompt";
	var confirmationText = document.createElement('h1');
	confirmationText.innerHTML = "Give up?";
	
	//Give up YES or NO buttons:
	
	var buttonYes = document.createElement('div');
	buttonYes.className = "button";
	buttonYes.innerHTML = "Yes"
	
	buttonYes.addEventListener("click", function() {
		context.gameFinished(false,true);
	}, false);
	
	var buttonNo = document.createElement('div');
	buttonNo.className = "button";
	buttonNo.innerHTML = "No";
	
	buttonNo.addEventListener("click", function() {
		context.hideGiveUp();
	}, false);
	
	
	// ---------------------- //
	
	//Points board for when the game is finished:
	
	this.pointsBoard = document.createElement('div');
	
	this.pointsBoard.className = "pointsBoard";
	
	
	this.pointsBoardTitle = document.createElement('h1');
	this.pointsBoardTitle.className ="title";
	
	
	var hr = document.createElement('hr');
	this.pointsBoard.appendChild(hr);
	
	var pointsBoardPoints = document.createElement('h2');
	pointsBoardPoints.innerHTML = "Points";
	
	var buttonContainer = document.createElement('div');
	buttonContainer.className = "buttons";
	var changeSettignsButton = document.createElement('input');
	changeSettignsButton.className = "button right";
	changeSettignsButton.type = "submit";
	changeSettignsButton.value = "Change settings";
	
	var playAgainButton = document.createElement('input');
	playAgainButton.className = "button left";
	playAgainButton.type = "submit";
	playAgainButton.value = "Play again";
	buttonContainer.appendChild(changeSettignsButton)
	buttonContainer.appendChild(playAgainButton)
	
	// -------------------- //

	//Timer if the game mode is online:


	if(!this.isOffline){
		this.timerCanvas = document.createElement('div');
		this.timerCanvas.className = "timerCanvas"
		console.log(145-this.columnNumber+"px");
		this.timerCanvas.style.marginRight = 165-this.columnNumber+"px";
		this.timerCanvas.style.display = "none";
	}

	

	// -------------------- //

	this.boardContainer.appendChild(this.turn);
	if(!this.isOffline){
		this.boardContainer.appendChild(this.timerCanvas);
	}
	this.boardContainer.appendChild(this.alert);
	this.boardContainer.appendChild(this.canvas);
	this.boardContainer.appendChild(this.verboseCanvas);
	this.boardContainer.appendChild(this.verboseButton);
	this.boardContainer.appendChild(this.giveUpButton);
	this.boardContainer.appendChild(this.confirmationContainer);
	this.domElement.appendChild(this.boardContainer);
	this.verboseCanvas.appendChild(this.verboseText);
	this.confirmationContainer.appendChild(confirmation);
	confirmation.appendChild(confirmationText);
	confirmation.appendChild(buttonYes);
	confirmation.appendChild(buttonNo);
	
	this.domElement.appendChild(this.pointsBoard);
	this.pointsBoard.appendChild(this.pointsBoardTitle);
	this.pointsBoard.appendChild(hr);
	this.pointsBoard.appendChild(pointsBoardPoints);
	this.pointsBoard.style.display = "none"
	
}

NimGame.prototype.initializeBoard = function() {
	var stackWidth = this.table_width/this.columnNumber-5;
	var stackHeight = this.ballSize*this.maxBalls;
	var counter = 1;
	for(var i = 0; i<this.columnNumber; i++){
		var column = new Stack(stackHeight,stackWidth,this,i);
		for(var j = 0; j<counter ; j++){
			var ball = new Ball(this.ballSize);
			column.pushToStack(ball);
		}
		column.appendStack(this.canvas);
		this.columns[i]=column;
		counter+=1;
	}
}

NimGame.prototype.drawGame = function() {
	this.initializeDOM();
	this.initializeBoard();
}

NimGame.prototype.initializeColumns = function() {
	var incrementer = 1;
	for (var i = 0; i < this.columns.length; i++) {
		this.columns[i] = incrementer;
		this.limits[i]=this.max_balls-incrementer-1;
		incrementer+=1;
	}	
}

/**
* @returns {Number} The nim sum of the current board
*/
NimGame.prototype.nimSum = function() {
	var nimSum = this.columns[0].balls.length;
	for (var i = 1; i < this.columns.length; i++) {
		nimSum = nimSum ^ this.columns[i].balls.length;
	}
	return nimSum;
}

/**
* @param {String} eventName
* @param {Function} callback
*/
NimGame.prototype.on = function(eventName, callback) {
	if(this.events[eventName] === null)
	this.events[eventName] = []
	this.events[eventName].push(callback)
}

NimGame.prototype.isOver = function() {
	for(var i = this.columns.length - 1; i >= 0; --i) {
		if(this.columns[i].balls.length !== 0)
		return false
	}
	return true
}

NimGame.prototype.shouldPlayRandom = function(){
	var random = randomBetween(0, 100)
	return random>=this.difficulty
}

/**
* @returns {Number} - Returns a random column which contains atleast one ball
*/
NimGame.prototype.getRandomValidColumn = function() {
	var valid = [];
	for(var i = this.columns.length - 1; i >= 0; --i) {
		if(this.columns[i].balls.length > 0){
			valid.push(i)
		}
	}
	return valid[randomBetween(0, valid.length - 1)]
}

NimGame.prototype.getAiPlay = function() {
	console.log("getting AI play...");
	var nimSum = this.nimSum()
	if(nimSum === 0 || this.shouldPlayRandom()) {
		var column = this.getRandomValidColumn();
		//console.log("aaPlaying in column "+column+" And "+randomBetween(0, this.columns[column].length));
		return new NimPlay(column, randomBetween(1, this.columns[column].balls.length))
	}
	for(var i = 0; i < this.columns.length; ++i) {
		if((this.columns[i].balls.length ^ nimSum) < this.columns[i].balls.length) {
			var ballsToRemove = this.columns[i].balls.length - (this.columns[i].balls.length ^ nimSum);
			return new NimPlay(i, ballsToRemove);
		}
	}
	
}

NimGame.prototype.difficulties = {
	easy: 25,
	normal: 50,
	heroic: 75,
	legendary: 100
}

