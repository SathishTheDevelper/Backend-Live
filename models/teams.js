const mongoose = require('mongoose')
const TEAMSSCHEMA = {
   team_name:{type:String,required:true},
   parent_id :{
    type:mongoose.Schema.Types.ObjectId, ref:"teams", default:null,
   },
  
  created_by:{ type:mongoose.Schema.Types.ObjectId, ref:"admin_login", default:null, },
     
  
   
 
   
     
    

    
};

module.exports = TEAMSSCHEMA