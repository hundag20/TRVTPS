const db = require("../utils/database");

module.exports = class Policy_3 {
  static find() {
    try {
      const result = db.execute("SELECT * FROM policy_3");
      return result;
    } catch (err) {
      console.log("err@findOne: " + err);
      throw err;
    }
  }
};
