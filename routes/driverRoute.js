const path = require('path');

const express = require('express');

const driverController = require('../controller/driverController');

const router = express.Router();

// home
router.get('/api/v1/d/', driverController.addMultiUsers);

module.exports = router;
