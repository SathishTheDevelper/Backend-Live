const mongoose = require('mongoose')
const GOALSSECHEMA = {
   goaltype_name:{type:String,required:true},
   assigned:[],
  
  created_by:{ type:mongoose.Schema.Types.ObjectId, ref:"admin_login", default:null, },
     
  
   
 
   
     
    

    
};

module.exports = GOALSSECHEMA