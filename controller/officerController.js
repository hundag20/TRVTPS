const fs = require("fs");
const csv = require("csv-parser");
const formidable = require("formidable");

exports.getRecord = (req, res, send) => {
  //return last ticket or x number of tickets based on req
  res.send({ message: "you want officer records huh" });
};
//DONE
//login
//getProfileInfo

//TODO
//get Last Ticket or All tickets issued(not from user table but from ticket table)
