const mongoose = require('mongoose')
const CLIENTSSCHEMA = {
  name:{type:String,unique:true,required:true},
  p_fisrt_name:String,
  p_last_name:String,
  email_id:String,
  phone_no:String,
  address:String,
  country:String,
  internal_contact:String,
  state:String,
  city:String,
  zip_code:String,
  currency:String,
  payment_terms:String,
  fulltime_commission:Number,
  shipping_address:[],
  billing_address:[],
parent:{type:mongoose.Schema.Types.ObjectId,ref:"clients",

 default:null},
 company_id:{ type:mongoose.Schema.Types.ObjectId, ref:"company", default:null, },

  contact_persons:[],
  created_by:{ type:mongoose.Schema.Types.ObjectId, ref:"admin_login", default:null, },

   
     
    

    
};

module.exports = CLIENTSSCHEMA