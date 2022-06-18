const User = require("../model/UserModel.js");
const Ticket = require("../model/TicketModel.js");
const Payment = require("../model/PaymentModel.js");
const Policy_1 = require("../model/Policy_1Model.js");
const Policy_2 = require("../model/Policy_2Model.js");
const Policy_3 = require("../model/Policy_3Model.js");
const { myLogger } = require("../app.js");

const suspend = async (license_id, offence_level) => {
  //if ticketParam.offence_level > 5 || point will surpass 16
  const user = await User.findOne(license_id);
  const user_points = user[0][0].points;
  let added_points = 0;
  const policy_1 = await Policy_1.find();
  const policy_2 = await Policy_2.find();

  if (offence_level === 1) {
    added_points = added_points + policy_1[0][0].points;
  } else if (offence_level === 2) {
    added_points = added_points + policy_1[0][1].points;
  } else if (offence_level === 3) {
    added_points = added_points + policy_1[0][2].points;
  } else if (offence_level === 4) {
    added_points = added_points + policy_1[0][3].points;
  } else if (offence_level === 5) {
    added_points = added_points + policy_1[0][4].points;
  }

  if (offence_level > 5) {
    let suspended_for = 0;
    if (offence_level == 6) {
      suspended_for = policy_2[0][5].months_suspended;
    } else if (offence_level == 7) {
      suspended_for = policy_2[0][6].months_suspended;
    }
    await User.updateOne(license_id, "first_time", "true");
    await User.updateOne(license_id, "points", 0);
    await User.updateOne(license_id, "status", "suspended");
    await User.updateOne(license_id, "suspended_for", suspended_for);
    return true;
  } else if (user_points + added_points > 16) {
    await User.updateOne(license_id, "first_time", "true");
    await User.updateOne(license_id, "points", 0);
    await User.updateOne(license_id, "status", "suspended");
    await User.updateOne(license_id, "suspended_for", 3);
    return true;
  }
  return false;
};

issueTicket = async (req, res, send) => {
  try {
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
    const savedTicket = await ticket.save();

    const suspended = await suspend(
      ticketParam.license_id,
      ticketParam.offence_level
    );

    if (!suspended) {
      const uname = ticketParam.license_id;
      const field = "status";
      const value = savedTicket[0].insertId;
      await User.updateOne(uname, field, value);
    }

    return res.status(200).send({
      message: "ticket added successfully!",
      ticketData: ticketParam,
    });
  } catch (e) {
    if (e === "driver has a pending ticket") {
      return res.status(400).send({
        status: "400",
        message: "driver has a pending ticket!",
      });
    }
    if (e === "driver license is suspended") {
      return res.status(400).send({
        status: "400",
        message: "driver's license is suspended!",
      });
    }
    if (e === "Driver with that license id doesn't exist") {
      return res.status(400).send({
        status: "400",
        message: "Driver with that license id doesn't exist!",
      });
    }
    console.log(e);
    myLogger.log(e);
    return res.status(500).send({
      status: 500,
      message: "unexpected error",
    });
  }
};

