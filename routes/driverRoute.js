const path = require("path");

const express = require("express");

const driverController = require("../controller/driverController");
const auth = require("../middleware/auth.js");

const router = express.Router();

// driver endpoints
router.post("/driver/login", auth.login);

router.get(
  "/driver/getRecord",
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
