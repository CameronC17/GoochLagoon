//##############################################//
//          GLOBAL VARIABLES                    //
//                                              //
//      © CAMERON CHALMERS, 2015                //
//##############################################//

var util 	= require('util');
var http = require('http');
var express = require('express');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

//Class imports
var Player = require('./Player').Player;
var Enemy = require('./Enemy').Enemy;
var HealthPack = require('./HealthPacks').HealthPack;
var Projectile = require('./Projectile').Projectile;
var Weapon = require('./Weapon').Weapon;
var Boots = require('./Boots').Boots;
var Chest = require('./Chests').Chest;
var Hat = require('./Hats').Hat;
var Light = require('./Lights').Light;

//Server variables
var myPort = 8000;
var waitTime = 20;
var endGame = false;

//Holds connected users (not necessarily ingame)
var connected = [];

//Holds all of the characters in memory - this may only be temporary til i get the database
var players = [];

//Holds all the players currently INGAME
var playersInGame = [];

//Holds all of the enemy monsters ingame
var enemiesInGame = [];

//Holds all of the health packs ingame
var healthPacksIngame = [];

//Holds all of the projectiles
var projectilesIngame = [];

//Holds all of the weapons on the map
var weaponsInGame = [];

//Holds all of the boots on the map
var bootsInGame = [];

//Holds all of the chest armour on the map
var chestsInGame = [];

//Holds all of the hats on the map
var hatsInGame = [];

//Holds all of the lights on the map
var lightsInGame = [];

//Limits for items spawning
var maxHealthPacks = 50;
var maxWeapons = 50;
var maxBoots = 50;
var maxEnemiesZ1 = 50;
var maxEnemiesZ2 = 30;
var maxEnemiesPerPlayer = 10;
var maxChests = 50;
var maxHats = 50;
var maxLights = 50;

//Night day cycle stuff
var timeOfDay = 0;
var startNight = 60000;
var lightIncrement = 30000;

//Respawn timer for city zombies
var zombieRespawn = new Date().getTime();

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
	console.log('There are currently ' + connected.length + ' users online.');

	//Functions here can only be ran once user is connected
	socket.on('disconnect', onDisconnect);
	socket.on('signup', createPlayer);
	socket.on('spawnreq', spawnPlayer);
	socket.on('keypress', registerKeys);
	socket.on('chatmessage', sendChat);
	socket.on('loginPlayer', loginUser);
	socket.on('networkTrack', networkTrack);
	socket.on('editStats', editStats);
};

function onDisconnect() {
	var currentPlayer = playerByConnection(this.id);
	if (currentPlayer.toFixed)
	{
		//Remove from targetted zombies
		var playerName = playersInGame[currentPlayer].getName();
		for (var i = 0; i < enemiesInGame.length; i++)
		{
			enemiesInGame[i].disconTarget(playerName);
		}

		for (var i = 0; i < projectilesIngame.length; i++)
		{
			projectilesIngame[i].senderCheck(playerName);
		}

		//Remove from player list
		playersInGame.splice(currentPlayer, 1);
	}	

	var removeConnected = connectedById(this.id);
	if (removeConnected >= 0)
	{
		if (connected[removeConnected][1] != '')
			console.log('\n - Player: ' + connected[removeConnected][1] + ' disconnected.');
		else
			console.log('\n - User: ' + this.id + ' disconnected.');

		if (removeConnected >= 0)
			connected.splice(removeConnected, 1);
	}

	util.log('There are ' + connected.length + ' users connected.');
};

function createPlayer(data) {
	var sentData = data.userData;
	var username = sentData[0],
		password = sentData[1],
		charType = sentData[2];
	if (username == "")
	{
		io.to(this.id).emit('menuInfo', {menuMessage: 6});
	}
	else
	{
		if (!playerExists(username))
		{
			players[players.length] = new Player(username, password, charType);	
			console.log('\nNew player created: ' + username);
			io.to(this.id).emit('menuInfo', {menuMessage: 2});
		}
		else
		{
			console.log('\nPlayer already exists: ' + username);
			io.to(this.id).emit('menuInfo', {menuMessage: 1});
		}
	}
};

