const { myLogger } = require("../app.js");
const BitlyClient = require("bitly").BitlyClient;
var ypco = require("yenepaysdk");
const penaltyController = require("./penaltyController");
exports.getUrl = function (req) {
  var sellerCode = "SB1447"; //"YOUR_USER_CODE_IN_YENEPAY";
  var useSandbox = true; //set this false on your production environment

  var successUrlReturn = "https://etmilestone.com/ts/pay/success"; //"PAYMENT_SUCCESS_RETURN_URL";
  var ipnUrlReturn = "https://etmilestone.com/ts/pay/ipn"; //"PAYMENT_COMPLETION_NOTIFICATION_URL";
  var cancelUrlReturn = "PAYMENT_CANCEL_RETURN_URL";
  var failureUrl = "PAYMENT_FAILURE_RETURN_URL";
  var expiresAfter = 10; //"NUMBER_OF_MINUTES_BEFORE_THE_ORDER_EXPIRES less than a day";
  var orderId = req.params.order; //"UNIQUE_ID_THAT_IDENTIFIES_THIS_ORDER_ON_YOUR_SYSTEM";

  var checkoutOptions = ypco.checkoutOptions(
    sellerCode,
    orderId,
    ypco.checkoutType.Express,
    useSandbox,
    expiresAfter,
    successUrlReturn,
    cancelUrlReturn,
    ipnUrlReturn,
    failureUrl
  );
  var checkoutItem = {
    ItemName: "Sample Item 1",
    UnitPrice: "5",
    DeliveryFee: "0",
    Discount: "0",
    Tax1: "0",
    Tax2: "0",
    HandlingFee: "0",
    Quantity: "1",
  };
  var url = ypco.checkout.GetCheckoutUrlForExpress(
    checkoutOptions,
    checkoutItem
  );

  return url;
};

const getUrl2 = function (ticket_id, amount) {
  var sellerCode = "SB1447"; //"YOUR_USER_CODE_IN_YENEPAY";
  var useSandbox = true; //set this false on your production environment

  var successUrlReturn = "https://etmilestone.com/ts/pay/success"; //"PAYMENT_SUCCESS_RETURN_URL";
  var ipnUrlReturn = "https://etmilestone.com/ts/pay/ipn"; //"PAYMENT_COMPLETION_NOTIFICATION_URL";
  var cancelUrlReturn = "https://etmilestone.com/ts/pay/cancel";
  var failureUrl = "https://etmilestone.com/ts/pay/fail";
  var expiresAfter = 300; //"NUMBER_OF_MINUTES_BEFORE_THE_ORDER_EXPIRES less than a day";
  var orderId = ticket_id; //"UNIQUE_ID_THAT_IDENTIFIES_THIS_ORDER_ON_YOUR_SYSTEM";

  var checkoutOptions = ypco.checkoutOptions(
    sellerCode,
    orderId,
    ypco.checkoutType.Express,
    useSandbox,
    expiresAfter,
    successUrlReturn,
    cancelUrlReturn,
    ipnUrlReturn,
    failureUrl
  );
  var checkoutItem = {
    ItemName: "traffic violation penalty fee",
    UnitPrice: amount,
    DeliveryFee: "0",
    Discount: "0",
    Tax1: "0",
    Tax2: "0",
    HandlingFee: "0",
    Quantity: "1",
  };
  var url = ypco.checkout.GetCheckoutUrlForExpress(
    checkoutOptions,
    checkoutItem
  );

  return url;
};
exports.checkoutExpress = async function (req, res) {
  try {
    const license_id = req.uname;
    const penalty = await penaltyController.getPenalty(license_id);
    if (penalty.status) {
      return res.status(400).send({
        status: 400,
        message: `driver has been penalized for ${penalty.suspended_for} months`,
      });
    }
    const url = await getUrl2(penalty.ticket_id, penalty.amount);
    const bitly = new BitlyClient("585cfc815e12c56668f4429343c19e8b1d1cf30c");
    //REMINDER: check that using ussd, then api doesn't mean bitly will stop working
    const resp = await bitly.shorten(url).catch((e) => {
      console.log(e);
      myLogger.log(e);
      throw "no internet connection";
    });
    res.send({
      status: 200,
      amount: penalty.amount,
      url: resp.link,
    });
  } catch (e) {
    if (e === "no internet connection") {
      return res.status(400).send({
        status: 400,
        message: "no internet connection: bitly error",
      });
    }
    if (e === "driver has no pending penalty") {
      return res.status(400).send({
        status: 400,
        message: "driver has no pending penalty",
      });
    }
    console.log(e);
    myLogger.log(e);
    return res.status(500).send({
      status: 500,
      message: "internal error",
    });
  }
};
exports.IPNDestination = async (req, res, next) => {
  var ipnModel = req.body;
  myLogger.info("ipnModel");

  var useSandbox = true; //set this false on your production environment
  ypco.checkout
    .IsIPNAuthentic(ipnModel, useSandbox)
    .then((data) => {
      //this means the ipn is verified and the status of the transaction is COMPLETED
      //mark the order as "Paid" or "Completed" here
      myLogger.log(data);
    })
    .catch((err) => {
      myLogger.log(err);
      //this means either the ipn verification failed or the ipn model is INVALIDs
    });
};
exports.successDestination = async (req, res, next) => {
  res.json(req.query);
  //redirect url..serve web page here
};

//TODO
//7. do all input validations and change data in db accordingly so no inappropriate data exists

//2.DONE: eyosi request *
//3. DONE: enter policies to db *

//1. initPay func..returns url and amount *
//8. update ussd to accomodate amount + url

//4. admin web
//5. eyosi's map
//6. testing and documentation
//REMINDER: if enough time left change ussd to amharic..maybe tell elsh

//NOTE: policy updatable in db? better than hardcoded but worse than @admin web
//NOTE: status: 'active', ticket_id, 'suspended' && suspended_for: 0(default),3,6,12
//NOTE: recalc(){ on getRecord in case of status=suspended }
