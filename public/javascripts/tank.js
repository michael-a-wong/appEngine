var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

console.log(ctx.rotate);


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

var flash = 1;

var tankReloadRate = 100; // this is in miliseconds; 

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

class Game {
    constructor() {
      this.numOfPlayers = 0; 
      this.tankObjects = []; 
    }
    // addPlayer(playerNum, tank) {
    //   this.tankObjects[playerNum] = tank; 
    //   this.numOfPlayers++; 
    // }
    // removePlayer(playerNum) {
    //   this.tankObjects.splice(playerNum, 1); 
    //   this.numOfPlayers--; 
    // }
    // playerCommands(playerNum, keys) {
  
    //   var opponent = 0; 
    //   if (playerNum == 0) {
    //     opponent = 1; 
    //   }
  
    //   handleKeys(tankObjects[playerNum], keys)
    //   tankObjects[playerNum].checkIfHit(tankObjects[opponent]); 
  
    //   // might have to delete line below
    //   tankObjects[opponent].checkIfHit(tankObjects[playerNum]); 
  
  
    // }
    updateGame(serverGame) {

        // compare tanks
        // calculate distances 
        // make moves
        // add made up moves to a queue

        if (this.numOfPlayers != serverGame.numOfPlayers) {
            this.numOfPlayers = serverGame.numOfPlayers; 
        }

        for (var i = 0; i < serverGame.tankObjects.length; i++) {

            if (this.tankObjects[i] === undefined) {
                this.tankObjects[i] = serverGame.tankObjects[i]; 
            }
            else {
                // compare tank objects
                
                // add shots
                 
            }
        }

    }
    
  }

class Shot {
    constructor(tank) {
        this.x = tank.x + (tankWidth / 2) + ((tankWidth / 2) * Math.cos(tank.direction));
        this.y = tank.y + (tankHeight / 2) + ((tankWidth / 2) * Math.sin(tank.direction));
        this.direction = tank.direction;
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

                    if (this.health == 0) {
                        explosion(this);
                    }

                    // if only one shot can hit at a time
                    break;
                }

            }
        }
    }
}

