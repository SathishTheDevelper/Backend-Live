const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const { projectemployess, event } = require("../../utils/schemaMaster");
const { workexperience } = require("../../utils/schemaMaster");
const { success } = require("../../utils/response");
const crud_service = require("../../utils/crud_service");
const validateId = require('../../utils/validateId');
const { authAdmin } = require('../../middlewares/authMiddlewares');
const upload = require('../../utils/upload');
const crud = new crud_service();

const methods ={authAdmin}


//create
 methods.add =asyncHandler(async (req, res) => {
  try {
    if(req?.user) {
      req.body.created_by=req?.user?._id
      req.body.company_id=req.user?.company_id
    }
      if(req.file){
         req.body.sow=req?.file?.path
      }
      let assign =await crud.insertOne(projectemployess, req.body)
      if(assign){
        const currentDate = new Date();

        // Function to format a date as "YYYY-MM-DD"
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
 
        // Get tomorrow's date by adding one day
     
 
 // Assuming you have the provided StartTime and EndTime strings
 const providedStartTime = `${yesterdayDateString}T18:30:00.000Z`;
 const providedEndTime = `${currentDateString}T18:30:00.000Z`;

   let senddata={
     ...req?.body,
    StartTime:providedStartTime,
    EndTime:providedEndTime,
    logged_houres:"0:00"
    }
   

      let send =await crud.insertOne(event, senddata)
    success(res, 201, true, "Create Successfully",send);

      }
    

         

    

  } catch (err) {
    throw new Error(err);
  }
})


router.post('/',  upload.single("sow"),methods.authAdmin, methods.add )


//getall
methods.getAll=asyncHandler(async (req, res) => {
    console.log("lllllllllllll",req?.query)
  try {
    let data =await crud.getDocument(projectemployess, {...req.query},{},{populate:"employee_id job_id"})
    let sendFullTimedata =[]
    let sendContractdata =[]
   console.log("datasssss",data)
     if(data?.length>0){
      data?.map((item)=>{
        if(item?.job_id){
          if(item.job_id?.job_type == "Fulltime"){
            sendFullTimedata.push(item)
          }
          else{
            sendContractdata.push(item)
            
          }
        }
       
     })
     }

    success(res, 200, true, "Get Successfully", {sendFullTimedata,sendContractdata});
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/',methods.getAll );


 //getone

methods.getOne=asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(projectemployess, id, {}, {});
  if(!check) throw new Error('Data not Found!')
  try {
  success(res, 200, true, "Get Successfully", await crud.getOneDocumentById(projectemployess, id,{},{}));
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/:id', methods.getOne)


//Edit
methods.edit =asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  if(req.file){
    req.body.sow=req?.file?.path
 }
  const check = await crud.getOneDocumentById(projectemployess,id,{},{});
  if (!check) throw new Error('Data not Found!')
  console.log("req.body",req.body)
  try {
    success(res, 200, true, 'Update Successfully', await crud.updateById(projectemployess, id, req.body, { new: true }));
  } catch (err) {
    throw new Error(err);
  } 
})

 router.put('/:id', upload.single("sow"),methods.edit )


//delete
  .delete('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);
    const check = await crud.getOneDocumentById(projectemployess, id, {}, {});
    if(!check) throw new Error('Data not Found!')
    try {
      success(res, 200, true, "Delete Successfully", await crud.deleteById(projectemployess, id));
    } catch (err) {
      throw new Error(err);
    } 
}))











module.exports = router;