const path = require("path");
const jwt = require("jsonwebtoken");
let User = require("../model/UserModel.js");
let Admin = require("../model/AdminModel.js");
const md5 = require("md5");
const dotenv = require("dotenv");

dotenv.config();

const genToken = async (tokenObject) => {
  // create a unique token
  var secret = process.env.SECRET;
  const token = jwt.sign(tokenObject, secret);
  return token;
};

//authenticate
const verifyToken = (req, res, next) => {
  let token = req.query.x_access_token;

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
  const userName = req.query.username;
  const password = req.query.password;
  //REMINDER: [plain] password showing on url

  if (!userName || !password) {
    return res.status(400).send({
      status: 400,
      error: "userName or password missing from request",
    });
  }
  //admin can't start with number and 'O'
  //find out about officer badge number or assifn arbitrary alphapet (O) infront of all officer unames...all driver unames  nums only.
  try {
    const user = await User.findOne(userName);
    //if uname not found
    if (user[0].length === 0) {
      return res.status(400).send({
        status: 400,
        error: "User Not found.",
      });
    }

    const pwdEntered = await await md5(String(password));
    var passwordIsValid = pwdEntered === user[0][0].password;
    //if wrong password
    if (!passwordIsValid || user[0][0].password === "inactive") {
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
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: 500,
      error: err.message,
    });
  }
};

const resetPage = async (req, res, next) => {
  const token = req.query.token;
  const uname = req.query.uname;

  if (token && uname) {
    res.render("resetpage", {
      token: token,
      uname: uname,
    });
  } else {
    res.send("<html><body>404</body</html>");
  }
};

const resetPwd = async (req, res, next) => {
  try {
    const token = req.body.token;
    const uname = req.body.uname;
    const newPassword = req.body.newPassword;

    jwt.verify(token, process.env.SECRET, (err, decoded) => {
      if (err || decoded.uname != uname) {
        return res.status(401).send({
          message: "invalid token!",
        });
      }

      //update user pwd here
      User.updateOne(uname, "password", newPassword)
        .then(() => {
          res.render("resetSuccess");
        })
        .catch((e) => {
          console.log(e);
          return res.status(500).send({
            message: "something went wrong",
          });
        });
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send({
      message: "something went wrong",
    });
  }
};

const resetPage2 = async (req, res, next) => {
  const token = req.query.token;
  const email = req.query.email;

  if (token && email) {
    res.render("resetpage2", {
      token: token,
      email: email,
    });
  } else {
    res.send("<html><body>404</body</html>");
  }
};

const resetPwd2 = async (req, res, next) => {
  try {
    const token = req.body.token;
    const email = req.body.email;
    const newPassword = req.body.newPassword;
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
      if (err || decoded.email != email) {
        return res.status(401).send({
          message: "invalid token!",
        });
      }

      //update user pwd here
      Admin.updateOne(email, "password", newPassword)
        .then(() => {
          res.render("resetSuccess");
        })
        .catch((e) => {
          console.log(e);
          return res.status(500).send({
            message: "something went wrong",
          });
        });
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send({
      message: "something went wrong",
    });
  }
};

const authJwt = {
  verifyToken: verifyToken,
  login: login,
  resetPwd: resetPwd,
  resetPwd2: resetPwd2,
  resetPage: resetPage,
  resetPage2: resetPage2,
  genToken: genToken,
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

//REMINDER: token already expiring after some time, find out number
