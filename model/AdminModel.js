const db = require("../utils/database");
const md5 = require("md5");
const dotenv = require("dotenv");

dotenv.config();

module.exports = class Admin {
  static findOne(email) {
    if (!email) throw "passing undefined value for searching admin";
    try {
      const result = db.execute("SELECT * FROM users WHERE email = ? ", [
        email,
      ]);
      return result;
    } catch (err) {
      console.log("err@findOne: ", err);
      throw err;
    }
  }

  static async updateOne(email, fieldName, fieldValue) {
    if (!email || !fieldName || (fieldValue != 0 && !fieldValue))
      throw "incomplete information given";
    try {
      if (fieldName === "password") {
        //validate pwd appropirateness
        if (fieldValue.includes("*") || fieldValue.length < 8) {
          //* is problematic when changinf pwd with ussd
          throw "invalid password";
        }
        //hash and salt
        const newPwd = await md5(fieldValue);
        const result = db.execute(
          "UPDATE users SET password = ? WHERE email = ? ",
          [newPwd, email]
        );
        return result;
      }
    } catch (err) {
      console.log("err@Model@updateOne: " + err);
      throw err;
    }
  }
};
