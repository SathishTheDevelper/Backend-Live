const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const { projects,projectemployess } = require("../../utils/schemaMaster");
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


  if (req?.file) req.body.sow = req?.file?.path;
  try {
    success(res, 201, true, "Create Successfully", await crud.insertOne(projects, req.body));
  } catch (err) {
    throw new Error(err);
  }
})


router.post('/', upload.single("sow") , methods.add )


// get Sum functions
const getEmployeesData = async (clientId) => {
  return await crud.getDocument(projectemployess, { project_id: clientId }, {}, { populate: "employee_id" });
};


//getall
methods.getAll=asyncHandler(async (req, res) => {
    console.log("jjj",req?.query)
    const projectsData=await crud.getDocument(projects, {...req.query},{},{populate:"client_id"})
    

    const senddataPromises = projectsData.map(async (project) => {
      const [employees] = await Promise.all([
       
        getEmployeesData(project._id),
      ]);
 
    
      const totalRevenue = employees.reduce((accumulator, currentValue) => {
        return accumulator +  Number( currentValue.clientbilling_salarytype == "Monthly" ? currentValue.client_billing :currentValue.clientbilling_salarytype == "Per Hour" ? currentValue.client_billing*160 :currentValue.client_billing/12);
    
      }, 0);
    
      const totalSalary = employees.reduce((accumulator, currentValue) => {
        return accumulator + Number( currentValue.expected_Ctc_type == "Monthly" ? currentValue.expected_ctc :currentValue.expected_Ctc_type == "Per Hour" ? currentValue.expected_ctc*160 :currentValue.expected_ctc/12|| 0)
      }, 0);
    
      return {
        _id: project._id,
        project_name:project?.project_name,
        status:project?.status,
        activeemployess:employees.length,
        sow:project?.sow,
        client_id:project?.client_id,
      
        revenue: totalRevenue,
       
        salary: totalSalary,
      };
    });

    const senddata = await Promise.all(senddataPromises);



  try {
    success(res, 200, true, "Get Successfully", senddata);
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/',methods.getAll );


//  get status
methods.getStaus=asyncHandler(async (req, res) => {
   
  
  try {
  success(res, 200, true, "Get Successfully", await crud.getDocument(projects, {...req.query},{},{populate:"client_id"}));
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/status', methods.getStaus)



 //getone

methods.getOne=asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(projects, id, {}, {});
  if(!check) throw new Error('Data not Found!')
  try {
  success(res, 200, true, "Get Successfully", await crud.getOneDocumentById(projects, id,{},{populate:"client_id"}));
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/:id', methods.getOne)


//Edit
methods.edit =asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(projects,id,{},{});
  if (!check) throw new Error('Data not Found!')
  try {
    success(res, 200, true, 'Update Successfully', await crud.updateById(projects, id, req.body, { new: true }));
  } catch (err) {
    throw new Error(err);
  } 
})

 router.put('/:id',methods.edit )


//delete
  .delete('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);
    const check = await crud.getOneDocumentById(projects, id, {}, {});
    if(!check) throw new Error('Data not Found!')
    try {
      success(res, 200, true, "Delete Successfully", await crud.deleteById(projects, id));
    } catch (err) {
      throw new Error(err);
    } 
}))











module.exports = router;