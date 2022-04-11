const path = require('path');

const express = require('express');

const ussdController = require('../controller/ussdController');

const router = express.Router();

// home
//router.post('/ts/ussd', ussdController.ussdHandler);
router.get('/ts/ussd', ussdController.ussdHandler);
// router.get('/pay/success', officerController.addMultiUsers);
// router.get('/pay/ipn', officerController.addMultiUsers);
// router.get('/pay/cancel', officerController.addMultiUsers);
// router.get('/pay/failure', officerController.addMultiUsers);

module.exports = router;