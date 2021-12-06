const canvas = document.querySelector("#gs");
const ctx = canvas.getContext("2d");
const mountainImgSrc = "img/mountain.png";
const duckIdleSrc = "img/DuckIdle.png";
const duckWingUpSrc = "img/DuckWingUp.png";
const duckWingDownSrc = "img/DuckWingDown.png";
const duckZoominSrc = "img/DuckZoomin.png";
const eagleIdleSrc = "img/EagleIdle.png";
const eagleWingUpSrc = "img/EagleWingUp.png";
const eagleWingDownSrc = "img/EagleWingDown.png";
const eagleZoominSrc = "img/EagleZoomin.png";
const penguinIdleSrc = "img/PenguinIdle.png";
const penguinWingUpSrc = "img/PenguinWingUp.png";
const penguinWingDownSrc = "img/PenguinWingDown.png";
const penguinZoominSrc = "img/PenguinZoomin.png";
const treeImgSrc = "img/Tree.png";
const cloudImgSrc = "img/Clouds.png";
const batterStartImgSrc = "img/BatterStart.png";
const batterSwingingImgSrc = "img/BatterSwinging.png";
const troposphereColor = "deepskyblue";
const stratosphereColor = "cornflowerblue";
const thermosphereColor = "black";
const gameOverScreen = document.querySelector('#gameOverScreen');
const gameOverMsg = document.querySelector('#gameOverMsg');
const gameState = {
    MENU: 0,
    START: 1,
    FALLING: 2,
    MIDAIR: 3,
    GAME_OVER: 4
}
const skyMaxHeight = -15000;
const groundLevel = 0;
const xPosStart = 0;
const yPosStart = groundLevel - 350;
const xPosBatter = -40;
const yPosBatter = groundLevel - 120;
const batterPower = 3;
const battingWindow = 50;
const maxHighScoreDisplay = 20;
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

class Bird {
    constructor(gravity, groundFriction, jumpHeightSteps, fallingStateSpeed, maxJumps, birdYMultiplier, imgIdle, imgWingUp, imgWingDown, imgZoomin, name) {
        this.gravity = gravity;
        this.groundFriction = groundFriction;
        this.jumpHeightSteps = jumpHeightSteps;
        this.fallingStateSpeed = fallingStateSpeed;
        this.maxJumps = maxJumps;
        this.birdYMultiplier = birdYMultiplier;

        this.imgIdle = imgIdle;
        this.imgWingUp = imgWingUp;
        this.imgWingDown = imgWingDown;
        this.imgZoomin = imgZoomin;
        this.name = name;
    }
}

const duck = new Bird(0.002, -0.01, -0.1, 0.5, 5, 2.2, duckIdle, duckWingUp, duckWingDown, duckZoomin, "Duck");
const eagle = new Bird(0.0015, -0.02, -0.1, 0.5, 5, 2.5, eagleIdle, eagleWingUp, eagleWingDown, eagleZoomin, "Eagle");
const penguin = new Bird(0.003, -0.001, -0.15, 0.7, 7, 1.75, penguinIdle, penguinWingUp, penguinWingDown, penguinZoomin, "Penguin");