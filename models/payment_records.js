const mongoose = require('mongoose')
const RecordPaymentSchema = {

    invoice_id: { type:mongoose.Schema.Types.ObjectId,ref:"invoice"},
    received_amount: Number,
    bank_charges: Number,

    tax_deducted: Number,
    tds_tax_account: String,
    amount_withheld: Number,
    exchange_rate: Number,

    payment_date: Date,
    payment_mode: String,
    deposit_to: String,
    payment_reference: String,
    payment_notes: String,
    total_amount: Number,
  created_by:{ type:mongoose.Schema.Types.ObjectId, ref:"admin_login", default:null, },

};

module.exports = RecordPaymentSchema