const mongoose = require('mongoose')
const WorkingDaysSCHEMA = {
   
  year:Number,
  workingDays:[],

 
  created_by:{
    type:mongoose.Schema.Types.ObjectId,ref:"admin",
  },
  
   
     
    

    
};

module.exports = WorkingDaysSCHEMA