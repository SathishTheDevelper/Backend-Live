const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const { employee,workexperience,roles, admin } = require("../../utils/schemaMaster");
const crud_service = require("../../utils/crud_service");
const validateId = require('../../utils/validateId');
const { authAdmin } = require('../../middlewares/authMiddlewares');
const multer = require('multer')
const upload = require('../../utils/upload');
const crud = new crud_service();


const bcrypt = require("bcrypt");

const { generateToken } = require("../../config/jwtToken");
const { success, successToken } = require("../../utils/response");
const sendMail = require('../../utils/sendMail');
const { register} = require('../../utils/email_template');
const mongoose = require('mongoose');

const methods ={authAdmin}

const generateCreateBody = async (dataBody) => {
  console.log("data",dataBody)

  //https://www.guru99.com/mongodb-objectid.html
  const salt = bcrypt.genSaltSync(10);
let createBody = {
    ...dataBody,
    passwordHash:await bcrypt.hash(dataBody?.passwordHash, salt),
    user_role:"Employee",
    user_status:"onBoarding"
  }
 return createBody

}

//Create Employee
methods.add =asyncHandler(async (req, res) => {
 let generatedData = await generateCreateBody(req.body)
let admin_data = {
  "_id":generatedData["_id"],  
    "name":`${generatedData["firstname"]} ${generatedData["lastname"]}`,
    "email_id" : generatedData["email"],
    "role": generatedData["user_role"],
    "password": generatedData["passwordHash"]
  }

  console.log("Data Generate:",generatedData)

  
  
  try {
    const create = await crud.insertOne(employee, generatedData);
    const create_admin_login = await crud.insertOne(admin, admin_data);
    if(create_admin_login){
         let role = await crud.getDocument(roles, {name:create_admin_login?.role},{_id:1},{})
       
         let updatepermission= await crud.updateById(admin, create_admin_login?._id, {permission:role[0]?._id}, { new: true })
        }
    
    if(create){

      successToken(res, 201, true, "Register Successfully",create,generateToken(create?._id));
    }else{
      throw new Error("Register Failed!");
    }
  } catch (err) {
    console.log("error:",err)
    throw new Error(err);
  }
})
router.post('/', methods.add )

//Get All Employees
methods.getAll=asyncHandler(async (req, res) => {
  try {
    success(res, 200, true, "Get Successfully", await crud.getDocument(employee, {...req.query},{},{}));
  } catch (err) {
    throw new Error(err);
  }
})
router.get('/',methods.getAll );

//Employee Table List
methods.select=asyncHandler(async (req, res) => {

  let table_projection = {
    'user_id':1,'firstname':1,
    'lastname':1,'mobile':1,
    "form_completion":1,"billing_type":1,
    'designation':1,'job_type':1,
    'user_status':1,'salary_type':1,
    'yearly_ctc':1  
  }

  console.log("req.body:",req?.body)

  let filterBody = req?.body?.direct || req?.body
  console.log("Body:",filterBody)

  try {
    success(res, 200, true, "Get Successfully", await crud.getDocument(employee, {"user_role": {$ne: 1},...filterBody},table_projection,{}));
  } catch (err) {
    console.log("err:",err)
    throw new Error(err);
  }
})
router.post("/table",methods.select)

//Select Component Employee List
methods.select=asyncHandler(async (req, res) => {
  try {
    success(res, 200, true, "Get Successfully", await crud.getDocument(employee, {},{user_id:1,firstname:1,lastname:1},{}));
  } catch (err) {
    console.log("err:",err)
    throw new Error(err);
  }
})
router.get("/select",methods.select)
methods.invoiceselect=asyncHandler(async (req, res) => {
  // await employee.collection.createIndex({ firstname: 1, lastname: 1 });

  try {
    await employee.collection.createIndex({  lastname: 1 });
    let result = await employee.find()
    .select({
      label: { $concat: ['$firstname', ' ', '$lastname'] },
      value: '$_id',
    })
   
    .lean().exec(); 
   
    success(res, 200, true, "Get Successfully", result);
  } catch (err) {
    console.log("err:",err)
    throw new Error(err);
  }
})
router.get("/invoiceselect",methods.invoiceselect)

