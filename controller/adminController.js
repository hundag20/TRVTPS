const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const User = require("../model/UserModel.js");

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
      console.log(err);
      if (err.errno === 1062) {
        return res.status(400).send({
          message: "that username has already been used",
        });
      }
      return res.status(500).send({
        message: "something went wrong",
      });
    });
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
