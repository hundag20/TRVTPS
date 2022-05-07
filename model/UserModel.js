const db = require("../utils/database");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");

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
    console.log(this);
    // try {
    //back-end validation for sign-up
    if (!this.sex || !this.role) {
      throw new Error("required fields are missing");
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
    const newPwd = await bcrypt.hash(String(this.password), process.env.SALT);
    // console.log('entered pwd: ', String(this.password))
    // console.log('SALT: ', process.env.SALT)
    console.log("hash: ", newPwd);

    try {
      return db.execute(
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
    } catch (err) {
      return err;
    }
    // } catch (err) {
    //   console.log("err@sign-up: " + err);
    // }
  }

  static findOne(username) {
    try {
      return db.execute("SELECT * FROM user WHERE username = ? ", [username]);
    } catch (err) {
      console.log("err@findOne: " + err);
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

  static updateOne(uname, fieldName, fieldValue) {
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
    } catch (err) {
      console.log("err@Model@updateOne: " + err);
    }
  }

  static getStatus(id) {
    try {
      return db.execute("SELECT status FROM user WHERE id = ? ", [id]);
    } catch (err) {
      console.log("err@updateOne: " + err);
    }
  }
};

//TODO
// parametrize before queries
// backend validate pwd strength
// ---doc--- MAKE SURE OFFICER BADGE ID IS 5 DIGITS NUMBER
