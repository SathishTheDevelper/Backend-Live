const {admin} = require('../utils/schemaMaster');
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const authAdmin = asyncHandler(async (req, res, next)=>{
  let token;
  if (req?.headers?.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(" ")[1];
    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin_check = await admin.findById(decoded?.id);
        if(admin_check){
           console.log(" http://localhost:5173/",admin_check)
          req.user = admin_check;
          req.body.created_by = admin_check._id;
          req.body.company_id =admin_check?.company_id;
          next();
        }
        else {
      throw new Error("Not Authorized token expired, Please Login again");
           
        }
     
        
      }
    } catch (error) {
      throw new Error("Not Authorized token expired, Please Login again");
    }
  } else {
    throw new Error("There is no token attached to header");
  }
});

module.exports = { authAdmin };