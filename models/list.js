const mongoose = require('mongoose')
const LISTSCHEMA = {
   name:{type:String,required:true},
  status: { type:Boolean, default:true },
  created_by:{ type:mongoose.Schema.Types.ObjectId,ref:"admin"},
  
   
     
    

    
};

module.exports = LISTSCHEMA