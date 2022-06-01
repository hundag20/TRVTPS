const db = require("../utils/database");
const User = require("../model/UserModel.js");

module.exports = class Ticket {
  constructor({ newTicket }) {
    this.issued_to = newTicket.license_id;
    this.issued_by = newTicket.officer_id;
    this.location = newTicket.location;
    //this.date = newTicket.date;
    //this.time = newTicket.time;
    this.date_time = Date.now();
    this.offence_level = newTicket.offence_level;
    this.offence_code = newTicket.offence_code;
    this.plate_num = newTicket.plate_num;
    this.remark = newTicket.remark;
  }
  async save() {
    //REMINDER sanitize, validate and parametrize

    //verify driver status is active
    //check that offence_level and offence_code are valid
    //verfiy license exists
    const user = await User.findOne(this.issued_to);
    if (!user || user[0].length === 0 || !user[0][0]) {
      throw "Driver with that license id doesn't exist";
    }
    if (user[0][0].status === "suspended") {
      throw "driver license is suspended";
    } else if (user[0][0].status != "active") {
      throw "driver has a pending ticket";
    }
    try {
      return db.execute(
        "INSERT INTO fine (issued_to, issued_by, location, date_time, offence_level, offence_code, plate_num, remark) VALUES (?,?,?,?,?,?,?,?)",
        [
          this.issued_to,
          this.issued_by,
          this.location,
          this.date_time,
          this.offence_level,
          this.offence_code,
          this.plate_num,
          this.remark,
        ]
      );
    } catch (err) {
      return err;
    }
  }
  static find(license_id) {
    if (!license_id) throw "passing undefined license id";
    try {
      const result = db.execute("SELECT * FROM fine WHERE issued_to = ? ", [
        license_id,
      ]);
      return result;
    } catch (err) {
      console.log("err@findOne: " + err);
      throw err;
    }
  }
  static findById(id) {
    if (!id) throw "no ticket id provided";
    try {
      const result = db.execute("SELECT * FROM fine WHERE id = ? ", [id]);
      return result;
    } catch (err) {
      console.log("err@findOne: " + err);
      throw err;
    }
  }
};

//TODO verfiy license exists
//TODO verify driver status is active
//TODO check that offence_level and offence_code are valid
