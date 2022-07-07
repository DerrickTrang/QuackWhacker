// Rendering variables
const canvas = document.querySelector("#gs");
const ctx = canvas.getContext("2d");

var mountainPattern;
var cloudPattern;
var mountainImg = new Image();
var treeImg = new Image();
var cloudImg = new Image();
var batterStartImg = new Image();
var batterSwingingImg = new Image();
var backgroundGradient = ctx.createLinearGradient(0, 0, 0, skyMaxHeight);
backgroundGradient.addColorStop(0, troposphereColor);
backgroundGradient.addColorStop(0.2, stratosphereColor);
backgroundGradient.addColorStop(0.5, thermosphereColor);
var menuBackgroundLoopInterval = 0;
var duckIdle = new Image();
var duckWingUp = new Image();
var duckWingDown = new Image();
var duckZoomin = new Image();
var eagleIdle = new Image();
var eagleWingUp = new Image();
var eagleWingDown = new Image();
var eagleZoomin = new Image();
var penguinIdle = new Image();
var penguinWingUp = new Image();
var penguinWingDown = new Image();
var penguinZoomin = new Image();
var currentBirdName;
var currentBirdIdle = new Image();
var currentBirdWingUp = new Image();
var currentBirdWingDown = new Image();
var currentBirdZoomin = new Image();

function loadAssets() {
    mountainImg.src = mountainImgSrc;
    duckIdle.src = duckIdleSrc;
    duckWingUp.src = duckWingUpSrc;
    duckWingDown.src = duckWingDownSrc;
    duckZoomin.src = duckZoominSrc;

    eagleIdle.src = eagleIdleSrc;
    eagleWingUp.src = eagleWingUpSrc;
    eagleWingDown.src = eagleWingDownSrc;
    eagleZoomin.src = eagleZoominSrc;

    penguinIdle.src = penguinIdleSrc;
    penguinWingUp.src = penguinWingUpSrc;
    penguinWingDown.src = penguinWingDownSrc;
    penguinZoomin.src = penguinZoominSrc;

    treeImg.src = treeImgSrc;
    cloudImg.src = cloudImgSrc;
    batterStartImg.src = batterStartImgSrc;
    batterSwingingImg.src = batterSwingingImgSrc;

    mountainImg.onload = () => {
        mountainPattern = ctx.createPattern(mountainImg, "repeat");
    }
    cloudImg.onload = () => {
        cloudPattern = ctx.createPattern(cloudImg, "repeat");
    }
}

const updateCurrentBird = birdName => {
    if(birdName !== currentBirdName) {
        if(birdName === 'Duck') {
            currentBirdIdle = duckIdle;
            currentBirdWingUp = duckWingUp;
            currentBirdWingDown = duckWingDown;
            currentBirdZoomin = duckZoomin;
        } else if(birdName === 'Penguin') {
            currentBirdIdle = penguinIdle;
            currentBirdWingUp = penguinWingUp;
            currentBirdWingDown = penguinWingDown;
            currentBirdZoomin = penguinZoomin;
        } else if(birdName === 'Eagle') {
            currentBirdIdle = eagleIdle;
            currentBirdWingUp = eagleWingUp;
            currentBirdWingDown = eagleWingDown;
            currentBirdZoomin = eagleZoomin;
        } else {
            // Draw a duck if undefined bird type
            currentBirdIdle = duckIdle;
            currentBirdWingUp = duckWingUp;
            currentBirdWingDown = duckWingDown;
            currentBirdZoomin = duckZoomin;
            console.log("Unknown bird type: " + birdName);
        }
    }
    currentBirdName = birdName;
}

const drawMenu = () => {
    let wWidth = document.body.clientWidth;
    let wHeight = document.body.clientHeight;
    canvas.width = wWidth;
    canvas.height = wHeight;

    // Controls speed of clouds passing animation
    menuBackgroundLoopInterval = (menuBackgroundLoopInterval + 1) % 2000;
    ctx.translate(-menuBackgroundLoopInterval, 0);
    ctx.fillStyle = menuSkyColor;
    ctx.fillRect(menuBackgroundLoopInterval, 0, wWidth, wHeight);
    ctx.fillStyle = cloudPattern;
    ctx.fillRect(menuBackgroundLoopInterval, 0, wWidth, wHeight);
}

