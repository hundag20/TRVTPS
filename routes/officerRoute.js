const path = require("path");

const express = require("express");

const officerController = require("../controller/officerController");
const driverController = require("../controller/driverController");
const penaltyController = require("../controller/penaltyController");
const announcementController = require("../controller/announcementController");
const auth = require("../middleware/auth.js");

const router = express.Router();

//Officer endpoints

//login endpoint
router.get("/ts/officer/login", auth.login);
//REMINDER: post changed to get for testing but bad practice

//resetPwd
router.get("/ts/officer/resetPwd", officerController.resetPwd);
router.get("/ts/officer/passwordReset", auth.resetPage);
router.post("/ts/officer/passwordReset", auth.resetPwd);

//issue ticket endpoint
router.get(
  "/ts/officer/issueTicket",
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
  penaltyController.issueTicket
);

//get record endpoint
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
    } else {
      if (req.query.license_id) {
        req.uname = req.query.license_id;
        next();
      } else {
        return res.status(400).send({
          status: 400,
          message: "license id not provided",
        });
      }
    }
  },
  driverController.getRecord
);

//issue ticket endpoint
router.get(
  "/ts/officer/findDriver",
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
  officerController.findDriver
);

//getAnnouncements
router.get(
  "/ts/officer/getNews",
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
  announcementController.getAnnouncements
);

module.exports = router;
