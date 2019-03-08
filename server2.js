const express = require('express');
const app = express();
const path = require(`path`);
const bodyParser = require('body-parser');

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 3000;
var server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});

// var http = require('http').Server(app);
var io = require('socket.io').listen(server);

var numOfUsers = 0;
var tankActions = new Array(2);
for (var i = 0; i < tankActions.length; i++) {
  tankActions[i] = [0, 0, 0, 0, 0, 0];
}

// change this to be called run game
function moveShots(game) {

  //console.log("hello"); 
  var isChanged = false; 
  for (var i = 0; i < game.tankObjects.length; i++) {
    for (var j = 0; j < game.tankObjects[i].shots.length; j++) {
      var shot = game.tankObjects[i].shots[j];
      shot.x += shotSpeed * Math.cos(shot.direction);
      shot.y += shotSpeed * Math.sin(shot.direction);

      isChanged = true; 
      if (!checkShotLocation(shot)) {
        game.tankObjects[i].shots.splice(j, 1);
      }
    }
  }

  // if state of the game has changed. 
  if (isChanged || game.isChanged) {
    io.emit('gameState', game);
    game.isChanged = false; 
  }


}

class Game {
  constructor() {
    this.numOfPlayers = 0;
    this.tankObjects = [];
    this.isChanged = false; 
  }
  // constructor( game) {

  // }
  addPlayer(playerNum, tank) {
    this.tankObjects[playerNum] = tank;
    this.numOfPlayers++;
    this.isChanged = true; 
  }
  removePlayer(playerNum) {
    this.tankObjects.splice(playerNum, 1);
    this.numOfPlayers--;
    this.isChanged = true; 
  }
  playerCommands(playerNum, keys) {

    this.isChanged = true; 
    var opponent = 0;
    if (playerNum == 0) {
      opponent = 1;
    }

    //console.log(this.tankObjects);
    handleKeys(this.tankObjects[playerNum], keys)

    if (this.tankObjects[0] !== undefined && this.tankObjects[1] !== undefined) {
      this.tankObjects[playerNum].checkIfHit(this.tankObjects[opponent]);

      // might have to delete line below
      this.tankObjects[opponent].checkIfHit(this.tankObjects[playerNum]);
    }
  }

  isDifferent(game) {
    if (this.tankObjects.length == game.tankObjects.length) {
      for (var i = 0; i < this.tankObjects.length; i++) {
        if (this.tankObjects[i].isDifferent(game.tankObjects[i])) {
          return true;
        }
      }
      // this means all the tank objects are the same
      return false;
    }
    return true;
  }

}

var game = new Game();

var interval;

io.on('connection', function (socket) {

  if (numOfUsers == 0) {
    game.addPlayer(numOfUsers, new Tank(50, 50));
    interval = setInterval(moveShots, 20, game);
  }
  if (numOfUsers == 1) {
    game.addPlayer(numOfUsers, new Tank(150, 50));
  }

  console.log(`You are player ${numOfUsers}`);
  socket.emit('setPlayerNum', numOfUsers);

  // broadcast new updated state to everyone connected
  io.emit('gameState', game);

  numOfUsers++;

  console.log(`a user connected number of Users = ` + numOfUsers);

  socket.on('disconnect', function () {
    numOfUsers = 0;
    clearInterval(interval);
    game = new Game(); 
    console.log(`user disconnected number of Users = ` + numOfUsers);
    io.emit('endGame', "endGame");

  });

  socket.on('tank0Actions', function (msg) {

    //console.log(`received action from 0`);

    //if (!arraysEqual(msg,  [0, 0, 0, 0, 0, 0])) 
    console.log(msg);

    var previousGameState = game;
    game.playerCommands(0, msg);

    //if (previousGameState.isDifferent(game)) {
    // if game state is different
    // console.log("sending data"); 
    // io.emit('gameState', game);
    //}


  });
  socket.on('tank1Actions', function (msg) {

    var previousGameState = game;

    // if (!arraysEqual(msg,  [0, 0, 0, 0, 0, 0])) 
    console.log(msg);


    //console.log(`received action from 1`);
    game.playerCommands(1, msg);

    //console.log ( previousGameState, game); 

    //if (previousGameState.isDifferent(game)) {
    // if game state is different
    // console.log("sending data"); 

    // io.emit('gameState', game);
    //}

  });
});

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/submit', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/views/form.html'));
});

app.get('/tank', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/views/tank2.html'));
});

app.get('/', (req, res) => {
  res.send('Hello from App Engine!');
});

app.use(express.static(path.join(__dirname, 'public')));

app.post('/submit', (req, res) => {
  console.log({
    name: req.body.name,
    message: req.body.message
  });
  res.send('Thanks for your message!');
});



function calculateGame() {

}


var tankWidth = 25;
var tankHeight = 10;
var tankSpeed = 2;
var tankRotation = Math.PI / 32;
var tankHealth = 10;

var shotSpeed = 5;
var shotRadius = 2;

var AKey = 0;
var WKey = 0;
var EKey = 0;
var SKey = 0;
var DKey = 0;
var SpaceKey = 0;
var JKey = 0;
var LKey = 0;

