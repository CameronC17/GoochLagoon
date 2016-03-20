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
var canvasHeight = (c.height - 200), //200 is the chat box
    canvasWidth = (c.width - 130); // The 130 is the width of the console!
var menuChoice = 0;
var characterSelection = 0;
var username = '',
    password = '';
var chatMessage = '',
    chatCount = 0;
var chatArray = [];
var typeWaitTimer = 200,
    typeWait = 0;

//For day night stuff
var dayLength = 0;

var fadeIntensity = 0;
var fadeTimer = 0;
var fadeText = "";
var fadeDirection = 0;


//##############################################//
//          SERVER SECTION                      //
//                                              //
//      © CAMERON CHALMERS, 2015                //
//##############################################//

var serverStatus = 0;
var socket = io.connect("http://localhost:8000");

socket.on('connect', function () {  
    console.log('Connected!');
    localData.playerLocal.id = this.id;
    serverStatus = 1;
  });

socket.on('servermessage', function (data) {
    if (menuChoice == 5)
    {
      localData.serverData.playerData = data.playerData;
      var arrayPos = playerByName();
      if (arrayPos.toFixed)
      {
        localData.playerLocal.xPos = data.playerData[arrayPos][1];
        localData.playerLocal.yPos = data.playerData[arrayPos][2];
        localData.playerLocal.cHealth = data.playerData[arrayPos][3];
        localData.playerLocal.mHealth = data.playerData[arrayPos][4];
      }
      localData.serverData.enemyData = data.enemyData;
      localData.serverData.healthData = data.healthData;
      localData.serverData.projectileData = data.projectileData;
      localData.serverData.weaponData = data.weaponData;
      localData.serverData.bootsData = data.bootsData;
      localData.serverData.chestData = data.chestData;
      localData.serverData.hatData = data.hatData;
      localData.serverData.lightData = data.lightData;
      localData.serverData.currentTime = data.currTime;
      localData.serverData.serverTime = data.serverTime;
    }
  });

  socket.on('menuInfo', function (data) { 
      localData.menuData.serverReturn = data.menuMessage;
  });

  socket.on('loginValidation', function (data) {
      dayLength = data.dayTime;
      menuChoice = 5;
      fadeIntensity = 1;
      fadeDirection = -1;
      fadeText = "You wake up from a deep slumber...";
  });

  socket.on('sendserverchat', function (data) {
    if (chatArray.length < 9)
    {
        chatArray.push([data.sendMessage, chatCount]);
    }
    else
    {      
      for (var i = 1; i < chatArray.length; i++)
      {
        chatArray[i - 1] = chatArray[i];
      }
      chatArray[chatArray.length - 1] = [data.sendMessage, chatCount];
    }
    chatCount++;
  });

//##############################################//
//                Game Menu                     //
//                                              //
//      © CAMERON CHALMERS, 2015                //
//##############################################//

// Format is [x,y,width,height]
var loginBtn = [160, 140, 310, 60],
    signupBtn = [160, 220, 310, 60],
    guideBtn = [160, 300, 310, 60],
    loginBtn2 = [160, 330, 310, 60],
    txtBox1 = [180, 180, 270, 30],
    txtBox2 = [180, 250, 270, 30],
    homeBtn = [285, 400, 60, 30],
    playerButton1 = [255, 288, 28, 30],
    playerButton2 = [285, 288, 28, 30],
    playerButton3 = [315, 288, 28, 30],
    playerButton4 = [345, 288, 28, 30];

var activeTextBox = 1;

function drawMenu() {
  ctx.drawImage(menuImg, 0, 0, canvasWidth, canvasHeight, 0, 0, canvasWidth, canvasHeight);
  //Side bar
  ctx.fillStyle="#000";
  ctx.fillRect(620, 0, 130, 500);

  //Transparent back drop
  ctx.fillStyle="#000";
  ctx.globalAlpha=0.7;
  ctx.fillRect(100,50,430,400);
  ctx.globalAlpha=1;

  if (menuChoice == 0)  {
    //SurvivR title
    ctx.font = "40px Helvetica";
    ctx.fillStyle="#fff";
    ctx.fillText("SURVIVR", 230, 100);

    //Buttons
    ctx.fillStyle="#339900";
    ctx.fillRect(loginBtn[0], loginBtn[1], loginBtn[2], loginBtn[3]);
    ctx.fillRect(signupBtn[0], signupBtn[1], signupBtn[2], signupBtn[3]);
    ctx.fillRect(guideBtn[0], guideBtn[1], guideBtn[2], guideBtn[3]);

    //Button text
    ctx.font = "30px Helvetica";
    ctx.fillStyle="#000";
    ctx.fillText("LOGIN", 270, 180);
    ctx.fillText("SIGN UP", 252, 260);
    ctx.fillText("HOW TO PLAY", 220, 340);
  }
  else if ((menuChoice == 1)  || (menuChoice == 2)) {
    //Login title
    ctx.font = "42px Helvetica";
    ctx.fillStyle="#fff";
    //This is a shit saying, think of a better one...
    if (menuChoice == 1)
      ctx.fillText("Time to roll out.", 170, 120);
    else if (menuChoice == 2)
    {
      ctx.font = "34px Helvetica";
      ctx.fillText("Welcome to the Real World.", 104, 100);
    }

    //Home button
    ctx.fillStyle="#b35900";
    ctx.fillRect(homeBtn[0], homeBtn[1], homeBtn[2], homeBtn[3]);
    ctx.font = "16px Helvetica";
    ctx.fillStyle="#000";
    ctx.fillText("HOME", homeBtn[0] + 6, homeBtn[1] + 21);

    //Text boxes
    ctx.fillStyle="#fff";
    if (activeTextBox == 1)
      ctx.fillStyle="#808080";
    ctx.fillRect(txtBox1[0], txtBox1[1], txtBox1[2], txtBox1[3]);
    ctx.fillStyle="#fff";
    if (activeTextBox == 2)
      ctx.fillStyle="#808080";
    ctx.fillRect(txtBox2[0], txtBox2[1], txtBox2[2], txtBox2[3]);
    ctx.strokeStyle = "#0000ff";
    ctx.rect(txtBox1[0], txtBox1[1], txtBox1[2], txtBox1[3]);
    ctx.rect(txtBox2[0], txtBox2[1], txtBox2[2], txtBox2[3]);
    ctx.stroke();

    //Text box related text
    ctx.font = "20px Helvetica";
    ctx.fillStyle="#fff";
    ctx.fillText("USERNAME", 260, 170);
    ctx.fillText("PASSWORD", 260, 240);

    //Actual user text in the box...
    ctx.fillStyle="#000";
    ctx.fillText(username, 190, 202);
    var pwordStars = '';
    for (var i = 0; i < password.length; i++)
    {
      pwordStars = pwordStars.concat('*');
    }
    ctx.fillText(pwordStars, 190, 272);

    //Login button
    ctx.fillStyle="#339900";
    ctx.fillRect(loginBtn2[0], loginBtn2[1], loginBtn2[2], loginBtn2[3]);
    
    //Login button text
    //Button text
    ctx.font = "30px Helvetica";
    ctx.fillStyle="#000";
    if (menuChoice == 1)
      ctx.fillText("LOG IN", 270, 370);
    else if (menuChoice == 2)
      ctx.fillText("SIGN UP", 250, 370);

    //Character selection
    if (menuChoice == 2)
    {
      ctx.drawImage(playerImg, 0, 0, 28, 30, playerButton1[0], playerButton1[1], playerButton1[2], playerButton1[3]);
      ctx.drawImage(playerImg, 0, 30, 28, 30, playerButton2[0], playerButton2[1], playerButton2[2], playerButton2[3]);
      ctx.drawImage(playerImg, 0, 60, 28, 30, playerButton3[0], playerButton3[1], playerButton3[2], playerButton3[3]);
      ctx.drawImage(playerImg, 0, 90, 28, 30, playerButton4[0], playerButton4[1], playerButton4[2], playerButton4[3]);
      
      if (characterSelection > 0)
      {
        ctx.fillStyle="#ff751a";
        if (characterSelection == 1)
          ctx.fillRect(playerButton1[0], playerButton1[1] + 35, playerButton1[2], 5);
        else if (characterSelection == 2)
          ctx.fillRect(playerButton2[0], playerButton2[1] + 35, playerButton2[2], 5);
        else if (characterSelection == 3)
          ctx.fillRect(playerButton3[0], playerButton3[1] + 35, playerButton3[2], 5);
        else if (characterSelection == 4)
          ctx.fillRect(playerButton4[0], playerButton4[1] + 35, playerButton4[2], 5);
      }
    }
  } 
  
  if (localData.menuData.serverReturn != 0)
  {
    ctx.fillStyle="#595959";
    ctx.fillRect(60, 10, 510, 40);
    ctx.font = "14px Helvetica";
    ctx.fillStyle="#fff";

    switch (localData.menuData.serverReturn)
    {
      case 1: 
        ctx.fillText("User already exists, or name is not allowed. Please choose another username.", 68, 34);
        break;
      case 2: 
        ctx.fillText("User creation successful. Please proceed to the login page on the home screen.", 65, 34);
        break;
      case 3: 
        ctx.fillText("Unable to log in, it appears you are already logged in. Please contact support.", 65, 34);
        break;
      case 4:
        ctx.fillText("Please select a character.", 245, 34);
        break;
      case 5:
        ctx.fillText("User not found. Please ensure your username is correct.", 65, 34);
        break;
      case 6:
        ctx.fillText("Please enter a character name.", 235, 34);
        break;
    }
  }
  //Displays return messages from the server
  
  
  //Extra console stuff
  ctx.font = "10px Helvetica";
  ctx.fillStyle="#fff";
  ctx.fillText("xClick: " + localData.mouseClick.xClick, 630, 50);
  ctx.fillText("yClick: " + localData.mouseClick.yClick, 630, 60);
  ctx.fillText("Username: " + username, 630, 70);
  ctx.fillText("Password: " + password, 630, 80);
  ctx.fillText("Type wait: " + typeWait, 630, 90);
  ctx.fillText("Menu Message: " + localData.menuData.serverReturn, 630, 100);
  ctx.fillText("Console selection: " + characterSelection, 630, 110);
}

