const Ann = require("../model/AnnouncementModel");
const html = require("html-entities");

exports.getAnnouncements = (req, res, send) => {
  try {
    //return last ticket or x num of announcements based on req
    const role = req.role;
    if (role != "driver" && role != "officer") {
      throw "no role provided";
    }
    Ann.getAllFor(`${role}s`)
      .then((announcements) => {
        if (announcements && announcements[0] && announcements[0].length != 0) {
          announcements[0].map((el) => {
            el.message = html.decode(el.message);
          });
          return res.status(200).send({
            status: 200,
            allAnnouncements: announcements[0].reverse(),
          });
        } else {
          return res.status(400).send({
            status: 400,
            message: "no announcements",
          });
        }
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).send({
          status: 500,
          message: "something went wrong",
        });
      });
  } catch (e) {
    console.log(e);
    myLogger.log(e);
    return res.status(500).send({
      status: 500,
      message: "internal error",
    });
  }
};
