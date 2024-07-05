const mongoose = require('mongoose')
const MENUS = {
   name:{type:String,unique:true,required:true},
   url:String,
   
  contact_persons:[],
  created_by:{ type:mongoose.Schema.Types.ObjectId, ref:"admin_login", default:null, },
   
     
    

    
};

module.exports = MENUS