const renderLabel = (labelNum,labelType) => {

  let returnLabel = ""

  if(labelType==="billing")
    returnLabel = labelNum?"Billable":"Non Billable"

  if(labelType==="status"){
    switch(labelNum){
      case 0:
        returnLabel = "Terminated"
        break
      case 1:
        returnLabel = "Working"
        break
      case 2:
        returnLabel = "Releived"
        break
      case 3:
        returnLabel = "Onboarding"
        break
    }
  }

  return returnLabel
}

//Select Component Employee List
methods.graph=asyncHandler(async (req, res) => {
  try {

    let aggregateStatus = await employee.aggregate([
      { $group: {
        _id: "$user_status",
        count: { $sum: 1 }
      }}
    ]);
   

    let aggregateBilling = await employee.aggregate([
      { $group: {
        _id: "$salary_type",
        count: { $sum: 1 }
      }}
    ]);
    console.log("aggregrate",aggregateBilling)

    let totalEmployee = 0;
    let Billable=0;
    let Non_Billable=0
    let Working=0
    let Releived=0
    let Terminated=0
    let onBoarding=0

    let BillData=aggregateBilling?.forEach((label)=>{
      if(label._id =="Billable"){
        Billable+=label?.count
        totalEmployee += label?.count

        
      }
      else{
        Non_Billable+=label?.count
        totalEmployee += label?.count
      }
     
    })

    aggregateStatus?.forEach((label)=>{
      if(label?._id =="onBoarding") {onBoarding+=label.count}
      if(label?._id =="working"){
         Working+=label.count
      }
      if(label?._id =="Releived"){
        Releived+=label.count
     }
     
    })

    let chartData = {
      "status_chart":{
        Working,
        Releived,
        Terminated,
        onBoarding
      },
      "billing_chart":{
        Billable,
        Non_Billable
      },
      "totalEmployee":totalEmployee,
    }
    console.log("chart",chartData)

    success(res, 200, true, "Get Successfully", chartData);
  } catch (err) {
    console.log("err:",err)
    throw new Error(err);
  }
})
router.get("/graph",methods.graph)

const projectionGenerator  = (urlQuery) => {

  let projectionObj = {}

  if(!urlQuery || !urlQuery?.projtype){
    return {}
  }else{
    let projType = urlQuery?.projtype

    if(projType===""){
      return {}
    }else if(projType==="bank"){
      projectionObj["name_as_in_bank"]=1
      projectionObj["bank_name"]=1
      projectionObj["account_num"]=1
      projectionObj["ifsc_code"]=1
      projectionObj["branch_name"]=1
      projectionObj["branch_addr"]=1
      projectionObj["cheque_file"]=1
      projectionObj["form_completion"]=1
      projectionObj["bank_country"]=1
      projectionObj["bank_state"]=1
      projectionObj["bank_city"]=1
      projectionObj["bank_zipcode"]=1

    }else if(projType==="education"){
      projectionObj["ssc_file"]=1
      projectionObj["hsc_file"]=1
      projectionObj["degree_file"]=1
      projectionObj["educationDetails"]=1
      projectionObj["form_completion"]=1
    }else if(projType==="bgv"){

      projectionObj["authorization_form"]=1
      projectionObj["verification_form"]=1
      projectionObj["form_completion"]=1

    }else if(projType==="personal"){

      projectionObj["user_id"]=1
      projectionObj["firstname"]=1
      projectionObj["lastname"]=1
      projectionObj["email"]=1

      projectionObj["dob"]=1
      projectionObj["gender"]=1
      projectionObj["mobile"]=1
      projectionObj["marital_status"]=1
      projectionObj["blood_group"]=1

      projectionObj["aadhar_num"]=1
      projectionObj["aadhar_file"]=1
      projectionObj["pan_num"]=1
      projectionObj["pan_file"]=1

      projectionObj["uan_num"]=1
      projectionObj["uan_file"]=1
      projectionObj["esic_num"]=1
      projectionObj["esic_file"]=1

      projectionObj["present_addr"]=1
      projectionObj["present_country"]=1
      projectionObj["present_state"]=1
      projectionObj["present_district"]=1
      projectionObj["present_zipcode"]=1

      projectionObj["permanent_addr"]=1
      projectionObj["permanent_country"]=1
      projectionObj["permanent_state"]=1
      projectionObj["permanent_district"]=1
      projectionObj["permanent_zipcode"]=1

      projectionObj["display_profile_file"]=1
      projectionObj["emergencyContacts"]=1
      projectionObj["familyDetails"]=1
      projectionObj["form_completion"]=1
      projectionObj["billing_type"] = 1
      projectionObj["_id"]=1

    }else if(projType==="edit"){
      projectionObj["firstname"] = 1
      projectionObj["lastname"] = 1
      projectionObj["billing_type"] = 1
      projectionObj["email"] = 1
      projectionObj["job_type"] = 1
      projectionObj["monthly_ctc"] = 1
      projectionObj["salary_type"] = 1
      projectionObj["designation"] = 1
      projectionObj["user_role"] = 1
      projectionObj["user_status"] = 1
      projectionObj["yearly_ctc"] = 1
      projectionObj["reportsTo"] = 1
      projectionObj["passwordHash"] = 1
      projectionObj["user_id"] = 1
    }
  }

  return projectionObj

}

