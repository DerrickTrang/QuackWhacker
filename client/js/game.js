class Bird {
    constructor(gravity, groundFriction, jumpHeightSteps, fallingStateSpeed, maxJumps, birdYMultiplier, name) {
        this.gravity = gravity;
        this.groundFriction = groundFriction;
        this.jumpHeightSteps = jumpHeightSteps;
        this.fallingStateSpeed = fallingStateSpeed;
        this.maxJumps = maxJumps;
        this.birdYMultiplier = birdYMultiplier;
        this.name = name;
    }
}

const duck = new Bird(0.002, -0.01, -0.1, 0.5, 5, 2.2, "Duck");
const eagle = new Bird(0.0015, -0.02, -0.1, 0.5, 5, 2.5, "Eagle");
const penguin = new Bird(0.003, -0.001, -0.15, 0.7, 7, 1.75, "Penguin");

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

const getScoreFromPos = (x) => {
    return Math.round(x / 10);
}

const updateCurrentPosition = () => {
    let currentTime = new Date();
    let dateDiff = currentTime - new Date(lastUpdateTime);

    if(dateDiff > 1000) {
        /* If animation loop is stopped for longer than 1 second (e.g. switching browser tabs), redraw the same frame - basically pauses the game */
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

            if(sessionHighScore === getScoreFromPos(xPos) && sessionHighScore !== 0) {
                document.querySelector('#playAgainBtn').disabled = true;
                document.querySelector('#menuScreenBtn').disabled = true;
                var xhr = new XMLHttpRequest();
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
                xhr.open("GET","/checkHighScore?bird=" + bird.name + "&score=" + sessionHighScore, true);
                xhr.send();
            } else {
                gameOverMsg.innerHTML = msg;
            }

            break;
    }

    newKeyInput = false;
    currentGameState = newState;
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

    bird = duck;
    changeState(gameState.MENU);
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