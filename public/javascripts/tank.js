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

var AKey = false;
var WKey = false;
var SKey = false;
var DKey = false;
var EKey = false;
var SpaceKey = false;
var JKey = false;
var LKey = false;

var flash = 1;

var tankReloadRate = 100; // this is in miliseconds; 

class Shot {
    constructor(tank) {
        this.x = tank.x + (tankWidth / 2) + ((tankWidth / 2) * Math.cos(tank.direction));
        this.y = tank.y + (tankHeight / 2) + ((tankWidth / 2) * Math.sin(tank.direction));
        // this.y = tank.y + (tankWidth / 2) + ((tankWidth / 2) * Math.sin(tank.direction)); 


        // this.x = tank.x; 
        // this.y = tank.y; 

        //console.log(Math.sqrt(Math.pow((tankWidth / 2), 2)) - (tankWidth / 2));

        //- Math.pow((tank.y - (tankHeight/2)), 2)
        //this.x = tank.x ; 
        // this.y = tank.y + (tankHeight / 2) + ((tankHeight / 2) * Math.sin(tank.direction)); 

        this.direction = tank.direction;
    }
}

function explosion(tank) {

    ctx.beginPath();
    ctx.arc(tank.x + tankWidth / 2, tank.y + tankHeight / 2, 10, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();

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
            // if (tank.shots[i].x > this.x - shotRadius && tank.shots[i].x < this.x + shotRadius + tankWidth
            //     && tank.shots[i].y > this.y - shotRadius && tank.shots[i].y < this.y + shotRadius + tankHeight) 



            for (var orbitDegree = 0; orbitDegree < Math.PI * 2; orbitDegree += Math.PI / 32) {
                var length = getLengthForDeg(orbitDegree * (180 / Math.PI));

                var movingLengthX = (tankWidth + tankHeight) / 2 + ((tankWidth - tankHeight) / 2 * Math.cos(2 * this.direction));
                var movingLengthY = (tankWidth + tankHeight) / 2 + ((tankWidth - tankHeight) / -2 * Math.cos(2 * this.direction));

                var testx = this.x + (tankWidth / 2) + (movingLengthX / 2 * length * Math.cos(orbitDegree));
                var testy = this.y + (tankHeight / 2) + (movingLengthY / 2 * length * Math.sin(orbitDegree));

                var distanceToShot = Math.sqrt(Math.pow((testx - tank.shots[i].x), 2) + Math.pow((testy - tank.shots[i].y), 2));

                //console.log(distanceToShot); 

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

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {

    //console.log(e.key); 

    if (e.key == "w") {
        WKey = true;
    }
    if (e.key == "a") {
        AKey = true;
    }
    if (e.key == "s") {
        SKey = true;
    }
    if (e.key == "d") {
        DKey = true;
    }
    if (e.key == 'e') {
        EKey = true;
    }
    if (e.key == "j") {
        JKey = true;
    }
    if (e.key == 'l') {
        LKey = true;
    }
    if (e.key == ' ') {
        SpaceKey = true;
    }

}

function keyUpHandler(e) {
    if (e.key == "w") {
        WKey = false;
    }
    if (e.key == "a") {
        AKey = false;
    }
    if (e.key == "s") {
        SKey = false;
    }
    if (e.key == "d") {
        DKey = false;
    }
    if (e.key == 'e') {
        EKey = false;
    }
    if (e.key == "j") {
        JKey = false;
    }
    if (e.key == 'l') {
        LKey = false;
    }
    if (e.key == ' ') {
        SpaceKey = false;
    }

}

function rotateTank(tank, degree) {
    tank.direction = (tank.direction + degree) % (2 * Math.PI);
}

function moveTank(tank, distance) {
    tank.x += distance * Math.cos(tank1.direction);
    tank.y += distance * Math.sin(tank1.direction);

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

function handleKeys(tank) {
    if (WKey) {
        moveTank(tank, tankSpeed);
    }
    if (SKey) {
        moveTank(tank, -1 * tankSpeed)
    }
    if (EKey && flash > 0) {
        moveTank(tank, 40);
        flash--;
    }
    if (AKey) {
        rotateTank(tank, -1 * tankRotation)
    }
    if (DKey) {
        rotateTank(tank, tankRotation)
    }
    if (SpaceKey && !tank.isReloading) {
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

// var testOrbitDegree = 0;

function getLengthForDeg(phi) {
    phi = ((phi + 45) % 90 - 45) / 180 * Math.PI;
    return 1 / Math.cos(phi);
}

// function orbitTank(tank) {
//     //console.log(tank.direction); 
//     testOrbitDegree = (testOrbitDegree + Math.PI / 32) % (2 * Math.PI);
//     var testDegree = testOrbitDegree;
//     //var testDegree2 = Math.atan( -1 * tankHeight / tankWidth) + tank.direction; 


//     var length = getLengthForDeg(testDegree * (180 / Math.PI));

//     var movingLengthX = (tankWidth + tankHeight) / 2 + ((tankWidth - tankHeight) / 2 * Math.cos(2 * tank.direction));
//     var movingLengthY = (tankWidth + tankHeight) / 2 + ((tankWidth - tankHeight) / -2 * Math.cos(2 * tank.direction));

//     //console.log(movingLengthX);

//     // var testx = tank.x + (tankWidth / 2) + (tankWidth / 2 * length * Math.cos(testDegree));
//     // var testy = tank.y + (tankHeight / 2) + (tankHeight / 2 * length * Math.sin(testDegree));

//     var testx = tank.x + (tankWidth / 2) + (movingLengthX / 2 * length * Math.cos(testDegree));
//     var testy = tank.y + (tankHeight / 2) + (movingLengthY / 2 * length * Math.sin(testDegree));

//     ctx.beginPath();
//     // var xTranslation = tank.x + tankWidth / 2;
//     // var yTranslation = tank.y + tankHeight / 2;

//     // ctx.translate(xTranslation, yTranslation);
//     // ctx.rotate(tank.direction);
//     // ctx.translate(-1 * xTranslation, -1 * yTranslation);

//     // testx += testx * Math.cos(tank.direction); 
//     // testy += testy * Math.sin(tank.direction); 

//     //console.log(testy)
//     ctx.arc(testx, testy, 1, 0, Math.PI * 2);
//     ctx.fillStyle = "red";
//     ctx.fill();
//     ctx.setTransform(1, 0, 0, 1, 0, 0);

//     ctx.closePath();
// }



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

    // orbitTank(tank);

    // var testDegree = Math.atan(tankHeight / tankWidth) + tank.direction;
    // var testx = tank.x + (tankWidth / 2) + ((tankWidth / 2) * Math.cos(testDegree));
    // var testy = tank.y + (tankHeight / 2) + ((tankWidth / 2) * Math.sin(testDegree));

    // ctx.beginPath();
    // ctx.arc(testx, testy, 1, 0, Math.PI * 2);
    // ctx.fillStyle = "red";
    // ctx.fill();
    // ctx.closePath();

    // // X upper bound, lower bound

    // // var testx = tank.x + (tankWidth / 2) + ((tankWidth / 2) * Math.cos(tank.direction));
    // // var testy = tank.y + (tankHeight / 2) + ((tankWidth / 2) * Math.sin(tank.direction));

    // // ctx.beginPath();
    // // ctx.arc(testx, testy, 1, 0, Math.PI * 2);
    // // ctx.fillStyle = "red";
    // // ctx.fill();
    // // ctx.closePath();

    // var testx = tank.x + (tankWidth / 2) + ((tankWidth / 2) * Math.cos(testDegree) * -1);
    // var testy = tank.y + (tankHeight / 2) + ((tankWidth / 2) * Math.sin(testDegree) * -1);

    // ctx.beginPath();
    // ctx.arc(testx, testy, 1, 0, Math.PI * 2);
    // ctx.fillStyle = "red";
    // ctx.fill();
    // ctx.closePath();


    // // Y upper bound, lower bound

    // var testDegree = Math.atan(-1 * tankHeight / tankWidth) + tank.direction;


    // var testx = tank.x + (tankWidth / 2) + ((tankWidth / 2) * Math.cos(testDegree));
    // var testy = tank.y + (tankHeight / 2) + ((tankWidth / 2) * Math.sin(testDegree));

    // ctx.beginPath();
    // ctx.arc(testx, testy, 1, 0, Math.PI * 2);
    // ctx.fillStyle = "red";
    // ctx.fill();
    // ctx.closePath();

    // var testx = tank.x + (tankWidth / 2) + ((tankHeight / 2) * Math.cos(testDegree + Math.PI / 2) * -1);
    // var testy = tank.y + (tankHeight / 2) + ((tankHeight / 2) * Math.sin(testDegree + Math.PI / 2) * -1);

    // ctx.beginPath();
    // ctx.arc(testx, testy, 1, 0, Math.PI * 2);
    // ctx.fillStyle = "red";
    // ctx.fill();
    // ctx.closePath();

}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawTank(tank1);
    handleKeys(tank1);

    if (JKey) {
        rotateTank(tank2, -1 * tankRotation)
    }
    if (LKey) {
        rotateTank(tank2, tankRotation)
    }

    // drawTank(tank2);
    // tank2.checkIfHit(tank1);

    socket.emit('tankData', tank1); 

    drawTank(testTank); 
    testTank.checkIfHit(tank1); 
    tank1.checkIfHit(testTank); 

    
    requestAnimationFrame(draw);
}

var tank1 = new Tank(40, 40);
var tank2 = new Tank(150, 40);

var testTank = new Tank(40, 40); 

var socket = io(); 
socket.on('serverTankData', function(msg){
    //console.log(msg); 
    testTank.update(msg); 

  });

draw(); 