function registerMenuClick() {
  if ((localData.mouseClick.xClick != -1) && (localData.mouseClick.yClick != -1))
    {
      if (menuChoice == 0)
      {
          if (((localData.mouseClick.xClick >= loginBtn[0]) && (localData.mouseClick.xClick <= (loginBtn[0] + loginBtn[2]))) && 
            ((localData.mouseClick.yClick >= loginBtn[1]) && (localData.mouseClick.yClick <= (loginBtn[1] + loginBtn[3]))))
          {
            menuChoice = 1;
          }
          else if (((localData.mouseClick.xClick >= signupBtn[0]) && (localData.mouseClick.xClick <= (signupBtn[0] + signupBtn[2]))) && 
            ((localData.mouseClick.yClick >= signupBtn[1]) && (localData.mouseClick.yClick <= (signupBtn[1] + signupBtn[3]))))
          {
            menuChoice = 2;
          }
          else if (((localData.mouseClick.xClick >= guideBtn[0]) && (localData.mouseClick.xClick <= (guideBtn[0] + guideBtn[2]))) && 
            ((localData.mouseClick.yClick >= guideBtn[1]) && (localData.mouseClick.yClick <= (guideBtn[1] + guideBtn[3]))))
          {
            console.log('yep3');
          }
      }
      else if ((menuChoice == 1) || (menuChoice == 2))
      {
        if (((localData.mouseClick.xClick >= txtBox1[0]) && (localData.mouseClick.xClick <= (txtBox1[0] + txtBox1[2]))) && 
            ((localData.mouseClick.yClick >= txtBox1[1]) && (localData.mouseClick.yClick <= (txtBox1[1] + txtBox1[3]))))
          {
            activeTextBox = 1;
          }
        else if (((localData.mouseClick.xClick >= txtBox2[0]) && (localData.mouseClick.xClick <= (txtBox2[0] + txtBox2[2]))) && 
            ((localData.mouseClick.yClick >= txtBox2[1]) && (localData.mouseClick.yClick <= (txtBox2[1] + txtBox2[3]))))
          {
            activeTextBox = 2;
          }
        else if (((localData.mouseClick.xClick >= loginBtn2[0]) && (localData.mouseClick.xClick <= (loginBtn2[0] + loginBtn2[2]))) && 
            ((localData.mouseClick.yClick >= loginBtn2[1]) && (localData.mouseClick.yClick <= (loginBtn2[1] + loginBtn2[3]))))
          {
            if (menuChoice == 1) //Login menu
              {
                localData.menuData.serverReturn = 0;
                console.log('Try to log in!');
                socket.emit('loginPlayer', { userData: [username, password] });
              }
            else if (menuChoice == 2) //Sign up menu
            {
              localData.menuData.serverReturn = 0;
              if (characterSelection > 0)
              {
                console.log('Try to sign in!');
                socket.emit('signup', { userData: [username, password, characterSelection] });
              }
              else
              {
                localData.menuData.serverReturn = 4;
              }
            }
          }
          else if (((localData.mouseClick.xClick >= homeBtn[0]) && (localData.mouseClick.xClick <= (homeBtn[0] + homeBtn[2]))) && 
            ((localData.mouseClick.yClick >= homeBtn[1]) && (localData.mouseClick.yClick <= (homeBtn[1] + homeBtn[3]))))
          {
            localData.menuData.serverReturn = 0;
            characterSelection = 0;
            menuChoice = 0;
          }
      }
      if (menuChoice == 2)
      {
        if (((localData.mouseClick.xClick >= playerButton1[0]) && (localData.mouseClick.xClick <= (playerButton1[0] + playerButton1[2]))) && 
            ((localData.mouseClick.yClick >= playerButton1[1]) && (localData.mouseClick.yClick <= (playerButton1[1] + playerButton1[3]))))
          {
            characterSelection = 1;
          }
        else if (((localData.mouseClick.xClick >= playerButton2[0]) && (localData.mouseClick.xClick <= (playerButton2[0] + playerButton2[2]))) && 
            ((localData.mouseClick.yClick >= playerButton2[1]) && (localData.mouseClick.yClick <= (playerButton2[1] + playerButton2[3]))))
          {
            characterSelection = 2;
          }
        else if (((localData.mouseClick.xClick >= playerButton3[0]) && (localData.mouseClick.xClick <= (playerButton3[0] + playerButton3[2]))) && 
            ((localData.mouseClick.yClick >= playerButton3[1]) && (localData.mouseClick.yClick <= (playerButton3[1] + playerButton3[3]))))
          {
            characterSelection = 3;
          }
        else if (((localData.mouseClick.xClick >= playerButton4[0]) && (localData.mouseClick.xClick <= (playerButton4[0] + playerButton4[2]))) && 
            ((localData.mouseClick.yClick >= playerButton4[1]) && (localData.mouseClick.yClick <= (playerButton4[1] + playerButton4[3]))))
          {
            characterSelection = 4;
          }
      }
      clearClick();
    }   
}


