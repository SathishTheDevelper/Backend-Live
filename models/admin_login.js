const mongoose = require("mongoose");
const admin_schema = {
  name: String,
  phone_number: { type: Number, },
  email_id: { type: String, required: true, unique: true },
  role:{type:String,default:"HR"},
  password: { type: String, required: true },
  created_at: { type: Date, default: Date.now( ) },
  permission:{ type:mongoose.Schema.Types.ObjectId, ref:"roles"},
  status: { type: Boolean, default: true },
  reportmanager:[{}],
  salary_type:String,
  company_id:{ type:mongoose.Schema.Types.ObjectId, ref:"company", default:null, },
  created_by:{ type:mongoose.Schema.Types.ObjectId, ref:"admin_login", default:null, },
  client_id:{ type:mongoose.Schema.Types.ObjectId, ref:"clients", default:null, },
  parent_id :{ type:mongoose.Schema.Types.ObjectId, ref:"teams", default:null, },
  goaltypes:[
    {type:mongoose.Schema.Types.ObjectId, ref:"goaltypes", default:null}
  ],
 cc:[ {}],
};
module.exports = admin_schema;
