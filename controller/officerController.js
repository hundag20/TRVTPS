const fs = require("fs");
const csv = require("csv-parser");
const formidable = require("formidable");
const User = require("../model/UserModel.js");
const { sendEmail } = require("./reportController.js");
const { genToken } = require("../middleware/auth.js");
exports.findDriver = (req, res, send) => {
  let license_id = "";
  if (req.query.license_id) license_id = req.query.license_id;
  else {
    return res.status(400).send({
      status: 400,
      message: "license id not provided",
    });
  }
  User.findOne(license_id)
    .then((driver) => {
      if (driver[0].length === 0) {
        return res.status(400).send({
          status: 400,
          message: "driver not found",
        });
      }
      return res.status(200).send({
        message: "driver found",
        driverInfo: driver[0][0],
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send({
        message: "error at finding driver",
        err: err,
      });
    });
};

exports.resetPwd = (req, res, send) => {
  try {
    const uname = req.query.username;
    if (!uname) {
      return res.status(400).send({
        status: 400,
        message: "username not provided",
      });
    }

    User.findOne(uname)
      .then(async (officer) => {
        if (
          !officer ||
          officer[0].length === 0 ||
          officer[0][0].role != "officer"
        ) {
          return res.status(400).send({
            status: 400,
            message: "officer with that badge number not found",
          });
        }
        const officerInfo = officer[0][0];
        const URL = "https://etmilestone.com/ts/officer";
        const tokenObject = {
          uname: uname,
        };
        const resetToken = await genToken(tokenObject);

        const link = `${URL}/passwordReset?token=${resetToken}&uname=${uname}`;
        const emailData = {
          email: officerInfo.email,
          message: `Hello, follow the following link to reset your password
          link: ${link}`,
          subject: "Officer Reset Password",
          from: "'Rest officer password' <trtvps@etmilestone.com>",
          too: "Registered Officer",
        };
        await sendEmail(
          emailData.message,
          emailData.email,
          emailData.subject,
          emailData.from,
          emailData.too
        );
        return res.status(200).send({
          status: 200,
          message: "reset password sent to your email",
        });
      })
      .catch((err) => {
        console.log("@2", err);
        return res.status(500).send({
          status: 500,
          message: "something went wrong",
        });
      });
  } catch (e) {
    console.log("@1", e);
    return res.status(500).send({
      status: 500,
      message: "something went wrong",
    });
  }
};
//DONE
//login
//getProfileInfo

//TODO
//get Last Ticket or All tickets issued(not from user table but from ticket table)
