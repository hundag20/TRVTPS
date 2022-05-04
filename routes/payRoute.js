const path = require("path");

const express = require("express");

const paymentController = require("../controller/paymentController");
const auth = require("../middleware/auth.js");

const router = express.Router();

// home
router.get(
  "/ts/driver/pay",
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
  paymentController.checkoutExpress
);
//router.post('/ts/pay/ipn', paymentController.IPNDestination);
router.get("/ts/pay/success", paymentController.successDestination);
// router.get('/pay/success', officerController.addMultiUsers);
// router.get('/pay/ipn', officerController.addMultiUsers);
// router.get('/pay/cancel', officerController.addMultiUsers);
// router.get('/pay/failure', officerController.addMultiUsers);

module.exports = router;
