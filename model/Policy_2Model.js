const db = require("../utils/database");

module.exports = class Policy_2 {
  static find() {
    try {
      const result = db.execute("SELECT * FROM policy_2");
      return result;
    } catch (err) {
      console.log("err@findOne: " + err);
      throw err;
    }
  }
};