//##############################################//
//          Drawing GAME                        //
//                                              //
//      © CAMERON CHALMERS, 2015                //
//##############################################//

var txtBoxChat = [50, canvasHeight + 175, canvasWidth + 74, 20]

var btnRetry = [260, 360, 250, 70];

mainLoop = function() {
      if (menuChoice <= 4)
      {
        drawMenu();
        registerMenuClick();
        checkType();
      }

      if (menuChoice == 5)
      {
        drawGame();
        registerGameClick();
        getFPS();
        // put an if here and say if the chat box is selected, ignore the keyboard commands
        if (activeTextBox != 3)
        {
          var keyboardMove = checkMove();
          if ((keyboardMove[0] > 0) || (keyboardMove[1] > 0) || (keyboardMove[2] > 0) || (keyboardMove[3] > 0) || (keyboardMove[4] > 0) || (keyboardMove[5] > 0) || (keyboardMove[6] > 0) || (keyboardMove[7] > 0) || (keyboardMove[8] > 0) || (keyboardMove[9] > 0) || (keyboardMove[10] > 0) || (keyboardMove[11] > 0) || (keyboardMove[12] > 0))
          {
            var deltaTime = new Date().getTime();
            socket.emit('keypress', { kp: keyboardMove, delta: deltaTime});
          }
        }
        else
        {
          checkType();
        }
      }
      if (menuChoice == 6)
      {
        drawRetryScreen();
        registerRetryClick();
      }
    };

function registerGameClick()
{
  if ((localData.mouseClick.xClick != -1) && (localData.mouseClick.yClick != -1))
  {
    if (menuChoice == 5)
      {
        if (((localData.mouseClick.xClick >= txtBoxChat[0]) && (localData.mouseClick.xClick <= (txtBoxChat[0] + txtBoxChat[2]))) && 
            ((localData.mouseClick.yClick >= txtBoxChat[1]) && (localData.mouseClick.yClick <= (txtBoxChat[1] + txtBoxChat[3]))))
          {
            activeTextBox = 3;
          }
      }
  }
  clearClick();
}

function registerRetryClick()
{
  if ((localData.mouseClick.xClick != -1) && (localData.mouseClick.yClick != -1))
  {
    if (menuChoice == 6)
      {
        if (((localData.mouseClick.xClick >= btnRetry[0]) && (localData.mouseClick.xClick <= (btnRetry[0] + btnRetry[2]))) && 
            ((localData.mouseClick.yClick >= btnRetry[1]) && (localData.mouseClick.yClick <= (btnRetry[1] + btnRetry[3]))))
          {
            menuChoice = 5;
            fadeIntensity = 1;
            fadeDirection = -1;
            fadeText = "You wake up from a deathly slumber...";
            menuChoice = 5;
          }
      }
  }
  clearClick();
}


// Game drawing stuff

function drawRetryScreen() {
  ctx.fillStyle="#000";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle="#cc0000";
  ctx.fillRect(btnRetry[0], btnRetry[1], btnRetry[2], btnRetry[3]);
  ctx.fillStyle="#000";
  ctx.font = "30px Helvetica";
  ctx.fillText("RETRY", btnRetry[0] + 80, btnRetry[1] + 50);
  ctx.fillStyle="#fff";
  ctx.fillText("Dare you go back in the wasteland?", 170, 270);
}

// Start game code
function drawGame() {
  //Draw background (to cover empty space)
  ctx.drawImage(sBackImg, (localData.playerLocal.xPos / 3.72), (localData.playerLocal.yPos / 3.6), canvasWidth, canvasHeight, 0, 0, canvasWidth, canvasHeight);
  //Draw game map
  ctx.drawImage(backgroundImg, localData.playerLocal.xPos - ((canvasWidth / 2) - (15)), localData.playerLocal.yPos - ((canvasHeight / 2) - (14)), canvasWidth, canvasHeight, 0, 0, canvasWidth, canvasHeight);
    
  //Draws stuff on the ground
  drawWeapons();
  drawHealth();
  drawBoots();
  drawChests();
  drawHats();
  drawLights();

  drawProjectile();

  //Draws all players + enemies
  drawPlayers();
  drawEnemies();

  //Draw Current time
  drawTimeCycle();

  //Draw overlay stuff
  drawConsole();
  drawChat();

  drawFader(); 
}

function drawFader() {
  if (localData.playerLocal.cHealth <= 0 && fadeDirection == 0)
  {
    fadeIntensity = 0;
    fadeDirection = 1;
    //fadeText = "You wake up from a deep slumber...";
    fadeText = "You have been killed in the wasteland";
  }

  if (fadeDirection != 0)
  {
    ctx.fillStyle="#000";
    if (fadeIntensity >= 0 && fadeIntensity <= 1)
      ctx.globalAlpha=fadeIntensity;
    else
      ctx.globalAlpha=0;
    ctx.fillRect(0, 0, 620, 500);
    
    var rightNow = new Date().getTime();
    if (rightNow - fadeTimer > 100)
    {
      if (fadeDirection > 0)
      {
        if (fadeIntensity >= 1)
        {
          menuChoice = 6;
          fadeDirection = 0;          
        }
        else
          fadeIntensity += 0.02;
      }
      if (fadeDirection < 0)
      {
        if (fadeIntensity <= 0)
          fadeDirection = 0;
        else
          fadeIntensity -= 0.02;
      }
      fadeTimer = new Date().getTime();
    }
    ctx.fillStyle="#fff";
    ctx.font = "30px Helvetica";
    ctx.fillText(fadeText, 80, 260)
  }

  ctx.globalAlpha=1;
}

