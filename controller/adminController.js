const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const User = require("../model/UserModel.js");
const Admin = require("../model/AdminModel.js");
const { genToken } = require("../middleware/auth.js");
const { sendEmail } = require("./reportController.js");
const Announcement = require("../model/AnnouncementModel.js");

exports.addMultiUsers = async (req, res, next) => {
  const role = req.body.role;
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", async function (row) {
      console.log(row);
      if (role === "admin") {
        await User.addAdmin(row);
        return res.sendStatus(200);
      } else if (role === "driver") {
        return res.sendStatus(200);
      } else if (role === "officer") {
        return res.sendStatus(200);
      } else {
        return res.sendStatus(400);
      }
    });
};

exports.addSingleUser = async (req, res, next) => {
  try {
    const newUser = { newUser: req.body };

    //REMINDER: sanitize and validate at model (Fat model)
    const user = new User(newUser);
    user
      .save()
      .then((user) => {
        return res.status(200).send({
          message: "user added successfully!",
          userData: user,
        });
      })
      .catch((err) => {
        if (err.errno === 1062) {
          return res.status(400).send({
            message: "that username has already been used",
          });
        }
        if (err === "invalid password") {
          return res.status(400).send({
            message: "invalid password",
          });
        }
        console.log(err);
        return res.status(500).send({
          message: "something went wrong",
          error: err,
        });
      });
  } catch (e) {
    if (e === "invalid password") {
      return res.status(400).send({
        message: "invalid password!",
      });
    }
    console.log(e);
    return res.status(500).send({
      message: "something went wrong!",
      error: e,
    });
  }
};

exports.addNews = async (req, res, next) => {
  try {
    const newsObj = {
      announced_by: req.uname,
      roles: req.body.roles || "all",
      message: req.body.message,
    };
    const newNews = { newNews: newsObj };

    //REMINDER: sanitize and validate at model (Fat model)
    const announcement = new Announcement(newNews);
    announcement
      .save()
      .then((announcement) => {
        return res.status(200).send({
          message: "news added successfully!",
          userData: announcement,
        });
      })
      .catch((err) => {
        if ((err = "message_limit")) {
          return res.status(400).send({
            message:
              "announcement message can't surpass the maximum character count of 192",
          });
        }
        console.log(err);
        return res.status(500).send({
          message: "something went wrong",
          error: err,
        });
      });
  } catch (e) {
    console.log(e);
    return res.status(500).send({
      message: "something went wrong!",
      error: e,
    });
  }
};

exports.resetPwd = (req, res, send) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.render("usernamemissing");
    }

    Admin.findOne(email)
      .then(async (admin) => {
        if (!admin || admin[0].length === 0) {
          return res.render("notfound");
        }
        const URL = "https://etmilestone.com/ts/admin";
        const tokenObject = {
          email: email,
        };
        const resetToken = await genToken(tokenObject);

        const link = `${URL}/passwordReset?token=${resetToken}&email=${email}`;
        const emailData = {
          email: email,
          message: `Hello, follow the following link to reset your password
          link: ${link}`,
          subject: "Admin Reset Password",
          from: "'Rest Admin password' <trtvps@etmilestone.com>",
          too: "Registered Admin",
        };
        await sendEmail(
          emailData.message,
          emailData.email,
          emailData.subject,
          emailData.from,
          emailData.too
        );
        return res.render("adminresetlinksent");
      })
      .catch((err) => {
        console.log("@2", err);
        return res.render("tryagain");
      });
  } catch (e) {
    console.log("@1", e);
    return res.render("tryagain");
  }
};

//NOTE: 400: bad request, 500: error at backend

//DONE
//addSingleUser

//TODO
//add multi users
//editUserInfo
//addPolicy
//editPolicyInfo

//TODO:
//generateReport
//    -req 3 filters
//    -res: json
//    -downloadPdf
//subscriveToReport(not mvp)
//    -req 3 filters
//    -email(from profile + add subscribers) every [week/month] newly generated pdfs