const calcAmount = async (info) => {
  let amount = 0;
  let overdue_fee = 0;
  let added_points = 0;
  const policy_1 = await Policy_1.find();
  const policy_3 = await Policy_3.find();

  //overdue fee
  if (info.days_overdue < 9) {
    overdue_fee = info.days_overdue * (policy_3[0][0].percentage / 100);
    added_points = added_points + policy_3[0][0].points;
  } else if (info.days_overdue < 31) {
    overdue_fee = info.days_overdue * (policy_3[0][1].percentage / 100);
    added_points = added_points + policy_3[0][1].points;
  } else {
    overdue_fee = info.days_overdue * (policy_3[0][2].percentage / 100);
    added_points = added_points + policy_3[0][2].points;
  }
  //violation fee
  if (info.first_time === "true") {
    if (info.offence_level === 1) {
      amount = policy_1[0][0].first_time_fee;
      added_points = added_points + policy_1[0][0].points;
    } else if (info.offence_level === 2) {
      amount = policy_1[0][1].first_time_fee;
      added_points = added_points + policy_1[0][1].points;
    } else if (info.offence_level === 3) {
      amount = policy_1[0][2].first_time_fee;
      added_points = added_points + policy_1[0][2].points;
    } else if (info.offence_level === 4) {
      amount = policy_1[0][3].first_time_fee;
      added_points = added_points + policy_1[0][3].points;
    } else if (info.offence_level === 5) {
      amount = policy_1[0][4].first_time_fee;
      added_points = added_points + policy_1[0][4].points;
    }
  } else if (info.first_time === "false") {
    if (info.offence_level === 1) {
      amount = policy_1[0][0].non_first_time_fee;
      added_points = added_points + policy_1[0][0].points;
    } else if (info.offence_level === 2) {
      amount = policy_1[0][1].non_first_time_fee;
      added_points = added_points + policy_1[0][1].points;
    } else if (info.offence_level === 3) {
      amount = policy_1[0][2].non_first_time_fee;
      added_points = added_points + policy_1[0][2].points;
    } else if (info.offence_level === 4) {
      amount = policy_1[0][3].non_first_time_fee;
      added_points = added_points + policy_1[0][3].points;
    } else if (info.offence_level === 5) {
      amount = policy_1[0][4].non_first_time_fee;
      added_points = added_points + policy_1[0][4].points;
    }
  }
  const totalAmount = amount + amount * overdue_fee;
  const obj = {
    amount: totalAmount,
    points: added_points,
  };
  return obj;
};
getPenalty = async (license_id) => {
  //based on ticket nd past record info: try{
  //1. throw "no pending ticket", "account suspended"
  //2. calculate and return amount(points nd count updated @payment_success_confirmation via calling update function written @penaltyController)
  //}catch (err){ throw err }
  //@penaltyController: suspend(//on ticketing event after status=active AND level>5 checks){ reset counts and suspend (months- recalced on get profile at model) account for x months AND lock(boolean) account until verified by admin}
  try {
    let obj = {};
    const driver = await User.findOne(license_id);
    if (!driver || !driver[0] || driver[0].length === 0) {
      throw "driver not found";
    }
    if (driver[0][0].status === "active") {
      throw "driver has no pending penalty ";
    }
    if (driver[0][0].status === "suspended") {
      obj = {
        status: "suspended",
        suspended_for: driver[0][0].suspended_for,
      };
      return obj;
    }

    const ticket = await Ticket.findById(driver[0][0].status);
    const today = new Date(Date.now());
    const day_ticketed = new Date(ticket[0][0].date_time);
    const difference = Math.abs(today - day_ticketed);
    const info = {
      days_overdue: Math.floor(difference / (1000 * 3600 * 24)),
      offence_level: ticket[0][0].offence_level,
      points: driver[0][0].points,
      first_time: driver[0][0].first_time,
    };
    const result = await calcAmount(info);

    obj = {
      amount: result.amount,
      points: result.points,
      ticket_id: driver[0][0].status,
    };
    return obj;
  } catch (err) {
    throw err;
  }
};
endPenalty = async (ticket_id) => {
  //update user added points, first_time, status
  //create payment record
  //update ticket payment_order_num

  const ticket = await Ticket.findById(ticket_id);
  if (!ticket || !ticket[0] || ticket[0].length === 0 || !ticket[0][0])
    throw "ticket not found";
  const user = await User.findOne(ticket[0][0].issued_to);
  if (!user || !user[0] || user[0].length === 0 || !user[0][0])
    throw "user not found";

  const penalty = await getPenalty(ticket[0][0].issued_to);
  const new_points = user[0][0].points + penalty.points;

  await User.updateOne(ticket[0][0].issued_to, "status", "active");
  await User.updateOne(ticket[0][0].issued_to, "first_time", "false");
  await User.updateOne(ticket[0][0].issued_to, "points", new_points);

  const newPayment = {
    newPayment: {
      amount: penalty.amount,
      ticket_id: ticket_id,
    },
  };
  const payment = new Payment(newPayment);
  await payment.save();

  //forgot create pay record and update ticket
  return;
};

module.exports = {
  getPenalty: getPenalty,
  issueTicket: issueTicket,
  endPenalty: endPenalty,
};
//TODO
//issueTicket
//    -addNewTicket
//    -updateDriverLicenseStatus [status: ticketId/active]
//NOTE: ../temp/code_note.jpg JUSTIFY: We aim to change card-taking procedure to online status deactivation. the other two scenarios can be integrated further but this is the most common case and the other two are out of our scope.

//QUESTION: before, losing id was a motivator to pay. now what?

//TODO:
// DONE: calcAmount and return*
// DONE: suspend on ticketing*

// DONE: update driver, ticket, and payment info on payment success* //test with localhost..for console.logging

// 5. redirect to real page on payment success*
// 4. return appropriate message on ussd make payment

// 7. Admin UI*

// 6. logout
// 8. Admin backend
