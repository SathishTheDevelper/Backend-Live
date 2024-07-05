const mongoose = require("mongoose");
const companySChema = {
 
  organization:  String ,
  industry: { type: String },
  location: { type: String },
  address_sreet: { type: String },
  state: { type: String },
  pincode: { type: String },
  phone_number: { type: String },
  city: { type: String },
  company_id: { type: String },
  tax_id: { type: String },
  street:{type:String},
  logo:String,
 status:{
  type:Boolean,
  default:false
 },
  created_by:{ type:mongoose.Schema.Types.ObjectId, ref:"admin_login", default:null, },


};
module.exports = companySChema;