function drawTimeCycle() {
  if (localData.serverData.currentTime > 0)
  {    
    ctx.fillStyle="#000033";
    ctx.globalAlpha=localData.serverData.currentTime;
    ctx.beginPath();
    
    for (var i = 0; i < localData.serverData.playerData.length; i++)
    {
      if (inPlayerView(localData.serverData.playerData[i][1], localData.serverData.playerData[i][2]))
      {
        if (localData.serverData.playerData[i][7][3] !== null)
        {
          var charX = localData.serverData.playerData[i][1] - (localData.playerLocal.xPos - (canvasWidth/2 - 15)),
              charY = localData.serverData.playerData[i][2] - (localData.playerLocal.yPos - (canvasHeight/2 - 15));
          var lightRadius = 80;
          switch (localData.serverData.playerData[i][7][3])
          {
            case 0:
              lightRadius = 120;
              break;
            case 11:
              lightRadius = 180;
              break;
            case 22:
              lightRadius = 260;
              break;
            default:
              lightRadius = 120;
              break;
          }
          ctx.arc(charX + 10, charY + 10, lightRadius, 0, 2 * Math.PI);
        }
      }
    }
    ctx.rect(620, 0, -620, 500);
    ctx.fill();

    //Reset for rest of drawing
    ctx.globalAlpha=1;
  }  
}

function drawPlayers() {
  //Draw all visible players
  //ctx.fillStyle="#0040FF";
  ctx.fillStyle="#000";
  ctx.font = "10px Helvetica";
  for (var i = 0; i < localData.serverData.playerData.length; i++)
  {
    if (inPlayerView(localData.serverData.playerData[i][1], localData.serverData.playerData[i][2]))
    {  
    var charX = localData.serverData.playerData[i][1] - (localData.playerLocal.xPos - (canvasWidth/2 - 15)),
          charY = localData.serverData.playerData[i][2] - (localData.playerLocal.yPos - (canvasHeight/2 - 15)),
          enemyName = localData.serverData.playerData[i][0],
          sprPos = localData.serverData.playerData[i][5],
          cType = localData.serverData.playerData[i][6],
          inventory = localData.serverData.playerData[i][7];
      var playerImage = 0;
      switch (cType)
      {
        case 1:
          playerImage = 0;
          break;
        case 2:
          playerImage = 30;
          break;
        case 3:
          playerImage = 60;
          break;
        case 4:
          playerImage = 90;
          break;
        default:
          playerImage = 0;
          break;
      }
      //Draw character
      ctx.drawImage(playerImg, sprPos, playerImage, 28, 30, charX, charY, 28, 30);
      //Draw inventory on character
      drawInventPlayer(inventory, charX, charY, sprPos);

      //Draw username + health bar (if not player)
      if (enemyName != username)
      {
        var enemyCHealth = localData.serverData.playerData[i][3],
            enemyMHealth = localData.serverData.playerData[i][4];
        ctx.fillStyle="#000";
        ctx.fillText(enemyName, charX, charY + 37);
        ctx.fillStyle="#ff0000";
        ctx.fillRect(charX,charY + 40,30,4); 
        ctx.fillStyle="#66ff33";
        ctx.fillRect(charX,charY + 40,((enemyCHealth / enemyMHealth) * 30),4);
      }
      else
      {
        consoleInventory(inventory);
      }
    }
  }
};

function consoleInventory(inventory)
{
  //For hat
  if (inventory[0] !== null)
  {
    localData.playerLocal.hat = inventory[0];
  }
  else
  {
    localData.playerLocal.hat = -1;
  }

  //For weapons
  if (inventory[1])
  {
    if (inventory[1][0])
    {
      var imageType = 0;
      switch (inventory[1][0])
        {
          case 1:
            imageType = 0;
            break;
          case 2:
            imageType = 15;
            break;
          case 3:
            imageType = 30;
            break;
          case 4:
            imageType = 45;
            break;
          default:
            imageType = 0;
            break;
        }
      localData.playerLocal.weapon = imageType;
      localData.playerLocal.currAmmo = inventory[1][1];
      localData.playerLocal.maxAmmo = inventory[1][2];
      localData.playerLocal.firePercent = inventory[1][3];      
    }
  }
  else
  {
    localData.playerLocal.weapon = -1;
    localData.playerLocal.currAmmo = -1;
    localData.playerLocal.firePercent = -1;     
  }

  //For chest
  if (inventory[2] !== null)
  {
    localData.playerLocal.chest = inventory[2];
  }
  else
  {
    localData.playerLocal.chest = -1;
  }

  //For light
  if (inventory[3] !== null)
  {
    localData.playerLocal.light = inventory[3];
  }
  else
  {
    localData.playerLocal.light = -1;
  }

  //For boots
  if (inventory[4] !== null)
  {
    localData.playerLocal.boots = inventory[4];
  }
  else
  {
    localData.playerLocal.boots = -1;
  }

}

function drawInventPlayer(inventory, xPos, yPos, sprPos) {
  var itemSprPos = 0;

  if (inventory[0] !== null)
    ctx.drawImage(hatImg, 0, inventory[0], 20, 10, xPos + 3, yPos, 20, 10);

  //For weapon
  if (inventory[1])
  {
    if (inventory[1][0])
    {
      var imageType = 0;
      switch (inventory[1][0])
        {
          case 1:
            imageType = 0;
            break;
          case 2:
            imageType = 15;
            break;
          case 3:
            imageType = 30;
            break;
          case 4:
            imageType = 45;
            break;
          default:
            imageType = 0;
            break;
        }

      itemSprPos = yPos + 10;
      if (sprPos == 28)
        itemSprPos -= 1;
      ctx.drawImage(weaponsImg, 0, imageType, 15, 15, xPos - 10, itemSprPos, 15, 15);
    }
  }

  //For chest
  if (inventory[2] !== null)
    ctx.drawImage(chestImg, 0, inventory[2], 17, 13, xPos + 5, yPos + 11, 17, 13);

  itemSprPos = yPos + 14;
  if (sprPos == 28)
    itemSprPos += 2;
  //For light
  if (inventory[3] !== null)
    ctx.drawImage(lightImg, 0, inventory[3], 10, 10, xPos + 15, itemSprPos, 10, 10);

  //For boots
  itemSprPos = 0;
  if (sprPos == 28)
    itemSprPos = 17;
  if (inventory[4] !== null)
    ctx.drawImage(bootsImg, itemSprPos, inventory[4], 17, 6, xPos + 5, yPos + 24, 17, 6);
  
};

