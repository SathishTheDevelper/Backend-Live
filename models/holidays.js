const mongoose = require('mongoose')
const HOLLYDAYSSCHEMA = {
   
 
 title:String,
 StartTime:Date,
 EndTime:Date,
 day:String,
 description:String,
 year:Number,
 
  created_by:{
    type:mongoose.Schema.Types.ObjectId,ref:"admin",
  },

  status:{
    type:String,
    default:"publicholiday"
  }
  
   
     
    

    
};

module.exports = HOLLYDAYSSCHEMA