const mongoose = require('mongoose')
const LEAVEREQUESTSSCHEMACHEMA = {
   
    leave_id:{ type:mongoose.Schema.Types.ObjectId,ref:"leaves"},
   employee_id:{ type:mongoose.Schema.Types.ObjectId,ref:"admin"},
  no_of_days:Number,
  startDate:Date,
  endDate:Date,

 
  reason:String,
  approved_by:{ type:mongoose.Schema.Types.ObjectId,ref:"admin"},
 
  status:{
    type:String,
    default:"Pending"
  },
   
     
    

    
};

module.exports = LEAVEREQUESTSSCHEMACHEMA