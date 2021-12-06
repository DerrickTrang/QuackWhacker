if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const path = require('path');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const schedule = require('node-schedule');
const Filter = require('bad-words');
const filter = new Filter();
var mongoClient = require('mongodb').MongoClient;

var dbConnection;
var highScoreCol;

const clientPath = path.join('client');
const clientImgPath = path.join('client', 'img');

var PORT = process.env.PORT || 5000;
//const highScoreUrl = `${process.env.DB_PROTOCOL}://${process.env.DB_HOST}/`; // For testing
const highScoreUrl = `${process.env.DB_PROTOCOL}://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/`; // For production
const maxDocumentsPerBird = process.env.MAX_DOCUMENTS_PER_BIRD;

const app = express();
app.use(express.static(clientPath));
app.use('/client/img', express.static(clientImgPath));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const server = http.createServer(app);

server.on('error', (err) => {
    console.error('Server error: ', err);
});

server.listen(PORT, () => {    
    connectToDatabase();
    console.log('Server started on port: ', PORT);
});

app.get("/getHighScores", (req, res) => {
    console.log("GetHighScores GET request received");

    if(typeof highScoreCol === 'undefined') {
        console.log("HighScore collection undefined");
        res.send();
        return;
    }

    highScoreCol.find().toArray(function(err, items) {
        if(err) {
            console.log(err);
            dbConnection = undefined;
            highScoreCol = undefined;
            res.send();
        } else {
            console.log("HighScore collection retrieved successfully");
            res.send(items);
        }        
    });
});

app.get("/checkHighScore", (req, res) => {    
    console.log("CheckHighScore GET request received - bird: " + req.query.bird + ", score: " + req.query.score);

    if(typeof highScoreCol === 'undefined') {
        console.log("HighScore collection not defined");
        res.send("unavailable");
        return;
    }

    let birdQuery = {};
    birdQuery["$eq"] = req.query.bird;

    highScoreCol.find({bird: birdQuery}).toArray((err, result) => {
        if(err) {
            console.log("error occured");
            console.log(err);
            dbConnection = undefined;
            highScoreCol = undefined;
            res.send("unavailable");
            return;
        }

        if(result.length < maxDocumentsPerBird) {
            console.log("Maximum number of all-time high scores not reached");
            res.send("allTime");
        } else {
            result.sort((a,b) => { return b["score"] - a["score"]; }); // Sort in descending order

            if(typeof result.slice(0, maxDocumentsPerBird + 1).find( i => { return i["score"] < req.query.score; }) !== 'undefined') {
                console.log("Lower all-time high score found");
                res.send("allTime");
            } else if (result.filter( i => { return (new Date() - Date.parse(i["date"])) < (1000 * 60 * 60 * 24 * 30)}).length < maxDocumentsPerBird) {
                console.log("Maximum number of monthly high scores not reached");
                res.send("monthly");    
            } else if(typeof result.find( i => { return i["score"] < req.query.score; }) !== 'undefined') {
                console.log("Lower monthly high score found");
                res.send("monthly");
            } else {
                res.send("no");
            }
        }
    });
});

app.post("/postHighScore", (req, res) => {
    console.log("postHighScore POST received");

    if(typeof highScoreCol === 'undefined') {
        res.send("unavailable");
        return;
    }
    
    if (filter.isProfane(req.body.name)) {
        res.send("badWord");
        return;
    }

    highScoreCol.insertOne(req.body, (err) => {
        if(err) {
            res.send("unavailable");
            return;
        };

        console.log("1 document inserted");
        res.send("ok");

        // If there are too many scores within the last 30 days for the given bird, delete lowest score
        let birdQuery = {};
        birdQuery["$eq"] = req.body.bird;

        let dateQuery = {};
        dateQuery["$gte"] = new Date(new Date().getTime() - (1000 * 60 * 60 * 24 * 30)).toISOString();

        highScoreCol.countDocuments({ bird: birdQuery, date: dateQuery }, (err, count) => {
            if(err) throw err;            
    
            if(count > maxDocumentsPerBird) {
                // Find and delete record with the lowest score (oldest first)
                highScoreCol.find({bird: birdQuery}).sort({score: 1, date: -1}).limit(1).toArray((err, result) => {
                    if(err) throw err;

                    highScoreCol.deleteOne({_id: result[0]._id}, (err, res) => {
                        if(err) throw err;

                        console.log("Lowest score document removed");
                    });                    
                });
            }
        });            
    });    
});

connectToDatabase = () => {
    if(typeof dbConnection !== 'undefined') {
        // TODO - actually test connection
        console.log("Already connected to db");
    }
    else {
        let connectOptions = { useUnifiedTopology: true };
        console.log("Attempting to connect to db");
        mongoClient.connect(highScoreUrl, connectOptions, function(err, db) {            
            if(err) {
                console.log(err);
            } else {
                console.log("Connected to db");
                dbConnection = db;
                highScoreCol = dbConnection.db("highScores").collection("allScores");
            }    
        });
    }
}

process.on("SIGINT", () => {
    if(typeof dbConnection === 'undefined') {
        process.exit(0);
    }

    dbConnection.close((err) => {
        if(err) throw err;
        dbConnection = undefined;
        console.log("Closed db connection");
        process.exit(0);
    });
});

// Retry database connection if currently disconnected
// Runs every hour
const dbReconnectJob = schedule.scheduleJob('0 * * * *', () => {
    console.log("DB reconnect job executing...");
    connectToDatabase();
});

// Deletes any records that are not in the top maxDocumentsPerBird and not within the last 30 days
// Runs daily at midnight
const leaderboardPurgeJob = schedule.scheduleJob('0 0 * * *', () => {    
    console.log("Leaderboard purge job started");

    if(typeof highScoreCol === 'undefined') {
        return;
    }

    let ag = {};
    ag["_id"] = "$bird";
    
    let expirationDate = new Date(new Date().getTime() - (1000 * 60 * 60 * 24 * 30)).toISOString();    

    highScoreCol.aggregate([{$match: {}}, {$group: ag}]).toArray((err, res) => {
        if (err) throw err;

        res.forEach(i => {
            let birdQuery = {};
            birdQuery["$eq"] = i["_id"];

            highScoreCol.find({ bird: birdQuery }).sort({score: -1, date: -1}).toArray((err, items) => {
                if (err) throw err;

                items.forEach( (item, i) => {
                    if(i + 1 > maxDocumentsPerBird && item["date"] < expirationDate) {
                        highScoreCol.deleteOne({_id: item["_id"]}, (err, res) => {
                            if (err) throw err;

                            console.log("Document removed - ID: " + item["_id"]);
                        });                        
                    }
                });
            });
        });
    });
});