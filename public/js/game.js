var animFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            null ;

// Keyboard input information below
window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);

//Mouse input
window.addEventListener('mousedown', saveClick, false);

var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");

//##############################################//
//          VARIABLES STUFF                     //
//                                              //
//      © CAMERON CHALMERS, 2015                //
//##############################################//

var localData = {
  mouse: {
    xClick: -1,
    yClick: -1
  },
  player: {
    xPos: 100,
    yPos: 700 
  }
}

var serverData = {
  levelData: 0
}

var connected = false;

//Temporary until we get the images
var colourPallette = ["#000", "#00ff00", "#664400"];

//##############################################//
//          SERVER SECTION                      //
//                                              //
//      © CAMERON CHALMERS, 2015                //
//##############################################//

var socket = io.connect("http://localhost:8000");

socket.on('connect', function () {  
    console.log('Connected!');
    socket.emit('logincheck', { userData: false });
});

socket.on('serverUpdate', function (data) {
    serverData.levelData = data.levelData;
    connected = true;
});



//##############################################//
//          GAME FUNCTIONS                      //
//                                              //
//      © CAMERON CHALMERS, 2015                //
//##############################################//

function mainLoop() {
  clearScreen();
  if (connected)
    drawLevel();
  drawPlayers();
  getPress();
}

function drawLevel() {
  var mapWidth = serverData.levelData.mapSize[0],
      mapHeight = serverData.levelData.mapSize[1];
  var currentDrawY = 750;
  var currentDrawX = 0;
  for (var i = serverData.levelData.map.length - 1; i >= 0; i--)
  {
    ctx.fillStyle = colourPallette[serverData.levelData.map[i]];
    ctx.fillRect(currentDrawX, currentDrawY, 50, 50);
    currentDrawX += 50;
    if (i % mapWidth == 0)
    {
      currentDrawY -= 50;
      currentDrawX = 0;
    }
  }
}

function clearScreen() {
  ctx.fillStyle="#fff";
  ctx.fillRect(0, 0, c.width, c.height);
}

function drawPlayers() {
  ctx.fillStyle="#0066ff";
  ctx.fillRect(localData.player.xPos, localData.player.yPos - 100, 70, 100);
}

function getPress() {
  if (Key.isDown(Key.RIGHT)) localData.player.xPos += 1;
  if (Key.isDown(Key.LEFT)) localData.player.xPos -= 1;
}


//##############################################//
//          KEY LISTENER                        //
//                                              //
//      © CAMERON CHALMERS, 2015                //
//##############################################//

var Key = {
	//http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
  _pressed: {},
  LEFT: 65,
  UP: 87,
  RIGHT: 68,
  DOWN: 83,
  FLEFT: 37,
  FUP: 38,
  FRIGHT: 39,
  FDOWN: 40,
  DHEAD: 89,
  DWEAP: 85,
  DLGHT: 73,
  DCHST: 79,
  DBOOT: 80,	
  isDown: function(keyCode) {
    return this._pressed[keyCode];
  },  
  onKeydown: function(event) {
    if (event.keycode == '8')
      event.preventDefault();
    this._pressed[event.keyCode] = true;
  },  
  onKeyup: function(event) {
    delete this._pressed[event.keyCode];
  }
};

//##############################################//
//          MOUSE STUFF                         //
//                                              //
//      © CAMERON CHALMERS, 2015                //
//##############################################//

function saveClick(e) {
      var pos = getMousePos(c, e);
      localData.mouse.xClick = pos.x;
      localData.mouse.yClick = pos.y;
  }

function getMousePos(c, evt) {
      var rect = c.getBoundingClientRect();
      return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
      };
  };

function clearClick() {
  localData.mouse.xClick = -1;
  localData.mouse.yClick = -1;
};

//This loops the animation frames
var recursiveAnim = function() {
          mainLoop();
          animFrame(recursiveAnim);
    };
//Start game
animFrame(recursiveAnim);



//Load images here
/*var weaponsImg = new Image();
weaponsImg.src = "http://cameronchalmers.uk/game-images/weapons.png";

helpImg.onload = function() {
  loadPercent += 6;
}*/

