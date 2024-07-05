const mongoose = require('mongoose')
const HRLOGGED = {

total_logged_hours:String,
loginhour:String,
logouthour:String,
break_logged_hours:String,
employee_id:{type:mongoose.Schema.Types.ObjectId,ref:"admin"},
status:{
  type:String,
  default:"NonBillable"
},
type:{
    type:String,
    default:"Pending"
},
StartTime: Date,
EndTime: Date,
leave_id:{type:mongoose.Schema.Types.ObjectId,ref:"leaverequests"},

   
     
    

    
};

module.exports = HRLOGGED