const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const { expense,employee,workexperience, clients, projectemployess, event, invoice } = require("../../utils/schemaMaster");
const { success } = require("../../utils/response");
const crud_service = require("../../utils/crud_service");
const validateId = require('../../utils/validateId');
const { authAdmin } = require('../../middlewares/authMiddlewares');
const multer = require('multer')
const upload = multer({limits:{fieldSize:25*1024*1024}})
const crud = new crud_service();
const pdf = require('pdf-thumbnail');

const fs = require('fs');
const { default: mongoose } = require("mongoose");
const { SendMailClient } = require("zeptomail");

// const pdfBuffer = fs.readFileSync("uploads/1692782448188sample.pdf");

const methods ={authAdmin}


//Get All - Employees Name
methods.getAll=asyncHandler(async (req, res) => {

    const {user_id} = req.params

    let fileProjection = {
        "user_id":1,
        "firstname":1,
        "lastname":1,
        "aadhar_file":1,
        "pan_file":1,
        "display_profile_file":1,
        "cheque_file":1,
        "authorization_form":1,
        "verification_form":1,
        "ssc_file":1,
        "hsc_file":1,
        "degree_file":1,
        "educationDetails":1,
    }

    let experienceProj = {
        "offer_letter":1,
        "seperation_letter":1,
        "pay_slip_01":1,
        "pay_slip_02":1,
        "pay_slip_03":1,
        "hike_letter":1,
        "employer_name":1
    }

    const personal_files = await crud.getDocument(employee,{"user_id":user_id}, {...fileProjection}, {});
    const experience_files = await crud.getDocument(workexperience, {"employee_id":user_id},{...experienceProj},{})

    //console.log("file mngr:",fileCategorized)

    let sample_obj = personal_files[0]
    let aadhar_file = sample_obj["aadhar_file"]

    if(aadhar_file){
        console.log("pdf buffer:",aadhar_file?.buffer,typeof(aadhar_file?.buffer))
        //console.log("epdf buffer:",pdfBuffer,typeof(pdfBuffer))
        let base64data = aadhar_file.buffer.toString('base64');
        let dataURL = "data:" + aadhar_file.mimetype + ";base64," + base64data;
        console.log("data_url:",dataURL)
        var buf = Buffer.from(dataURL, 'base64');
        console.log("bin_data:",buf)
        // pdf(aadhar_file?.buffer).then((data)=>{
        //     console.log("data:",data)
        // }).catch((err)=>{console.log("err:",err)})
        pdf(buf).then(data /*is a stream*/ => data.pipe(fs.createWriteStream("./previewStream.jpg"))).catch((err)=>{console.log("err:",err)})
    }

    let responseData = {
        "personal":personal_files.length?personal_files[0]:null,
        "expereince":experience_files.length?experience_files:null
    }

    try {
        success(res, 200, true, "Get Successfully", responseData);
    }catch(err) {
        throw new Error(err);
    }

})
router.get('/employee-docs/:user_id',methods.getAll );



methods.clients=asyncHandler(async (req, res) => {
    try {
      success(res, 200, true, "Get Successfully", await crud.getDocument(clients, {...req.query},{name:1},{}));
    } catch (err) {
      throw new Error(err);
    }
  })
   router.get('/clients',methods.clients );

methods.SowClick=asyncHandler(async (req, res) => {
    let {id}=req.params
    try {
      let senddata= await projectemployess.find({client_id:id}).populate({
        path: 'employee_id',
        select: ' id firstname lastname', // Specify the fields you want to select from the populated document
      }).populate("client_id")
       
      success(res, 200, true, "Get Successfully",senddata );
    } catch (err) {
      throw new Error(err);
    }
  })
   router.get('/projectemployees/:id',methods.SowClick );

methods.EmployeeClick=asyncHandler(async (req, res) => {
    let {id}=req.params
    try {
      let senddata= await projectemployess.find({employee_id:new mongoose.Types.ObjectId(id)}).populate({
        path: 'employee_id',
        select: ' id firstname lastname', // Specify the fields you want to select from the populated document
      })
      success(res, 200, true, "Get Successfully",senddata );
    } catch (err) {
      throw new Error(err);
    }
  })
   router.get('/employee/:id',methods.EmployeeClick );


