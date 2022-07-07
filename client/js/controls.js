const gameOverScreen = document.querySelector('#gameOverScreen');
const gameOverMsg = document.querySelector('#gameOverMsg');
const gameStartScreen = document.querySelector('#gameStartScreen');
const gameInstructionsScreen = document.querySelector('#gameInstructionsScreen');
const leaderboardsScreen = document.querySelector('#leaderboardsScreen');
const birdSelectScreen = document.querySelector('#birdSelectScreen');
const birdSelectionBtn = document.querySelector('#birdSelectionBtn');

var highScoresList;

const buildLeaderboard = () => {
    let birdFilter = document.querySelector("#birdOptionButton").innerHTML;
    let dateFilter = document.querySelector("#dateOptionButton").innerHTML;

    let highScoresTable = document.querySelector("#highScoresTable");
    highScoresTable.innerHTML = ""; // Blank out existing entries

    let row = highScoresTable.insertRow(0);
    let rankHeaderCell = row.insertCell(0);
    let nameHeaderCell = row.insertCell(1);
    let birdHeaderCell = row.insertCell(2);
    let scoreHeaderCell = row.insertCell(3);
    rankHeaderCell.innerHTML = "<b>Rank</b>";
    nameHeaderCell.innerHTML = "<b>Name</b>";
    birdHeaderCell.innerHTML = "<b>Bird</b>";
    scoreHeaderCell.innerHTML = "<b>Score</b>";

    if(highScoresList === undefined) return;

    for (let record of highScoresList) {
        switch (birdFilter) {
            case "All birds":
                break;
            default:
                if(record["bird"] !== birdFilter) continue;
                break;
        }

        switch (dateFilter) {
            case "All time":
                break;
            case "Monthly":
                if(new Date() - Date.parse(record["date"]) > (1000 * 60 * 60 * 24 * 30)) continue;
                break;
        }

        let row = highScoresTable.insertRow(highScoresTable.rows.length);
        let rankCell = row.insertCell(0);
        let nameCell = row.insertCell(1);
        let birdCell = row.insertCell(2);
        let scoreCell = row.insertCell(3);

        rankCell.innerHTML = highScoresTable.rows.length - 1;
        nameCell.innerHTML = record["name"];
        birdCell.innerHTML = record["bird"];
        scoreCell.innerHTML = record["score"];

        if(highScoresTable.tBodies[0].rows.length > maxHighScoreDisplay) break;
    }
}

const changeBird = (birdName) => {
    let birdImgSrc;
    switch(birdName) {
        case "Duck":
            bird = duck;
            birdImgSrc = duckIdleSrc;
            break;
        case "Eagle":
            bird = eagle;
            birdImgSrc = eagleIdleSrc;
            break;
        case "Penguin":
            bird = penguin;
            birdImgSrc = penguinIdleSrc;
            break;
    }

    //birdSelectionBtn.innerHTML = "Selected Bird ("+ birdName +")<br><br><img id='selectedBird' src=" + birdImgSrc + ">";
    birdSelectionBtn.innerHTML = "Selected Bird: "+ birdName +"<br><br><img id='selectedBird' src=" + birdImgSrc + ">";
}

