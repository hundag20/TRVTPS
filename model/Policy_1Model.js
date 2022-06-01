const db = require("../utils/database");

module.exports = class Policy_1 {
  static find() {
    try {
      const result = db.execute("SELECT * FROM policy_1");
      return result;
    } catch (err) {
      console.log("err@findOne: " + err);
      throw err;
    }
  }
};
