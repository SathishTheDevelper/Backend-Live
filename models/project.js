const mongoose = require('mongoose')
const PROJECTSSCHEMA = {
   project_name:{type:String},
   client_id:{ type:mongoose.Schema.Types.ObjectId,ref:"clients"},
   employees_need:Number,
   sow:String,
   endDate:Date,
   startDate:Date,
   status:{
      type:String, default:"Ongoing", enum:["Ongoing","Completed"]
   },
  created_by:{ type:mongoose.Schema.Types.ObjectId, ref:"admin_login", default:null, },

   
     
    

    
};

module.exports = PROJECTSSCHEMA