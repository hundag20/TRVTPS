const cron = require("node-cron");
const mailer = require("nodemailer");
const User = require("../model/UserModel.js");
const Ticket = require("../model/TicketModel.js");
const dateParser = require("date-and-time");

let transporter;
try {
  // Creating a transporter
  transporter = mailer.createTransport({
    host: "mail.etmilestone.com",
    port: 465,
    auth: {
      user: "trtvps@etmilestone.com",
      pass: "passwordpasswordpassword",
    },
  });

  function percentage(partialValue, totalValue) {
    return (100 * partialValue) / totalValue;
  }
  const r_active = async () => {
    let inactives = 0;
    let actives = 0;
    let suspendeds = 0;
    let fineds = 0;

    const allUsers = await User.getAll();
    if (allUsers && allUsers[0] && allUsers[0].length > 0) {
      allUsers[0].forEach((el) => {
        if (el.status === "suspended") suspendeds = suspendeds + 1;
        if (el.status != "suspended" && el.status != "active")
          fineds = fineds + 1;
        if (el.password === "inactive") {
          inactives = inactives + 1;
        } else {
          actives = actives + 1;
        }
      });
      actives = percentage(actives, allUsers[0].length);
      inactives = percentage(inactives, allUsers[0].length);
      suspendeds = percentage(suspendeds, allUsers[0].length);
      fineds = percentage(fineds, allUsers[0].length);
    }

    const results = {
      inactives: inactives,
      actives: actives,
      suspendeds: suspendeds,
      fineds: fineds,
    };
    return results;
  };

  const r_barStats = async (schedule) => {
    //return num of fines issued (in the last day, last week, last month, last year)
    let fines = {
      pastDay: 0,
      pastWeek: {
        mon: 0,
        tue: 0,
        wed: 0,
        thu: 0,
        fri: 0,
        sat: 0,
        sun: 0,
        tot: 0,
      },
      pastMonth: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
      ],
    };
    //NOTE: monthly means past 31 day (first index is yesterday)

    const allFines = await Ticket.getAll();
    if (allFines && allFines[0] && allFines[0].length > 0) {
      allFines[0].forEach((ticket) => {
        const ticketDate = String(ticket.date);
        if (ticketDate && ticketDate != "Invalid Date") {
          const date = new Date(ticketDate);
          const today = new Date();

          const week = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
          const year = [
            "jan",
            "feb",
            "mar",
            "apr",
            "may",
            "jun",
            "jul",
            "aug",
            "sep",
            "oct",
            "nov",
            "dec",
          ];

          if (date.getFullYear() == today.getFullYear()) {
            //handle yesterday's fines
            const yest = dateParser.addDays(today, -1);
            if (date.getDate() === yest.getDate()) fines.pastDay++;

            //handle past month (past 31 days)
            for (let i = 1; i <= 31; i++) {
              const x = dateParser.addDays(today, -i);
              if (date.getDate() == x.getDate()) {
                fines.pastMonth[i - 1]++;
                fines.pastMonth[31]++;
              }
            }

            //handle past full week here (last saturday and 6 days b4 that until sunday)
            let y, last_sat_date;
            let i = 1;
            while (true) {
              y = dateParser.addDays(today, -i);
              if (y.getDay() === 6) {
                last_sat_date = y.getDate();
                break;
              }
              i++;
            }

            if (date.getDate() == last_sat_date) {
              fines.pastWeek.sat++;
              fines.pastWeek.tot++;
            }
            if (date.getDate() == dateParser.addDays(y, -1).getDate()) {
              fines.pastWeek.fri++;
              fines.pastWeek.tot++;
            }
            if (date.getDate() == dateParser.addDays(y, -2).getDate()) {
              fines.pastWeek.tot++;
              fines.pastWeek.thu++;
            }
            if (date.getDate() == dateParser.addDays(y, -3).getDate()) {
              fines.pastWeek.tot++;
              fines.pastWeek.wed++;
            }
            if (date.getDate() == dateParser.addDays(y, -4).getDate()) {
              fines.pastWeek.tot++;
              fines.pastWeek.tue++;
            }
            if (date.getDate() == dateParser.addDays(y, -5).getDate()) {
              fines.pastWeek.tot++;
              fines.pastWeek.mon++;
            }
            if (date.getDate() == dateParser.addDays(y, -6).getDate()) {
              fines.pastWeek.tot++;
              fines.pastWeek.sun++;
            }
          }
          //handle annual here
        }
      });
    }
    return fines;
  };

  const r_dognutStats = async (schedule) => {
    let levels = [0, 0, 0, 0, 0, 0, 0];

    const allTickets = await Ticket.getAll();
    if (allTickets && allTickets[0] && allTickets[0].length > 0) {
      allTickets[0].forEach((el) => {
        if (el.offence_level === 1) levels[0]++;
        if (el.offence_level === 2) levels[1]++;
        if (el.offence_level === 3) levels[2]++;
        if (el.offence_level === 4) levels[3]++;
        if (el.offence_level === 5) levels[4]++;
        if (el.offence_level === 6) levels[5]++;
        if (el.offence_level === 7) levels[6]++;
      });
    }

    const results = {
      levels: levels,
    };
    return results;
  };

  const getReport = async (schedule) => {
    const report = {};
    //return total number of activated and unactivaeted accounts as input for piechart
    report.activesPercentage = await r_active();

    //return num of fines issued(in the last day, last week, last month)
    report.barStats = await r_barStats();

    //return num of fines issued in each violation level (1, 2, 3, 4, 5, 6, 7)
    report.dognutStats = await r_dognutStats();

    // console.log(report);
    return report;
  };
  const sendEmail = async (message, email, subject, from, too) => {
    try {
      //sending the email
      const to = `"${too}" <${email}>`;
      const emailsent = await transporter.sendMail({
        from: from,
        to: to,
        subject: subject,
        text: message,
      });
      console.log(emailsent);
      console.log("Email sent on " + new Date());
      return;
    } catch (e) {
      throw e;
    }
  };

  const scheduledReports = async () => {
    try {
      //setting up email messages
      const from = "'Automatic Traffic Reports' <trtvps@etmilestone.com>";
      const to = "Traffic Report Subscriber";

      const init = async (schedule) => {
        if (
          !schedule ||
          (schedule != "daily" &&
            schedule != "weekly" &&
            schedule != "monthly" &&
            schedule != "annual")
        )
          throw "using invalid schedule for filtering subscribers by schedule";
        const subject = `Scheduled ${schedule} report`;
        const message = await getReport(schedule);

        const subs = await RebortSubs.findBySchedule(schedule);
        if (subs && subs[0] && subs[0].length > 0) {
          subs[0].forEach((el) => {
            sendEmail(message, el.email, subject, from, to);
          });
        }
      };

      await getReport();
      const initDaily = () => init("daily");
      const initWeekly = () => init("weekly");
      const initMonthly = () => init("monthly");
      const initAnnual = () => init("anuual");

      cron.schedule("* * * * *", initDaily);
    } catch (e) {
      console.log(e);
    }
  };

  const getReports = async (req, res, next) => {
    try {
      const report = await getReport();
      return res.status(200).send({
        message: "reports loaded successfully",
        report: report,
      });
    } catch (e) {
      console.log("error at report", e);
      return res.status(500).send({
        message: "something went wrong",
      });
    }
  };
  module.exports = {
    getReports: getReports,
    scheduledReports: scheduledReports,
    sendEmail: sendEmail,
  };
} catch (e) {
  console.log("error on setting up email transporter", e);
}

//DONE: 1. percentage of activated users (piechart)

//2. total number of fines issued (total stat and comparisons bar chart)
//3. total number of payments completed (total stat and comparisons bar chart)

//5. total number of tickets issued in each violation level (comparisons bar chart)
//4. total number of payments made in each payment category (comparisons bar chart)