const initMenu = () => {
    gameStartScreen.style.display = "flex";
    gameInstructionsScreen.style.display = "none";
    leaderboardsScreen.style.display = "none";
    gameOverScreen.style.display = "none";
    birdSelectScreen.style.display = "none";

    document.querySelector('#startGameBtn').addEventListener("click", () => {
        gameStartScreen.style.display = "none";
        gameInstructionsScreen.style.display = "none";
        leaderboardsScreen.style.display = "none";
        gameOverScreen.style.display = "none";
        changeState(gameState.START);
    });

    document.querySelector('#openInstructionsBtn').addEventListener("click", () => {
        gameStartScreen.style.display = "none";
        gameInstructionsScreen.style.display = "flex";
    });

    document.querySelector('#openLeaderboardsBtn').addEventListener("click", () => {
        gameStartScreen.style.display = "none";
        leaderboardsScreen.style.display = "flex";

        let leaderboardMsg = document.querySelector("#leaderboardMsg");
        leaderboardMsg.style.display = "flex";
        leaderboardMsg.innerHTML = "Loading...";

        let highScoreTableContainer = document.querySelector("#highScoreTableContainer");
        highScoreTableContainer.style.display = "none";

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = (e) => {
            if(xhr.readyState == 4) {
                console.log("getHighScores response received");
                if(xhr.status == 200) {
                    if(xhr.responseText === "") {
                        leaderboardMsg.innerHTML = "Currently unavailable.";
                    } else {
                        leaderboardMsg.style.display = "none";
                        highScoreTableContainer.style.display = "flex";
                        highScoresList = JSON.parse(xhr.responseText); // Array of JSON objects

                        highScoresList.sort((a,b) => { return b["score"] - a["score"]; }); // Sort in descending order
                        buildLeaderboard();
                    }
                } else {
                    leaderboardMsg.innerHTML = "Currently unavailable.";
                }
            }
        }
        xhr.open("GET","/getHighScores", true);
        xhr.send();
    });

    document.querySelector("#birdOptionButton").addEventListener("click", () => {
        document.querySelector("#birdDropdown").style.display = "inline-block";
    });

    document.querySelector("#dateOptionButton").addEventListener("click", () => {
        document.querySelector("#dateDropdown").style.display = "inline-block";
    });

    document.querySelectorAll('.birdDropdownButton').forEach((button) => {
        button.addEventListener("click", (e) => {
            document.querySelector("#birdOptionButton").innerHTML = e.target.innerHTML;
            buildLeaderboard();
        });
    });

    document.querySelectorAll('.dateDropdownButton').forEach((button) => {
        button.addEventListener("click", (e) => {
            document.querySelector("#dateOptionButton").innerHTML = e.target.innerHTML;
            buildLeaderboard();
        });
    });

    window.addEventListener("click", (event) => {
        if (!event.target.matches('#birdOptionButton')) {
          document.querySelector("#birdDropdown").style.display = "none";
        }
    });

    window.addEventListener("click", (event) => {
        if (!event.target.matches('#dateOptionButton')) {
          document.querySelector("#dateDropdown").style.display = "none";
        }
    });

    birdSelectionBtn.addEventListener("click", () => {
        gameStartScreen.style.display = "none";
        birdSelectScreen.style.display = "flex";
    });

    document.querySelector('#closeInstructionsBtn').addEventListener("click", () => {
        gameStartScreen.style.display = "flex";
        gameInstructionsScreen.style.display = "none";
    });

    document.querySelector('#closeLeaderboardsBtn').addEventListener("click", () => {
        gameStartScreen.style.display = "flex";
        leaderboardsScreen.style.display = "none";
    });

    document.querySelector('#submitScoreBtn').addEventListener("click", (e) => {
        let name = document.querySelector("#submitScoreName").value;
        if(name !== "") {
            let data = {};
            data["name"] = name;
            data["bird"] = bird.name;
            data["score"] = sessionHighScore;
            data["date"] = new Date();

            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = (e) => {
                if(xhr.readyState === 4 && xhr.status == 200) {
                    console.log("postHighScores request successful");
                    if(xhr.responseText === "badWord") {
                        let submitScoreMsg = document.querySelector('#submitScoreMsg');
                        submitScoreMsg.style.display = "flex";
                        submitScoreMsg.style.color = "red";
                        submitScoreMsg.innerHTML = "No bad words!";
                    } else if (xhr.responseText === "ok") {
                        let submitScoreMsg = document.querySelector('#submitScoreMsg');
                        submitScoreMsg.style.display = "flex";
                        submitScoreMsg.style.color = "green";
                        submitScoreMsg.innerHTML = "Score submitted!";
                        document.querySelector('#submitScoreName').disabled = true;
                        document.querySelector('#submitScoreBtn').disabled = true;
                    } else {
                        submitScoreMsg.style.display = "flex";
                        submitScoreMsg.style.color = "red";
                        submitScoreMsg.innerHTML = "Something went wrong - please try again later.";
                    }
                }
            }
            xhr.open("POST","/postHighScore", true);
            xhr.setRequestHeader("Content-Type","application/json");
            xhr.send(JSON.stringify(data));
        }
    });

    document.querySelector('#playAgainBtn').addEventListener("click", (e) => {
        document.querySelector('#submitScoreMsg').style.display = "none";
        document.querySelector('#submitScoreMsg').innerHTML = "";
        document.querySelector('#submitScoreName').disabled = false;
        document.querySelector('#submitScoreBtn').disabled = false;
        document.querySelector('#submitScoreForm').style.display = "none";
        changeState(gameState.START);
    });

    document.querySelector('#menuScreenBtn').addEventListener("click", (e) => {
        document.querySelector('#submitScoreMsg').style.display = "none";
        document.querySelector('#submitScoreMsg').innerHTML = "";
        gameStartScreen.style.display = "flex";
        gameInstructionsScreen.style.display = "none";
        gameOverScreen.style.display = "none";
        changeState(gameState.MENU);
    });

    document.querySelectorAll('.selectBird').forEach((button) => {
        button.addEventListener("click", (e) => {
            let birdName = e.target.title;
            if(birdName === "") {
                birdName = e.target.parentElement.title;
            }
            changeBird(birdName);
            sessionHighScore = 0;
            gameStartScreen.style.display = "flex";
            birdSelectScreen.style.display = "none";
        });
    });
}

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