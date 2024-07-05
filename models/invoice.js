const mongoose = require('mongoose')
const InvoiceSchema = {

    client_id: { type:mongoose.Schema.Types.ObjectId,ref:"clients"},
    invoice_number: String,
    order_number: String,
    invoice_date: Date,
    terms: String,
    due_date: Date,
    paid_amount:String,

    subject: String,
    list_items: {
        type: Array,
        default : undefined,
    },
    tableData:[],
    total_amount:String,
    sub_total:String,
    igst_amount:String,

    customer_notes: String,
    adjustments: Number,
    terms_and_conditions: String,
    invoice_attachment: {
        type : Object,
        default : undefined
    },
    invoice_status:{ type:String, enum:["Draft","Overdue","Paid","Withheld","Sent"] },
    invoice_tds: String,
    total_bill: Number,
    status:String,
  created_by:{ type:mongoose.Schema.Types.ObjectId, ref:"admin_login", default:null, },

};

module.exports = InvoiceSchema