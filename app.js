var http = require('http');
const path = require('path');
const pino = require('pino');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require("fs");
const { Console } = require("console");



const myLogger = new Console({
    stdout: fs.createWriteStream("normalStdout.txt")
});

myLogger.log(`app started`);

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const driverRoutes = require('./routes/driverRoute');
const officerRoutes = require('./routes/officerRoute');
const adminRoutes = require('./routes/adminRoute');
const payRoutes = require('./routes/payRoute');
//const adminRoutes = require('./routes/admin');

app.use(bodyParser.urlencoded({ extended: false }));
// app.use(express.static(path.join(__dirname, 'static')));

app.get('/ts', (req, res) => {
    console.log('/ get received');
    myLogger.log('/ get received');
    res.send('<html>jjj</html>');
});
app.use(driverRoutes);
app.use(officerRoutes);
app.use(adminRoutes);
//app.use(express.static(__dirname));

// app.listen();
http.createServer(app).listen();

// var http = require('http');
// var server = http.createServer(function(req, res) {
//     res.writeHead(200, {'Content-Type': 'text/plain'});
//     var message = 'It works!\n',
//         version = 'NodeJS ' + process.versions.node + '\n',
//         response = [message, version].join('\n');
//     res.end(response);
// });
// server.listen(3000);