//Get Employee By Id
methods.getOne=asyncHandler(async (req, res) => {
  const { user_id } = req.params;

  let generatedProjection = projectionGenerator(req.query)

  const check = await crud.getDocument(employee,{"_id":user_id}, {...generatedProjection}, {});

  if(!check || !check?.length) throw new Error('Data not Found!')
  try{
    if(req.query.projtype && req.query.projtype==="edit"){
      check[0]["passwordHash"] = ""
    }
    success(res, 200, true, "Get Successfully", check[0] );
  }catch(err) {
    throw new Error(err);
  }
})
router.get('/:user_id', methods.getOne)

const generateCompleteObject = (employeeObj,mapObj) => {

  let objReturn = {}

  //console.log("employee:",employeeObj)
  //console.log("mapObj:",mapObj)

  for(let key in mapObj){
    objReturn[key] = employeeObj[key]
  }

  //console.log("obj return:",objReturn)
  return objReturn

}

//Get Employee By Id for detailed expansion view
methods.getOneComplete=asyncHandler(async (req, res) => {
  const { user_id } = req.params;

  let responseBody = {}

  
  let bankDetails = projectionGenerator({"projtype":"bank"})
  let bgvDetails = projectionGenerator({"projtype":"bgv"})
  let personalDetails = projectionGenerator({"projtype":"personal"})
  let educationDetails = projectionGenerator({"projtype":"education"})
  // console.log("education---------",educationDetails)

  personalDetails["job_type"] = 1
  personalDetails["designation"] = 1
  personalDetails["user_status"] = 1

  let basicProj = {...bankDetails,...bgvDetails,...personalDetails} 
  let eduProj = educationDetails
  let totalProj = {...basicProj,...eduProj}

  console.log("basic-proj",bankDetails)
  console.log("total-proj",totalProj)

  const check = await crud.getDocument(employee,{"_id":user_id}, {...totalProj}, {});
  let workExperienceDetails = await crud.getDocument(workexperience, {"employee_id":user_id},{},{})

  responseBody["basic"] = generateCompleteObject(check[0],basicProj)
  responseBody["education"] = generateCompleteObject(check[0],eduProj)
  responseBody["experience"] = workExperienceDetails
  
  if(!check || !check.length) throw new Error('Data not Found!')
  try{
    success(res, 200, true, "Get Successfully",responseBody );
  }catch(err) {
    throw new Error(err);
  }
})
router.get('/complete/:user_id', methods.getOneComplete)

