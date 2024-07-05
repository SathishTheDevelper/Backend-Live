const mongoose = require('mongoose')
const SPACESLISTSCHEMA = {
   list_name:{type:String},
   created_by:{
  type:mongoose.Schema.Types.ObjectId, ref:"admin", default:null,

   },
   space_id:{
  type:mongoose.Schema.Types.ObjectId, ref:"space", default:null,
     
   },
  status: { type:Boolean, default:true },
   
     
    

    
};

module.exports = SPACESLISTSCHEMA