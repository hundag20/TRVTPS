const db = require("../utils/database");

module.exports = class ReportSubs {
  static findByEmail(email) {
    if (!email) throw "passing undefined value for searching subscribers";
    try {
      const result = db.execute(
        "SELECT * FROM report_subscribers WHERE email = ? ",
        [email]
      );
      return result;
    } catch (err) {
      console.log("err@findByEmail: " + err);
      throw err;
    }
  }
  static findBySchedule(schedule) {
    if (!schedule)
      throw "passing undefined value for filtering subscribers by schedule";
    if (
      schedule != "daily" &&
      schedule != "weekly" &&
      schedule != "monthly" &&
      schedule != "annual"
    )
      throw "schedule value is invalid";

    try {
      return db.execute("SELECT * FROM report_subscribers WHERE schedule = ?", [
        schedule,
      ]);
    } catch (err) {
      console.log("err@findByEmail: " + err);
      throw err;
    }
  }
};
