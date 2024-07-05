const mongoose = require('mongoose')
const ACCOUNTSSCHEMA = {
   name:{type:String},
   account_mobile:{type:String},
   company_stage:{type:String,default:"Cold"},
   location:String,
   website_url:String,
   phone:String,
   founded_year:Number,
   logo_url:String,
   industry:String,
   street_address:String,
   city:String,
   state:String,
   estimated_num_employees:Number,
   country:String,
   short_description:String,
   annual_revenue:Number,
   technology_names:Array,
   num_contacts:String,

   created_by:{ type:mongoose.Schema.Types.ObjectId,ref:"admin"},
   
   linkedin_url:String,
   twitter_url:String,
   facebook_url:String,
   primary_phone:Object,
  status: { type:Boolean, default:true },

    

    
};

module.exports = ACCOUNTSSCHEMA