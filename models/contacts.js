const mongoose = require('mongoose')
const CONTACTSSCHEMA = {
   first_name:{type:String},
   last_name:{type:String},
   name:String,
   stage:{type:String},
   title:{type:String},
   email_status:String,
   list_id:{ type:mongoose.Schema.Types.ObjectId,ref:"lists"},
   photo_url:String,
   logo_url:String,
   employment_history:Array,
   phone_numbers:Array,
   employment_history:Array,
 
   state:String,
   city:String,
   country:String,
 
   linkedin_url:String,
  status: { type:Boolean, default:true },
   email_id:{type:String},
   industry:String,
   email_Status:String,
   contact_owner:{ type:mongoose.Schema.Types.ObjectId,ref:"admin"},
    phone_no:{type:String},
    account_id:{ type:mongoose.Schema.Types.ObjectId,ref:"accounts"},
    stage:{
         type:String,
         default:"Cold"
    }

    
};

module.exports = CONTACTSSCHEMA