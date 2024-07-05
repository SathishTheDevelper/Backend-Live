const mongoose = require('mongoose')
const SPACESSCHEMA = {
   space_name:{type:String,required:true},
   created_by:{
  type:mongoose.Schema.Types.ObjectId, ref:"admin", default:null,

   },
   assigned_to:[],
  status: { type:Boolean, default:true },
   
     
    

    
};

module.exports = SPACESSCHEMA