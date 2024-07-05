const mongoose = require('mongoose')
const ENDCLIENTSCHEMA = {
   name:{type:String,unique:true,required:true},
  status: { type:Boolean, default:true },
  client_id: {type:mongoose.Schema.Types.ObjectId,ref:"clients"},
   
     
    

    
};

module.exports = ENDCLIENTSCHEMA