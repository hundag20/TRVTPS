const db = require("../utils/database");

module.exports = class Ticket {
  constructor({ newTicket }) {
    this.issued_to = newTicket.license_id;
    this.issued_by = newTicket.officer_id;
    this.location = newTicket.location;
    this.date = newTicket.date;
    this.time = newTicket.time;
    this.offence_level = newTicket.offence_level;
    this.offence_code = newTicket.offence_code;
    this.plate_num = newTicket.plate_num;
    this.remark = newTicket.remark;
  }
  async save() {
    //verfiy license exists
    //verify driver status is active
    //check that offence_level and offence_code are valid
    try {
      return db.execute(
        "INSERT INTO fine (issued_to, issued_by, location, date, time, offence_level, offence_code, plate_num, remark) VALUES (?,?,?,?,?,?,?,?,?)",
        [
          this.issued_to,
          this.issued_by,
          this.location,
          this.date,
          this.time,
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
};
