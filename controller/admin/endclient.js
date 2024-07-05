const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const { endclients } = require("../../utils/schemaMaster");
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
    success(res, 201, true, "Create Successfully", await crud.insertOne(endclients, req.body));
  } catch (err) {
    throw new Error(err);
  }
})


router.post('/', methods.add )


//getall
methods.getAll=asyncHandler(async (req, res) => {
  try {
    success(res, 200, true, "Get Successfully", await crud.getDocument(endclients, {...req.query},{},{}));
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/',methods.getAll );


 //getone

methods.getOne=asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(endclients, id, {}, {});
  if(!check) throw new Error('Data not Found!')
  try {
  success(res, 200, true, "Get Successfully", await crud.getOneDocumentById(endclients, id,{},{}));
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/:id', methods.getOne)


//Edit
methods.edit =asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(endclients,id,{},{});
  if (!check) throw new Error('Data not Found!')
  try {
    success(res, 200, true, 'Update Successfully', await crud.updateById(endclients, id, req.body, { new: true }));
  } catch (err) {
    throw new Error(err);
  } 
})

 router.put('/:id',methods.edit )


//delete
  .delete('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);
    const check = await crud.getOneDocumentById(endclients, id, {}, {});
    if(!check) throw new Error('Data not Found!')
    try {
      success(res, 200, true, "Delete Successfully", await crud.deleteById(endclients, id));
    } catch (err) {
      throw new Error(err);
    } 
}))











module.exports = router;