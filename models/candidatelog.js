const mongoose = require('mongoose')
const CANDIDATELOGSSCHEMA = {

  job_id:{ type:mongoose.Schema.Types.ObjectId,ref:"jobs"},
  gender:String,
  dob:String,
  city:String,
  candidateoriginal_id:{type:mongoose.Schema.Types.ObjectId,ref:"candidates"},
  attachment_name:String,
  totalExperience:"String",
  ctc:String,
  expectedCtc:String,
  skillMatrix:[],

  jobType:String,
  empStatus:String,
  prefLocation:String,
  empStatus:String,
  candidate_id:String,
  first_name:String,
  last_name:String,
  to_exp_from:Number,
  mode_of_hiring:String,
  roll_name:String,
  projects:[],
  workExperiences:[],
  educations:[],
  summary:String,
  address:String,


  
  to_exp_to:Number,
  re_exp_from:Number,
  skills:[],
  re_exp_to:Number,
  client_billing:Number,
  email_id:String,
  phone_no:String,
  candidateskills:[],
  mode_of_hiring:String,
  current_location:String,
  preferred_location:[],
  salary_type:String,
//   total_experience:String,
//   relevent_experience:String,
  current_ctc:Number,
  expected_ctc:Number,
  notice_period:String,
  offer_details:String,
  resume:String,
  status:{
  type:String, default:"Submitted"
  },
  candidate_owner:{type:mongoose.Schema.Types.ObjectId, ref:"admin"},
  company_id:{ type:mongoose.Schema.Types.ObjectId, ref:"company", default:null, },







   












  job_description:String,
  created_by:String,
  created_on:{
     type:Date,
     default:Date.now()
  }
     
    

    
};

module.exports = CANDIDATELOGSSCHEMA