function drawEnemies() {
  //Draws all enemies
  for (var i = 0; i < localData.serverData.enemyData.length; i++)
  {
    if (inPlayerView(localData.serverData.enemyData[i][1], localData.serverData.enemyData[i][2]))
    {
    var charX = localData.serverData.enemyData[i][1] - (localData.playerLocal.xPos - (canvasWidth/2 - 15)),
          charY = localData.serverData.enemyData[i][2] - (localData.playerLocal.yPos - (canvasHeight/2 - 15)),
          sprPos = localData.serverData.enemyData[i][5];
    var imageType = 0;

    switch (localData.serverData.enemyData[i][0])
    {
      case 'zombie':
        imageType = 0;
        break;
      case 'fastZombie':
        imageType = 30;
        break;
      case 'tankZombie':
        imageType = 60;
        break;
      default:
        imageType = 0;
        break;
    }
    /*//Temporary test stuff
    ctx.fillStyle="#000";
    ctx.fillRect(charX - 300, charY,600,1);
    ctx.fillRect(charX - 300, charY + 30,600,1);
    ctx.fillRect(charX, charY - 300,1,600);
    ctx.fillRect(charX + 28, charY - 300,1,600);*/
    ctx.drawImage(enemyImg, sprPos, imageType, 28, 30, charX, charY, 28, 30);
    var enemyCHealth = localData.serverData.enemyData[i][3],
        enemyMHealth = localData.serverData.enemyData[i][4];
    ctx.fillStyle="#ff0000";
    ctx.fillRect(charX,charY + 34,30,4); 
    ctx.fillStyle="#66ff33";
    ctx.fillRect(charX,charY + 34,((enemyCHealth / enemyMHealth) * 30),4);
  }
  }
};

function drawHealth() {
  //Draw all visible health packs
  for (var i = 0; i < localData.serverData.healthData.length; i++)
  {
    if (inPlayerView(localData.serverData.healthData[i][1], localData.serverData.healthData[i][2]))
    { 
      var healthX = localData.serverData.healthData[i][1] - (localData.playerLocal.xPos - (canvasWidth/2 - 15)),
          healthY = localData.serverData.healthData[i][2] - (localData.playerLocal.yPos - (canvasHeight/2 - 15)),
          imageType = 0;

      switch (localData.serverData.healthData[i][0])
      {
        case 10:
          imageType = 0;
          break;
        case 30:
          imageType = 15;
          break;
        case 60:
          imageType = 30;
          break;
        case 500:
          imageType = 45;
          break;
        default:
          imageType = 60;
          break;
      }
      ctx.drawImage(healthImg, 0, imageType, 15, 15, healthX, healthY, 15, 15);
    }
  }
};

function drawProjectile() {
  //Draw all visible health packs
  for (var i = 0; i < localData.serverData.projectileData.length; i++)
  {
    if (inPlayerView(localData.serverData.projectileData[i][1], localData.serverData.projectileData[i][2]))
    { 
      var projX = localData.serverData.projectileData[i][1] - (localData.playerLocal.xPos - (canvasWidth/2 - 15)),
          projY = localData.serverData.projectileData[i][2] - (localData.playerLocal.yPos - (canvasHeight/2 - 15)),
          imageType = localData.serverData.projectileData[i][0];

      ctx.fillStyle="#000";
      ctx.fillRect(projX, projY,3,3); 
    }
  }
};

function drawWeapons() {
  //Draw all visible health packs
  for (var i = 0; i < localData.serverData.weaponData.length; i++)
  {
    if (inPlayerView(localData.serverData.weaponData[i][0], localData.serverData.weaponData[i][1]))
    { 
      var weaponX = localData.serverData.weaponData[i][0] - (localData.playerLocal.xPos - (canvasWidth/2 - 15)),
          weaponY = localData.serverData.weaponData[i][1] - (localData.playerLocal.yPos - (canvasHeight/2 - 15)),
          imageType = 0;

      switch (localData.serverData.weaponData[i][2])
      {
        case 1:
          imageType = 0;
          break;
        case 2:
          imageType = 15;
          break;
        case 3:
          imageType = 30;
          break;
        case 4:
          imageType = 45;
          break;
        default:
          imageType = 0;
          break;
      }
      ctx.drawImage(weaponsImg, 0, imageType, 15, 15, weaponX, weaponY, 15, 15);
    }
  }
};

function drawBoots() {
  //Draw all visible health packs
  for (var i = 0; i < localData.serverData.bootsData.length; i++)
  {
    if (inPlayerView(localData.serverData.bootsData[i][0], localData.serverData.bootsData[i][1]))
    { 
      var bootsX = localData.serverData.bootsData[i][0] - (localData.playerLocal.xPos - (canvasWidth/2 - 15)),
          bootsY = localData.serverData.bootsData[i][1] - (localData.playerLocal.yPos - (canvasHeight/2 - 15));

      ctx.drawImage(bootsImg, 0, localData.serverData.bootsData[i][2], 17, 6, bootsX, bootsY, 17, 6);
    }
  }
};

function drawChests() {
  //Draw all visible chest armour
  for (var i = 0; i < localData.serverData.chestData.length; i++)
  {
    if (inPlayerView(localData.serverData.chestData[i][0], localData.serverData.chestData[i][1]))
    { 
      var chestX = localData.serverData.chestData[i][0] - (localData.playerLocal.xPos - (canvasWidth/2 - 15)),
          chestY = localData.serverData.chestData[i][1] - (localData.playerLocal.yPos - (canvasHeight/2 - 15));

      ctx.drawImage(chestImg, 0, localData.serverData.chestData[i][2], 17, 13, chestX, chestY, 17, 13);
    }
  }
};

function drawHats() {
  //Draw all visible hats
  for (var i = 0; i < localData.serverData.hatData.length; i++)
  {
    if (inPlayerView(localData.serverData.hatData[i][0], localData.serverData.hatData[i][1]))
    { 
      var hatX = localData.serverData.hatData[i][0] - (localData.playerLocal.xPos - (canvasWidth/2 - 15)),
          hatY = localData.serverData.hatData[i][1] - (localData.playerLocal.yPos - (canvasHeight/2 - 15));

      ctx.drawImage(hatImg, 0, localData.serverData.hatData[i][2], 20, 10, hatX, hatY, 20, 10);
    }
  }
};

function drawLights() {
  //Draw all visible light sources
  for (var i = 0; i < localData.serverData.lightData.length; i++)
  {
    if (inPlayerView(localData.serverData.lightData[i][0], localData.serverData.lightData[i][1]))
    { 
      var lightX = localData.serverData.lightData[i][0] - (localData.playerLocal.xPos - (canvasWidth/2 - 15)),
          lightY = localData.serverData.lightData[i][1] - (localData.playerLocal.yPos - (canvasHeight/2 - 15));

      ctx.drawImage(lightImg, 0, localData.serverData.lightData[i][2], 10, 10, lightX, lightY, 10, 10);
    }
  }
};

function inPlayerView(tryXPos, tryYPos) {
  if (((tryXPos > localData.playerLocal.xPos - 350) && (tryXPos < localData.playerLocal.xPos + 350)) && ((tryYPos > localData.playerLocal.yPos - 300) && (tryYPos < localData.playerLocal.yPos + 300)))
    return true;
  else
    return false;
};