function explosion(tank) {

    ctx.beginPath();
    ctx.arc(tank.x + tankWidth / 2, tank.y + tankHeight / 2, 10, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();

}

function keyDownHandler(e) {

    if (e.key == "w") {
        WKey = 1;
    }
    if (e.key == "a") {
        AKey = 1;
    }
    if (e.key == "s") {
        SKey = 1;
    }
    if (e.key == "d") {
        DKey = 1;
    }
    if (e.key == 'e') {
        EKey = 1;
    }
    if (e.key == "j") {
        JKey = 1;
    }
    if (e.key == 'l') {
        LKey = 1;
    }
    if (e.key == ' ') {
        SpaceKey = 1;
    }

}

function keyUpHandler(e) {
    if (e.key == "w") {
        WKey = 0;
    }
    if (e.key == "a") {
        AKey = 0;
    }
    if (e.key == "s") {
        SKey = 0;
    }
    if (e.key == "d") {
        DKey = 0;
    }
    if (e.key == 'e') {
        EKey = 0;
    }
    if (e.key == "j") {
        JKey = 0;
    }
    if (e.key == 'l') {
        LKey = 0;
    }
    if (e.key == ' ') {
        SpaceKey = 0;
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

function drawShot(shot) {

    ctx.beginPath();
    ctx.arc(shot.x, shot.y, shotRadius, 0, Math.PI * 2);
    ctx.fillStyle = "blue";
    ctx.fill();
    ctx.closePath();

    shot.x += shotSpeed * Math.cos(shot.direction);
    shot.y += shotSpeed * Math.sin(shot.direction);
}

function getLengthForDeg(phi) {
    phi = ((phi + 45) % 90 - 45) / 180 * Math.PI;
    return 1 / Math.cos(phi);
}

function drawTank(tank) {
    if (tank.health > 0) {


        ctx.beginPath();

        var xTranslation = tank.x + tankWidth / 2;
        var yTranslation = tank.y + tankHeight / 2;

        ctx.translate(xTranslation, yTranslation);
        //console.log(tank.direction); 
        ctx.rotate(tank.direction);
        ctx.translate(-1 * xTranslation, -1 * yTranslation);

        ctx.rect(tank.x, tank.y, tankWidth, tankHeight);
        ctx.fillStyle = "#0095DD";
        ctx.fill();

        ctx.setTransform(1, 0, 0, 1, 0, 0);

        ctx.closePath();

        for (var i = 0; i < tank.shots.length; i++) {

            if (checkShotLocation(tank.shots[i])) {
                drawShot(tank.shots[i]);
                //console.log("true"); 
            }
            else {
                tank.shots.splice(i, 1);
                //console.log("hello?!?");

            }
        }
    }
}

var keys = [WKey, SKey, EKey, AKey, DKey, SpaceKey];
var previousKeys = [WKey, SKey, EKey, AKey, DKey, SpaceKey];
var myKeys = [0, 0, 0, 0, 0, 0]; 

function arraysEqual(arr1, arr2) {
    if(arr1.length !== arr2.length)
        return false;
    for(var i = arr1.length; i--;) {
        if(arr1[i] !== arr2[i])
            return false;
    }

    return true;
}

function draw() {

    keys = [WKey, SKey, EKey, AKey, DKey, SpaceKey];

   // if ( !arraysEqual(previousKeys, keys)) {
        
        //socket.emit('tankData', keys);
        socket.emit(`tank${playerNum}Actions`, keys); 
    //}
    previousKeys = keys; 


    // if (meTank.health > 0) {

    //     //console.log(JSON.stringify(meTank)); 
    //     handleKeys(meTank, myKeys);
    //     meTank.checkIfHit(enemyTank);
    //     drawTank(meTank);
    //     //socket.emit('tankData', meTank); 

    //     //console.log(keys + "myKeys"); 
        
    // }

    // if (opponentKeys.length === 6) {
    //     handleKeys(enemyTank, opponentKeys);
    //     //opponentKeys.fill(0); 
    // }

    // if (enemyTank.health > 0) {
    //     drawTank(enemyTank);
    //     if (meTank.health > 0) {
    //         meTank.checkIfHit.call(enemyTank, meTank);
    //     }
    // }

    requestAnimationFrame(draw);
}

var meTank;
var tank2;


var enemyTank;
var opponentKeys = []

var playerNum = 0; 

var socket = io();
socket.on('serverTankData', function (msg) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);


    if (playerNum == 1) {
        myKeys = msg[0]; 
        opponentKeys = msg[1];         
    }
    else if (playerNum == 2) {
        myKeys = msg[1]; 
        opponentKeys = msg[0]; 
    }

    console.log(msg); 
    //enemyTank = msg; 
    // opponentKeys = msg;

    if (meTank.health > 0) {

        //console.log(JSON.stringify(meTank)); 
        handleKeys(meTank, myKeys);
        meTank.checkIfHit(enemyTank);
        drawTank(meTank);
        //socket.emit('tankData', meTank); 

        //console.log(keys + "myKeys"); 
        
    }

    if (opponentKeys.length === 6) {
        handleKeys(enemyTank, opponentKeys);
        //opponentKeys.fill(0); 
    }

    if (enemyTank.health > 0) {
        drawTank(enemyTank);
        if (meTank.health > 0) {
            meTank.checkIfHit.call(enemyTank, meTank);
        }
    }

});

socket.on('setPlayerNum', function (msg) {

    playerNum = msg; 
    console.log("I am player " + msg); 
    if (playerNum == 1) {
        meTank = new Tank(50, 50);
        enemyTank = new Tank(150, 50); 
        
    }
    else if (playerNum == 2) {
        meTank = new Tank(150, 50);
        enemyTank  = new Tank(50, 50); 
    }

    draw(); 

});

socket.on('gameState', function(msg) {

    // process game
    // add new commads to queue
}); 

