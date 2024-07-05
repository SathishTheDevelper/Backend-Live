const mongoose = require('mongoose')
const CANDIDATESSCHEMA =
 {

     job_id:{ type:mongoose.Schema.Types.ObjectId,ref:"jobs"},
     gender:String,
     dob:String,
     city:String,
     
     totalExperience:"String",
     ctc:String,
     expectedCtc:String,
     jobType:String,
     empStatus:String,
     prefLocation:String,
     roll_name:String,
     empStatus:String,
     candidate_id:String,
     first_name:String,
     last_name:String,
     to_exp_from:Number,
     mode_of_hiring:String,
     projects:[],
     workExperiences:[],
     educations:[],
     summary:String,
     address:String,
     resumeArray:[],
     EmployeeDocuments:[],
     PersonalDocuments:[],
     date_of_submission:Date,
     
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
     skillMatrix:[],
     preferred_location:[],  
     salary_type:String,
     client_id:{ type:mongoose.Schema.Types.ObjectId,ref:"clients"},
     company_id:{ type:mongoose.Schema.Types.ObjectId, ref:"company", default:null, },

     
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






      












     job_description:String,
     created_by:String,
     created_on:{
        type:Date,
        default:Date.now()
     }
   
     
    

    
};

module.exports = CANDIDATESSCHEMA