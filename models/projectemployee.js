const mongoose = require('mongoose')
const PROJECTEMPLOYESSSCHEMA = {
   project_id:{
     type:mongoose.Schema.Types.ObjectId,
     ref:"projects"
   },
   employee_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"employee"
   },
   job_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"jobs"
   },
   startDate:Date,
   endtDate:Date,
   client_billing:Number,
   clientbilling_salarytype:String,
   expected_Ctc_type:String,
   expected_ctc:Number,
   sow:String,
   client_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"clients"
  },
  date:[],
  status: { type:String, default:"Working" },
  created_by:{ type:mongoose.Schema.Types.ObjectId, ref:"admin_login", default:null, },

   
     
    

    
};

module.exports = PROJECTEMPLOYESSSCHEMA