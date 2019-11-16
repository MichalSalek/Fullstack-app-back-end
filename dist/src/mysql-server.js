'use strict';

var mysql = require('mysql');
var express = require('express');

// DB main connection
var db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "toor",
    database: "btc"
});

// Queries
var tableName = "addresses";
var createTableQuery = "CREATE TABLE IF NOT EXISTS " + tableName + " (id INT AUTO_INCREMENT PRIMARY KEY)";

/*
    Database initialization START
*/
function tablesCreator(ok, notOk) {
    db.query(createTableQuery, function (err, result) {
        if (err) {
            notOk();throw err;
        }
        console.log("Table " + tableName + " created. Result: ");
        console.log(result);
        ok();
    });
}

function dbConnection(ok, notOk) {
    db.connect(function (err) {
        if (err) {
            notOk();throw err;
        }
        console.log("Connected!");
        ok();
    });
}
/*
    Database initialization END
*/

// Main app initialization function
function initDB() {
    var prom1 = new Promise(function (ok, notOk) {
        dbConnection(ok, notOk);
    });
    var prom2 = new Promise(function (ok, notOk) {
        tablesCreator(ok, notOk);
    });
    return Promise.all([prom1, prom2]);
}

// Server init
function serverAPI() {
    app.get('/', function (req, res) {
        res.send('vá para /user para ver os usuarios');
    });
}

// Init chain
initDB().then(function () {
    console.log("DB ready, preparing server...");
    serverAPI();
});

module.exports.dbConnection = dbConnection;