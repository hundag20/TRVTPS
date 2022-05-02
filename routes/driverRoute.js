const path = require("path");

const express = require("express");

const driverController = require("../controller/driverController");
const auth = require("../middleware/auth.js");

const router = express.Router();

// driver endpoints
router.get("/ts/driver/login", auth.login);
//NOTE post changed to get for testing but bad practice

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

module.exports = router;