// timesheet

   methods.employee=asyncHandler(async (req, res) => {
    try {
      success(res, 200, true, "Get Successfully", await crud.getDocument(employee, {...req.query},{firstname:1,lastname:1,createdAt:1},{}));
    } catch (err) {
      throw new Error(err);
    }
  })
   router.get('/employee',methods.employee );


   methods.getOne=asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);
    const check = await crud.getOneDocumentById(employee, id, {}, {});
    if(!check) throw new Error('Data not Found!')
    try {
    success(res, 200, true, "Get Successfully", await crud.getOneDocumentById(employee, id,{firstname:1,lastname:1},{}));
    } catch (err) {
      throw new Error(err);
    } 
  })
   router.get('/employee/:id', methods.getOne)

   methods.TimesheetClick=asyncHandler(async (req, res) => {
    let {id}=req.params
    try {
      const
firstDayOfMonth =
new
Date
(req.query.year, req.query.month -
1
,
1
);
// Month is 0-based in JavaScript Date object, so subtract 1
const
lastDayOfMonth =
new
Date
(req.query.year, req.query.month,
0
);

      const
pipeline = [ {    
  $match
  : { 
    employee_id: new mongoose.Types.ObjectId(id),  
  StartTime
  : {        
  $gte
  : firstDayOfMonth,
  // Filter documents with StartTime greater than or equal to the first day of the specified month
  $lt
  : lastDayOfMonth
  // Filter documents with StartTime less than the first day of the next month
        }    }   },
        {
          $lookup: {
          from: 'projects', // Replace with the actual name of the "projects" collection
          localField: 'project_id',
          foreignField: '_id',
          as: 'projectData',
          },
      }, ];

      console.log("time",req?.query)
      let senddata= await event.aggregate(pipeline)
      
      success(res, 200, true, "Get Successfully",senddata );
    } catch (err) {
      throw new Error(err);
    }
  })
   router.get('/timesheet/:id',methods.TimesheetClick );


  //  Invoice

  methods.getOne=asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);
    const check = await crud.getOneDocumentById(employee, id, {}, {});
    if(!check) throw new Error('Data not Found!')
    try {
    success(res, 200, true, "Get Successfully", await crud.getOneDocumentById(employee, id,{firstname:1,lastname:1},{}));
    } catch (err) {
      throw new Error(err);
    } 
  })
   router.get('/employee/:id', methods.getOne)

   methods.InvoiceClick=asyncHandler(async (req, res) => {
    
    try {
      const
firstDayOfMonth =
new
Date
(req.query.year, req.query.month -
1
,
1
);
// Month is 0-based in JavaScript Date object, so subtract 1
const
lastDayOfMonth =
new
Date
(req.query.year, req.query.month,
0
);

      const
pipeline = [ {    
  $match
  : { 
    // employee_id: new mongoose.Types.ObjectId(id),  
  invoice_date
  : {        
  $gte
  : firstDayOfMonth,
  // Filter documents with StartTime greater than or equal to the first day of the specified month
  $lt
  : lastDayOfMonth
  // Filter documents with StartTime less than the first day of the next month
        }    }   },
         ];

      console.log("time",req?.query)
      let senddata= await invoice.aggregate(pipeline)
      
      success(res, 200, true, "Get Successfully",senddata );
    } catch (err) {
      throw new Error(err);
    }
  })
   router.get('/invoice',methods.InvoiceClick );

  //  Expense

   methods.getOne=asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);
    const check = await crud.getOneDocumentById(employee, id, {}, {});
    if(!check) throw new Error('Data not Found!')
    try {
    success(res, 200, true, "Get Successfully", await crud.getOneDocumentById(employee, id,{firstname:1,lastname:1},{}));
    } catch (err) {
      throw new Error(err);
    } 
  })
   router.get('/employee/:id', methods.getOne)

   methods.ExpenseClick=asyncHandler(async (req, res) => {
    
    try {
      const
firstDayOfMonth =
new
Date
(req.query.year, req.query.month -
1
,
1
);
// Month is 0-based in JavaScript Date object, so subtract 1
const
lastDayOfMonth =
new
Date
(req.query.year, req.query.month,
0
);

      const
pipeline = [ {    
  $match
  : { 
    // employee_id: new mongoose.Types.ObjectId(id),  
  expense_date
  : {        
  $gte
  : firstDayOfMonth,
  // Filter documents with StartTime greater than or equal to the first day of the specified month
  $lt
  : lastDayOfMonth
  // Filter documents with StartTime less than the first day of the next month
        }    }   },
         ];

      console.log("time",req?.query)
      let senddata= await expense.aggregate(pipeline)
      
      success(res, 200, true, "Get Successfully",senddata );
    } catch (err) {
      throw new Error(err);
    }
  })
   router.get('/expense',methods.ExpenseClick );


module.exports = router;


