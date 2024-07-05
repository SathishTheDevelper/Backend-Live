const mongoose = require('mongoose')
const THEMESCHEMA = {
   colorprimary:{type:String,required:true},
   colorsecondary:{type:String,required:true},
   font_family:String,
   font_size:String,
  company_id:{ type:mongoose.Schema.Types.ObjectId, ref:"company", default:null, },
  created_by:{ type:mongoose.Schema.Types.ObjectId, ref:"admin_login", default:null, },
  
 
   
     
    

    
};

module.exports = THEMESCHEMA