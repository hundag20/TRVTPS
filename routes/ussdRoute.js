const path = require("path");

const express = require("express");

const ussdController = require("../controller/ussdController");

const router = express.Router();
const { myLogger } = require("../app.js");

// home
router.post(
  "/",
  (req, res, next) => {
    myLogger.log(`ussd post `);
    next();
  },
  ussdController.ussdHandler
);
router.get(
  "/ts/ussd",
  (req, res, next) => {
    myLogger.log(`ussd post `);
    next();
  },
  ussdController.ussdHandler
);
router.post(
  "/ts/ussd",
  (req, res, next) => {
    myLogger.log(`ussd post `);
    next();
  },
  ussdController.ussdHandler
);
// router.get('/pay/success', officerController.addMultiUsers);
// router.get('/pay/ipn', officerController.addMultiUsers);
// router.get('/pay/cancel', officerController.addMultiUsers);
// router.get('/pay/failure', officerController.addMultiUsers);

module.exports = router;
