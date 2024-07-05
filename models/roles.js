const mongoose = require('mongoose')
const ROLESSCHEMA = {
name:String,
  
Clients:[String],
Profile:[String],
Accounts:[String],
Employee:[String],
FileManager:[String],
ZiveX:[String],
Candidates:[String], 
Jobs:[String],
Leaves:[String],
Reports:[String],
Timesheet:[String],
UserManagement:[String],
UserSettings:[String],
AddCandidate:[String],
Contacts:[String],
Company:[String],
parent_id :{
  type:mongoose.Schema.Types.ObjectId, ref:"roles", default:null,
 },

 
    status:{
      type:Boolean,default:true
    }
   
     
    

    
};

module.exports = ROLESSCHEMA