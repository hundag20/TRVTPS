const fs = require('fs')
const csv = require('csv-parser')
const formidable = require('formidable');


exports.addMultiUsers = () => {
    const form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      const oldpath = files.filetoupload.filepath;
      console.log(oldpath);
      const newpath = 'C:/Users/Your Name/' + files.filetoupload.originalFilename;
      fs.rename(oldpath, newpath, function (err) {
        if (err) throw err;
        res.write('File uploaded and moved!');
        res.end();
      });
    });
}

//getProfileInfo
//editProfileInfo
//--not from user table but from ticket table
//getLastTicket
//getAllTicket  
//--
