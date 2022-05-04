const jwt = require("jsonwebtoken");
let User = require("../model/UserModel.js");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");

dotenv.config();

//authenticate
const verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({
      message: "No token provided!",
    });
  }

  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!",
      });
    }
    req.uname = decoded.uname;
    req.role = decoded.role;
    next();
  });
};

const login = async (req, res, next) => {
  const userName = String(req.query.username);
  const password = String(req.query.password);
  //REMINDER: [plain] password showing on url

  if (!userName || !password) {
    return res.status(400).send({
      status: 400,
      error: "userName or password missing from request",
    });
  }
  //admin can't start with number and 'O'
  //find out about officer badge number or assifn arbitrary alphapet (O) infront of all officer unames...all driver unames  nums only.
  User.findOne(userName)
    .then(async (user) => {
      //if uname not found
      if (!user || user[0].length === 0) {
        return res.status(400).send({
          status: 400,
          error: "User Not found.",
        });
      }

      const pwdEntered = await bcrypt.hash(String(password), process.env.SALT);
      var passwordIsValid = pwdEntered === user[0][0].password;
      //if wrong password
      if (!passwordIsValid) {
        return res.status(400).send({
          status: 400,
          error: "Invalid Password!",
        });
      }

      //create new token
      var token = jwt.sign(
        { uname: user[0][0].username, role: user[0][0].role },
        process.env.SECRET,
        {
          expiresIn: 86400, //token will expire in 24 hours
        }
      );

      //return token and user data
      //REMINDER: the hashed password is being returned with userData, that's a no no
      res.status(200).send({
        userData: user[0][0],
        accessToken: token,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        status: 500,
        error: err.message,
      });
    });
};

const authJwt = {
  verifyToken: verifyToken,
  login: login,
  // isModerator: isModerator,
  // isModeratorOrAdmin: isModeratorOrAdmin,
};
module.exports = authJwt;

//----notes----
//NOTE: signup will not issue a token only login does, at signup worry abt bycrypt
//NOTE: ussd acts as a text service....JUSTIFY: besides no free txt service, also phone can be hacked to make app read a fake number, ussd prevents that.
//NOTE: login with jst license for ussd..at app they r asked pwd too, to get pwd they need to use ussd. at ussed, after loging in, there is an option for create/update pwd -> enter new pwd -> confirm new pwd -> success.

//TODO
//logout
