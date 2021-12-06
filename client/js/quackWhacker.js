// Rendering variables
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

var bird;
var batSwung;
var currentGameState;
var xPos;
var yPos;
var xVelocity;
var yVelocity;
var yAcceleration;
var birdAngle;
var jumpsRemaining;
var yMultiplier;
var lastUpdateTime = new Date();

var keyPressed;
var newKeyInput;

var sessionHighScore = 0;

// Event listeners
const spacebarEventListener = (e) => {
    if(e.keyCode === 32 && !keyPressed) {
        keyPressed = true;
        if(!newKeyInput) {
            newKeyInput = true;
        }
    }
}

const backspaceEventListener = (e) => {
    if(e.keyCode === 8 && !keyPressed) {
        keyPressed = true;
        if(!newKeyInput) {
            newKeyInput = true;
        }
    }
}

const mousedownEventListener = (e) => {
    if(!keyPressed) {
        keyPressed = true;
        if(!newKeyInput) {
            newKeyInput = true;
        }
    }
}

const touchstartEventListener = (e) => {
    if(!keyPressed) {
        keyPressed = true;
        if(!newKeyInput) {
            newKeyInput = true;
        }
    }
}

const getScoreFromPos = (x) => {
    return Math.round(x) / 10;
}

const updateCurrentPosition = () => {
    let currentTime = new Date();
    let dateDiff = currentTime - new Date(lastUpdateTime);

    if(dateDiff > 1000) {
        /* If animation loop is stopped for longer than 1 second (e.g. switching browser tabs), redraw same frame */
        dateDiff = 0;
    }

    // Calculate velocity
    xVelocity += xAcceleration * dateDiff;
    if(xVelocity <= 0) {
        xVelocity = 0;
    }
    yVelocity += yAcceleration * dateDiff;    

    // Calculate position
    xPos += xVelocity * dateDiff;
    yPos += yVelocity * yMultiplier * dateDiff;    
    if(yPos >= groundLevel) {
        yPos = groundLevel;
        yVelocity = 0;
    }

    // Calculate velocity vector angle
    if(yVelocity !== 0) {
        birdAngle = Math.atan(yVelocity * yMultiplier / xVelocity);
    }

    lastUpdateTime = currentTime;
}

const startLoop = () => {
    if(newKeyInput) {
        changeState(gameState.FALLING);
        newKeyInput = false;
    }
}

const fallingLoop = () => {
    if(yVelocity > 0) {
        yAcceleration = 0;
        yVelocity = bird.fallingStateSpeed;        
    }

    if(yPos >= groundLevel) {
        yPos = groundLevel;
        //newKeyInput = false;
        changeState(gameState.GAME_OVER);
    } else {
        if(newKeyInput && batSwung === false) {
            batSwung = true;
            if(yPos >= (yPosBatter - battingWindow) &&
                yPos <= (yPosBatter + battingWindow)) {
                    // Determine angle between batter and duck
                    let dx = xPos - xPosBatter;
                    let dy = yPos - yPosBatter;
                    let theta = Math.atan(dy/dx);
    
                    // Calculate duck x and y velocity using angle
                    let vx = batterPower * Math.cos(theta);
                    let vy = batterPower * Math.sin(theta);
    
                    xVelocity = vx;
                    yVelocity = vy;
                    changeState(gameState.MIDAIR);
            }
            newKeyInput = false;
        }
    }
}

const midairLoop = () => {
    if(yPos >= groundLevel) {
        
        if(xVelocity <= 0) {
            sessionHighScore = Math.max(sessionHighScore, getScoreFromPos(xPos));
            changeState(gameState.GAME_OVER);
        } else {
            xAcceleration = bird.groundFriction;
            if(keyPressed && jumpsRemaining > 0) {
                yVelocity = bird.jumpHeightSteps * jumpsRemaining;
                jumpsRemaining -= 1; 
            }
        }        
    } else {
        xAcceleration = 0;
        if(yVelocity > 1) {
            yAcceleration = 0;
        } else {
            yAcceleration = bird.gravity;
        }
        if(keyPressed) {
            yMultiplier = bird.birdYMultiplier;
        } else {
            yMultiplier = 1;
        }
    }
}

