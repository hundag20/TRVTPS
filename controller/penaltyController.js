const User = require("../model/UserModel.js");
const Ticket = require("../model/TicketModel.js");

exports.issueTicket = async (req, res, send) => {
  const ticketParam = {
    license_id: req.query.license_id,
    officer_id: req.uname,
    date: req.query.date,
    time: req.query.time,
    location: req.query.location,
    offence_level: req.query.offence_level,
    offence_code: req.query.offence_code,
    plate_num: req.query.plate_num,
    remark: req.query.remark || "no remark",
  };
  //REMINDER sanitize and parametrize all these at model

  //REMINDER validate ticket data at model before saving (eg. license_id exists, stauts is active [no two tickets, JUSTIFY])
  if (Object.values(ticketParam).includes(undefined)) {
    return res.status(400).send({
      status: 400,
      message: "full information not provided",
    });
  }

  const newTicket = { newTicket: ticketParam };
  const ticket = new Ticket(newTicket);
  ticket
    .save()
    .then((savedTicket) => {
      console.log(savedTicket);

      const uname = ticketParam.license_id;
      const field = "status";
      const value = savedTicket[0].insertId;
      User.updateOne(uname, field, value)
        .then(() => {
          return res.status(200).send({
            message: "ticket added successfully!",
            ticketData: ticketParam,
          });
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).send({
            message: "ticket saved but ERROR at updating user status",
            err: err,
          });
        });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send({
        message: "an ERROR occured when saving ticket",
        err: err,
      });
    });
};

//TODO
//issueTicket
//    -addNewTicket
//    -updateDriverLicenseStatus [status: ticketId/active]
//NOTE: ../temp/code_note.jpg JUSTIFY: We aim to change card-taking procedure to online status deactivation. the other two scenarios can be integrated further but this is the most common case and the other two are out of our scope.

//QUESTION: before, losing id was a motivator to pay. now what?
