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

//##############################################//
//          SERVER SECTION                      //
//                                              //
//      © CAMERON CHALMERS, 2015                //
//##############################################//

var socket = io.connect("http://localhost:8000");

socket.on('connect', function () {  
    console.log('Connected!');
  });

function mainLoop() {
  clearScreen();
  drawPlayers();

  var keyboardMove = checkMove();
  if ((keyboardMove[0] > 0) || (keyboardMove[1] > 0) || (keyboardMove[2] > 0) || (keyboardMove[3] > 0) || (keyboardMove[4] > 0) || (keyboardMove[5] > 0) || (keyboardMove[6] > 0) || (keyboardMove[7] > 0) || (keyboardMove[8] > 0) || (keyboardMove[9] > 0) || (keyboardMove[10] > 0) || (keyboardMove[11] > 0) || (keyboardMove[12] > 0))
  {
    var deltaTime = new Date().getTime();
    socket.emit('keypress', { kp: keyboardMove, delta: deltaTime});
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

