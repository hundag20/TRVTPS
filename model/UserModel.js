const db = require("../utils/database");
const md5 = require("md5");
const dotenv = require("dotenv");
const res = require("express/lib/response");

dotenv.config();

module.exports = class User {
  constructor({ newUser }) {
    this.username = newUser.username;
    this.password = newUser.password;
    this.status = newUser.status || "NOT_APPLICABLE";
    this.first_name = newUser.first_name;
    this.middle_name = newUser.middle_name;
    this.last_name = newUser.last_name;
    this.phone_num = newUser.phone_num;
    this.email = newUser.email || "NOT_APPLICABLE";
    this.role = newUser.role;
    this.level = newUser.level || "NOT_APPLICABLE";
    this.region = newUser.region || "NOT_APPLICABLE";
    this.authority = newUser.authority || "NOT_APPLICABLE";
    this.yob = newUser.yob || 0;
    this.nationality = newUser.nationality || "NOT_APPLICABLE";
    this.subcity = newUser.subcity || "NOT_APPLICABLE";
    this.woreda = newUser.woreda || "NOT_APPLICABLE";
    this.sex = newUser.sex;
  }

  async save() {
    //back-end validation for sign-up
    if (!this.sex || !this.role) {
      throw "required fields are missing";
    }
    if (this.password.includes("*") || this.password.length < 8) {
      //* is problematic when changinf pwd with ussd
      throw "invalid password";
    }
    if (this.role === "admin" && !isNaN(this.username.charAt(0))) {
      throw "username can not begin with a number!";
    }
    if (
      this.role === "officer" &&
      (isNaN(this.username) || this.username.length != 5)
    )
      throw "username is invalid!";
    if (
      this.role === "driver" &&
      (isNaN(this.username) || this.username.length != 6)
    )
      throw "username is invalid!";
    if (this.role === "driver") {
      this.status = "active";
    }
    //becrypt enc password before inserting into db, but need to decrypt cuz req holds encrypted pwd.
    // now we set user password to hashed password
    const newPwd = await await md5(this.password);
    // console.log('entered pwd: ', String(this.password))
    // console.log('SALT: ', process.env.SALT)
    try {
      const result = db.execute(
        "INSERT INTO user (username, password, status, first_name, middle_name, last_name, phone_num, sex, role, email, level, region, authority, yob, nationality, subcity, woreda) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        [
          this.username,
          newPwd,
          this.status,
          this.first_name,
          this.middle_name,
          this.last_name,
          this.phone_num,
          this.sex,
          this.role,
          this.email,
          this.level,
          this.region,
          this.authority,
          this.yob,
          this.nationality,
          this.subcity,
          this.woreda,
        ]
      );
      return result;
    } catch (err) {
      throw err;
    }
    // } catch (err) {
    //   console.log("err@sign-up: " + err);
    // }
  }

  static findOne(username) {
    if (!username) throw "passing undefined value for searching user";
    try {
      const result = db.execute("SELECT * FROM user WHERE username = ? ", [
        username,
      ]);
      return result;
    } catch (err) {
      console.log("err@findOne: ", err);
      throw err;
    }
  }

  static fetchFirstMatch(type, sex) {
    try {
      if (type === "casual")
        return db.execute(
          'SELECT * FROM user WHERE status = "looking" LIMIT 1'
        );
      if (type === "date")
        return db.execute(
          'SELECT * FROM user WHERE sex = ? AND status = "looking" LIMIT 1',
          [sex]
        );
    } catch (err) {
      console.log("err@updateOne: " + err);
    }
  }

  static async updateOne(uname, fieldName, fieldValue) {
    if (!uname || !fieldName || (fieldValue != 0 && !fieldValue))
      throw "incomplete information given";
    try {
      if (fieldName === "name")
        return db.execute("UPDATE user SET username = ? WHERE id = ? ", [
          fieldValue,
          id,
        ]);
      if (fieldName === "desc")
        return db.execute("UPDATE user SET descr = ? WHERE id = ? ", [
          fieldValue,
          id,
        ]);
      if (fieldName === "status")
        return db.execute("UPDATE user SET status = ? WHERE username = ? ", [
          fieldValue,
          uname,
        ]);
      if (fieldName === "first_time")
        return db.execute(
          "UPDATE user SET first_time = ? WHERE username = ? ",
          [fieldValue, uname]
        );
      if (fieldName === "suspended_for")
        return db.execute(
          "UPDATE user SET suspended_for = ? WHERE username = ? ",
          [fieldValue, uname]
        );
      if (fieldName === "points")
        return db.execute("UPDATE user SET points = ? WHERE username = ? ", [
          fieldValue,
          uname,
        ]);
      if (fieldName === "password") {
        //validate pwd appropirateness
        if (fieldValue.includes("*") || fieldValue.length < 8) {
          //* is problematic when changinf pwd with ussd
          throw "invalid password";
        }
        //hash and salt
        const newPwd = await await md5(String(fieldValue));
        const result = db.execute(
          "UPDATE user SET password = ? WHERE username = ? ",
          [newPwd, uname]
        );
        return result;
      }
    } catch (err) {
      console.log("err@Model@updateOne: " + err);
      throw err;
    }
  }

  static getStatus(id) {
    if (!id) throw "incomplete information given to return driver's satus";
    try {
      return db.execute("SELECT status FROM user WHERE id = ? ", [id]);
    } catch (err) {
      console.log("err@updateOne: " + err);
    }
  }
  static getPwds() {
    try {
      const result = db.execute("SELECT password FROM user");
      return result;
    } catch (err) {
      console.log("err@updateOne: " + err);
    }
  }
  static getAll() {
    try {
      const result = db.execute("SELECT * FROM user");
      return result;
    } catch (err) {
      console.log("err@updateOne: " + err);
    }
  }
};

//TODO
// parametrize before queries
// backend validate pwd strength
// ---doc--- MAKE SURE OFFICER BADGE ID IS 5 DIGITS NUMBER

//NOTE (bug with mysql err handling) "TypeError: Bind parameters must not contain undefined. To pass SQL NULL specify JS null" type errors (caused by null values) are uncatchable by any try/catch blocks so make sure undefined never passes to that statement
