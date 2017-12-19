"use strict";
//url -> div
var root_pages;
const selectsToReset = ['adversary', 'playOrder', 'gamedifficulty'];

var loginInfo = {
	signedIn: false,
	username: null
}
var playing = false
var currentPage = "#"
function homepageOnLoad() {

	cleanError();

	if(!loginInfo.signedIn) {
		document.getElementById('configuration').style.display = 'none'
		document.getElementById('login-form').style.display = 'block'
	}
	else {
		document.getElementById('configuration').style.display = 'block'
		document.getElementById('login-form').style.display = 'none'
		document.getElementById('username-display').innerHTML = loginInfo.username
	}
}

function onMyTurnToPlay() {
	if(currentPage !== "#/game") {
		document.getElementById('your-turn').style.display='block'		
	}
}

function bigHeaderHandler(show){
	if(show && playingGame && currentPage !== "#/game"){
		document.getElementById('returnToGame').style.display='block'
		if(myTurn)
			document.getElementById('your-turn').style.display='block'
	}
	else {
		document.getElementById('returnToGame').style.display='none'		
		document.getElementById('your-turn').style.display='none'
	}
}

const pages = {
	"#/leaderboard": {
		divID: "leaderboard",
		div: null,
		onload: function() {
			//resetSelects()
			OnLeaderBoardPageLoad()
			//buildLeaderboard(document.getElementById('big-leaderboard'))
			bigHeaderHandler(true)
		}
	},
	"#/about": {
		divID: "about",
		div: null,
		onload: function() {
			bigHeaderHandler(true)
		}
	},
	"#/game": {
		divID: "game-content",
		div: null,
		onload: function() {
			if(!playingGame) {

				var domElement = document.getElementById('game')
				var form = document.getElementById('startGame')
				var children = form.children
				var columns = parseInt(children[0].value)
				var gameType = (children[1].value)
				var playingFirst = (children[2].value)
				var difficulty = (children[3].value);
				var group = parseInt(children[4].value)

				console.log("WHAT?");
				console.log(columns);
				console.log("----------------------------------");
				console.log(children[0].value);
				console.log(children[1].value);
				console.log(children[2].value);
				console.log(children[3].value);
				console.log(children[4].value);
				console.log("----------------------------------");

				var game = new NimGame(gameType,columns,difficulty,playingFirst,domElement,loginInfo.username,group,loginInfo.password);
				game.on('gameFinish', OnGameFinished)
				
			}
			bigHeaderHandler(false)
		}
	},
	"#": {
		divID: "homepage",
		div: null,
		onload: homepageOnLoad
	},
	"#/": {
		divID: "homepage",
		div: null,
		onload: homepageOnLoad
	},
	
}

/**
 * Handles the click on links
 * @param {MouseEvent} event
 */
function onAnchorClick(event){
	if(event.target.hash === '#/logout') {
		navigate('#')
		return;
	}
	navigate(event.target.hash)
}

/**
 * 
 * @param {String} url
 * @returns {HTMLElement} 
 */
function getDivForUrl(url) {
	var div = pages[url].div;
	if(div === null)
		div = pages[url].div = document.getElementById(pages[url].divID);
	return div
}
/**
 * Navigates to the given URL
 * @param {String} url 
 */
function navigate(url) {
	if(url === "")
		url = "#"
	url = url || '#'
	if((url === "#" || url === "#/") && playingGame)
		return;
	var div = getDivForUrl(url)
	
	for(var elem in pages) {
		getDivForUrl(elem).style.display = 'none'
	}
	for(var i = root_pages.children.length - 1; i >= 0; --i) {
		root_pages.children[i].style.display ='none'
	}	
	if(pages[url].divID !== "homepage")
		document.getElementById('big-header').style.display = 'block'
	
	currentPage = url
	window.location.hash = url;
	if(pages[url].onload !== null)
		pages[url].onload()
	div.style.display = "block";
}

function resetSelects() {
	for(var i = selectsToReset.length - 1; i >= 0; --i) {
		document.getElementById(selectsToReset[i]).selectedIndex = 0
	}
}

function  disabledColor() {
	var elements = document.getElementsByTagName('input')
	for(var i = elements.length - 1; i >= 0; --i){
		if(elements[i].className !== 'text')
			continue;
		elements[i].addEventListener('keyup', (event) => {
			if(event.target.value.length == 0)
				event.target.style.color = '#919191'
			else
				event.target.style.color = '#353535'
		})
	}
}

