const mongoose = require("mongoose");
let Schema = mongoose.Schema;

var logsSchema = new mongoose.Schema(
  {
    userid: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    intime: {
      type: Date,
      require: true,
      default:Date.now(),
    },
    outtime: {
      type:Date,
    },
    status: {
      type: String,
      default:'o',
    }
  },
  {
    timestamps: true,
  }
);



module.exports = mongoose.model("Logs", logsSchema);
