import mysql from 'mysql';
import express from 'express';
import path from 'path';
import homeDirHTML from './index.html';

// Express init
const globalApp = express();

// DB main connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "toor",
    database: "btc"
});

// Queries
const tableName = "addresses";
const CREATE_TABLE = "CREATE TABLE IF NOT EXISTS " + tableName + " (id INT AUTO_INCREMENT PRIMARY KEY)";

// Error handler
const rejectAndReturn = (error, reject) => {
    if (error) {
        reject();
        throw error;
    }
};

/*
    Database initialization START
*/
const tablesCreator = (ok, notOk) => {
    db.query(CREATE_TABLE, function (err, result) {
        rejectAndReturn(err, notOk);
        console.log("Table " + tableName + " created. Result: ");
        console.log(result);
        ok();
    })
};

const dbConnection = (ok, notOk) => {
    db.connect(function (err) {
        rejectAndReturn(err, notOk);
        console.log("Connected!");
        ok();
    });
};
/*
    Database initialization END
*/

// Main app initialization function
function initDB() {
    const prom1 = new Promise(function (ok, notOk) {
        dbConnection(ok, notOk)
    });
    const prom2 = new Promise(function (ok, notOk) {
        tablesCreator(ok, notOk)
    });
    return Promise.all([prom1, prom2]);
}

// Server init
function serverAPI() {
    globalApp.get('/', (req, res) => {
        res.send(homeDirHTML);
        console.log(req.query)
    });

    globalApp.listen(4321, () => {
        console.log('o servidor está rodando na porta 4321');
    });
}

// Init chain
initDB().then(function () {
    console.log("DB ready, preparing server...");
    serverAPI();
});

module.exports.dbConnection = dbConnection;
