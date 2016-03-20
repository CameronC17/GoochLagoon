var util 	= require('util');
var http = require('http');
var express = require('express');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

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

//##############################################//
//          SERVER STUFF                        //
//                                              //
//      © CAMERON CHALMERS, 2015                //
//##############################################//

//Checks to see if a new connection has been made
io.on('connection', onConnect);

function onConnect(socket) {
	console.log('\n + New connection. Reference: ' + socket.id);
	connected.push([socket.id, '']);
	console.log('There are currently ' + connected.length + ' users online.\n');

	//Functions here can only be ran once user is connected
	socket.on('disconnect', onDisconnect);	
}

function onDisconnect() {	
	for (var i = 0 ; i < connected.length; i++)
	{
		if (connected[i][0] == this.id)
			connected.splice(i, 1);
	}	

	util.log('There are ' + connected.length + ' users connected.');
};

//##############################################//
//          Starting functions                  //
//                                              //
//      © CAMERON CHALMERS, 2015                //
//##############################################//

server.listen(myPort);
console.log('\n\n----------------------\nServer started.\nListening on PORT: ' + myPort);
//CONNECT HERE
//console.log('Database connection: Successful.');
console.log('Starting game engine...' + "\n----------------------")
//game();
//sendUpdate();
