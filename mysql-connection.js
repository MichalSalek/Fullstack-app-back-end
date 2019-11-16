var mysql = require('mysql');

var con = mysql.createConnection({
    host: "michalsalek.pl",
    user: "mimtrans_root",
    password: "Iamsuperuser777!"
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});