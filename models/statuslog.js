const mongoose = require("mongoose");
let Schema = mongoose.Schema;
const moment = require('moment-timezone');
var statuslogsSchema = new mongoose.Schema(
  {
    candidate_id: {
      type: Schema.Types.ObjectId,
      ref: "candidates",
    },
    children:[{
        status:String,
        created_by:{
            type: Schema.Types.ObjectId,
            ref: "admin",
          },
          createdAt :{
            type:Date ,default:()=>moment().tz('Asia/Kolkata'),
          }
    }],
   
  },
  {
    timestamps: true,
  }
);

module.exports = statuslogsSchema
 


