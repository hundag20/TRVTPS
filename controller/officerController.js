const fs = require("fs");
const csv = require("csv-parser");
const formidable = require("formidable");
const User = require("../model/UserModel.js");

exports.getRecord = (req, res, send) => {
  //return last ticket or x number of tickets based on req
  res.send({ message: "you want officer records huh" });
};

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
//DONE
//login
//getProfileInfo

//TODO
//get Last Ticket or All tickets issued(not from user table but from ticket table)
