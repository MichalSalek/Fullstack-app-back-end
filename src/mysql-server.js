import mysql from 'mysql';
import express from 'express';

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
const columnName = "addresses_paths";
const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS ${tableName} (id INT AUTO_INCREMENT PRIMARY KEY, ${columnName} varchar(255));`;
const FETCH_BTC_ADDRESSES = "SELECT * FROM addresses;";
const INSERT_ADDRESS = `INSERT INTO ${tableName} (${columnName}) VALUES`;

// Error handler
const rejectAndReturn = (error, reject) => {
    if (error) {
        console.error(error); // ERASE IT ON PRODUCTION BUILD
        reject && reject();
        throw error;
    }
};

/*
    Database initialization START
*/
const tablesCreator = (ok, notOk) => {
    db.query(CREATE_TABLE, (err) => {
        rejectAndReturn(err, notOk);
        console.log(`Table "${tableName}" with column "${columnName}" created. \n`);
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

// Database routes
const dbRoutesInit = () => {
    globalApp.get('/addresses', (req, res) => {
        db.query(FETCH_BTC_ADDRESSES, (err, result) => {
            if (err) {
                console.error(err); // ERASE IT ON PRODUCTION BUILD
                return rejectAndReturn(err);
            } else {
                return res.status(200).json({
                    data: result
                })
            }
        })
    });

    globalApp.get('/addresses/add', (req, res) => {
        const {address} = req.query;
        db.query(`${INSERT_ADDRESS} ("${String(address)}");`, (err) => {
            if (err) {
                console.error(err); // ERASE IT ON PRODUCTION BUILD
                return rejectAndReturn(err);
            } else {
                return res.send('Address added successfully!')
            }
        })
    });

    globalApp.get('/teapot', (req, res) => {
        return res.status(418).send("<h1 style='color: #801a08'>418: <em>I am teapot</em></h1>");
    });
};

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
    dbRoutesInit();
    serverAPI();
});