function loginUser(data) {
	//First, check the details
	var sentData = data.userData;
	var username = sentData[0],
		password = sentData[1];

	if (playerExists(username))
	{		
		if (!playerInGame(username))
		{
			//Need to add password stuff eventually! but not for testing...
			var playerLoc = playerByName(username);
			if (playerLoc >= 0)
			{
				console.log('\nSpawning player: ' + username + ' into the world.');
				spawnPlayer(playerLoc);
			}

			var linkConnected = connectedById(this.id);
			if (linkConnected >= 0)
			{	
				connected[linkConnected][1] = username;
			}
			console.log('There are currently ' + playersInGame.length + ' players in game.');
			var dayLength = (startNight + (lightIncrement * 10));
			io.to(this.id).emit('loginValidation', {validLog: true, dayTime: dayLength});
		}
		else
		{
			console.log('\nLogin attempt for user: ' + username + ' failed. User already online.');
			io.to(this.id).emit('menuInfo', {menuMessage: 3});
		}
	}
	else
	{
		console.log('\nLogin attempt for user: ' + username + ' failed. User not found.');
			io.to(this.id).emit('menuInfo', {menuMessage: 5});
	}
};

function spawnPlayer(playerID) {
	playersInGame.push(players[playerID]);
};

function sendChat(data) {
	//console.log("Name: " + playersInGame[playerByConnection(this.id)].getName() + "   Time: " + data.sentMessage[0] + "   Message: " + data.sentMessage[1]);
	var emitChat = [playersInGame[playerByConnection(this.id)].getName(), data.sentMessage[1], data.sentMessage[0]];
	io.sockets.emit('sendserverchat', { sendMessage : emitChat});
};

function registerKeys(data) {
	playersInGame[playerByConnection(this.id)].setKBMove(data.kp);
};

function networkTrack(data) {
	var zomReset = new Date().getTime();
	zomReset = zombieRespawn - zomReset;
	var currentStats = [players.length, connected.length, playersInGame.length, enemiesInGame.length, zomReset, healthPacksIngame.length, projectilesIngame.length, weaponsInGame.length, bootsInGame.length, chestsInGame.length, hatsInGame.length, lightsInGame.length];
	io.to(this.id).emit('networkResult', {networkResult : data.sendPackage, serverStats : currentStats});
};