function drawConsole() {  
// Console will be 130px*500px @ position x: 620, y = 0
  ctx.font = "10px Helvetica";
  ctx.fillStyle="#999999";
  ctx.fillRect(620, 0, 130, 500);
  ctx.fillStyle="#86592c";
  ctx.fillRect(628,05,115,80);
  ctx.fillRect(628,95,115,80);
  ctx.fillRect(628,185,115,80);
  ctx.fillRect(628,275,115,80);
  ctx.fillRect(628,365,115,127);

  //User information stuff
  //localData.playerLocal.cHealth
  ctx.fillStyle="#000";
  ctx.fillText("Name: " + username, 630, 105);

  //Health bar
  ctx.fillStyle="#ff0000";
  ctx.fillRect(635,125,100,10);  
  ctx.fillStyle="#66ff33";
  ctx.fillRect(635,125,(((localData.playerLocal.cHealth / localData.playerLocal.mHealth)*100)),10);
  ctx.fillStyle="#000";
  ctx.fillText(parseInt(localData.playerLocal.cHealth, 10) + ' / ' + localData.playerLocal.mHealth, 664, 134);

  //Armour bar
  ctx.fillStyle="#6699ff";
  ctx.fillRect(635,140,100,10);
  var barLength = 0;
  switch (localData.playerLocal.chest)
  {
    case 0:
      barLength = 40;
      break;
    case 13:
      barLength = 70;
      break;
    case 26:
      barLength = 100;
      break;
  }
  ctx.fillStyle="#0055ff";
  ctx.fillRect(635,140,barLength,10);
  ctx.fillStyle="#000";
  ctx.fillText("Armour", 666, 149);

  //Weapon shoot bar
  ctx.fillStyle="#595959";
  ctx.fillRect(635,155,100,10);
  if (localData.playerLocal.firePercent > -1)
  {
    if (localData.playerLocal.currAmmo <= 0)
    {
      ctx.fillStyle="#000";
      ctx.fillText("EMPTY", 668, 164);
    }
    else
    {
      ctx.fillStyle="#ff751a";
      ctx.fillRect(635,155,100 * localData.playerLocal.firePercent,10);
      ctx.fillStyle="#000";

      if (localData.playerLocal.firePercent == 1)
        ctx.fillText("FIRE", 670, 164);
      else
        ctx.fillText("WAIT", 670, 164);
    }
  }
  else
  {
    ctx.fillStyle="#000";
    ctx.fillText("NO WEAPON", 655, 164);
  }


  //Inventory stuff   ##############################
  ctx.fillStyle="#1a1a1a";

  //Head
  if (localData.playerLocal.hat > -1)
  {
    ctx.fillStyle="#bfbfbf";
    ctx.fillRect(668,372,35,35);
    ctx.drawImage(hatImg, 0, localData.playerLocal.hat, 20, 10, 676, 385, 20, 10);
  }
  else
  {  
    ctx.fillStyle="#1a1a1a";
    ctx.fillRect(668,372,35,35);
  }
 
  //Light
  if (localData.playerLocal.light > -1)
  {
    ctx.fillStyle="#bfbfbf";
    ctx.fillRect(648,448,35,35);
    ctx.drawImage(lightImg, 0, localData.playerLocal.light, 10, 10, 656, 456, 15, 15);
  }
  else
  {    
    ctx.fillStyle="#1a1a1a";
    ctx.fillRect(648,448,35,35);
  }

  //Weapon
  ctx.font = "9px Helvetica";
  if (localData.playerLocal.weapon > -1)
  {
    ctx.fillStyle="#bfbfbf";
    ctx.fillRect(640,410,35,35);
    ctx.drawImage(weaponsImg, 0, localData.playerLocal.weapon, 15, 15, 648, 410, 20, 20);
    if (localData.playerLocal.currAmmo > -1)
    {
      ctx.fillStyle="#404040";
      ctx.fillText(localData.playerLocal.currAmmo + " /" + localData.playerLocal.maxAmmo, 641, 440);
    }
  }
  else
  {
    ctx.fillStyle="#1a1a1a";
    ctx.fillRect(640,410,35,35);
  }

  ctx.font = "10px Helvetica";
  
  //Chest
  if (localData.playerLocal.chest > -1)
  {
    ctx.fillStyle="#bfbfbf";
    ctx.fillRect(696,410,35,35);
    ctx.drawImage(chestImg, 0, localData.playerLocal.chest, 17, 13, 703, 418, 20, 16);
  }
  else
  {  
    ctx.fillStyle="#1a1a1a";
    ctx.fillRect(696,410,35,35);
  }

  //Boots
  if (localData.playerLocal.boots > -1)
  {
    ctx.fillStyle="#bfbfbf";
    ctx.fillRect(688,448,35,35);
    ctx.drawImage(bootsImg, 0, localData.playerLocal.boots, 17, 6, 695, 462, 20, 7);
  }
  else  
  {    
    ctx.fillStyle="#1a1a1a";
    ctx.fillRect(688,448,35,35);
  }

  //Minimap stuff
  ctx.fillStyle="#000";
  ctx.fillText("Map", 638, 196);
  ctx.drawImage(minimapImg, 0, 0, 85, 65, 642, 198, 85, 65);
  var mapXPos = 648,
      mapYPos = 204;
  mapXPos = mapXPos + parseInt(((localData.playerLocal.xPos / 4000) * 70), 10);
  mapYPos = mapYPos + parseInt(((localData.playerLocal.yPos / 3500) * 48), 10);
  ctx.fillStyle="#ff0000";
  ctx.fillRect(mapXPos, mapYPos, 5, 5);



  //Console information
  ctx.fillStyle="#000";
  ctx.fillText("xPos: " + localData.playerLocal.xPos, 630, 15);
  ctx.fillText("yPos: " + localData.playerLocal.yPos, 630, 25);
  ctx.fillText("Players: " + localData.serverData.playerData.length, 630, 35);
  ctx.fillText("Enemies: " + localData.serverData.enemyData.length, 630, 45);
  ctx.fillText("FPS: " + localData.gameData.fps, 630, 55);
  ctx.fillText("Projectiles: " + localData.serverData.projectileData.length, 630, 65);
  ctx.fillText("Weapons: " + localData.serverData.weaponData.length, 630, 75);

  drawTimeWatch();

  //Draw compass
  ctx.fillStyle="#000";
  ctx.fillText("Compass", 688, 286);
  ctx.drawImage(compassImg, 0, 0, 44, 44, 687, 300, 44, 44);

};

function drawTimeWatch() {
  if (localData.serverData.serverTime < 94 && localData.serverData.serverTime >= 0)
  {
    var rotCalc = parseInt((localData.serverData.serverTime / 93) * 360, 10) - 45;
  }
  else
    var rotCalc = -45; 
    
  rotateImage(timeWatchImg, 632, 300, 44, 44, -rotCalc);

  ctx.fillStyle="#000";
  ctx.fillText("Time", 642, 286);
  ctx.fillStyle="#663300";
  ctx.beginPath();
  ctx.moveTo(650, 290);
  ctx.lineTo(658, 290);
  ctx.lineTo(654, 310);
  ctx.fill();
}

function rotateImage(img,x,y,width,height,deg){
    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate(deg * Math.PI / 180);
    ctx.drawImage(img,width / 2 * (-1),height / 2 * (-1),width,height);
    ctx.restore();
}

