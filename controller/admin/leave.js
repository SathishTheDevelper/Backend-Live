const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const { leaves, workingdays, holidays, leave_request, event, hrlogged} = require("../../utils/schemaMaster");
const { workexperience } = require("../../utils/schemaMaster");
const { success } = require("../../utils/response");
const crud_service = require("../../utils/crud_service");
const validateId = require('../../utils/validateId');
const { authAdmin } = require('../../middlewares/authMiddlewares');
const upload = require('../../utils/upload');
const crud = new crud_service();

const methods ={authAdmin}


//create

methods.publicholidays =asyncHandler(async (req, res) => {
  try {
    success(res, 201, true, "Create Successfully", await crud.insertOne(holidays, req.body));
  } catch (err) {
    throw new Error(err);
  }
})


router.post('/publicholidays', methods.publicholidays )

methods.leaverequest =asyncHandler(async (req, res) => {
   req.body.employee_id = req.user._id
   console.log("req.body",req.body)
  try {
     console.log("req.user",req.user.salary_type)
    if(req?.user?.salary_type && req.user?.salary_type === 'Non Billable'){
       console.log("im workingggg")
     let created = await crud.insertOne(leave_request, req.body)
     const currentDate = new Date(created.startDate);
     let dataArray=[]
     // Function to format a date as "YYYY-MM-DD"
     for (let i = 0; i < created?.no_of_days; i++) {
       // Use toISOString() to get the date string in the format "YYYY-MM-DDTHH:mm:ss.sssZ"
       const formatDate = (date) => {
         const year = date.getFullYear();
         const month = String(date.getMonth() + 1).padStart(2, '0');
         const day = String(date.getDate()).padStart(2, '0');
       
         return `${year}-${month}-${day}`;
       };
       
       // Format the current date
       const currentDateString = formatDate(currentDate);
       const yesterdayDate = new Date(currentDate);
       yesterdayDate.setDate(currentDate.getDate() - 1);
       
       // Function to format a date as "YYYY-MM-DD"
       const formatDate1 = (date) => {
         const year = date.getFullYear();
         const month = String(date.getMonth() + 1).padStart(2, '0');
         const day = String(date.getDate()).padStart(2, '0');
       
         return `${year}-${month}-${day}`;
       };
       
       // Format yesterday's date
       const yesterdayDateString = formatDate1(yesterdayDate);
       const providedStartTime = `${yesterdayDateString}T18:30:00.000Z`;
       const providedEndTime = `${currentDateString}T18:30:00.000Z`;
       dataArray.push({
         StartTime:providedStartTime,
         EndTime:providedEndTime,
         employee_id:created?.employee_id,
         leave_id:created?._id,
         leave_title:created?.leave_title,
         type:"Pending",
         status:"Leave"
       })

       
       
       // Increment the current date by one day for the next iteration
       currentDate.setDate(currentDate.getDate() + 1);
     }
      console.log("ffff",dataArray)
        let eventscreate= await crud.insertMany(hrlogged,dataArray)
        console.log("eventcreate",eventscreate)
  
    success(res, 201, true, "Create Successfully", created);

    }
    else{
      success(res, 201, true, "Create Successfully", await crud.insertOne(leave_request, req.body));

    }
  } catch (err) {
    throw new Error(err);
  }
})


router.post('/leaverequest',methods.authAdmin, methods.leaverequest )
 methods.add =asyncHandler(async (req, res) => {
  try {
    success(res, 201, true, "Create Successfully", await crud.insertOne(leaves, req.body));
  } catch (err) {
    throw new Error(err);
  }
})


router.post('/', methods.add )


//getall

