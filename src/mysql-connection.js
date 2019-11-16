var mysql = require('mysql');

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
        if (err) {notOk(); throw err;}
        console.log("Table " + tableName + " created. Result: ");
        console.log(result);
        ok();
    })
}

function dbConnection(ok, notOk) {
    db.connect(function (err) {
        if (err) {notOk(); throw err;}
        console.log("Connected!");
        ok();
    });
}
/*
    Database initialization END
*/




// Main app initialization function
function initChain() {
    var prom1 = new Promise(function(ok, notOk) {dbConnection(ok, notOk)});
    var prom2 = new Promise(function(ok, notOk) {tablesCreator(ok, notOk)});


    return Promise.all([prom1, prom2]);
}

// Init chain
initChain().then(function () {
    console.log("Chain ready")});

module.exports.dbConnection = dbConnection;
