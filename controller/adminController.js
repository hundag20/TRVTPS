const fs = require('fs')
const path = require('path');
const csv = require('csv-parser');


exports.addMultiUsers = async(req, res, next) => {
  
    const role = req.body.role;
    fs.createReadStream(req.file.path)
  .pipe(csv())
  .on('data', async function (row) {
      console.log(row);
    if(role === 'admin'){
    await User.addAdmin(row);
    return res.sendStatus(200);
    }else if(role === 'driver'){
    return res.sendStatus(200);
    }else if(role === 'officer'){
    return res.sendStatus(200);
    }else{
         return res.sendStatus(400);
    }
   
  })
}

//addSingleUser
//editUserInfo
//addPolicy
//editPolicyInfo

//generateReport
//    -req 3 filters
//    -res: json
//    -downloadPdf
//subscriveToReport(not mvp)
//    -req 3 filters
//    -email(from profile + add subscribers) every [week/month] newly generated pdfs


//----------------------------//
//mvp1 sql_injection_unconsidered

//model side, controller side.