methods.getallholidays=asyncHandler(async (req, res) => {
  try {
    success(res, 200, true, "Get Successfully", await crud.getDocument(holidays, {...req.query},{},{}));
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/getallholidays',methods.getallholidays );
 methods.getleaverequest=asyncHandler(async (req, res) => {
   console.log("We can",req.user)
   if(req.user?.role !=="SuperAdmin"){
    req.query.employee_id = req.user._id 
    }
   
  try {
    success(res, 200, true, "Get Successfully", await crud.getDocument(leave_request, {...req.query},{},{populate:"leave_id employee_id approved_by",sort: { createdAt: -1 }}));
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/leaverequest',methods.authAdmin,methods.getleaverequest );

 methods.hoiliday=asyncHandler(async (req, res) => {
  try {
    success(res, 200, true, "Get Successfully", await crud.getDocument(holidays, {...req.query},{},{}));
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/hoiliday',methods.hoiliday );
methods.getAll=asyncHandler(async (req, res) => {
  try {
    success(res, 200, true, "Get Successfully", await crud.getDocument(leaves, {...req.query},{},{}));
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/',methods.getAll );


 //getone

methods.getOne=asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(leaves, id, {}, {});
  if(!check) throw new Error('Data not Found!')
  try {
  success(res, 200, true, "Get Successfully", await crud.getOneDocumentById(leaves, id,{},{}));
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/:id', methods.getOne)

 methods.getWorkingDays=asyncHandler(async (req, res) => {
    const { id } = req.params;
    
  
    try {
success(res, 200, true, "Get Successfully",await crud.getOneDocument(workingdays, {year:id}, {}, {}));
    } catch (err) {
      throw new Error(err);
    } 
  })

   router.get('/working/:id', methods.getWorkingDays)

   methods.getWorkingDaysAdd=asyncHandler(async (req, res) => {
    const { id } = req.params;
let check =await crud.getOneDocument(workingdays, {year:id}, {}, {})

 if(check){
    return success(res, 200, true, 'Update Successfully', await crud.updateById(workingdays, check?._id, req.body, { new: true }));

 }
  
    try {
success(res, 200, true, "Update Successfully",await crud.insertOne(workingdays, req.body));
    } catch (err) {
      throw new Error(err);
    } 
  })
   router.post('/working/:id', methods.getWorkingDaysAdd)


   methods.approved =asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);
    const check = await crud.getOneDocumentById(leave_request,id,{},{populate:"leave_id employee_id"});
    console.log("check",check)
    if (!check) throw new Error('Data not Found!')
    try {

    if(check.status == "Pending"){
      const currentDate = new Date(check.startDate);
      const dataArray=[]
      // Function to format a date as "YYYY-MM-DD"
      for (let i = 0; i < check?.no_of_days; i++) {
        // Use toISOString() to get the date string in the format "YYYY-MM-DDTHH:mm:ss.sssZ"
        const formatDate = (date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
        
          return `${year}-${month}-${day}`;
        };
        
        // Format the current date
        const currentDateString = formatDate(currentDate);
        const yesterdayDate = new Date(currentDate);
        yesterdayDate.setDate(currentDate.getDate() - 1);
        
        // Function to format a date as "YYYY-MM-DD"
        const formatDate1 = (date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
        
          return `${year}-${month}-${day}`;
        };
        
        // Format yesterday's date
        const yesterdayDateString = formatDate1(yesterdayDate);
        const providedStartTime = `${yesterdayDateString}T18:30:00.000Z`;
        const providedEndTime = `${currentDateString}T18:30:00.000Z`;
        dataArray.push({
          StartTime:providedStartTime,
          EndTime:providedEndTime,
          employee_id:check?.employee_id,
          leave_id:check?.leave_id?._id,
          leave_title:check?.leave_id?.leave_title,
          type:"Approved",
          status:"Leave"
        })

        
        
        // Increment the current date by one day for the next iteration
        currentDate.setDate(currentDate.getDate() + 1);
      }
   

      // Get tomorrow's date by adding one day
   

// Assuming you have the provided StartTime and EndTime strings

      if(check?.employee_id?.salary_type == "Non Billable"){

        let eventscreate= await crud.updateMany(hrlogged,{leave_id:id},{type:"Approved"})
         console.log("ffff",eventscreate)
      success(res, 200, true, 'Update Successfully', await crud.updateById(leave_request, id, {...req.body,approved_by:req.user._id}, { new: true }));

      }
      else{
        let eventscreate= await crud.insertMany(event,dataArray)
       

      success(res, 200, true, 'Update Successfully', await crud.updateById(leave_request, id, {...req.body,approved_by:req.user._id}, { new: true }));
       
      }
    }
    else{
      throw new Error("Already Approved");

    }
    } catch (err) {
      throw new Error(err);
    } 
  })
  
   router.put('/status/:id', methods.authAdmin,methods.approved )

//Edit
methods.edit =asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(leaves,id,{},{});
  if (!check) throw new Error('Data not Found!')
  try {
    success(res, 200, true, 'Update Successfully', await crud.updateById(leaves, id, req.body, { new: true }));
  } catch (err) {
    throw new Error(err);
  } 
})

 router.put('/:id',methods.edit )


//delete
  .delete('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);
    const check = await crud.getOneDocumentById(leaves, id, {}, {});
    if(!check) throw new Error('Data not Found!')
    try {
      success(res, 200, true, "Delete Successfully", await crud.deleteById(leaves, id));
    } catch (err) {
      throw new Error(err);
    } 
}))











module.exports = router;