function drawChat() {
  //Border and background stuff
  ctx.fillStyle="#666699";
  ctx.fillRect( 0, canvasHeight, canvasWidth + 130, 200);
  ctx.fillStyle="#333333";
  ctx.fillRect( 0, canvasHeight, canvasWidth + 130, 6);

  //Chat box and stuff
  ctx.fillStyle="#333333";
  ctx.fillRect( 0, canvasHeight + 168, canvasWidth + 130, 3);
  ctx.font = "15px Helvetica";
  ctx.fillStyle="#000";
  ctx.fillText("Say:", 16, 690);
  if (activeTextBox == 3)
    ctx.fillStyle="#ffcc00";
  else
    ctx.fillStyle="#ccb3ff";
  ctx.fillRect(txtBoxChat[0], txtBoxChat[1], txtBoxChat[2], txtBoxChat[3]);
  ctx.font = "15px Helvetica";
  ctx.fillStyle="#000";
  ctx.fillText(chatMessage, txtBoxChat[0] + 3, txtBoxChat[1] + 14);

  //Chat messages
  var chatHeight = canvasHeight + 150;

  if (chatArray.length > 0)
  {
    for (var i = chatArray.length - 1; i >= 0; i--)
    {
      if (chatArray[i][1] % 2 == 0)
      {
        ctx.fillStyle="#0066ff";
        ctx.fillRect( 0, chatHeight, canvasWidth + 130, 18);
      }
      ctx.fillStyle="#000";
      var timeHour = chatArray[i][0][2][0],
          timeMinute = chatArray[i][0][2][1];

      if (timeHour.length == 1)
        timeHour = "0" + timeHour;

      if (timeMinute.length == 1)
        timeMinute = "0" + timeMinute;

      ctx.fillText(timeHour + ":" + timeMinute + " - " + chatArray[i][0][0] + "  >>>  " + chatArray[i][0][1], 6, chatHeight + 13);
      chatHeight -= 18;
    }
  }
};

/*function drawImage(whatIMG, spriteX, spriteY, sizeX, sizeY, posX, posY, x, y) {
    //This code puts the image to a new src....
    var drawCanvasImage = new Image();    
    drawCanvasImage.src = whatIMG;
    drawCanvasImage.onload = function(){ 
      ctx.drawImage(drawCanvasImage, spriteX, spriteY, sizeX, sizeY, posX, posY, x, y); 
    }
};*/

function getFPS() {
  if (localData.gameData.timeCount <= 0)
  {
    localData.gameData.timeCount = new Date().getTime();
  }
  var currTime = new Date().getTime();
  if (currTime >= (localData.gameData.timeCount + 1000))
  {
    localData.gameData.timeCount = 0;
    localData.gameData.fps = localData.gameData.fpsNew;
    localData.gameData.fpsNew = 0;
  }
  else
  {
    localData.gameData.fpsNew++;
  }
}


//##############################################//
//          code for events                     //
//                                              //
//      © CAMERON CHALMERS, 2015                //
//##############################################//

function checkMove () {
  var keyPresses = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  //Directions to move in
  if (Key.isDown(Key.UP)) keyPresses[0] += 1;
  if (Key.isDown(Key.RIGHT)) keyPresses[1] += 1;
  if (Key.isDown(Key.DOWN)) keyPresses[2] += 1;
  if (Key.isDown(Key.LEFT)) keyPresses[3] += 1;
  //Directions to fire at
  if (Key.isDown(Key.FUP)) keyPresses[4] += 1;
  if (Key.isDown(Key.FRIGHT)) keyPresses[5] += 1;
  if (Key.isDown(Key.FDOWN)) keyPresses[6] += 1;
  if (Key.isDown(Key.FLEFT)) keyPresses[7] += 1;
  //Keys to drop items
  if (Key.isDown(Key.DHEAD)) keyPresses[8] += 1;
  if (Key.isDown(Key.DWEAP)) keyPresses[9] += 1;
  if (Key.isDown(Key.DLGHT)) keyPresses[10] += 1;
  if (Key.isDown(Key.DCHST)) keyPresses[11] += 1;
  if (Key.isDown(Key.DBOOT)) keyPresses[12] += 1;
  return keyPresses;
};

function checkType () {
  var myKey = '';
  //Numbers to type
  if (Key.isDown('48')) myKey = '0';
  if (Key.isDown('49')) myKey = '1';
  if (Key.isDown('50')) myKey = '2';
  if (Key.isDown('51')) myKey = '3';
  if (Key.isDown('52')) myKey = '4';
  if (Key.isDown('53')) myKey = '5';
  if (Key.isDown('54')) myKey = '6';
  if (Key.isDown('55')) myKey = '7';
  if (Key.isDown('56')) myKey = '8';
  if (Key.isDown('57')) myKey = '9';

  //Letters to type
  if (Key.isDown('65')) myKey = 'a';
  if (Key.isDown('66')) myKey = 'b';
  if (Key.isDown('67')) myKey = 'c';
  if (Key.isDown('68')) myKey = 'd';
  if (Key.isDown('69')) myKey = 'e';
  if (Key.isDown('70')) myKey = 'f';
  if (Key.isDown('71')) myKey = 'g';
  if (Key.isDown('72')) myKey = 'h';
  if (Key.isDown('73')) myKey = 'i';
  if (Key.isDown('74')) myKey = 'j';
  if (Key.isDown('75')) myKey = 'k';
  if (Key.isDown('76')) myKey = 'l';
  if (Key.isDown('77')) myKey = 'm';
  if (Key.isDown('78')) myKey = 'n';
  if (Key.isDown('79')) myKey = 'o';
  if (Key.isDown('80')) myKey = 'p';
  if (Key.isDown('81')) myKey = 'q';
  if (Key.isDown('82')) myKey = 'r';
  if (Key.isDown('83')) myKey = 's';
  if (Key.isDown('84')) myKey = 't';
  if (Key.isDown('85')) myKey = 'u';
  if (Key.isDown('86')) myKey = 'v';
  if (Key.isDown('87')) myKey = 'w';
  if (Key.isDown('88')) myKey = 'x';
  if (Key.isDown('89')) myKey = 'y';
  if (Key.isDown('90')) myKey = 'z';

  if (Key.isDown('8')) myKey = 'BCKSPC';
  if (Key.isDown('13')) myKey = 'ENTER';
  if (Key.isDown('32')) myKey = 'SPACE';

  
  if (myKey != '')
  {
    if (myKey == 'BCKSPC')
    {
      var nowTime = new Date().getTime();
      if (nowTime > typeWait + typeWaitTimer)
      {
        if (activeTextBox == 1)
        {
          if (username.length == 1)
            username = '';
          else if (username.length > 1)
            username = username.slice(0, -1);
          typeWait = new Date().getTime();
        }
        else if (activeTextBox == 2)
        {
          if (password.length == 1)
            password = '';
          else if (password.length > 1)
            password = password.slice(0, -1);
          typeWait = new Date().getTime();
        }
        else if (activeTextBox == 3)
        {
          if (chatMessage.length == 1)
            chatMessage = '';
          else if (chatMessage.length > 1)
            chatMessage = chatMessage.slice(0, -1);
          typeWait = new Date().getTime();
        }
      }
    }
    else if (myKey == 'ENTER')
    {
      if (activeTextBox == 3)
      {
        if (chatMessage.length > 0)
        {
          var allMessage = [[new Date().getHours(), new Date().getMinutes()], chatMessage];
          //emit the chat message
          socket.emit('chatmessage', { sentMessage: allMessage });
        }
        chatMessage = "";
        activeTextBox = 0;
      }
    }
    else if (myKey == 'SPACE')
    {
      if (activeTextBox == 3)
      {
        if (' ' != chatMessage.charAt(chatMessage.length - 1))
        {
          chatMessage = chatMessage.concat(' ');
          typeWait = new Date().getTime();
        }
        else
        {
          var nowTime = new Date().getTime();
          if (nowTime > typeWait + typeWaitTimer)
          {
            chatMessage = chatMessage.concat(' ');
            typeWait = new Date().getTime();
          }
        }
      }
    }
    else
    {
      if (activeTextBox == 1)
      {
        if (myKey != username.charAt(username.length - 1))
        {
          username = username.concat(myKey);          
          typeWait = new Date().getTime();
        }
        else
        {
          var nowTime = new Date().getTime();
          if (nowTime > typeWait + typeWaitTimer)
          {
            username = username.concat(myKey);
            typeWait = new Date().getTime();
          }
        }
      }        
      else if (activeTextBox == 2)
      {
        if (myKey != password.charAt(password.length - 1))
        {
          password = password.concat(myKey);
          typeWait = new Date().getTime();
        }
        else
        {
          var nowTime = new Date().getTime();
          if (nowTime > typeWait + typeWaitTimer)
          {
            password = password.concat(myKey);
            typeWait = new Date().getTime();
          }
        }
      }
      else if (activeTextBox == 3)
      {
        if (myKey != chatMessage.charAt(chatMessage.length - 1))
        {
          chatMessage = chatMessage.concat(myKey);
          typeWait = new Date().getTime();
        }
        else
        {
          var nowTime = new Date().getTime();
          if (nowTime > typeWait + typeWaitTimer)
          {
            chatMessage = chatMessage.concat(myKey);
            typeWait = new Date().getTime();
          }
        }
      }
    }
  }
};

