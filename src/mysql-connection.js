var mysql = require('mysql');

var db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "toor",
    database: "wallets"
});

// function dbCreator() {
//     var query = "CREATE DATABASE IF NOT EXISTS wallets";
//     db.query(query, function (err, result) {
//         if (err) throw err;
//         console.dir("Database created: ");
//         console.dir(result);
//         db = mysql.createConnection({
//             host: "localhost",
//             user: "root",
//             password: "toor",
//             database: "wallets"
//         });
//         console.log(db);
//     });
// }

function tablesCreator() {
    var query = "CREATE TABLE IF NOT EXISTS wallet1";
    db.query(query, function (err, result) {
        if (err) throw err;
        console.log("Tables created: ");
        console.log(result)
    })
}

db.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    // dbCreator();
    tablesCreator();
});