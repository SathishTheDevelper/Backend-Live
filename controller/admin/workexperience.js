const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const { workexperience } = require("../../utils/schemaMaster");
const { success } = require("../../utils/response");
const crud_service = require("../../utils/crud_service");
const validateId = require('../../utils/validateId');
const { authAdmin } = require('../../middlewares/authMiddlewares');
const multer = require('multer')
const upload = require('../../utils/upload');
const crud = new crud_service();

const methods ={authAdmin}

//Create Work Experience
methods.add =asyncHandler(async (req, res) => {
    console.log("is it:",req.body)
    console.log("we files:",req.files)

    const postData = req.body;
    const filesData = req.files;

    // let createData = Object.assign({}, postData);

    if(req?.files?.length > 0){
      req.files.map((file)=> {
        req.body[file.fieldname]=file.path
      })
    }

    try {
        success(res, 201, true, "Create Successfully", await crud.insertOne(workexperience, req.body));
    } catch (err) {
        console.log("adding:",err)
        throw new Error(err);
    }
})
router.post('/',upload.any(),methods.add)

const checkFileBody = (fileBody,fieldName) => {
    if(!fileBody.length)
      return false
    else{
      let flagData = false
      fileBody.forEach(file  => {
        if(file.fieldname === fieldName)
          flagData = file
      })
      return flagData
    }
}

const fileUpdateMngr = (dataBody,fileBody,fieldArr) => {

    for(let fieldName in fieldArr){
      let keyName = fieldArr[fieldName]
      let fileExist = checkFileBody(fileBody,keyName)
      if(fileExist){
        dataBody[keyName] = fileExist
      }else if(dataBody[keyName]){
        dataBody[keyName] = JSON.parse(dataBody[keyName])
      }else{
        dataBody[keyName] = null
      }
    }
  
}

//Edit Work Experience
methods.edit =asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);
    const check = await crud.getOneDocumentById(workexperience,id,{},{});

    let dataBody = req.body
    let fileBody = req.files

    if(req?.files?.length > 0){
      req.files.map((file)=> {
        req.body[file.fieldname]=file.path
      })
    }

    if (!check) throw new Error('Data not Found!')
    try {
        success(res, 200, true, 'Update Successfully', await crud.updateById(workexperience, id, req?.body, { new: true }));
    } catch (err) {
        throw new Error(err);
    } 
})  
router.put('/:id',upload.any(),methods.edit )
methods.experienceupadte =asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  // const check = await crud.getOneDocumentById(workexperience,id,{},{});

  let dataBody = req.body
  let fileBody = req.files
  
  if(req?.files?.length > 0){
    req.files.map((file)=> {
      req.body[file.fieldname]=file.path
    })
  }


  // if (!check) throw new Error('Data not Found!')
  try {
      success(res, 200, true, 'Update Successfully', await crud.updateById(workexperience, id, req?.body, { new: true }));
  } catch (err) {
      throw new Error(err);
  } 
})  
router.put('/experience/:id',methods.experienceupadte )

//Get All - Work Experience
methods.getAll=asyncHandler(async (req, res) => {
    try {
      let data =  await req.body.workexperience?.map( async(item)=>{
        const check = await crud.getOneDocumentById(workexperience,item?._id,{},{});
         if(check){
           let modifyedit =await crud.updateById(workexperience, item?._id, item, { new: true })
           
         }
         else{
             let modifyadd = await crud.insertOne(workexperience, item)
              
         }
               
       })
     
      success(res, 200, true, "Get Successfully",data);
    } catch (err) {
      throw new Error(err);
    }
  })
router.get('/',methods.getAll );
  
//Get By ID - Work Experience
methods.getOne=asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);
    const check = await crud.getOneDocumentById(workexperience, id, {}, {});
    if(!check) throw new Error('Data not Found!')
    try {
        success(res, 200, true, "Get Successfully", await crud.getOneDocumentById(workexperience, id,{},{}));
    } catch (err) {
        throw new Error(err);
    }
})
router.get('/:id', methods.getOne)

//Delete Work Experience
.delete('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);
    const check = await crud.getOneDocumentById(workexperience, id, {}, {});
    if(!check) throw new Error('Data not Found!')
    try {
      success(res, 200, true, "Delete Successfully", await crud.deleteById(workexperience, id));
    } catch (err) {
      throw new Error(err);
    } 
}))

module.exports = router;