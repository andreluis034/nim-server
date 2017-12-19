"use strict";

function Timer(minutes,seconds,domEllement,size){

	this.minutesLock = minutes;
	this.secondsLock = seconds;
	this.frozen = false;
	this.canvas = document.createElement('canvas');
	this.canvas.width = size;
	this.canvas.height = size;
	domEllement.appendChild(this.canvas);

	this.context=this.canvas.getContext("2d");

	this.initializeStyle(size,"#3889EA","#e9e9e9",5,20);
	
	this.totalTime = (minutes*60+seconds)*1000;
	this.startTime = new Date().getTime();
	this.endTime = this.startTime + this.totalTime; // convert the second to ms
	this.currentTime = this.startTime;

	this.minutes = minutes;
	this.seconds = seconds;
	this.circleInterval = 2*Math.PI;

	var timerContext = this;

	this.runTimer = setInterval(function(){
		if(!this.frozen){
			var currentTime = new Date().getTime();
			var distance = timerContext.endTime-currentTime;
			distance = Math.round(distance / 100) * 100;
			timerContext.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
			timerContext.seconds = Math.floor((distance % (1000 * 60)) / 1000);
		}	
	},1000);

	this.drawTimer();
}

Timer.prototype.initializeStyle = function(size,positiveColor,negativeColor,lineWidth,fontSize){
	this.positiveColor = positiveColor;
	this.negativeColor = negativeColor;
	this.lineWidth = lineWidth;
	this.center = size/2;
	this.radius = size/2 - lineWidth;
	this.context.lineWidth=lineWidth;
	this.context.strokeStyle=positiveColor;
	this.context.textBaseline = 'middle';
	this.context.textAlign="center"; 
	this.context.font=fontSize+"px Arial";
	this.context.fillStyle = positiveColor;
}

Timer.prototype.clearCanvas = function(){
	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  	this.context.beginPath();	
}

Timer.prototype.resetTimer = function(){
	this.startTime = new Date().getTime();
	this.currentTime = this.startTime;
	this.minutes = this.minutesLock;
	this.seconds = this.secondsLock;
	this.endTime = this.currentTime + (60*this.minutes+this.seconds)*1000;
}

Timer.prototype.writeTime = function(){
	if(this.seconds<10){
  		this.context.fillText(`${this.minutes}:0${this.seconds}`,this.center,this.center);
  	}
  	else{
  		this.context.fillText(`${this.minutes}:${this.seconds}`,this.center,this.center);
  	}
}

Timer.prototype.freeze = function(){
	this.resetTimer();
	this.frozen = true;
}

Timer.prototype.unFreeze = function(){
	this.frozen = false;
	this.resetTimer();
	this.drawTimer();
}

Timer.prototype.drawArc = function(start,end,color){
	this.context.strokeStyle = color;
	this.context.arc(this.center,this.center,this.radius,start,end);
	this.context.stroke();
	this.context.beginPath();
	this.context.closePath();
}

Timer.prototype.drawTimer = function(){


	this.clearCanvas();
	this.writeTime();	

	this.currentTime = new Date().getTime();

	var distance = this.endTime - this.currentTime;
	var percentage = distance*100/this.totalTime;
	var unPercentage = 100 - percentage;
	var decrease = unPercentage/100*this.circleInterval;
	var increase = percentage/100*this.circleInterval;

	this.drawArc(-0.5*Math.PI,1.5*Math.PI-decrease,this.positiveColor);

	this.drawArc(1.5*Math.PI+increase,1.5*Math.PI,this.negativeColor);


	if(!this.frozen){
		window.requestAnimationFrame(this.drawTimer.bind(this));
	}

	else{
		this.clearCanvas();
		this.context.fillStyle = this.negativeColor;
		this.writeTime();
		this.context.fillStyle = this.positiveColor;
		this.drawArc(-0.5*Math.PI,1.5*Math.PI,this.negativeColor);
	}

}