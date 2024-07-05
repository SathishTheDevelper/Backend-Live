const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const { roles, admin } = require("../../utils/schemaMaster");
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
    success(res, 201, true, "Create Successfully", await crud.insertOne(roles, req.body));
  } catch (err) {
    throw new Error(err);
  }
})


router.post('/', methods.add )


methods.getRollUsers=asyncHandler(async (req, res) => {
   req.query.company_id=req?.user?.company_id

  try {
    success(res, 200, true, "Get Successfully", await crud.getDocument(admin, {...req.query},{password:0,},{populate:"permission"}));
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/userget',methods.authAdmin,methods.getRollUsers );


 methods.Companyselect=asyncHandler(async (req, res) => {
  // req.query.company_id=req?.user?.company_id
  try {
    let senddata =await roles.aggregate([
     
      {
        $project: {
     
        label: '$name',
        value: '$name',
      
        },
    }
     ])
    success(res, 200, true, "Get Successfully",senddata);
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/companyselect',methods.authAdmin,methods.Companyselect );

//getall
methods.getAll=asyncHandler(async (req, res) => {
  // req.query.company_id=req?.user?.company_id
  try {
    success(res, 200, true, "Get Successfully", await crud.getDocument(roles, {...req.query},{},{}));
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/',methods.authAdmin,methods.getAll );




 methods.getOneAssign=asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(admin, id, {}, {});
  if(!check) throw new Error('Data not Found!')
  try {
  success(res, 200, true, "Get Successfully", await crud.getOneDocumentById(admin, id,{password:0,email_id:0},{}));
  } catch (err) {
    throw new Error(err);
  } 
})  
 router.get('/assign/:id', methods.getOneAssign)
 //getone

methods.getOne=asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(roles, id, {}, {});
  if(!check) throw new Error('Data not Found!')
  try {

  success(res, 200, true, "Get Successfully", await crud.getOneDocumentById(roles, id,{},{}));
  } catch (err) { 
    throw new Error(err);
  } 
})
 router.get('/:id', methods.getOne)



//Edit
methods.edit =asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(roles,id,{},{});
  if (!check) throw new Error('Data not Found!')
  try {
    success(res, 200, true, 'Update Successfully', await crud.updateById(roles,id,req.body,{ new: true }));
  } catch (err) {
    throw new Error(err);
  } 
})

 router.put('/:id',methods.edit )


//delete
  .delete('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);
    const check = await crud.getOneDocumentById(roles, id, {}, {});
    if(!check) throw new Error('Data not Found!')
    try {
      success(res, 200, true, "Delete Successfully", await crud.deleteById(roles, id));
    } catch (err) {
      throw new Error(err);
    } 
}))











module.exports = router;