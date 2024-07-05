const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const { contacts } = require("../../utils/schemaMaster");
const { workexperience } = require("../../utils/schemaMaster");
const { success } = require("../../utils/response");
const crud_service = require("../../utils/crud_service");
const validateId = require('../../utils/validateId');
const { authAdmin } = require('../../middlewares/authMiddlewares');
const upload = require('../../utils/upload');
const { default: mongoose } = require("mongoose");
const crud = new crud_service();

const methods ={authAdmin}


//create
 methods.add =asyncHandler(async (req, res) => {
  try {

  const check = await crud.getOneDocument(contacts, {email_id:req.body.email_id}, {}, {});
    if(check){
 
  throw new Error('This Email Id is Already Exist !')
       
    }
    else{
      req.body.contact_owner =req?.user?._id
      success(res, 201, true, "Create Successfully", await crud.insertOne(contacts, req.body));
    }
    
  } catch (err) {
    throw new Error(err);
  }
})


router.post('/', methods.authAdmin, methods.add )


//getall
methods.getAll=asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
     let query ={}
      if(req.query.account_id){
         query.account_id=req.query.account_id
      }
      if(req.query.list_id){
        query.list_id=req.query.list_id
     }
    const total = await contacts.countDocuments(query);
     
     let data = await contacts.find(query)
     .sort({ createdAt: -1 })
     .skip( (page - 1) * limit )
     .limit(limit)
     .populate({
      
      path: "contact_owner",

      select:"name"
    })
    .populate({
      
      path: "account_id",

      select:"name logo_url twitter_url linkedin_url"
    })
    success(res, 200, true, "Get Successfully",  {
      data,total
   });
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/',methods.getAll );


 methods.contactlist=asyncHandler(async (req, res) => {
  try {
   
     let query ={}
   
      if(req.query.list_id){
        query.list_id=new mongoose.Types.ObjectId(req.query.list_id)
     }

  
  
     
     let data = await contacts.find(query)
     .sort({ createdAt: -1 })
     
     .populate({
      
      path: "contact_owner",

      select:"name"
    })
    .populate({
      
      path: "account_id",

      select:"name logo_url twitter_url linkedin_url"
    })
    success(res, 200, true, "Get Successfully",  
      data)
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/contactlist',methods.contactlist );


 //getone

methods.getOne=asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(contacts, id, {}, {});
  if(!check) throw new Error('Data not Found!')
  try {
  success(res, 200, true, "Get Successfully", await crud.getOneDocumentById(contacts, id,{},{populate:"account_id"}));
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/:id', methods.getOne)


//Edit
methods.edit =asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(contacts,id,{},{});
  if (!check) throw new Error('Data not Found!')
  try {
    success(res, 200, true, 'Update Successfully', await crud.updateById(contacts, id, req.body, { new: true }));
  } catch (err) {
    throw new Error(err);
  } 
})

 router.put('/:id',methods.edit )


//delete
  .delete('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);
    const check = await crud.getOneDocumentById(contacts, id, {}, {});
    if(!check) throw new Error('Data not Found!')
    try {
      success(res, 200, true, "Delete Successfully", await crud.deleteById(contacts, id));
    } catch (err) {
      throw new Error(err);
    } 
}))











module.exports = router;