const path = require('path');

const express = require('express');

const officerController = require('../controller/officerController');

const router = express.Router();

// home
router.get('/pay/success', officerController.addMultiUsers);
router.get('/pay/ipn', officerController.addMultiUsers);
router.get('/pay/cancel', officerController.addMultiUsers);
router.get('/pay/failure', officerController.addMultiUsers);

module.exports = router;