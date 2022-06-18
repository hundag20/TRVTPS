const db = require("../utils/database");

module.exports = class Announcement {
  constructor({ newNews }) {
    this.announced_by = newNews.announced_by;
    this.date = Date.now();
    this.roles = newNews.roles || "all";
    this.message = newNews.message;
  }
  async save() {
    //REMINDER sanitize, validate and parametrize

    if (!this.message || !this.announced_by || !this.date) {
      throw "required fields are missing";
    }
    if (this.message.length > 192) {
      throw "message_limit";
    }
    try {
      const result = db.execute(
        "INSERT INTO announcement (announced_by, date, roles, message) VALUES (?,?,?,?)",
        [this.announced_by, this.date, this.roles, this.message]
      );
      return result;
    } catch (err) {
      throw err;
    }
  }
  static getAll() {
    try {
      const result = db.execute("SELECT * FROM announcement");
      return result;
    } catch (err) {
      console.log("err@getAll: " + err);
      throw err;
    }
  }
  static getAllFor(roles) {
    if (!roles) throw "incomplete information given";
    try {
      const result = db.execute(
        "SELECT * FROM announcement WHERE roles = ? OR roles = 'all'",
        [roles]
      );
      return result;
    } catch (e) {
      console.log("err@getAll: " + err);
      throw err;
    }
  }
};
