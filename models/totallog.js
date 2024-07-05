const mongoose = require("mongoose");
let Schema = mongoose.Schema;
const moment = require('moment-timezone');
var totallogsSchema = new mongoose.Schema(
  {
    job_id: {
        type: Schema.Types.ObjectId,
        ref: "jobs",
      },
      client_id: {
        type: Schema.Types.ObjectId,
        ref: "clients",
      },
    created_by:{
      type: Schema.Types.ObjectId,
      ref: "admin",
    },
    candidate_id: {
      type: Schema.Types.ObjectId,
      ref: "candidates",
    },
    status:String
   
  },
  {
    timestamps: true,
  }
);

module.exports = totallogsSchema
 


