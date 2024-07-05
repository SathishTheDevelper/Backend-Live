const mongoose = require('mongoose')
const EVENTSCHEMA = {
   
  StartTime: Date,
  EndTime: Date,
  client_id: {
    type:mongoose.Schema.Types.ObjectId,ref:"clients",
  },
  days_worked:{
    type:Number,
    default:1
  },
  project_id: {
    type:mongoose.Schema.Types.ObjectId,ref:"projects",
  },
  employee_id:{
    type:mongoose.Schema.Types.ObjectId,ref:"admin",
  },
  logged_houres:String, 
  status:{
     type:String,
    //  default:"leave"
  },
  startend_time:Array,
  type:{
    type:String,
   default:"Pending"


  },
  IsBlock:{
    type:Boolean,
  //  default:true


  },
  
leave_title:String,
leave_id:String,
created_by:{ type:mongoose.Schema.Types.ObjectId, ref:"admin_login", default:null, },


  timesheet:String
   
     
    

    
};

module.exports = EVENTSCHEMA