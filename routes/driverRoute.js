const path = require("path");

const express = require("express");

const driverController = require("../controller/driverController");
const announcementController = require("../controller/announcementController");
const auth = require("../middleware/auth.js");

const router = express.Router();

// driver endpoints
router.get("/ts/driver/login", auth.login);
//REMINDER: post changed to get for testing but bad practice

//getRecord
router.get(
  "/ts/driver/getRecord",
  auth.verifyToken,
  //verify role is driver
  (req, res, next) => {
    if (req.role != "driver") {
      res.send({
        status: 400,
        error: "you don't have driver authorization",
      });
    } else next();
  },
  driverController.getRecord
);

//getAnnouncements
router.get(
  "/ts/driver/getNews",
  auth.verifyToken,
  //verify role is driver
  (req, res, next) => {
    if (req.role != "driver") {
      res.send({
        status: 400,
        error: "you don't have driver authorization",
      });
    } else next();
  },
  announcementController.getAnnouncements
);

module.exports = router;
