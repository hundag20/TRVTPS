var http = require("http");
const path = require("path");
const pino = require("pino");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");
const { Console } = require("console");
const myLogger = new Console({
  stdout: fs.createWriteStream("normalStdout.txt"),
});
module.exports = { myLogger };

myLogger.log(`app started`);

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const driverRoutes = require("./routes/driverRoute");
const officerRoutes = require("./routes/officerRoute");
const adminRoutes = require("./routes/adminRoute");
const payRoutes = require("./routes/payRoute");
const ussdRoutes = require("./routes/ussdRoute");

const report = require("./controller/reportController");
//const adminRoutes = require('./routes/admin');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(express.static(path.join(__dirname, 'static')));

app.get("/ts", (req, res) => {
  console.log("/ get received");
  myLogger.log("/ get received");
  res.send("<html>/ts page served</html>");
});
app.use(driverRoutes);
app.use(officerRoutes);
app.use(payRoutes);
app.use(adminRoutes);
app.use(ussdRoutes);

report.scheduledReports();
//app.use(express.static(__dirname));
http.createServer(app).listen(3002);

//------todos------
//DONE: disable double ticketing
//TODO: calculate penalty for real
//TODO: generate url for completing payment (not new jst the redirect url-- but maybe a short string instead of full url-- maybe there is a library for this)
//TODO: on success show real page and message
//TODO: reset pwd feature on USSD
//TODO: catch all unhandled routes nd errs at app.js

//TODO: SECURITY features checklist: SQLinjection, ..
//TODO: at admin there should be a feature for disabling an account easily..cuz if a phone is stolen all access is open.

//-----notes-----
//NOTE: physical icense id and our digital id are meant to coexist, eg. traffic looks at phyical if for expiration date then proceeds to deactivate the digital license.

//REMINDER: - ignore nd remove .env file from repo - modify models so that password is not returned with userData
