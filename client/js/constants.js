
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
const menuSkyColor = "lightskyblue";
const groundColor = "green";
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