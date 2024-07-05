const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const { spaces, spaceList } = require("../../utils/schemaMaster");
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
     req.body.created_by =req?.user?._id
    success(res, 201, true, "Create Successfully", await crud.insertOne(spaces, req.body));
  } catch (err) {
    throw new Error(err);
  }
})


router.post('/',methods.authAdmin, methods.add )


methods.Listadd =asyncHandler(async (req, res) => {
  try {
     req.body.created_by =req?.user?._id
    success(res, 201, true, "Create Successfully", await crud.insertOne(spaceList, req.body));
  } catch (err) {
    throw new Error(err);
  }
})


router.post('/list',methods.authAdmin, methods.Listadd )


//getall
methods.getAll=asyncHandler(async (req, res) => {
  try {
    success(res, 200, true, "Get Successfully", await crud.getDocument(spaces, {...req.query},{},{populate:"created_by"}));
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/',methods.getAll );


 methods.List=asyncHandler(async (req, res) => {
  try {
    success(res, 200, true, "Get Successfully", await crud.getDocument(spaceList, {...req.query},{},{populate:"created_by"}));
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/list',methods.List );


 methods.ListSingle=asyncHandler(async (req, res) => {

  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(spaceList, id, {}, {});
  if(!check) throw new Error('Data not Found!')
  try {
  success(res, 200, true, "Get Successfully", await crud.getOneDocumentById(spaceList, id,{},{}));
     
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/list/:id',methods.ListSingle );


 //getone

methods.getOne=asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(spaces, id, {}, {});
  if(!check) throw new Error('Data not Found!')
  try {
  success(res, 200, true, "Get Successfully", await crud.getOneDocumentById(spaces, id,{},{}));
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/:id', methods.getOne)


//Edit
methods.edit =asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(spaces,id,{},{});
  if (!check) throw new Error('Data not Found!')
  try {
    success(res, 200, true, 'Update Successfully', await crud.updateById(spaces, id, req.body, { new: true }));
  } catch (err) {
    throw new Error(err);
  } 
})

 router.put('/:id',methods.edit )


//delete
  .delete('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);
    const check = await crud.getOneDocumentById(spaces, id, {}, {});
    if(!check) throw new Error('Data not Found!')
    try {
      success(res, 200, true, "Delete Successfully", await crud.deleteById(spaces, id));
    } catch (err) {
      throw new Error(err);
    } 
}))











module.exports = router;