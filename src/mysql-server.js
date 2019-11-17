import mysql from 'mysql';
const globalApp = require("express")();
const server = require('http').Server(globalApp);
import cors from 'cors';
const io = require("socket.io")(server);

import homeDirHTML from './index.html';

io.origins('http://localhost:3000/');

globalApp.use(cors());

// Names
const tableName = "addresses";
const columnName = "addresses_paths";

// DB main connection
const dbConfig = {
    host: "localhost",
    user: "root",
    password: "toor",
    database: "btc"
};
const db = mysql.createConnection(dbConfig);

/*
    MySQL listener START
*/
// Creating POOL MySQL connection.
const poolSQL = mysql.createPool(dbConfig);

const add_status = function (status, callback) {
    poolSQL.getConnection(function (err, connection) {
        if (err) {
            callback(false);
            return;
        }
        // connection.query("INSERT INTO `status` (`s_text`) VALUES ('" + status + "')", function (err, rows) {
        //     connection.release();
        //     if (!err) {
        //         callback(true);
        //     }
        // });
        connection.on('error', function (err) {
            callback(false);
            return null;
        });
    });
};

io.on('connection', function (socket) {
    console.log("A user is connected");
    socket.on('status added', function (status) {
        add_status(status, function (res) {
            if (res) {
                io.emit('refresh feed', status);
            } else {
                io.emit('error');
            }
        });
    });
});

/*
    MySQL listener END
*/

// Queries
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

    server.listen(4100, () => {
        console.log('The server is now available on port 4100. \n');
    });
};

// Init chain
initDB().then(() => {
    console.log("DB ready, preparing server... \n");
    dbRoutesInit();
    serverAPI();
});
