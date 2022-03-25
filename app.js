const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

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

app.get('/', (req, res) => {res.send('<html>jjj</html>')});
app.use(driverRoutes);
app.use(officerRoutes);
app.use(adminRoutes);
app.use(express.static(__dirname));

app.listen(80);