function saveClick(e) {
      var pos = getMousePos(c, e);
      localData.mouseClick.xClick = pos.x;
      localData.mouseClick.yClick = pos.y;
  }

function getMousePos(c, evt) {
      var rect = c.getBoundingClientRect();
      return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
      };
  };

function clearClick() {
  localData.mouseClick.xClick = -1;
  localData.mouseClick.yClick = -1;
};

//##############################################//
//          client side prediction              //
//                                              //
//      © CAMERON CHALMERS, 2015                //
//##############################################//

//Maybe only use this for client side prediction?
function move(press) {
  if (press[0] == 1) {
    localData.playerLocal.yPos--;
  }
  if (press[1] == 1) {
    localData.playerLocal.xPos++;
  }
  if (press[2] == 1) {
    localData.playerLocal.yPos++;
  }
  if (press[3] == 1) {
    localData.playerLocal.xPos--;
  }  
};

//##############################################//
//          useful functions                    //
//                                              //
//      © CAMERON CHALMERS, 2015                //
//##############################################//

// Find player by ID
function playerByName() {
  var i;
  for (i = 0; i < localData.serverData.playerData.length; i++) {
    if (localData.serverData.playerData[i][0] == username)
      return i;
  };  
  console.log('Unable to find player');
  return false;
};


//##############################################//
//          LOCAL VARIABLES                     //
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

//D:\Users\Cameron\University\SEGM Project\images

var localData = {
   playerLocal: {
    id: 0,
    xPos: 0,
    yPos: 0,
    cHealth: 0,
    mHealth: 0,
    weapon: -1,
    currAmmo: -1,
    maxAmmo: -1,
    firePercent: -1,
    boots: -1,
    chest: -1,
    light: -1,
    hat: -1
  },
   serverData: {
    playerData: [],
    enemyData: [],
    healthData: [],
    projectileData: [],
    weaponData: [],
    bootsData: [],
    chestData: [],
    lightData: [],
    hatData: [],
    currentTime: 0,
    serverTime: 0
  },
  mouseClick: {
    xClick: -1,
    yClick: -1
  },
  menuData: {
    serverReturn: 0
  },
  gameData: {
    timeCount: 0,
    fps: 0,
    fpsNew: 0
  }
};

//This loops the animation frames
var recursiveAnim = function() {
          mainLoop();
          animFrame(recursiveAnim);
    };

var weaponsImg = new Image();
weaponsImg.src = "http://i.imgur.com/CBbOaoW.png";
var bootsImg = new Image();
bootsImg.src = "http://i.imgur.com/pWoI51Z.png";
var chestImg = new Image();
chestImg.src = "http://i.imgur.com/vHBdE9f.png";
var hatImg = new Image();
hatImg.src = "http://i.imgur.com/x0JRVQR.png";
var lightImg = new Image();
lightImg.src = "http://i.imgur.com/yxT0tOX.png";
var enemyImg = new Image();
enemyImg.src = "http://i.imgur.com/JOLUvuy.png";
var healthImg = new Image();
healthImg.src = "http://i.imgur.com/sH1tcTy.png";
var playerImg = new Image();
playerImg.src = "http://i.imgur.com/qoOPt7d.png";
var backgroundImg = new Image();
backgroundImg.src = "http://i.imgur.com/8rTiyCj.jpg";
var overlayImg = new Image();
overlayImg.src = "http://i.imgur.com/LMgh2hk.png";
var timeWatchImg = new Image();
timeWatchImg.src = "http://i.imgur.com/aDBKXg5.png";
var menuImg = new Image();
menuImg.src = "http://i.imgur.com/qeQdWKl.jpg";
var sBackImg = new Image();
sBackImg.src = "http://i.imgur.com/x6YCIJx.png";
var minimapImg = new Image();
minimapImg.src = "http://i.imgur.com/t742sHr.png";
var compassImg = new Image();
compassImg.src = "http://i.imgur.com/UQfJyvx.png";

weaponsImg.onload = function() {
  bootsImg.onload = function() {
    chestImg.onload = function() {
      hatImg.onload = function() {
        lightImg.onload = function() {
          enemyImg.onload = function() {
            healthImg.onload = function() {
              playerImg.onload = function() {
                backgroundImg.onload = function() {
                  overlayImg.onload = function() {
                    timeWatchImg.onload = function() {
                        menuImg.onload = function() {
                          sBackImg.onload = function() {
                            minimapImg.onload = function() {
                              compassImg.onload = function() {
        animFrame(recursiveAnim);
}}}}}}}}}}}}}}};
