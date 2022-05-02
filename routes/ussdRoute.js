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

//TODO
//make ussd a separate app
//then post it to etmilestone.com.(still started on localhost(can't use nginx on cpanel's terminal cuz they don have it installed...[justification: ideally..u'd buy a premimum package and u get ur own terminal where u can install stuff on])..but atleast updated code and db)
//just put the ussdView in httpdocs..will take the post request and return the menus, then relay(redirect) the handling of the different options to the main trvtps subdomain.
//wat if i just put our url on thier callback url page
