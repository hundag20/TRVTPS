const path = require('path');

const express = require('express');

const paymentController = require('../controller/paymentController');

const router = express.Router();

// home
router.get('/ts/pay/init', paymentController.checkoutExpress);
//router.post('/ts/pay/ipn', paymentController.IPNDestination);
router.get('/ts/pay/success', paymentController.successDestination);
// router.get('/pay/success', officerController.addMultiUsers);
// router.get('/pay/ipn', officerController.addMultiUsers);
// router.get('/pay/cancel', officerController.addMultiUsers);
// router.get('/pay/failure', officerController.addMultiUsers);

module.exports = router;