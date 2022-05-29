const db = require("../utils/database");

module.exports = class Ussd {
  constructor({ newUssd }) {
    this.session_id = newUssd.session_id;
    this.license_id = newUssd.license_id;
  }
  async save() {
    //REMINDER sanitize, validate and parametrize

    if (!this.session_id || !this.license_id) {
      throw "required fields are missing";
    }
    try {
      const result = db.execute(
        "INSERT INTO ussd (session_id, license_id) VALUES (?,?)",
        [this.session_id, this.license_id]
      );
      return result;
    } catch (err) {
      throw err;
    }
  }
  static find(session_id) {
    if (!session_id) throw "passing undefined license id";
    try {
      const result = db.execute("SELECT * FROM ussd WHERE session_id = ? ", [
        session_id,
      ]);
      return result;
    } catch (err) {
      console.log("err@findOne: " + err);
      throw err;
    }
  }
};
