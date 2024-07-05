const mongoose = require("mongoose");
let Schema = mongoose.Schema;
const moment = require('moment-timezone');
var InterviewSchema = new mongoose.Schema(
  {
    candidate_id: {
      type: Schema.Types.ObjectId,
      ref: "candidatelogs",
    },
    date:{
       type:Date ,default:Date.now()
    },
    starttime:{
      type:Date
    },
    endtime:{
        type:Date
    },
    status:{
       type:String,
       default :"L1 Schdule"
    },
    feedback:String,
  created_by:{ type:mongoose.Schema.Types.ObjectId, ref:"admin_login", default:null, },

   
  },
  
  {
    timestamps: true,
  }
);

module.exports = InterviewSchema
 


