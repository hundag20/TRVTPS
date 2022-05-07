const fs = require("fs");
const csv = require("csv-parser");
const formidable = require("formidable");
const User = require("../model/UserModel");
const Ticket = require("../model/TicketModel.js");

exports.getRecord = (req, res, send) => {
  //return last ticket or x num of tickets based on req
  const license_id = req.uname;
  Ticket.find(license_id)
    .then((tickets) => {
      return res.status(200).send({
        status: 200,
        records: tickets[0].reverse(),
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send({
        status: 500,
        message: "something went wrong",
      });
    });
};
//DONE
//login
//getProfileInfo

//TODO
//return two past records on login
//getRecord (return all records) (not from user table but from ticket table)
