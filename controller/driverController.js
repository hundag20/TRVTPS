const fs = require("fs");
const csv = require("csv-parser");
const formidable = require("formidable");

exports.getRecord = (req, res, send) => {
  //return last ticket or x number of tickets based on req
  res.send({ message: "you want driver records huh" });
};
//DONE
//login
//getProfileInfo

//TODO
//getRecord(s) (not from user table but from ticket table)
