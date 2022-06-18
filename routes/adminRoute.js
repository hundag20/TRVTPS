const path = require("path");
const multer = require("multer");
const upload = multer({ dest: path.join(__dirname, "../temp") });

const express = require("express");

const adminController = require("../controller/adminController");
const report = require("../controller/reportController");
const auth = require("../middleware/auth.js");

const router = express.Router();

//admin endpoints

router.get("/ts/admin/getReports", report.getReports);

router.get("/ts/admin", auth.verifyToken, (req, res, next) => {
  res.send(`your role is: ${req.userId}`);
});
router.get(
  "/ts/admin/addUsersFile",
  upload.single("file"),
  adminController.addMultiUsers
);
router.get("/ts/admin/login", auth.login);
router.get(
  "/ts/admin/addUser",
  auth.verifyToken,
  //verify role is admin
  (req, res, next) => {
    if (req.role != "admin") {
      res.send({
        status: 400,
        error: "you don't have admin authorization",
      });
    } else next();
  },
  adminController.addSingleUser
);
router.get(
  "/ts/admin/addNews",
  auth.verifyToken,
  //verify role is admin
  (req, res, next) => {
    if (req.role != "admin") {
      res.send({
        status: 400,
        error: "you don't have admin authorization",
      });
    } else next();
  },
  adminController.addNews
);
module.exports = router;