const gameOverLoop = () => {
    if(newKeyInput) {
        changeState(gameState.START);
        newKeyInput = false;
    }    
}

const drawMenu = () => {
    let wWidth = document.body.clientWidth;
    let wHeight = document.body.clientHeight;
    canvas.width = wWidth;
    canvas.height = wHeight;

    menuLoopInterval = (menuLoopInterval + 1) % 2000;
    ctx.translate(-menuLoopInterval, 0);
    ctx.fillStyle = "lightskyblue";
    ctx.fillRect(menuLoopInterval, 0, wWidth, wHeight);    
    ctx.fillStyle = cloudPattern;
    ctx.fillRect(menuLoopInterval, 0, wWidth, wHeight);    
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
    ctx.fillStyle = "deepskyblue";
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
	ctx.fillStyle = "green";
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
    if(currentGameState === gameState.MIDAIR) {        
        if(yMultiplier !== 1) {
            ctx.drawImage(bird.imgZoomin, 0, 0, 64, 32, -64, -32, 64, 32);
        } else if(lastUpdateTime.getMilliseconds() % 100 > 50) {
            ctx.drawImage(bird.imgWingUp, 0, 0, 64, 32, -64, -32, 64, 32);
        } else {
            ctx.drawImage(bird.imgWingDown, 0, 0, 64, 32, -64, -32, 64, 32);
        }
    } else {
        ctx.drawImage(bird.imgIdle, 0, 0, 64, 32, -64, -32, 64, 32);
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

    // FOR DEBUGGING: 
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

const changeState = (newState) => {
    // Remove existing listeners
    switch(currentGameState) {
        case gameState.START:
            document.removeEventListener("keydown", spacebarEventListener);
            document.removeEventListener("mousedown", mousedownEventListener);
            document.removeEventListener("touchstart", touchstartEventListener);
            break;
        case gameState.FALLING:
            document.removeEventListener("keydown", spacebarEventListener);
            document.removeEventListener("mousedown", mousedownEventListener);
            document.removeEventListener("touchstart", touchstartEventListener);
            break;
        case gameState.MIDAIR:
            document.removeEventListener("keydown", spacebarEventListener);
            document.removeEventListener("mousedown", mousedownEventListener);
            document.removeEventListener("touchstart", touchstartEventListener);
            break;
        case gameState.GAME_OVER:
            //document.removeEventListener("keydown", backspaceEventListener);
            break;
    }

    // Add new listeners
    switch(newState) {
        case gameState.START:
            xPos = xPosStart;
            yPos = yPosStart;
            batSwung = false;
            xVelocity = 0;
            yVelocity = 0;            
            xAcceleration = 0;
            yAcceleration = 0;
            birdAngle = 0;
            yMultiplier = 1;
            jumpsRemaining = bird.maxJumps;
            lastUpdateTime = new Date();
            gameOverScreen.style.display = "none";
            document.addEventListener("keydown", spacebarEventListener);
            document.addEventListener("mousedown", mousedownEventListener);
            document.addEventListener("touchstart", touchstartEventListener);
            break;
        case gameState.FALLING:
            yVelocity = -0.5;
            yAcceleration = bird.gravity;            
            document.addEventListener("keydown", spacebarEventListener);
            document.addEventListener("mousedown", mousedownEventListener);
            document.addEventListener("touchstart", touchstartEventListener);
            break;
        case gameState.MIDAIR:
            yAcceleration = bird.gravity;
            document.addEventListener("keydown", spacebarEventListener);
            document.addEventListener("mousedown", mousedownEventListener);
            document.addEventListener("touchstart", touchstartEventListener);
            break;
        case gameState.GAME_OVER:
            xAcceleration = 0;
            yAcceleration = 0;
            xVelocity = 0;
            yVelocity = 0;

            let msg = "Game over!<br><br>You hit the " + (bird.name).toLowerCase() + " <b>" + getScoreFromPos(xPos) + "</b> meters away.";
            document.querySelector('#submitScoreForm').style.display = "none";
            gameOverMsg.innerHTML = msg + "<br><br>Checking for a high score...";
            gameOverScreen.style.display = "flex";
            //document.addEventListener("keydown", backspaceEventListener);

            if(sessionHighScore === getScoreFromPos(xPos) && sessionHighScore !== 0) {
                document.querySelector('#playAgainBtn').disabled = true;
                document.querySelector('#menuScreenBtn').disabled = true;                
                var xhr = new XMLHttpRequest();
                xhr.open("GET","/checkHighScore?bird=" + bird.name + "&score=" + sessionHighScore, true);
                xhr.send();
                xhr.onreadystatechange = (e) => {
                    if(xhr.readyState === 4) {
                        console.log("checkHighScores response received - status: " + xhr.status);
                        if(xhr.status === 200) {
                            if(xhr.responseText == "allTime") {
                                msg += "<br><br>That's a new all-time record!<br><br>Enter your name and submit to add<br>your score to the leaderboards.";
                                document.querySelector('#submitScoreForm').style.display = "block";
                                document.querySelector('#submitScoreName').disabled = false;
                                document.querySelector('#submitScoreBtn').disabled = false;
                            } else if(xhr.responseText == "monthly") {
                                msg += "<br><br>That's a new monthly record!<br><br>Enter your name and submit to add<br>your score to the leaderboards.";
                                document.querySelector('#submitScoreForm').style.display = "block";
                                document.querySelector('#submitScoreName').disabled = false;
                                document.querySelector('#submitScoreBtn').disabled = false;
                            } else {
                                msg += "<br><br>That's a new personal record!<br><br>High score submission unavailable.";
                                document.querySelector('#submitScoreForm').style.display = "none";
                            }
                        } else {
                            msg += "<br><br>That's a new personal record!<br><br>High score submission unavailable.";
                            document.querySelector('#submitScoreForm').style.display = "none";
                        }
                    }
                    document.querySelector('#playAgainBtn').disabled = false;
                    document.querySelector('#menuScreenBtn').disabled = false;
                    gameOverMsg.innerHTML = msg;
                    gameOverScreen.style.display = "flex";
                    //document.addEventListener("keydown", backspaceEventListener);  
                }
            } else {
                gameOverMsg.innerHTML = msg;
            }

            break;
    }

    newKeyInput = false;
    currentGameState = newState;
}

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

function initGame() {
    yMultiplier = 1;
    keyPressed = false;
    newKeyInput = false;
    document.addEventListener("keyup", () => {
        keyPressed = false;
        newKeyInput = false;
    });
    document.addEventListener("mouseup", () => {
        keyPressed = false;
        newKeyInput = false;
    });
    document.addEventListener("touchend", () => {
        keyPressed = false;
        newKeyInput = false;
    });
    document.addEventListener("contextmenu", (e) => {
        e.preventDefault();
    });    
    
    changeState(gameState.START);
}

const gameLoop = () => {    

    switch(currentGameState) {
        case gameState.MENU:
            drawMenu();
            break;
        case gameState.START:
            updateCurrentPosition();
            startLoop();
            drawScene();
            break;
        case gameState.FALLING:
            updateCurrentPosition();
            fallingLoop();
            drawScene();
            break;
        case gameState.MIDAIR:
            updateCurrentPosition();
            midairLoop();
            drawScene();
            break;
        case gameState.GAME_OVER:
            updateCurrentPosition();
            gameOverLoop();
            drawScene();
            break;
    }
	
	requestAnimationFrame(gameLoop);
}