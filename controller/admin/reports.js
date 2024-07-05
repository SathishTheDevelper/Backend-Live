const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const { skils } = require("../../utils/schemaMaster");
const { workexperience } = require("../../utils/schemaMaster");
const { success } = require("../../utils/response");
const crud_service = require("../../utils/crud_service");
const validateId = require('../../utils/validateId');
const { authAdmin } = require('../../middlewares/authMiddlewares');
const upload = require('../../utils/upload');
const crud = new crud_service();

const methods ={authAdmin}


const Reportsmenu= [
    //   {
    //   module:"Employee",
    //   url:"/Employee",
    //   icon:"EmployeesLogo",
    //   component:"EmployeeDashboard",
      
      
    //   permissions:[
    //     "View All Employees",
    //     "Edit Employee Details",
    //     "Delete Employee Record"
    
    //   ]
    // },
    {
      label:"Favourites",
      key:"1",
      icon:null,    
      parent_id:null
     
    },
    {
        label:"Accounts",
        key:"2",
        icon:null,    
        parent_id:null
       
      },
      {
        label:"Invoice Summary",
        key:"2.1",
        icon:null,    
        parent_id:null
       
      },
      {
        label:"Expense Summary",
        key:"2.2",
        icon:null,    
        parent_id:null
       
      },
      {
        label:"Payment Summary",
        key:"2.3",
        icon:null,    
        parent_id:null
       
      },
      {
        label:"Profit vs Loss",
        key:"2.4",
        icon:null,    
        parent_id:null
       
      },
      {
        label:"Salary vs Revenue",
        key:"2.5",
        icon:null,    
        parent_id:null
       
      },
      {
        label:"GST Report",
        key:"2.6",
        icon:null,    
        parent_id:null
       
      }, 
       {
        label:"TDS Report",
        key:"2.7",
        icon:null,    
        parent_id:null
       
      },
      {
        label:"TDS Report",
        key:"2.7",
        icon:null,    
        parent_id:null
       
      },   {
        label:"HR",
        key:"3",
        icon:null,    
        parent_id:null
       
      },
      {
        label:"Timesheet Report",
        key:"3.1",
        icon:null,    
        parent_id:null
       
      },
      {
        label:"Salary Report",
        key:"3.2",
        icon:null,    
        parent_id:null
       
      },
      {
        label:"Leave Report",
        key:"3.3",
        icon:null,    
        parent_id:null
       
      },
      {
        label:"Recruiter Performance",
        key:"3.3",
        icon:null,    
        parent_id:null
       
      },
   
    
    ]

//create
 methods.add =asyncHandler(async (req, res) => {
  try {
    
    success(res, 201, true, "Create Successfully", await crud.insertOne(skils, req.body));
  } catch (err) {
    throw new Error(err);
  }
})


router.post('/', methods.add )


//getall
methods.getAll=asyncHandler(async (req, res) => {
  try {
    success(res, 200, true, "Get Successfully", await crud.getDocument(skils, {...req.query},{},{}));
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/',methods.getAll );


 //getone

methods.getOne=asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(skils, id, {}, {});
  if(!check) throw new Error('Data not Found!')
  try {
  success(res, 200, true, "Get Successfully", await crud.getOneDocumentById(skils, id,{},{}));
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/:id', methods.getOne)


//Edit
methods.edit =asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(skils,id,{},{});
  if (!check) throw new Error('Data not Found!')
  try {
    success(res, 200, true, 'Update Successfully', await crud.updateById(skils, id, req.body, { new: true }));
  } catch (err) {
    throw new Error(err);
  } 
})

 router.put('/:id',methods.edit )


//delete
  .delete('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);
    const check = await crud.getOneDocumentById(skils, id, {}, {});
    if(!check) throw new Error('Data not Found!')
    try {
      success(res, 200, true, "Delete Successfully", await crud.deleteById(skils, id));
    } catch (err) {
      throw new Error(err);
    } 
}))











module.exports = router;