const mongoose = require('mongoose')
const ExpenseSchema = {

    expense_type : String,
    employee_id : { type:mongoose.Schema.Types.ObjectId,ref:"employee"},
    expense_cost : Number,
    expense_date : Date,
    expense_desc : String,  
    expense_attachment :String,
    others_type:String,
  created_by:{ type:mongoose.Schema.Types.ObjectId, ref:"admin_login", default:null, },


};

module.exports = ExpenseSchema