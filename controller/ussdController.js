const { myLogger } = require("../app.js");

exports.ussdHandler = (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;
  console.log("###########", req.body);
  myLogger.info(req.body);

  let response = "";

  if (text == "") {
    // This is the first request. Note how we start the response with CON
    response = `CON Welcome to Traffic Management system
        1. login
        2. Check information`;
  } else if (text == "2") {
    // Business logic for first level response
    response = `CON Choose account information you want to view
        1. Penatly information
        2. Traffic Management Agency news`;
  } else if (text == "2") {
    // Business logic for first level response
    // This is a terminal request. Note how we start the response with END
    response = `END Your phone number is ${phoneNumber}`;
  } else if (text == "1*1") {
    // This is a second level response where the user selected 1 in the first instance
    const accountNumber = "ACC100101";
    // This is a terminal request. Note how we start the response with END
    response = `END Your account number is ${accountNumber}`;
  } else if (text == "1*2") {
    // This is a second level response where the user selected 1 in the first instance
    const balance = "KES 10,000";
    // This is a terminal request. Note how we start the response with END
    response = `END Your balance is ${balance}`;
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

//TODO
//login
//--get link to payment --- by rec of evaluators
//reset password(new pwd nd confirm)
//get news