const drawScene = () => {

    // Update canvas size (if window is resized)
    let wWidth = document.body.clientWidth;
    let wHeight = document.body.clientHeight;
    canvas.width = wWidth;
    canvas.height = wHeight;

    // Update camera position1
    let cameraX = xPos - (wWidth * 2 / 5);
    let cameraY = Math.min(yPos - (wHeight / 4), groundLevel - wHeight + 200);
    ctx.translate(-cameraX, -cameraY);

    // Draw background
    ctx.fillStyle = backgroundGradient;
    ctx.fillRect(cameraX, skyMaxHeight, wWidth, groundLevel - skyMaxHeight);

    // Draw clouds
    ctx.beginPath();
    ctx.fillStyle = cloudPattern;
    ctx.fillRect(cameraX, -3000, wWidth, 500);
    ctx.closePath();

    // Draw mountain
    ctx.beginPath();
    ctx.fillStyle = mountainPattern;
    ctx.fillRect(cameraX, groundLevel - 482, wWidth, 482);
    ctx.closePath();

    // Draw ground
    ctx.beginPath();
	ctx.fillStyle = groundColor;
	ctx.fillRect(cameraX, groundLevel, wWidth, 200);
    ctx.closePath();

    // Draw tree
    ctx.drawImage(treeImg, 0, 0, 500, 600, -435, -600, 500, 600);

    // Draw batter
    if(batSwung) {
        ctx.drawImage(batterSwingingImg, 0, 0, 200, 200, xPosBatter - 164, groundLevel - 200, 200, 200);
    } else {
        ctx.drawImage(batterStartImg, 0, 0, 200, 200, xPosBatter - 164, groundLevel - 200, 200, 200);
    }

    // Draw bird
    ctx.translate(xPos, yPos);
    ctx.rotate(birdAngle);
    updateCurrentBird(bird.name);
    if(currentGameState === gameState.MIDAIR) {
        if(yMultiplier !== 1) {
            ctx.drawImage(currentBirdZoomin, 0, 0, 64, 32, -64, -32, 64, 32);
        } else if(lastUpdateTime.getMilliseconds() % 100 > 50) {
            ctx.drawImage(currentBirdWingUp, 0, 0, 64, 32, -64, -32, 64, 32);
        } else {
            ctx.drawImage(currentBirdWingDown, 0, 0, 64, 32, -64, -32, 64, 32);
        }
    } else {
        ctx.drawImage(currentBirdIdle, 0, 0, 64, 32, -64, -32, 64, 32);
    }

    // DEBUGGING: Draw angle indicator
    // ctx.textAlign = 'left';
    // ctx.fillStyle = "red";
    // ctx.font = "50px Verdana";
    // ctx.fillText(">", 0, 0);
    // ctx.font = "12px Verdana";

    ctx.rotate(-birdAngle);
    ctx.translate(-xPos, -yPos);

    // Draw high score
    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("High score: " + sessionHighScore + " m", cameraX + 20, cameraY + wHeight - 20);

    // DEBUGGING: Display current game state info
    // ctx.textAlign = 'left';
    // ctx.fillStyle = "black";
    // ctx.fillText("x position: " + xPos, xPos, yPos - 100);
    // ctx.fillText("y position: " + yPos, xPos, yPos - 90);
    // ctx.fillText("x vel: " + xVelocity, xPos, yPos - 80);
    // ctx.fillText("y vel: " + yVelocity, xPos, yPos - 70);
    // ctx.fillText("current state: " + currentGameState, xPos, yPos - 60);
    // ctx.fillText("y multiplier: " + yMultiplier, xPos, yPos - 50);
    // ctx.fillText("duck angle: " + birdAngle, xPos, yPos - 40);
}