function selectChange() {
	var elements = document.getElementsByTagName('select')
	for(var i = elements.length - 1; i >= 0; --i) {
		if(elements[i].className !== 'text')
			continue;
		elements[i].addEventListener('change', (event) => {
			event.target.style.borderColor = '#7A7A7A'
		})
	}
}

function playGame(event) {
	console.log("lets test")
	event.preventDefault()
	var elements = document.getElementById('startGame').children
	var allGood = true
	for(var i = elements.length - 1; i >= 0; --i) {
		if(elements[i].tagName === 'DIV')
			continue;
		console.log(elements[i].tagName)
		console.log(elements[i].selectedIndex)
		console.log(elements[i].value)
		if( ( (elements[i].tagName === "SELECT" && elements[i].selectedIndex === 0) 
			|| (elements[i].tagName === "INPUT" && elements[i].value === "") ) && elements[i].style.display == "inline"){
				elements[i].style.borderColor = '#B00'
				allGood = false			
		}

	}
	if(!allGood)
		return 
	navigate('#/game')
}

function cleanError(){
	var errorText = document.getElementById("error");
	errorText.innerHTML = "";
}

function throwJoinError(id){

	var errorText = document.getElementById("error");

	switch(id){
		case "loginButton":
		errorText.innerHTML = "Wrong user/password combination"
		break;
		case "registerButton":
		errorText.innerHTML = "Username already exists"
		break;
	}
}

function login(event) {
	loginInfo.username = document.getElementById('username_box').value
	loginInfo.password = document.getElementById('password_box').value

	makeRequest("register", "POST", {nick: loginInfo.username, pass: loginInfo.password}, (status, data) => {
		if(data.error){
			throwJoinError(event.target.id);
		}else{
			loginInfo.signedIn = true
			navigate('#')
			console.log(data)
			console.log(status)
		}
	})

}

function logout(event) {
	loginInfo.signedIn = false
	navigate('#')
}

function register(event) {
	login(event);
}

function changeDisplay(objects,display){
	for(var i = 0;i<objects.length;i++){
		document.getElementById(objects[i]).style.display = display;
	}
}

function changeGameMode(event){
	switch(event.target.value){
		case "Computer":
			changeDisplay(ComputerForms,'inline');
			changeDisplay(HumanForms,'none');
		break;
		case "Human":
			changeDisplay(ComputerForms,'none');
			changeDisplay(HumanForms,'inline');
		break;
	}
}

var ComputerForms = ['playOrder','gamedifficulty'];

var HumanForms = ['groupnumber'];

var FormEvents = [
	{
		elemId: 'startGame',
		eventName: 'submit',
		callback: playGame
	},
	{
		elemId: 'loginForm',
		eventName: 'submit',
		callback: (event) => {event.preventDefault()}
	},
	{
		elemId: 'loginButton',
		eventName: 'click',
		callback: login
	},
	{
		elemId: 'registerButton',
		eventName: 'click',
		callback: register
	},
	{
		elemId: 'logoutbutton',
		eventName: 'click',
		callback: logout
	},
	{	elemId: 'adversary',
		eventName: 'change',
		callback: changeGameMode
	},
	{
		elemId: 'returnToGame',
		eventName: 'click',
		callback: (event) => { navigate('#/game') }
	},
	{
		elemId: 'offline-lb',
		eventName: 'click',
		callback: () => {OnChangeLeaderboardType("offline")} 
	},
	{
		elemId: 'online-lb',
		eventName: 'click',
		callback: () => {OnChangeLeaderboardType("online")} 
	}, 
	{
		elemId: 'rankingSize',
		eventName: 'change',
		callback: () => {OnChangeLeaderboardType("online")}
	}
]
var initialPageNotAllowed = ['#/game', '#/logout']
window.onload = function() {
	disabledColor()
	selectChange()
	var anchors = document.getElementsByTagName('a');
	root_pages = document.getElementById('pages')

	for(var i = FormEvents.length - 1; i >= 0; --i) {
		var elem = document.getElementById(FormEvents[i].elemId)
		elem.addEventListener(FormEvents[i].eventName, FormEvents[i].callback)
	}
	for(var i = anchors.length - 1; i >= 0; --i) {
		anchors[i].addEventListener('click', onAnchorClick)
	}
	if(initialPageNotAllowed.indexOf(window.location.hash) > -1)
		window.location.hash = ''
	
	if(window.location.hash === '') {
		navigate('#')
		return;
	}
	navigate(window.location.hash)
}