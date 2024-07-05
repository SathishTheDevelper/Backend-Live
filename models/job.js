const mongoose = require('mongoose')
const JOBSSCHEMA = {

     job_id:String,
     job_title:String,
     job_type:String,
     exp_to:Number,
     exp_from:Number,
     vendor_clientbillable:Number,
     vendor_job_type:String,
     vendor_salary_type:String,
     end_client:[String],
     client_id:[{ type:mongoose.Schema.Types.ObjectId,ref:"clients"}],
     job_location:[String],
     joing_avaliability:String,
     salary:Number,
     skils:[String],
     salaryType:{
      type:String,
      default:"",
     },
     poc:[],
     required_no_of_candidates:Number,
     job_description:String,
     created_by:{ type:mongoose.Schema.Types.ObjectId,ref:"admin"},
     company_id:{ type:mongoose.Schema.Types.ObjectId, ref:"company", default:null, },

     created_on:{
        type:Date,
        default:Date.now()
     },
     assigneddata :[
      {
      
       assign:  {type:mongoose.Schema.Types.ObjectId, ref:"admin", default:null, },
       vendor_salary_type:String,
       vendor_job_type:String,
       vendor_clientbillable:Number
      }
     ],
     assign:[{
      
       type:mongoose.Schema.Types.ObjectId, ref:"admin", default:null, }],

  status: { type:String, default:"opened", enum:["opened","closed","Hold"] },
   
     
    

    
};

module.exports = JOBSSCHEMA