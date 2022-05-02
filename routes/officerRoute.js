const path = require("path");

const express = require("express");

const officerController = require("../controller/officerController");
const auth = require("../middleware/auth.js");

const router = express.Router();

//Officer endpoints

//login endpoint
router.get("/ts/officer/login", auth.login);
//REMINDER: post changed to get for testing but bad practice

//get records endpoint
router.get(
  "/ts/officer/getRecord",
  auth.verifyToken,
  //verify role is driver
  (req, res, next) => {
    if (req.role != "officer") {
      res.send({
        status: 400,
        error: "you don't have officer authorization",
      });
    } else next();
  },
  officerController.getRecord
);

module.exports = router;
