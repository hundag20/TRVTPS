const cron = require("node-cron");
const mailer = require("nodemailer");
const User = require("../model/UserModel.js");
const Ticket = require("../model/TicketModel.js");

let transporter;
try {
  // Creating a transporter
  transporter = mailer.createTransport({
    host: "mail.etmilestone.com",
    port: 465,
    auth: {
      user: "traffic.report@etmilestone.com",
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
      },
      currentMonth: {
        mon: 0,
        tue: 0,
        wed: 0,
        thu: 0,
        fri: 0,
        sat: 0,
        sun: 0,
      },
      pastYear: {
        jan: 0,
        feb: 0,
        mar: 0,
        apr: 0,
        may: 0,
        jun: 0,
        jul: 0,
        aug: 0,
        sep: 0,
        oct: 0,
        nov: 0,
        dec: 0,
      },
    };
    //NOTE: monthly now means 7(instead of 4) monthly stats[eg. all mondays in the past month] (daily(yesterday's) report exists for subs but not for visual)

    const allFines = await Ticket.getAll();
    if (allFines && allFines[0] && allFines[0].length > 0) {
      allFines[0].forEach((ticket) => {
        const ticketDate = String(ticket.date);
        if (ticketDate && ticketDate != "Invalid Date") {
          const date = {};
          date.full = ticketDate;
          date.year = ticketDate.split(" ")[3];
          date.month = ticketDate.split(" ")[1];
          date.day_of_the_week = ticketDate.split(" ")[0];
          date.day_of_the_month = ticketDate.split(" ")[2];

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
          const today = {};
          today.full = new Date();
          today.day_of_the_week = week[new Date().getDay()];
          today.day_of_the_month = new Date().getDate();
          today.month = year[new Date().getMonth()];
          today.year = new Date().getFullYear();
          if (date.year == today.year) {
            if (date.month == today.month) {
              //yesterday //NOTE: (except month change days)
              if (date.day_of_the_month == today.day_of_the_month - 1) {
                fines.pastDay++;
              }
              //past month's stats grouped into 7
              if (date.day_of_the_week == "mon") fines.currentMonth.mon++;
              if (date.day_of_the_week == "tue") fines.currentMonth.tue++;
              if (date.day_of_the_week == "wed") fines.currentMonth.wed++;
              if (date.day_of_the_week == "thu") fines.currentMonth.thu++;
              if (date.day_of_the_week == "fri") fines.currentMonth.fri++;
              if (date.day_of_the_week == "sat") fines.currentMonth.sat++;
              if (date.day_of_the_week == "sun") fines.currentMonth.sun++;
            }
            //handle month change dates
            //handle past week here
          }
          //handle annual here
        }
      });
    }
  };

  const getReport = async (schedule) => {
    const report = {};
    //return total number of activated and unactivaeted accounts as input for piechart
    report.activesPercentage = await r_active();

    //return num of fines issued(in the last day, last week, last month, last year)
    report.barStats = await r_barStats();

    //return num of fines issued in each violation level (1, 2, 3, 4, 5, 6, 7)
    // report.dognutStats = await r_dognutStats();

    return report;
  };
  const sendEmail = async (message, email, subject, from, too) => {
    //sending the email
    const to = `"${too}" <${email}>`;
    transporter
      .sendMail({
        from: from,
        to: to,
        subject: subject,
        text: message,
      })
      .then((_) => {
        console.log("Email sent on " + new Date());
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const scheduledReports = async () => {
    try {
      //setting up email messages
      const from =
        "'Automatic Traffic Reports' <traffic.report@etmilestone.com>";
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
