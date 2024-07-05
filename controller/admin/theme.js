const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const { theme } = require("../../utils/schemaMaster");
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
    success(res, 201, true, "Create Successfully", await crud.insertOne(theme, req.body));
  } catch (err) {
    throw new Error(err);
  }
})


router.post('/', methods.add )


//getall
methods.getAll=asyncHandler(async (req, res) => {
  try {
    success(res, 200, true, "Get Successfully", await crud.getOneDocument(theme, {company_id:req?.user?.company_id,},{},{}));
  } catch (err) {
    throw new Error(err);
  } 
})    
 router.get('/',methods?.authAdmin,methods.getAll );


 //getone

methods.getOne=asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(theme, id, {}, {});
  if(!check) throw new Error('Data not Found!')
  try {
  success(res, 200, true, "Get Successfully", await crud.getOneDocumentById(theme, id,{},{}));
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/:id', methods.getOne)


//Edit
methods.edit =asyncHandler(async (req, res) => {
//   const { id } = req.params;
  console.log("req.user.company_id", req.user.company_id)
   req.body.company_id= req.user?.company_id
  
  const check = await crud.getOneDocument(theme,{company_id:req?.user?.company_id},{},{});
  
  try {
  
    if(check){
    
    success(res, 200, true, 'Update Successfully', await crud.updateById(theme, check?._id, req.body, { new: true }));
     
    }
    else{
    success(res, 200, true, 'Update Successfully', await crud.insertOne(theme,req.body));
       
    }
    // success(res, 200, true, 'Update Successfully', await crud.updateById(theme, id, req.body, { new: true }));
  } catch (err) {
    throw new Error(err);
  } 
})

 router.put('/',methods.authAdmin,methods.edit )


//delete
  .delete('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);
    const check = await crud.getOneDocumentById(theme, id, {}, {});
    if(!check) throw new Error('Data not Found!')
    try {
      success(res, 200, true, "Delete Successfully", await crud.deleteById(theme, id));
    } catch (err) {
      throw new Error(err);
    } 
}))











module.exports = router;