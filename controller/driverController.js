const fs = require("fs");
const csv = require("csv-parser");
const formidable = require("formidable");
const User = require("../model/UserModel");
const Ticket = require("../model/TicketModel.js");
const { myLogger } = require("../app");

exports.getRecord = (req, res, send) => {
  try {
    //return last ticket or x num of tickets based on req
    const license_id = req.uname;
    Ticket.find(license_id)
      .then((tickets) => {
        if (tickets && tickets[0] && tickets[0].length != 0) {
          let driverInfo;
          User.findOne(license_id)
            .then((driver) => {
              if (driver[0].length === 0) {
                return res.status(400).send({
                  status: 400,
                  message: "driver not found",
                });
              }
              driverInfo = driver[0][0];
              return res.status(200).send({
                status: 200,
                driverStatus: driverInfo.status,
                records: tickets[0].reverse(),
              });
            })
            .catch((err) => {
              console.log(err);
              return res.status(500).send({
                message: "error at finding driver",
                err: err,
              });
            });
        } else {
          return res.status(400).send({
            status: 400,
            message: "driver has no past records",
          });
        }
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).send({
          status: 500,
          message: "something went wrong",
        });
      });
  } catch (e) {
    console.log(e);
    myLogger.log(e);
    return res.status(500).send({
      status: 500,
      message: "internal error",
    });
  }
};
//DONE
//login
//getProfileInfo

//TODO
//return two past records on login
//getRecord (return all records) (not from user table but from ticket table)
