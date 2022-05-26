const { myLogger } = require("../app.js");
var shortUrl = require("node-url-shortener");
const paymentController = require("../controller/paymentController");

exports.ussdHandler = async (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;
  console.log("###########", req.body);
  myLogger.info(req.body);

  let response = "";

  if (text == "") {
    // This is the first request. Note how we start the response with CON
    response = `CON Welcome to Traffic Management system
    1. get payment link
    2. set password
        3. get information`;
  } else if (text == "1") {
    // Business logic for first level response
    const url = await paymentController.getUrl(req);
    shortUrl.short(url, function (err, url2) {
      response = `END use this url to complete payment: ${url2}`;
    });
  } else if (text == "2") {
    // Business logic for first level response
    response = `CON please enter your new password`;
  } else if (text == "3") {
    // Business logic for first level response
    // This is a terminal request. Note how we start the response with END
    response = `CON Choose account information you want to view
    1. Penatly information
    2. Traffic Management Agency news`;
  } else if (text == "3*1") {
    // This is a second level response where the user selected 1 in the first instance
    const policies = "policies";
    // This is a terminal request. Note how we start the response with END
    response = `END policy info: ${policies}`;
  } else if (text == "3*2") {
    // This is a second level response where the user selected 1 in the first instance
    const news = "sample news";
    // This is a terminal request. Note how we start the response with END
    response = `END latest announcement ${news}`;
  } else if (text) {
    //new pwd enter, check if first 1 is selected 1*smth regex
    response = `END password reset successfully`;
  }

  // Print the response onto the page so that our SDK can read it
  res.set("Content-Type: text/plain");
  res.send(response);
  // DONE!!!
};

exports.ussdHandler2 = (req, res) => {
  myLogger.info("post ussd");
  console.log("ussd is posted");
};

//NOTE no login required because phone_num is already the validator, login would be redundant
//TODO
//--get link to payment --- by rec of evaluators
//reset password(new pwd nd confirm)
//news (put the option and decide at admin if we're doing it or not)
