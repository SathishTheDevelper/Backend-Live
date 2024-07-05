const mongoose = require('mongoose')

const WORKEXPERIENCE_SCHEMA = {

    employee_id : String,

    jobType :String,
    designation : String,
    employer_name : String,
    company_name : String,
   
    location: String,
    employer_addr : String,
    mobile_no : String,
    joining_date : Date,
    seperation_date : Date,
    seperation_reason : String,
    payslip_reason : String,
    
    offer_letter : {
        type: String,
        default: undefined
    },
    seperation_letter : {
        type: String,
        default: undefined
    },
    pay_slip_01 : {
        type: String,
        default: undefined
    },
    pay_slip_02 : {
        type: String,
        default: undefined
    },
    pay_slip_03 : {
        type: String,
        default: undefined
    },
    hike_letter : {
        type: String,
        default: undefined
    },
    
};

module.exports = WORKEXPERIENCE_SCHEMA