var canvas = {};
canvas['width'] = 480;
canvas['height'] = 320;

var flash = 1;

var tankReloadRate = 100; // this is in miliseconds; 



class Shot {
  constructor(tank) {
    this.x = tank.x + (tankWidth / 2) + ((tankWidth / 2) * Math.cos(tank.direction));
    this.y = tank.y + (tankHeight / 2) + ((tankWidth / 2) * Math.sin(tank.direction));
    this.direction = tank.direction;
  }
  isDifferent(shot) {
    if (this.x == shot.x && this.y == shot.y && this.direction == shot.direction) {
      return false;
    }
    return true;
  }
}

class Tank {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.direction = 0;
    this.shots = [];
    this.isReloading = false;
    this.health = tankHealth;

  }

  update(object) {
    this.x = object.x;
    this.y = object.y;
    this.direction = object.direction;
    this.shots = object.shots;
    this.isReloading = object.isReloading;
    this.health = object.health;
  }

  checkIfHit(tank) {
    for (var i = 0; i < tank.shots.length; i++) {

      for (var orbitDegree = 0; orbitDegree < Math.PI * 2; orbitDegree += Math.PI / 32) {
        var length = getLengthForDeg(orbitDegree * (180 / Math.PI));

        var movingLengthX = (tankWidth + tankHeight) / 2 + ((tankWidth - tankHeight) / 2 * Math.cos(2 * this.direction));
        var movingLengthY = (tankWidth + tankHeight) / 2 + ((tankWidth - tankHeight) / -2 * Math.cos(2 * this.direction));

        var testx = this.x + (tankWidth / 2) + (movingLengthX / 2 * length * Math.cos(orbitDegree));
        var testy = this.y + (tankHeight / 2) + (movingLengthY / 2 * length * Math.sin(orbitDegree));

        var distanceToShot = Math.sqrt(Math.pow((testx - tank.shots[i].x), 2) + Math.pow((testy - tank.shots[i].y), 2));


        if (distanceToShot < shotRadius) {
          console.log("I got hit!!!");
          tank.shots.splice(i, 1);
          this.health--;

          // if (this.health == 0) {
          //   explosion(this);
          // }

          // if only one shot can hit at a time
          break;
        }

      }
    }
  }

  isDifferent(tank) {
    if (this.x == tank.x && this.y == tank.y && this.direction == tank.direction
      && this.isReloading == tank.isReloading && this.health == tank.health) {

      if (this.shots.length == tank.shots.length) {
        for (var i = 0; i < tank.shots.length; i++) {
          if (this.shots[i].isDifferent(tank.shots[i])) {
            return true;
          }
        }
        // the values are the same here
        // can only get here if all the shots are different
        return false;
      }
      return true;
    }

    return true;
  }
}



function rotateTank(tank, degree) {
  tank.direction = (tank.direction + degree) % (2 * Math.PI);
}

function moveTank(tank, distance) {
  tank.x += distance * Math.cos(tank.direction);
  tank.y += distance * Math.sin(tank.direction);

  if (tank.x < 0) {
    tank.x = 0;
  }
  if (tank.y < 0 + (tankHeight / 2)) {
    tank.y = 0 + (tankHeight / 2);
  }
  if (tank.x > canvas.width - (tankWidth / 2)) {
    tank.x = canvas.width - (tankWidth / 2);
  }
  if (tank.y > canvas.height - (tankHeight / 2)) {
    tank.y = canvas.height - (tankHeight / 2);
  }
}

function reload(tank) {
  tank.isReloading = false;
}

function handleKeys(tank, keys) {
  // The order of the Keys are WKey, SKey, EKey, AKey, DKey, SpaceKey

  if (keys[0]) {
    moveTank(tank, tankSpeed);
  }
  if (keys[1]) {
    moveTank(tank, -1 * tankSpeed)
  }
  if (keys[2] && flash > 0) {
    moveTank(tank, 40);
    flash--;
  }
  if (keys[3]) {
    rotateTank(tank, -1 * tankRotation)
  }
  if (keys[4]) {
    rotateTank(tank, tankRotation)
  }
  if (keys[5] && !tank.isReloading) {
    tank.shots.push(new Shot(tank));
    tank.isReloading = true;
    setTimeout(reload, tankReloadRate, tank);
  }
}

function checkShotLocation(shot) {
  if (shot.x > 0 && shot.x < canvas.width && shot.y > 0 && shot.y < canvas.height) {
    return true;
  }
  return false;
}



function getLengthForDeg(phi) {
  phi = ((phi + 45) % 90 - 45) / 180 * Math.PI;
  return 1 / Math.cos(phi);
}



var keys = [WKey, SKey, EKey, AKey, DKey, SpaceKey];
var previousKeys = [WKey, SKey, EKey, AKey, DKey, SpaceKey];
var myKeys = [0, 0, 0, 0, 0, 0];

function arraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length)
    return false;
  for (var i = arr1.length; i--;) {
    if (arr1[i] !== arr2[i])
      return false;
  }

  return true;
}



var meTank;
var tank2;


var enemyTank;
var opponentKeys = []

var playerNum = 0;

