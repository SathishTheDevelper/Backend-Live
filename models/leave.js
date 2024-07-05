const mongoose = require('mongoose')
const LEAVESCHEMA = {
   
  leave_title:String,
  applicable_days:Number,

 
  description:String,
  status:String,
  created_by:{ type:mongoose.Schema.Types.ObjectId, ref:"admin_login", default:null, },
   
     
    

    
};

module.exports = LEAVESCHEMA