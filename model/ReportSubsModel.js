const db = require("../utils/database");

module.exports = class ReportSubs {
  static async findByEmail(email) {
    if (!email) throw "passing undefined value for searching subscriber";
    try {
      const result = await db.execute(
        "SELECT * FROM report_subscriber WHERE email = ? ",
        [email]
      );
      return result;
    } catch (err) {
      console.log("err@findByEmail: " + err);
      throw err;
    }
  }
  static async findBySchedule(schedule) {
    if (!schedule) {
      throw "passing undefined value for filtering subscriber by schedule";
    }
    if (
      schedule != "daily" &&
      schedule != "weekly" &&
      schedule != "monthly" &&
      schedule != "annual"
    )
      throw "schedule value is invalid";

    try {
      const report = await db.execute(
        "SELECT * FROM report_subscriber WHERE schedule = ?",
        [schedule]
      );
      return report;
    } catch (err) {
      console.log("err@findByEmail: " + err);
      throw err;
    }
  }
};
