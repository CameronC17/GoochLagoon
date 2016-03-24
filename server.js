var util 	= require('util');
var http = require('http');
var express = require('express');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);


//##############################################//
//          CLASS IMPORTS                       //
//                                              //
//      © CAMERON CHALMERS, 2015                //
//##############################################//
var Level = require('./level').Level;
var Character = require('./character').Character;

//##############################################//
//          SERVER VARIABLES                    //
//                                              //
//      © CAMERON CHALMERS, 2015                //
//##############################################//
var myPort = 8000;
var waitTime = 20;
var endGame = false;

//Holds connected users (not necessarily ingame)
var connected = [];

//all characters created
var characters = [];

//Players ingame
var players = [];

//Holds all the levels
var numLevels = 1;
var levels = [];

//##############################################//
//          SERVER STUFF                        //
//                                              //
//      © CAMERON CHALMERS, 2016                //
//##############################################//

//Checks to see if a new connection has been made
io.on('connection', onConnect);

function onConnect(socket) {
	util.log(' + New connection. Reference: ' + socket.id);
	connected.push([socket.id, '']);
	console.log('There are currently ' + connected.length + ' users online.\n');

	//Functions here can only be ran once user is connected
	socket.on('disconnect', onDisconnect);
	socket.on('logincheck', loginCheck);
}

function loginCheck() {
	//CHANGE THIS STUFF LATER
	characters.push(new Character(characters.length, "Cameron", 0, this.id));
	connected[0][1] = "Cameron";
	players.push(characters[0]);
}

function onDisconnect() {	
	/*for (var i = 0; i < connected.length; i++)
	{
		if (connected[i][0] == this.id)
			connected.splice(i, 1);
	}*/
	connected = [];
	characters = [];
	players = [];
	util.log(' - User Diconnected. There are ' + connected.length + ' users online.\n');
};

//##############################################//
//          Starting functions                  //
//                                              //
//      © CAMERON CHALMERS, 2016                //
//##############################################//

server.listen(myPort);
console.log('\n\n----------------------\nServer started.\nListening on PORT: ' + myPort);
console.log('Starting game engine...' + "\n----------------------");
loadLevels();
console.log('Levels Loaded: ' + numLevels);
//Game logic
//gameEngine();
//Send updates to users
sendUpdate();
console.log('SERVER IS LIVE' + "\n----------------------");

function loadLevels() {
	for (var i = 0; i < numLevels; i++) {
		levels.push(new Level(i));
	}


}

//##############################################//
//          GAME + SEVER SEND INFO              //
//                                              //
//      © CAMERON CHALMERS, 2016                //
//##############################################//

function sendUpdate() {
	//console.log(players.length);
	for (var i = 0; i < players.length; i++)
	{
		io.to(players[i].getCurrentID()).emit('serverUpdate', {levelData : levels[players[i].getLevelID()]});
	}
	/*console.log("hnm");
	for (var i = 0; i < connected.length; i++) {
		console.lo
		io.to(connected[i][0]).emit('serverUpdate', {test: "TEST"});
	}*/

	setTimeout(function () {	
        sendUpdate();
    }, waitTime);
}