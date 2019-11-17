import mysql from 'mysql';

const globalApp = require("express")();
const server = require('http').Server(globalApp);
import cors from 'cors';

const io = require("socket.io")(server);

import homeDirHTML from './index.html';

// io CORS
io.origins('http://localhost:3000/');

// CORS
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
    WebSocket START
*/
// Creating POOL MySQL connection.
const poolSQL = mysql.createPool(dbConfig);

const startWebSocket = () => {
    io.on('connection', function (socket) {
        console.log("A user is connected");
        socket.on('address added', (address) => {
            addAddressWS(address);
        });
    });
};

const addAddressWS = function (address, callback) {
    poolSQL.getConnection(function (err, connection) {
        if (err) {
            rejectAndReturn(err);
            callback(false);
            return;
        }

        console.log("connected io -> DB");

        db.query(FETCH_BTC_ADDRESSES, (err, result) => {
            if (err) {
                console.error(err); // ERASE IT ON PRODUCTION BUILD
                return rejectAndReturn(err);
            } else {
                io.emit('refresh addresses', result);
            }
        });

        connection.on('error', (err) => rejectAndReturn(err));
    });
};
/*
    WebSocket END
*/

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

const getAddressesQuery = (req, res) => {
    return db.query(FETCH_BTC_ADDRESSES, (err, result) => {
        if (err) {
            console.error(err); // ERASE IT ON PRODUCTION BUILD
            return rejectAndReturn(err);
        } else {
            return res.status(200).json({
                data: result
            })
        }
    })
};

// Database routes
const dbRoutesInit = () => {
    globalApp.get('/addresses', (req, res) => {
        getAddressesQuery(req, res);
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
    startWebSocket();
    dbRoutesInit();
    serverAPI();
});
