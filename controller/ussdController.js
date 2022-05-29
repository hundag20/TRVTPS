const { myLogger } = require("../app.js");
const BitlyClient = require("bitly").BitlyClient;
const bitly = new BitlyClient("585cfc815e12c56668f4429343c19e8b1d1cf30c");
const paymentController = require("../controller/paymentController");
const Announcement = require("../model/AnnouncementModel.js");
const User = require("../model/UserModel.js");
const Ussd = require("../model/UssdModel.js");

const verifySession = async (id) => {
  const session = await Ussd.find(id);
  if (session[0].length === 0) {
    return "invalid session";
  } else return "session valid";
};

exports.ussdHandler = async (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;
  console.log("###########", req.body);
  // myLogger.info(req.body);

  let response = "";

  if (text == "") {
    // This is the first request. Note how we start the response with CON
    response = `CON 1. Login`;
  } else if (text == "1") {
    // This is the first request. Note how we start the response with CON
    response = `CON Enter license id to login`;
  } else if (/^1\*/.test(text) && !text.substring(2).includes("*")) {
    //REMINDER: validate pwd entered doesn't contain */ that is is alphanumeric
    // This is the first request. Note how we start the response with CON
    try {
      const license_id = text.split("1*")[1];
      //REMINDER this user.findone promise not handled with .catch
      let driver = await User.findOne(license_id);
      //if license exists and if phone num assocd with license matches
      if (driver[0].length === 0) {
        response = `END Driver with this license id not found!`;
      } else {
        driver = driver[0][0];
        //REMINDER (works for less strings too but validate anyways) assuming phone num has atleast 8+ letters in string, validate this at sign-up
        const phone_num = `+2519${driver.phone_num.substring(
          driver.phone_num.length - 8
        )}`;
        if (phone_num === req.body.phoneNumber) {
          try {
            const newUssd = {
              newUssd: {
                session_id: req.body.sessionId,
                license_id: driver.username,
              },
            };
            //REMINDER session ids should expire after a period in case db gets compromised.
            const ussd = new Ussd(newUssd);
            ussd
              .save()
              .then()
              .catch((err) => {
                console.log("ERROR while saving ussd session id: ", err);
                myLogger.log("ERROR while saving ussd session id: ", err);
              });
            response = `CON Welcome to Traffic Management system
            2. get payment link
            3. set password
            4. get information`;
          } catch (e) {
            response = `END an error occurred while saving session id`;
          }
        } else {
          response = `END The license id you entered doesn't match with the phone number you called with! \nplease call with the number you registered with.`;
        }
      }
    } catch (err) {
      console.log("ERROR: ", err);
      myLogger.log("ERROR: ", err);
      response = `END unexpected error: ${err}`;
    }
  } else if (/1\*.*\*2/.test(text)) {
    // Business logic for second level response
    try {
      //verify session id
      const valid = await verifySession(req.body.sessionId);
      if (valid === "invalid session") {
        response = "END invalid session";
      } else {
        //get link and amount instead of jst url
        const url = await paymentController.getUrl(req);
        const resp = await bitly.shorten(url);
        //REMINDER: (done, but enough?)bitly error not handled, try+catch it.
        response = `END use this url to complete payment: ${resp.link}`;
      }
    } catch (e) {
      console.log(e);
      myLogger.log(e);
      response = `END e`;
    }
  } else if (/^1\*.*\*3$/.test(text)) {
    // Business logic for first level response
    try {
      //verify session id
      const valid = await verifySession(req.body.sessionId);
      if (valid === "invalid session") {
        response = "END invalid session";
      } else {
        response = `CON please enter your new password\n (the password must have atleast 8 characters and can not include asterix symbol (*))`;
      }
    } catch (e) {
      console.log(e);
      myLogger.log(e);
      response = `END e`;
    }
  } else if (/^(1\*.*\*3).+/.test(text)) {
    // Business logic for first level response
    try {
      //verify session id
      const valid = await verifySession(sessionId);
      if (valid === "invalid session") {
        response = "END invalid session";
      } else {
        const pwd = text.split("*3*")[1];
        //update db
        const ussd = await Ussd.find(sessionId);
        if (ussd[0].length != 0 && ussd[0][0]) {
          await User.updateOne(ussd[0][0].license_id, "password", pwd);
          response = `END password updated successfully`;
        } else {
          throw "driver with that session id no longer exists";
        }
      }
    } catch (e) {
      console.log(e);
      myLogger.log(e);
      response = `END ${e}`;
    }
  } else if (/1\*.*\*4/.test(text)) {
    try {
      //verify session id
      const valid = await verifySession(sessionId);
      if (valid === "invalid session") {
        response = "END invalid session";
      } else {
        // get latest three news, limit news size on admin based on ussd window
        const allNews = await Announcement.getAll();
        if (
          allNews &&
          allNews[0] &&
          allNews[0].length != 0 &&
          allNews[0].length >= 3
        ) {
          response = `END These are the latest news 
      1.${allNews[0][allNews[0].length - 1].message}
      2.${allNews[0][allNews[0].length - 2].message}
      3.${allNews[0][allNews[0].length - 3].message}
      `;
        } else if (allNews && allNews[0] && allNews[0].length != 0) {
          response = `END This is the latest news 
      1. ${allNews[0][allNews[0].length - 1].message}`;
        } else {
          response = `END There are no news available`;
        }
      }
    } catch (e) {
      console.log(e);
      myLogger.log(e);
      response = `END ${e}`;
    }
  } else if (text) {
    response = `END invalid input, please refer the menu`;
  }

  res.set("Content-Type: text/plain");
  res.send(response);
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

//NOTE: ussd auth: enter license, if license and phone num match cont.
//DONE: how is throwed err not handled
//DONE: why err throwed at that sequence
//DONE: make option 3 regex work
//DONE: invalid pwd handle at admin too
//DONE: setup option 4
//DONE: else [if] for all unkown regexes- so net problem nvr appears
