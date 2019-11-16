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
    db.query(CREATE_TABLE, (err) => {
        rejectAndReturn(err, notOk);
        console.log(`Table "${tableName}" created. \n`);
        ok();
    })
};

const dbConnection = (ok, notOk) => {
    db.connect((err) => {
        rejectAndReturn(err, notOk);
        console.log("Connected! \n");
        ok();
    });
};
/*
    Database initialization END
*/

// Main app initialization function
const initDB = () => {
    console.log("Booting... \n");
    console.log("Let's try to connect to db... \n");
    const prom1 = new Promise((ok, notOk) => {
        dbConnection(ok, notOk)
    });
    const prom2 = new Promise((ok, notOk) => {
        tablesCreator(ok, notOk)
    });
    return Promise.all([prom1, prom2]);
};

// Front and Database paths


// Server init
const serverAPI = () => {
    globalApp.get('/', (req, res) => {
        res.send(homeDirHTML);
    });

    globalApp.listen(4100, () => {
        console.log('The server is now available on port 4100. \n');
    });
};

// Init chain
initDB().then(() => {
    console.log("DB ready, preparing server... \n");
    serverAPI();
});
