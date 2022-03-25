const path = require('path');

const express = require('express');

const officerController = require('../controller/officerController');

const router = express.Router();

// home
router.get('/api/v1/o/', officerController.addMultiUsers);

module.exports = router;
