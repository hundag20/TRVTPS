var http = require("http");
const path = require("path");
const pino = require("pino");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
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
//const adminRoutes = require('./routes/admin');

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
//app.use(express.static(__dirname));
http.createServer(app).listen(3002);

//------todos------
//TODO: finish this early and start react asap

//TODO: SECURITY features checklist: SQLinjection, ..
//TODO: DB feilds have shrunk..remedy by inroducing the firebase
//TODO: at admin there should be a feature for disabling an account easily..cuz if a phone is stolen all access is open.

//-----notes-----
//NOTE: physical icense id and our digital id are meant to coexist, eg. traffic looks at phyical if for expiration date then proceeds to deactivate the digital license.
