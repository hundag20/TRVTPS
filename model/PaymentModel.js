const db = require("../utils/database");

module.exports = class Payment {
  constructor({ newPayment }) {
    console.log(newPayment);
    this.ticket_id = newPayment.ticket_id;
    this.amount = newPayment.amount;
  }
  async save() {
    //REMINDER sanitize, validate and parametrize
    if (!this.ticket_id || (this.amount != 0 && !this.amount))
      throw "passing undefined value for creating new payment";
    try {
      const result = db.execute(
        "INSERT INTO payment (ticket_id, amount) VALUES (?,?)",
        [this.ticket_id, this.amount]
      );
      return result;
    } catch (e) {
      throw e;
    }
  }
};