function editStats(data) {
	maxHealthPacks += data.sendPackage[0];
	maxWeapons += data.sendPackage[1];
	maxBoots += data.sendPackage[2];
	maxEnemiesZ1 += data.sendPackage[3];
	maxEnemiesZ2 += data.sendPackage[4];
	maxEnemiesPerPlayer += data.sendPackage[5];
	maxChests += data.sendPackage[6];
	maxLights += data.sendPackage[7];
	maxHats += data.sendPackage[8];
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
game();
sendUpdate();

//##############################################//
//          USEFUL SERVER FUNCTIONS             //
//                                              //
//      © CAMERON CHALMERS, 2015                //
//##############################################//

// Find player by Name
function playerByName(name) {
	for (var i = 0; i < players.length; i++) {
		if (players[i].getName() == name)
			return i;
	}
	console.log('\nPlayer not found: "'+ name + '"');
	util.log('There are currently ' + connected.length + ' users connected.');
	return 'false';
};

// Find player by connection
function playerByConnection(conString) {
	var playerName;
	for (var i = 0; i < connected.length; i++)
	{
		if (connected[i][0] == conString)
			playerName = connected[i][1];
	}

	for (var i = 0; i < playersInGame.length; i++) {
		if (playersInGame[i].getName() == playerName)
			return i;
	}
	console.log('\nPlayer not found: "'+ conString + '"');
	util.log('There are currently ' + connected.length + ' users connected.');
	return 'false';
};

// Find player by ID
function connectedById(id) {
	for (var i = 0; i < connected.length; i++) {
		if (connected[i][0] == id)
			return i;
	}
	console.log("\nConnected user not found: "+ id);
	util.log('There are currently ' + connected.length + ' users connected.');
	return 'false';
};

function playerExists(name) {
	for (var i = 0; i < players.length; i++)
	{
		if (players[i].getName() == name)
			return true;
	}
	return false;
};

function playerInGame(name) {
	for (var i = 0; i < playersInGame.length; i++)
	{
		if (playersInGame[i].getName() == name)
			return true;
	}
	return false;
};

function playerInGameNumber(name) { 
	for (var i = 0; i < playersInGame.length; i++)
	{
		if (playersInGame[i].getName() == name)
			return i;
	}
	return false;
};

//##############################################//
//          GAME RUNNING FUNCTIONS              //
//                                              //
//      © CAMERON CHALMERS, 2015                //
//##############################################//

function game() {
	if (playersInGame.length > 0)
	{		
		//Character functions
		characterOptions();

		//Do all game code here like AI and spawning stuff
		spawnEnemy();

		// Add enemy detection
		enemyAI();

		//All projectiles functions
		projectileOptions();

		//Item spawning functions
		spawnItems();

		//Item spawning functions
		itemChecks();
	}

	if (!endGame)
	{
		setTimeout(function () {
			game();
	    }, waitTime/2);
	}
};

function sendUpdate() {
	var timeAlpha = getTimeAlpha();
	var currTime = new Date().getTime();
	var srvTime = parseInt(((currTime - timeOfDay) / (startNight + (lightIncrement * 10))) * 100, 10);
	//Turn all arrays into sendable data
	var playerPos = [];
	for (var i = 0; i < playersInGame.length; i++)
	{
		playerPos[playerPos.length] = [playersInGame[i].getName(), playersInGame[i].getX(), playersInGame[i].getY(), playersInGame[i].getCHealth(), playersInGame[i].getMHealth(), playersInGame[i].getSprMove(), playersInGame[i].getType(), playersInGame[i].getVisibleInventory()];
	}
	
	var enemyPos = [];
	for (var i = 0; i < enemiesInGame.length; i++)
	{
		enemyPos[enemyPos.length] = [enemiesInGame[i].getName(), enemiesInGame[i].getX(), enemiesInGame[i].getY(), enemiesInGame[i].getCHealth(), enemiesInGame[i].getMHealth(), enemiesInGame[i].getSprMove()];
	}

	var healthPos = [];
	for (var i = 0; i < healthPacksIngame.length; i++)
	{
		healthPos[healthPos.length] = healthPacksIngame[i].getInfo();
	}

	var projectilePos = [];
	for (var i = 0; i < projectilesIngame.length; i++)
	{
		projectilePos[projectilePos.length] = projectilesIngame[i].getInfo();
	}

	var weaponPos = [];
	for (var i = 0; i < weaponsInGame.length; i++)
	{
		weaponPos[weaponPos.length] = weaponsInGame[i].getInfo();
	}

	var bootsPos = [];
	for (var i = 0; i < bootsInGame.length; i++)
	{
		bootsPos[bootsPos.length] = bootsInGame[i].getInfo();
	}

	var chestPos = [];
	for (var i = 0; i < chestsInGame.length; i++)
	{
		chestPos[chestPos.length] = chestsInGame[i].getInfo();
	}

	var hatPos = [];
	for (var i = 0; i < hatsInGame.length; i++)
	{
		hatPos[hatPos.length] = hatsInGame[i].getInfo();
	}

	var lightPos = []
	for (var i  = 0; i < lightsInGame.length; i++)
	{
		lightPos[lightPos.length] = lightsInGame[i].getInfo();
	}
	

	//Send the update from here
	io.sockets.emit('servermessage', { playerData: playerPos, enemyData: enemyPos, healthData: healthPos, projectileData: projectilePos, weaponData: weaponPos, bootsData: bootsPos, chestData: chestPos, hatData: hatPos, lightData: lightPos, currTime: timeAlpha, serverTime: srvTime});

	if (!endGame)
	{
		setTimeout(function () {
			//Recursively loop	
	        sendUpdate();
	    }, waitTime);
	}
};

//##############################################//
//          GAME  FUNCTIONS      		        //
//                                              //
//      © CAMERON CHALMERS, 2015                //
//##############################################//

function getTimeAlpha() {
	var nowTime = new Date().getTime();
	if (timeOfDay == 0)
		timeOfDay = nowTime;

	if (nowTime - timeOfDay <= startNight)
		return 0;
	else if (nowTime - timeOfDay <= (startNight + lightIncrement * 1))
		return 0.2;
	else if (nowTime - timeOfDay <= (startNight + lightIncrement * 2))
		return 0.4;
	else if (nowTime - timeOfDay <= (startNight + lightIncrement * 3))
		return 0.6;
	else if (nowTime - timeOfDay <= (startNight + lightIncrement * 4))
		return 0.8;
	else if (nowTime - timeOfDay <= (startNight + lightIncrement * 5))
		return 0.9;
	else if (nowTime - timeOfDay <= (startNight + lightIncrement * 6))
		return 0.8;
	else if (nowTime - timeOfDay <= (startNight + lightIncrement * 7))
		return 0.6;
	else if (nowTime - timeOfDay <= (startNight + lightIncrement * 8))
		return 0.4;
	else if (nowTime - timeOfDay <= (startNight + lightIncrement * 9))
		return 0.2;
	else if (nowTime - timeOfDay <= (startNight + lightIncrement * 10))
	{
		timeOfDay = 0;
		return 0;
	}
	else
		return 0;

};

function characterOptions() {
	for (var i = 0; i < playersInGame.length; i++)
	{
		moveCharacters(playersInGame[i]);
		attackCharacters(playersInGame[i]);
		checkDrop(playersInGame[i]);
		checkPulse(playersInGame[i]);
	}
};

function moveCharacters(currentPlayChar) {
	currentPlayChar.moveChar();
};

function attackCharacters(currentPlayChar) {
	if (currentPlayChar.checkAttack())
	{
		projectilesIngame[projectilesIngame.length] = new Projectile(currentPlayChar.attackChar());
	}
};

function checkDrop(currentPlayChar) {
	if (currentPlayChar.checkDrop() > -1)
	{
		switch (currentPlayChar.checkDrop())
		{
			case 0:
				hatsInGame[hatsInGame.length] = currentPlayChar.dropItem(0);
				break;
			case 1:
				weaponsInGame[weaponsInGame.length] = currentPlayChar.dropItem(1);
				break;
			case 2:
				chestsInGame[chestsInGame.length] = currentPlayChar.dropItem(2);
				break;
			case 3:
				lightsInGame[lightsInGame.length] = currentPlayChar.dropItem(3);
				break;
			case 4:
				bootsInGame[bootsInGame.length] = currentPlayChar.dropItem(4);
				break;
			default:
				break;
		}		
	}
}

function checkPulse(currentPlayChar) {
	if (currentPlayChar.getCHealth() <= 0 && currentPlayChar.getTOD() == null)
		currentPlayChar.setTOD();

	if (currentPlayChar.getTOD() !== null)
	{
		var cleanUpTime = new Date().getTime();
		if (cleanUpTime - currentPlayChar.getTOD() >= 5500)
			currentPlayChar.handOfGod();
	}
}

function spawnItems() {
	for (var i = healthPacksIngame.length; i < maxHealthPacks; i++)
	{
		healthPacksIngame[healthPacksIngame.length] = new HealthPack();
	}

	for (var i = weaponsInGame.length; i < maxWeapons; i++)
	{
		weaponsInGame[weaponsInGame.length] = new Weapon();
	}

	for (var i = bootsInGame.length; i < maxBoots; i++)
	{
		bootsInGame[bootsInGame.length] = new Boots();
	}
	for (var i = chestsInGame.length; i < maxChests; i++)
	{
		chestsInGame[chestsInGame.length] = new Chest();
	}
	for (var i = hatsInGame.length; i < maxHats; i++)
	{
		hatsInGame[hatsInGame.length] = new Hat();
	}
	for (var i = lightsInGame.length; i < maxLights; i++)
	{
		lightsInGame[lightsInGame.length] = new Light();
	}
};

function projectileOptions() {
	for (var i = 0; i < projectilesIngame.length; i++)
	{
		//This checks if the bullet has finished its duration. If so, it deletes the bullet.
		if (!projectilesIngame[i].checkComplete())
		{
			projectilesIngame[i].moveProj();
			projectilesIngame[i].checkHit(enemiesInGame, playersInGame);
			if (projectilesIngame[i].getFinished())
				projectilesIngame.splice(i, 1);
		}
		else
		{
			projectilesIngame.splice(i, 1);
		}
	}
}

function itemChecks() {
	for (var i = 0; i < healthPacksIngame.length; i++)
	{
		healthPacksIngame[i].checkPickUp(playersInGame);
		if (healthPacksIngame[i].checkUsed())
		{
			healthPacksIngame.splice(i, 1);
			i--;
		}

	}

	for (var i = 0; i < weaponsInGame.length; i++)
	{
		weaponsInGame[i].checkPickUp(playersInGame);
		if (weaponsInGame[i].checkUsed())
		{
			weaponsInGame.splice(i, 1);
			i--;
		}
	}

	for (var i = 0; i < bootsInGame.length; i++)
	{
		bootsInGame[i].checkPickUp(playersInGame);
		if (bootsInGame[i].checkUsed())
		{
			bootsInGame.splice(i, 1);
			i--;
		}
	}
	for (var i = 0; i < chestsInGame.length; i++)
	{
		chestsInGame[i].checkPickUp(playersInGame);
		if (chestsInGame[i].checkUsed())
		{
			chestsInGame.splice(i, 1);
			i--;
		}
	}
	for (var i = 0; i < hatsInGame.length; i++)
	{
		hatsInGame[i].checkPickUp(playersInGame);
		if (hatsInGame[i].checkUsed())
		{
			hatsInGame.splice(i, 1);
			i--;
		}
	}
	for (var i = 0; i < lightsInGame.length; i++)
	{
		lightsInGame[i].checkPickUp(playersInGame);
		if (lightsInGame[i].checkUsed())
		{
			lightsInGame.splice(i, 1);
			i--;
		}
	}
}

function spawnEnemy() {
	//Rolls for a random enemy. Zombie = 50%, fast zombie = 30%ish, tank zom = 15% ish
	//bottom of map 3500y, top of map 20
	var enemiesZone1 = 0,
		enemiesZone2 = 0;

	for (var i = 0; i < enemiesInGame.length; i++)
	{
		if (enemiesInGame[i].getZone() == 1)
			enemiesZone1++;
		else if (enemiesInGame[i].getZone() == 2)
			enemiesZone2++;
	}
	//Spawns enemies in the wilderness
	if (enemiesZone1 <  (maxEnemiesZ1 + (playersInGame.length * maxEnemiesPerPlayer)))
	{
		for (var i = enemiesZone1; i < (maxEnemiesZ1 + (playersInGame.length * maxEnemiesPerPlayer)); i++)
		{
			var rndNum = Math.floor((Math.random() * 500) + 0);
			if (rndNum <= 250)
				enemiesInGame[enemiesInGame.length] = new Enemy(0, 1);
			else if (rndNum <= 400)
				enemiesInGame[enemiesInGame.length] = new Enemy(1, 1);
			else if (rndNum <= 500)
				enemiesInGame[enemiesInGame.length] = new Enemy(2, 1);
		}
	}
	//Spawns enemies in the city (each respawn is at 4 minutes. waits until then.)
	var currTime = new Date().getTime();
	if ((enemiesZone2 < maxEnemiesZ2) && (currTime >= zombieRespawn))
	{
		for (var i = enemiesZone2; i < maxEnemiesZ2; i++)
		{
			var rndNum = Math.floor((Math.random() * 500) + 0);
			if (rndNum <= 250)
				enemiesInGame[enemiesInGame.length] = new Enemy(0, 2);
			else if (rndNum <= 400)
				enemiesInGame[enemiesInGame.length] = new Enemy(1, 2);
			else if (rndNum <= 500)
				enemiesInGame[enemiesInGame.length] = new Enemy(2, 2);
		}
		//4 minutes until the zombies start respawning
		zombieRespawn = (new Date().getTime() + 240000);
	}

};

function enemyAI() {
	for (var i = 0; i < enemiesInGame.length; i++)
	{
		enemyAlert(enemiesInGame[i]);
		enemyMove(enemiesInGame[i]);
		enemyAttack(enemiesInGame[i]);
		enemyDespawn(enemiesInGame[i], i);
	}
};

function enemyDespawn(currentEnemy, enemyNum) {
	if (currentEnemy.checkDespawn())
	{
		if (currentEnemy.getKiller() !== null)
		{
			playersInGame[playerInGameNumber(currentEnemy.getKiller())].addZKill(currentEnemy.getName());
		}
		enemiesInGame.splice(enemyNum, 1);
	}
};

function enemyAlert(currentEnemy) {
		currentEnemy.checkTarget(playersInGame);
};

function enemyMove(currentEnemy) {
		if (currentEnemy.getTarget() != '')
		{	
			currentEnemy.chase(playersInGame[playerInGameNumber(currentEnemy.getTarget())].getX(), playersInGame[playerInGameNumber(currentEnemy.getTarget())].getY());
		}
		else
		{
			currentEnemy.wander();
		}
};

function enemyAttack(currentEnemy) {
	currentEnemy.checkAttack(playersInGame);
};



//##############################################//
//          PRIVATE SERVER DATA                 //
//                                              //
//      © CAMERON CHALMERS, 2015                //
//##############################################//

var privateServerData = {
  worldData: {
    xLowBound: 60,
    xHighBound: 2016,
    yLowBound: 36,    
    yHighBound: 1910
  },
  	spawnData: {
  		lastSpawn: 0
  },
	items: {
		//Weapons
		//[weaponDamage, speed, distance, type, gunSpeed, image, name, slot]		
		gun: [10, 6, 200, "bullet", 80, "http://i.imgur.com/ZuJl3XR.png", "Pistol", 1],
		smg: [13, 6, 150, "bullet", 30, "http://i.imgur.com/nvxzrdK.png", "Uzi", 1],
		snp: [30, 9, 600, "bullet", 200, "http://i.imgur.com/OEPCEoe.png", "Rifle", 1],
		//Health pack
		//[health, boost, image]
		smallhp: [10, 0, "http://i.imgur.com/1VmozW4.png", "Pills"],
		largehp: [30, 0, "http://i.imgur.com/IDDO7IA.png", "Health pack"]
	}
};