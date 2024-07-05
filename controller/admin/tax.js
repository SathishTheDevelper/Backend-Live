const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const { tax } = require("../../utils/schemaMaster");
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
    if(req?.user) req.body.created_by=req?.user?._id
  try {
    success(res, 201, true, "Create Successfully", await crud.insertOne(tax, req.body));
  } catch (err) {
    throw new Error(err);
  }
})


router.post('/',methods.authAdmin, methods.add )


//getall
methods.getAll=asyncHandler(async (req, res) => {
  
  let data =await tax.aggregate([
    {
      $lookup: {
        from: "candidates",
        localField: "_id",
        foreignField: "tax_id",
        as: "screening"
      },
     
    },
    {
      $lookup: {
        from: "admins",
        localField: "created_by",
        foreignField: "_id",
        as: "done_by"
      },
     
    },

    
   
    
   
  ])
  
 console.log("hhhhhhhhhhh",data)
  try {
    success(res, 200, true, "Get Successfully", data);
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/',methods.getAll );


 //getone

methods.getOne=asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(tax, id, {}, {});
  if(!check) throw new Error('Data not Found!')
  try {
  success(res, 200, true, "Get Successfully", await crud.getOneDocumentById(tax, id,{},{}));
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/:id', methods.getOne) 


//Edit
methods.edit =asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(tax,id,{},{});
  if (!check) throw new Error('Data not Found!')
  try {
    success(res, 200, true, 'Update Successfully', await crud.updateById(tax, id, req.body, { new: true }));
  } catch (err) {
    throw new Error(err);
  } 
})

 router.put('/:id',methods.edit )


//delete
  .delete('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);
    const check = await crud.getOneDocumentById(tax, id, {}, {});
    if(!check) throw new Error('Data not Found!')
    try {
      success(res, 200, true, "Delete Successfully", await crud.deleteById(tax, id));
    } catch (err) {
      throw new Error(err);
    } 
}))











module.exports = router;