const checkFileBody = (fileBody,fieldName) => {
  if(!fileBody?.length)
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

const additionalEducationMngr = (dataBody,fileBody,exceptionArr) => {

  let additionalObjects = {}

  for(let feildKey in dataBody){
    if(!exceptionArr.includes(feildKey)){
      additionalObjects[feildKey] = JSON.parse(dataBody[feildKey])
    }
  }

  fileBody.forEach(file => {
    if(!exceptionArr.includes(file.fieldname)){
      additionalObjects[file.fieldname] = file
    }
  });

  console.log("add-dataBody:",dataBody)
  console.log("add-fileBody:",fileBody)
  console.log("exceptionArr",exceptionArr)
  console.log("additionalObjects",additionalObjects)

  return Object. keys(additionalObjects).length?additionalObjects:undefined;

}

methods.profile = asyncHandler(async (req, res) => {

  const { user_id } = req.params;
  console.log("req.body",req.body)
  console.log("req.files",req.files)

  let filesArr = req.files
  let reqObj = req.body

  reqObj["display_profile_file"] = filesArr[0]

  const check = await crud.getDocument(employee,{"user_id":user_id},{},{});
  if (!check) throw new Error('Data not Found!')
  try{
    success(res, 200, true, 'Update Successfully', await crud.updateOne(employee, {"user_id":user_id}, reqObj, {}));
  }catch(err) {
    console.log("profile pic err:",err)
    throw new Error(err);
  }

})
router.post('/:user_id',upload.any(),methods.profile )

const updateFormCompletion = async (user_id) => {

  let projectionObj = {}
  projectionObj["aadhar_num"]=1
  projectionObj["authorization_form"]=1
  projectionObj["account_num"]=1
  projectionObj["hsc_file"]=1

  const check = await crud.getDocument(employee,{"_id":user_id}, {...projectionObj}, {});
  let user_data = check[0]
  let form_percentage = 0
  if(user_data["aadhar_num"]){
    form_percentage+=20
  }
  if(user_data["present_addr"]){
    form_percentage+=5
  }
  if(user_data["emergencyContacts"]){
    form_percentage+=5
  }
  if(user_data["familyDetails"]){
    form_percentage+=5
  }
  if(user_data["authorization_form"]){
    form_percentage+=25
  }
  if(user_data["account_num"]){
    form_percentage+=25
  }
  if(user_data["hsc_file"]){
    form_percentage+=25
  }
  console.log("user-data:",user_data)
  console.log("form%",form_percentage)
  await crud.updateOne(employee, {"_id":user_id}, {"form_completion":form_percentage}, {})
}

//Edit Employee
methods.edit =asyncHandler(async (req, res) => {
  const { user_id } = req.params;
  console.log("req.query",req.query)

  console.log("reqq",req.files)
  // if(req?.query?.edittype==="bank"){
  //   fileUpdateMngr(req.body,req.files,["cheque_file"])
  // }

  // if(req?.query?.edittype==="bgv"){
  // console.log("req.query",req.query)

  //   fileUpdateMngr(req.body,req.files,["authorization_form","verification_form"])
  // }

  // if(req?.query?.edittype==="education"){
  //   let required_files = ["ssc_file","hsc_file","degree_file"]
  //   fileUpdateMngr(req.body,req.files,required_files)
  //   let additionalObject = additionalEducationMngr(req.body,req.files,required_files)
  //   if(additionalObject)
  //     req.body["educationDetails"] = additionalObject
  // }

  if(req?.files?.length > 0){
    req.files.map((file)=> {
      req.body[file.fieldname]=file.path
    })
  }

  const check = await crud.getDocument(employee,{"user_id":user_id},{},{});
  if (!check) throw new Error('Data not Found!')
  try{
    console.log("rrrr",req.body)
    let updateResponse = await crud.updateOne(employee, {"_id":user_id}, req.body, {})
    await updateFormCompletion(user_id)
    success(res, 200, true, 'Update Successfully', updateResponse);
  }catch(err) {
    console.log("file err:",err)
    throw new Error(err);
  }
})
router.put('/:user_id',upload.any(),methods.edit )

module.exports = router;