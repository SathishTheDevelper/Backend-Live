const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const { candidate,interview,candidatelog, employee,admin, job, roles, clients } = require("../../utils/schemaMaster");
const { statuslog } = require("../../utils/schemaMaster");
const { totallogs,skils,locations } = require("../../utils/schemaMaster");
const bcrypt = require("bcrypt");



const { workexperience } = require("../../utils/schemaMaster");
const { success } = require("../../utils/response");
const crud_service = require("../../utils/crud_service");
const validateId = require("../../utils/validateId");
const { authAdmin } = require("../../middlewares/authMiddlewares");
const upload = require("../../utils/upload");
const multer = require('multer');
const sendStatusChange = require("../../utils/StatusChangeMail");
const clientSendMail = require("../../utils/ClientSendMail");
const storage = multer.memoryStorage();
const upload1 = multer({ storage: storage });

const ObjectId = mongoose.Types.ObjectId;

const crud = new crud_service();

const methods = { authAdmin };

 function storeFileds() {
  console.log("file working")
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./uploads/");
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + Math.random() + path.extname(file.originalname));
    },
  });
 
}


function getMonthName(month) {
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return monthNames[month - 1];
}

//create

methods.add = asyncHandler(async (req, res) => {

const imageId = new ObjectId();

  if (req?.user) {
    req.body.candidate_owner = req?.user?._id
    req.body.company_id=req.user?.company_id
  }
 
  if (req?.file){
    req.body.resume=req?.file?.path;
 
    req.body.resumeArray    =[{
      name:req.body.attachment_name,
    
      image: [{ _id: imageId, filepath: req.file.path }]
    }]
  }
 
  try {
    const count=await candidatelog.countDocuments({})
    req.body.candidate_id=count? count+1:2000
    const exist = await crud.getOneDocument(candidate,{ email_id: req.body.email_id },{},{});
    if(!exist){
      let created = await crud.insertOne(candidate, req.body);
    let createdlog=await crud.insertOne(candidatelog,{...req.body,candidateoriginal_id:created?._id})
    let update =await crud.updateById(job, req.body?.job_id,{updatedAt:new Date()},{ new: true })
    let clintsingle=await crud.getOneDocumentById(job,created?.job_id,{},{populate:"client_id created_by"})
     await clientSendMail(clintsingle,created,req?.user)
    let logs = await crud.insertOne(statuslog, {
      candidate_id: createdlog._id,
      children: [
        {
          status: created.status,
          created_by: created.candidate_owner,
        },
      ],
    });
   if(req.body.job_id){
    const totallogsdata =await crud.insertOne(totallogs,{
      job_id:created.job_id,
      candidate_id:createdlog._id,
      created_by:req?.user?._id,
      client_id:created?.client_id,
      status:created.status
    })
   }

   
  if(req.body.preferred_location&&req.body.preferred_location?.length>0){
       let data=[...req.body.preferred_location,req.body.current_location] 
        
    Promise.all(data.map( async(item)=>{
     let dataexist= await locations.find({name:item})
     
     if(dataexist?.length ==0){
        let created= await crud.insertOne(locations, {name:item}) 
       
     }
   }))
  }
    success(res, 201, true, "Create Successfully", created);
    }
    else{
      throw new Error("Already Exist For this EmailID In Database please Check!!!!");
         
      }
    
  } catch (err) {
    throw new Error(err);
  }
});

router.post("/", upload.single("image"), methods.authAdmin, methods.add);

methods.resumeEdit = asyncHandler(async (req, res) => {

  const { id } = req.params;
  const exist = await crud.getOneDocumentById(candidate, id, {}, {});
  
  
   
    
  try {

    console.log("req.body", req.body);
    const loop =req.files
    console.log("loop", loop)

    const data=[]
    for (let index = 0; index < req.body?.resume?.length; index++) {

      const element = loop.filter((item,i)=>item.fieldname ==`resume[${index}]upload_file` )
                          .map((item)=>{
                            const imageId = new ObjectId();
                            return { _id: imageId, filepath: item.path };})

    const existfiles=exist?.resumeArray||[]
                       
       if(existfiles[index]?.image){
        existfiles[index]?.image.map((item)=>{
          element.push(item)
        })
       }
      data.push({
        image: element,
        name:req?.body?.resume[index].attachment_name
      })
      
    }

    let updated=await crud.updateById(candidate, id,{resumeArray:data}, { new: true })


    success(res, 201, true, "Updated Successfully", updated);
    

    
   
 
    // Check if req.body.resume is defined and not null
   
  } catch (error) {
    console.error('Error processing resume data and files:', error);
    // Send an error response
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
  // Your remaining code...
});

router.put("/resumecreate/:id", upload.any(),  methods.resumeEdit);
methods.employeedocumentsEdit = asyncHandler(async (req, res) => {

  const { id } = req.params;
  const exist = await crud.getOneDocumentById(candidate, id, {}, {});
  
  
   
    
  try {

    console.log("req.body", req.body);
    const loop =req.files
    console.log("loop", loop)

    const data=[]
    for (let index = 0; index < req.body?.EmployeeDocuments?.length; index++) {

      const element = loop.filter((item,i)=>item.fieldname ==`EmployeeDocuments[${index}]upload_file` )
                          .map((item)=>{
                            const imageId = new ObjectId();
                            return { _id: imageId, filepath: item.path };})

    const existfiles=exist?.EmployeeDocuments||[]
                       
       if(existfiles[index]?.image){
        existfiles[index]?.image.map((item)=>{
          element.push(item)
        })
       }
      data.push({
        image: element,
        name:req?.body?.EmployeeDocuments[index].attachment_name
      })
      
    }

    let updated=await crud.updateById(candidate, id,{EmployeeDocuments:data}, { new: true })


    success(res, 201, true, "Updated Successfully", updated);
    

    
   
 
    // Check if req.body.resume is defined and not null
   
  } catch (error) {
    console.error('Error processing resume data and files:', error);
    // Send an error response
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
  // Your remaining code...
});
router.put("/employeedocumentscreate/:id", upload.any(),  methods.employeedocumentsEdit);

methods.personaldocumentscreate = asyncHandler(async (req, res) => {

  const { id } = req.params;
  const exist = await crud.getOneDocumentById(candidate, id, {}, {});
  
  
   
    
  try {

    console.log("req.body", req.body);
    const loop =req.files
    console.log("loop", loop)

    const data=[]
    for (let index = 0; index < req.body?.PersonalDocuments?.length; index++) {

      const element = loop.filter((item,i)=>item.fieldname ==`PersonalDocuments[${index}]upload_file` )
                          .map((item)=>{
                            const imageId = new ObjectId();
                            return { _id: imageId, filepath: item.path };})

    const existfiles=exist?.EmployeeDocuments||[]
                       
       if(existfiles[index]?.image){
        existfiles[index]?.image.map((item)=>{
          element.push(item)
        })
       }
      data.push({
        image: element,
        name:req?.body?.PersonalDocuments[index].attachment_name
      })
      
    }

    let updated=await crud.updateById(candidate, id,{PersonalDocuments:data}, { new: true })


    success(res, 201, true, "Updated Successfully", updated);
    

    
   
 
    // Check if req.body.resume is defined and not null
   
  } catch (error) {
    console.error('Error processing resume data and files:', error);
    // Send an error response
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
  // Your remaining code...
});
router.put("/personaldocumentscreate/:id", upload.any(),  methods.personaldocumentscreate);

methods.resumeRemoveImage = asyncHandler(async (req, res) => {
  const { id, imageId } = req.params;

  try {
    // Use $pull to remove the image with the specified _id from the image array
    const updatedCandidate = await candidate.findByIdAndUpdate(
      id,
      { $pull: { 'resumeArray.$[outer].image': { _id: new ObjectId(imageId) } } },
      {
        new: true,
        arrayFilters: [{ 'outer.image._id': new ObjectId(imageId) }],
      }
    );

    if (!updatedCandidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    res.status(200).json({ success: true, message: 'Image removed successfully', updatedCandidate });
  } catch (error) {
    console.error('Error removing image:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});


router.put("/removeimage/:id/:imageId",  methods.resumeRemoveImage);

methods.addlog = asyncHandler(async (req, res) => {
  if (req?.user) req.body.candidate_owner = req?.user?._id;
  if (req?.file) req.body.resume = req?.file?.path?req?.file?.path:req.body.resume;
  try {
    const exist = await crud.getOneDocument(candidate,{_id:req.body.candidateoriginal_id},{},{});
    console.log("exist",exist)
    if(exist&& exist.resumeArray?.length>0){
    const foundObject =exist?. resumeArray?.find(item => item.name === req.body.attachment_name||"");
    req.body.resume=foundObject?.image[0]?.filepath?foundObject?.image[0]?.filepath:req.body.resume
        
    }
    const existjob = await crud.getOneDocument(candidatelog,{candidateoriginal_id:req.body.candidateoriginal_id,job_id:req.body.job_id},{},{});
     if (existjob) {
    throw new Error("Already Assigned This Candidate For This Job please Check!!!!");
       
     }
    let created = await crud.insertOne(candidatelog, req.body);


    let logs = await crud.insertOne(statuslog, {
      candidate_id: created._id,
      children: [
        {
          status: created.status,
          created_by: created.candidate_owner,
        },
      ],
    });
     const totallogsdata =await crud.insertOne(totallogs,{
      job_id:created.job_id,
      candidate_id:created._id,  
      created_by:req?.user?._id,
      status:created.status
    })
    success(res, 201, true, "Assigned Successfully", created);
  } catch (err) {
    throw new Error(err);
  }
});

router.post("/logcreate", upload.single("image"), methods.authAdmin, methods.addlog);

methods.Alladd = asyncHandler(async (req, res) => {
  if (req?.user) req.body.candidate_owner = req?.user?._id;
  if (req?.file) req.body.resume = req?.file?.path;


  try {

     const exist = await crud.getOneDocument(candidate,{ email_id: req.body.email_id },{},{});
    console.log("exist",exist)
    if(!exist){
      let created = await crud.insertOne(candidatelog, req.body);
      let createdlog=await crud.insertOne(candidatelog,{...req.body,candidateoriginal_id:created?._id})
  
  
      let logs = await crud.insertOne(statuslog, {
        candidate_id: created._id,
        children: [
          {
            status: created.status,
            created_by: created.candidate_owner,
          },
        ],
      });
       const totallogsdata =await crud.insertOne(totallogs,{
        job_id:created.job_id,
        candidate_id:created._id,  
        created_by:req?.user?._id,
        status:created.status
      })
  
      if(req.body.candidateskills&&req.body.candidateskills?.length>0){
       
         Promise.all(req.body.candidateskills.map( async(item)=>{
          let dataexist= await skils.find({name:item.skill})
          
          if(dataexist?.length ==0){
             let created= await crud.insertOne(skils, {name:item}) 
            
          }
        }))
     }

    success(res, 201, true, "Assigned Successfully", created);

    }
    else{
    throw new Error("Already Exist For this EmailID In Database please Check!!!!");
       
    }


  } catch (err) {
    throw new Error(err);
  }
});

router.post("/create", upload.single("image"), methods.authAdmin, methods.Alladd);


// Add InterView
methods.add = asyncHandler(async (req, res) => {
  if (req?.user) req.body.created_by = req?.user?._id;

  try {
    let created = await crud.insertOne(interview, req.body);
  
    success(res, 201, true, "Created Successfully", created);
  } catch (err) {
    throw new Error(err);
  }
});

router.post("/interview", methods.authAdmin, methods.add);

//getall
methods.getAll = asyncHandler(async (req, res) => {

    console.log("jjjjjjjjjjj")
  
  try {
     let query ={
       ...req.query
     }

     if(req.user.role  =="Vendor"){
      query.candidate_owner =req.user._id
     }

    const getCandidates=await candidatelog.find(query).populate({
      path: "candidate_owner",
    }).populate({
      path: "job_id",
      model: "jobs",
      populate: {
        path: "client_id",  
        model: "clients",
      },
    }).populate("candidateoriginal_id");

    const sortedCandidates = getCandidates.sort((a, b) => {
      // Compare b.createdAt and a.createdAt to reverse the sorting order
      return b.createdAt - a.createdAt;
    });
    success(
      res,
      200,
      true,
      "Get Successfully",
      sortedCandidates)

      
  } catch (err) {
    throw new Error(err);
  }
});
router.get("/",authAdmin, methods.getAll);
methods.getAllList = asyncHandler(async (req, res) => {
  let company_id =req.user?.company_id||null;
  const currentDate = new Date();
   
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10; 
  let keywords = req.query.keywords
  console.log("query",keywords);
   let filter={
    
   }
   if(keywords){
    filter.$or = [

      { email_id: { $regex: keywords, $options: "i" } },
      { first_name: { $regex: keywords, $options: "i" } },
      { last_name: { $regex: keywords, $options: "i" } },
      {
        "workExperiences.organization": { $regex: keywords, $options: "i" }
      },
      {
        "workExperiences.designation": { $regex: keywords, $options: "i" }
      },
      { phone_no: { $regex: keywords, $options: "i" } } , // case-insensitive search for email_id
      // { phonenumber: { $regex: keywords, $options: "i" } }, // case-insensitive search for phonenumber
      { skills: { $regex:keywords, $options: "i" } }, // case-insensitive search for skills
      { locations: { $regex: keywords, $options: "i" } }, // case-insensitive search for locations
      { experience: { $regex: keywords, $options: "i" } } // case-insensitive search for experience
    ]
   }

   if(req.query.skills){
   
    console.log("skill_required",req.query.skill_required)

    if(req.query.skill_required){
      
    
      filter.skills = {
        $all: req.query.skills.map(skill => new RegExp(skill, 'i'))
      };
    }
    else{
      filter.skills = {
        $in: req.query.skills.map(skill => new RegExp(skill, 'i'))
      };
    }
   
   }

   if (req.query.minExp) {
   
    filter.to_exp_from = { $gte: parseInt(req.query.minExp) };
  }
  if(company_id){
    filter.company_id = company_id
    // filter. = { $regex: new RegExp(req.query.job_title, 'i') }
  }

  if(req.query.organization) {
    console.log("organization",req.query.organization)
    filter.workExperiences = {
      $elemMatch: {
        organization: { $regex: new RegExp(req.query.organization, 'i') }
      }
    };
  }
  if(req.query.designation) {
    filter.workExperiences = {
      $elemMatch: {
        designation: { $regex: new RegExp(req.query.designation, 'i') }
      }
    };
  }

  
  if (req.query.maxExp || req.query.minExp) {
    filter.to_exp_from  = { 
      $gte:parseInt(req.query.minExp),
      $lte: parseInt(req.query.maxExp) };
  }

  if(req.query.gender){
    filter.gender = { $regex: new RegExp(req.query.gender, 'i') };
   }
   if(req.query.empStatus && req.query.empStatus !=="Any"){
    filter.empStatus = { $regex: new RegExp(req.query.empStatus, 'i') };
   }
   if (req.query.current_location) {
    filter.current_location = { $regex: new RegExp(req.query.current_location, 'i') };
  }

  if (req.query.minCTC ||req.query.maxCTC) {
    filter.current_ctc = { $gte: parseFloat(req.query.minCTC), $lte: parseFloat(req.query.maxCTC) };
  }
  


  if (req.query.preffered_location) {
    
    filter.preferred_location = {
      $in:req.query.preffered_location.map(location => new RegExp(location, 'i'))
    };
  }

  if (req.query.minAge && req.query.maxAge) {
    const currentYear = new Date().getFullYear();
    const minBirthYear = currentYear - parseInt(req.query.minAge);
    const maxBirthYear = currentYear - parseInt(req.query.maxAge);
  
    filter.dob = {
      $gte: new Date(`${minBirthYear}-01-01T00:00:00.000Z`),
      // $lte: new Date(`${maxBirthYear}-12-31T23:59:59.999Z`),
    };
  }

   if(req.query.role){
    console.log("role",req.query.role);
    filter.roll_name = { $regex: new RegExp(req.query.role, 'i') };
   }



 console.log("filter",filter);
  
  try {
    const totalCount = await candidate.countDocuments(filter); 
    const getCandidates=await candidate.find(filter).populate({
      path: "candidate_owner",
      
    }).populate({
      path: "job_id",
      model: "jobs",
      populate: {
        path: "client_id",  
        model: "clients",
      },
    })
    .select("first_name email_id phone_no last_name created_At skills current_location to_exp_from to_exp_to re_exp_from re_exp_to preferred_location current_ctc roll_name")
     .sort({ createdAt: -1 })
    .skip((page - 1) * limit) // Skip records based on the page number
  .limit(limit); 
   
    let senddata={
      total:totalCount,
      data:getCandidates
    }
    success(
      res,
      200,
      true,
      "Get Successfully",
      senddata)
  } catch (err) {
    throw new Error(err);
  }
});
router.get("/list",authAdmin, methods.getAllList);

//getone

methods.getOne = asyncHandler(async (req, res) => {
  console.log("==================working id");

  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(candidatelog, id, {}, {});
  if (!check) throw new Error("Data not Found!");
  try {

    let find = await candidatelog.findById(id).populate({
      path: "job_id",
      model: "jobs",
      select:"job_type job_title salaryType",
      populate: {
        path: "client_id",  
        model: "clients",
        select:"name currency"
      },
    })
    success(
      res,
      200,
      true,
      "Get Successfully",
      find
    );
  } catch (err) {
    throw new Error(err);
  }
});
router.get("/single/:id", methods.getOne);
methods.interviewtimeline = asyncHandler(async (req, res) => {
 

  const { id } = req.params;
  validateId(id);
 
  try {

     let senddata =await interview.find({candidate_id:id}).populate({
      path: "candidate_id",
      model: "candidatelogs",
      select: 'first_name last_name',
      populate: {
        path: "job_id",  
        model: "jobs",
      select: 'job_title',

        populate: {
          path: "client_id",  
          model: "clients",
      select: 'name',

          
        },
      },
    })
     
    success(
      res,
      200,
      true,
      "Get Successfully",
      senddata
    );
  } catch (err) {
    throw new Error(err);
  }
});
router.get("/interviewtimeline/:id", methods.interviewtimeline);
methods.editResume = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(candidate, id, {}, {});

  
  try {
    if (req?.file) req.body.resume = req?.file?.path;

   let result = await crud.updateOne(candidatelog, {candidateoriginal_id:id}, req.body, { new: true })
       await crud.updateById(candidate, id,req.body, { new: true })
    console.log("req", req?.body);
    success(
      res,
      200,
      true,
      "Update Successfully",
      result
    );
  } catch (err) {
    throw new Error(err);
  }
});
router.put("/resume/:id", upload.single("image"), methods.editResume)

methods.editSkill = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(candidate, id, {}, {});
  
  let skilldata= req.body.candidateskills?.map((item)=>item.skill)
  console.log("ffff1", req.body.candidateskills)

  console.log("ffff",skilldata)
  if(check){
    const combinedSet = [...check.skills, ...skilldata];
    const final_set = [...new Set(combinedSet)];  
  
  try {
   

   let result = await crud.updateOne(candidatelog, {candidateoriginal_id:id}, {skills:final_set}, { new: true })
       await crud.updateById(candidate, id,{skills:final_set}, { new: true })
    console.log("req", req?.body);
    success(
      res,
      200,
      true,
      "Update Successfully",
      result
    );
  } catch (err) {
    throw new Error(err);
  }}
});
router.put("/skill/:id", methods.editSkill)

//Edit
methods.edit = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(candidatelog, id, {}, {});
  if (!check) throw new Error("Data not Found!");
  try {
    if (req?.file) req.body.resume = req?.file?.path;
    console.log("req", req?.body);
    success(
      res,
      200,
      true,
      "Update Successfully",
      await crud.updateById(candidatelog, id, req.body, { new: true })
    );
  } catch (err) {
    throw new Error(err);
  }
});


router
  .put("/:id", upload.single("image"), methods.edit)
 
   
  //delete
  .delete(
    "/:id",
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      validateId(id);
      const check = await crud.getOneDocumentById(candidatelog, id, {}, {});
      if (!check) throw new Error("Data not Found!");
      try {
        success(
          res,
          200,
          true,
          "Delete Successfully",
          await crud.deleteById(candidatelog, id)
        );
      } catch (err) {
        throw new Error(err);
      }
    })
  )

  // Candidate View Page Edit
  .put(
    "/edit/:id",
    // authAdmin,
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      validateId(id);
      const check = await crud.getOneDocumentById(candidatelog, id, {}, {});
      if (!check) throw new Error("Data not Found!");
      try {
      let send=  await crud.updateById(candidatelog, id, req.body, { new: true })
      console.log(res);
      let originalEdit=  await crud.updateById(candidate, res.candidateoriginal_id, req.body, { new: true })
       console.log("ggg",originalEdit);
        success(
          res,
          200,
          true,
          "Update Successfully",
          send
        );
      
       
       
        // let logsdata = await crud.getOneDocument(
        //   statuslog,
          
        //   { candidate_id: id },
        //   {},
        //   {}
        // );
      
        
      } catch (err) {
        throw new Error(err);
      }
    })
  )

  // Status Change

  .put(
    "/status/:id",
    authAdmin,
    asyncHandler(async (req, res) => {
      const { id } = req.params;

      validateId(id);
      const check = await crud.getOneDocumentById(candidatelog, id, {}, {});
      if (!check) throw new Error("Data not Found!");
      try {
        let logsdata = await crud.getOneDocument(
          statuslog,
          
          { candidate_id: id },
          {},
          {}
        );
        let exists =logsdata.children?.some((children)=>children?.status ==req?.body?.status)
        if(exists){
          throw new Error("Already exists this Status!");
        }
        else{
           let status = await candidatelog.findByIdAndUpdate(id, req.body, { new: true })
           .populate({
            path: "candidate_owner",
          }).populate({
            path: "job_id",     
            model: "jobs",
            populate: {
              path: "client_id",   
              model: "clients",
            },
          }).populate("candidateoriginal_id")
          .exec();
          console.log("status",status)
          await sendStatusChange({status,previous: check.status,Toemail:req?.user?.email_id,Toname:req?.user?.name,user:req.user})
          if(status.status =="Submitted"||status.status =="Client submission"||status.status =="Client screen Reject"||status.status =="L1 schedule"|| status.status =="L1 No show"||status.status =="Offered"||status.status =="Joined"){
             let jobupdate =await crud.updateById(job, status?.job_id,{updatedAt:new Date()},{ new: true })
            //  let candidateupdate =await crud.updateById(candidatelog, status?._id,{updatedAt:new Date()},{ new: true })
             console.log("updated",jobupdate)
            const totallogsdata =await crud.insertOne(totallogs,{
              job_id:status.job_id?._id,
              candidate_id:id,
              client_id:status.job_id?.client_id[0] ,
              created_by:status?.candidate_owner,
              status:status.status
            })
          }
          logsdata.children?.push({
            status: status.status,
            created_by:req?.user?._id,
          });
          if(status.status == "Offered"){
            const salt = bcrypt.genSaltSync(10);
             let data={
              
                "_id":status?._id,
                "firstname":status?.first_name,
                "lastname":status?.last_name,
                "password":"Welcome@9091",
                "role":"Employee",
                "email":status?.email_id
               
                
          

             }   
             let admin_data={
              
              "_id":status?._id,
              "name":status?.first_name,
              
              "password":await bcrypt.hash("Welcome@9091",salt),
              "role":"Employee",
              "email_id":status?.email_id
             
              
        

           }  
             const create = await crud.insertOne(employee, data);
             const create_admin_login = await crud.insertOne(admin,{ _id:create?._id,...admin_data}); 
             if(create_admin_login){
              let role = await crud.getDocument(roles, {name:create_admin_login?.role},{_id:1},{})
            
              let updatepermission= await crud.updateById(admin, create_admin_login?._id, {permission:role[0]?._id}, { new: true })
             }

          const resdata = await logsdata.save();
          success(res, 200, true, "Update Successfully", status);


          }
  
        
          const resdata = await logsdata.save();
          console.log("res",resdata)
          success(res, 200, true, "Update Successfully", status);
        }

        // console.log("lllllllllllll",req?.body?.date)
       
       
        // // let logsdata = await crud.getOneDocument(
        // //   statuslog,
          
        // //   { candidate_id: id },
        // //   {},
        // //   {}
        // // );
      
        // console.log("status", resdata);
        
      } catch (err) {
        throw new Error(err);
      }
    })
  )
  .get(
    "/timeline/:id",
    asyncHandler(async (req, res) => {
      let onbording = [];
      let screening = [];
      let interviewing = [];
      let data = await crud.getOneDocument(
        statuslog,
        { candidate_id: req?.params?.id },
        {},
        { populate: "children.created_by" }
      );
      console.log("dara", data);
      await data?.children?.map((child) => {
        if (child.status == "On Bording") {
          onbording.push(
            `<h5 style={{color:'#30409F'}}>On Bordted</h5>,<div style={{display:'flex', alignItems:'center',gap:'30px'}}><div className='timeline_content'><p>${child.status} <br/> By ${child.created_by?.name}</p></div><span>${child.cratedAt}</span></div>`
          );
        }
      });

      let sendingdata = [];
      if (onbording.length > 0) {
        sendingdata.push({
          dot: `<CheckOutlined  className="timeline-clock-icon" />`,
          color: "red",
          children: onbording,
        });
      }
      try {
        success(res, 200, true, "Get Successfully", data);
      } catch (err) {
        throw new Error(err);
      }
    })
  )
  .get(
    "/screening/",
    asyncHandler(async (req, res) => {
      console.log("req?.query", req.query);
      try {
        success(
          res,
          200,
          true,
          "Get Successfully",
          await crud.getDocument(
            candidatelog,
            {
              job_id: req?.query?.job_id,
              status: {
                $in: ["Internal screen Reject", "Submitted","Screening Submitted","Internal Duplicate"],
              },
            },
            {},
            { populate: "candidate_owner" }
          )
        );
      } catch (err) {
        throw new Error(err);
      }
    })
  )

  .get(
    "/submission/",
    asyncHandler(async (req, res) => {
      console.log("req?.query", req.query);
      try {
        success(
          res,
          200,
          true,
          "Get Successfully",
          await crud.getDocument(
            candidatelog,
            {
              job_id: req?.query?.job_id,
              status: {
                $in: [
                  
                
                  "Client submission",
                  "Client Duplicate",
                  "Client screen Reject"
                ],
              },
            },
            {},
            { populate: "candidate_owner" }
          )
        );
      } catch (err) {
        throw new Error(err);
      }
    })
  )
  .get(
    "/interview/",
    asyncHandler(async (req, res) => {
      console.log("req?.query", req.query);
      try {
        success(
          res,
          200,
          true,
          "Get Successfully",
          await crud.getDocument(
            candidatelog,
            {
              job_id: req?.query?.job_id,
              status: {
                $in: [
                  "L1 schedule",
                  "L1 feedback pending",
                  "L1 No show",
                  "L1 select",
                  "L1 Hold",
                  "L1 Reject",
                  "L2 schedule",
                  "L2 feedback pending",
                "L2 No show",
                  "L2 select",
                  "L2 Hold",
                  "L2 Reject",
                  "L3 schedule",
                  "L3 feedback pending",
                  "L3 No show",
                  "L3 select",
                  "L3 Hold",
                  "L3 Reject",
                  "Position Hold",
                ],
              },
            },
            {},
            { populate: "candidate_owner" }
          )
        );
      } catch (err) {
        throw new Error(err);
      }
    })
  )
  .get(
    "/allstaus",
    asyncHandler(async (req, res) => {
      console.log("req?.query", req.query);
  
      const pipeline = [
        {
          $match: {
            job_id: new mongoose.Types.ObjectId(req?.query?.job_id),
          }
        },
        
        {
          $facet: {
            screening: [
              {
                $match: {
                  status: {
                    $in: ["Internal screen Reject", "Submitted", "Screening Submitted", "Internal Duplicate"]
                  }
                },
               
              },
              {
                $lookup: {
                  from: "admins", // Assuming 'candidateowner' is the collection name
                  localField: "candidate_owner",
                  foreignField: "_id",
                  as: "candidateownerData"
                }
              },
              {
                $project: {
                  "first_name":1,
                  "last_name":1,
                  "email_id":1,
                  "phone_no":1,
                "status":1,
                  "Owner": { $arrayElemAt: ["$candidateownerData.name", 0] } // Replace 'name' with the actual field name you want to include
                }
              }
            ],
            submission: [
              {
                $match: {
                  status: {
                    $in: ["Client submission", "Client Duplicate", "Client screen Reject"]
                  }
                }
              },
              {
                $lookup: {
                  from: "admins", // Assuming 'candidateowner' is the collection name
                  localField: "candidate_owner",
                  foreignField: "_id",
                  as: "candidateownerData"
                }
              },
              {
                $project: {
                  "first_name":1,
                  "last_name":1,
                  "email_id":1,
                  "phone_no":1,
                "status":1,
                  "Owner": { $arrayElemAt: ["$candidateownerData.name", 0] } // Replace 'name' with the actual field name you want to include
                }
              }
             
            ],
            interview: [
              {
                $match: {
                  status: {
                    $in: [
                      "L1 schedule", "L1 feedback pending", "L1 No show", "L1 select", "L1 Hold", "L1 Reject",
                      "L2 schedule", "L2 feedback pending", "L2 No show", "L2 select", "L2 Hold", "L2 Reject",
                      "L3 schedule", "L3 feedback pending", "L3 No show", "L3 select", "L3 Hold", "L3 Reject",
                      "Position Hold"
                    ]
                  }
                }
              },
              {
                $lookup: {
                  from: "admins", // Assuming 'candidateowner' is the collection name
                  localField: "candidate_owner",
                  foreignField: "_id",
                  as: "candidateownerData"
                }
              },
              {
                $project: {
                  "first_name":1,
                  "last_name":1,
                  "email_id":1,
                  "phone_no":1,
                "status":1,
                  "Owner": { $arrayElemAt: ["$candidateownerData.name", 0] } // Replace 'name' with the actual field name you want to include
                }
              }
            ],
            offered: [
              {
                $match: {
                  status: { $in: ["Offered"] }
                }
              },
              {
                $lookup: {
                  from: "admins", // Assuming 'candidateowner' is the collection name
                  localField: "candidate_owner",
                  foreignField: "_id",
                  as: "candidateownerData"
                }
              },
              {
                $project: {
                  "first_name":1,
                  "last_name":1,
                  "email_id":1,
                  "phone_no":1,
                "status":1,
                  "Owner": { $arrayElemAt: ["$candidateownerData.name", 0] } // Replace 'name' with the actual field name you want to include
                }
              },
             
            ],
            joined: [
              {
                $match: {
                  status: { $in: ["Joined"] }
                }
              },
              {
                $lookup: {
                  from: "admins", // Assuming 'candidateowner' is the collection name
                  localField: "candidate_owner",
                  foreignField: "_id",
                  as: "candidateownerData"
                }
              },
              {
                $project: {
                  "first_name":1,
                  "last_name":1,
                  "email_id":1,
                  "phone_no":1,
                "status":1,
                  "Owner": { $arrayElemAt: ["$candidateownerData.name", 0] } // Replace 'name' with the actual field name you want to include
                }
              }
            ]
            
          }
        }
      ];
  
      try {
        const result = await candidatelog.aggregate(pipeline);
        success(res, 200, true, "Data retrieved successfully", result);
      } catch (err) {
        console.error("Error occurred:", err);
        // error(res, 500, "An error occurred while processing the request");
      }
    })
  )
  .get(
    "/viewjobcount",
    authAdmin,
    asyncHandler(async (req, res) => {
      console.log("req?.query", req.query);
  
      const pipeline = [
        {
          $match: {
            job_id: new mongoose.Types.ObjectId(req?.query?.job_id),
            ...(req.user?.role =="Vendor" && {created_by:new mongoose.Types.ObjectId(req?.user?._id)})

          }

        },
        {
          $group: {
            _id: null,
            submissionCount: {
              $sum: {
                $cond: {
                  if: {
                    $in: ["$status", ["Internal screen Reject", "Submitted", "Screening Submitted", "Internal Duplicate"]]
                  },
                  then: 1,
                  else: 0
                }
              }
            },
            clientSubmissionCount: {
              $sum: {
                $cond: {
                  if: {
                    $in: ["$status", ["Client submission"]]
                  },
                  then: 1,
                  else: 0
                }
              }
            },
            interviewCount: {
              $sum: {
                $cond: {
                  if: {
                    $in: [
                      "$status", [
                        "L1 schedule", "L1 feedback pending", "L1 No show", "L1 select", "L1 Hold", "L1 Reject",
                        "L2 schedule", "L2 feedback pending", "L2 No show", "L2 select", "L2 Hold", "L2 Reject",
                        "L3 schedule", "L3 feedback pending", "L3 No show", "L3 select", "L3 Hold", "L3 Reject",
                        "Position Hold"
                      ]
                    ]
                  },
                  then: 1,
                  else: 0
                }
              }
            },
            offerCount: {
              $sum: {
                $cond: {
                  if: { $in: ["$status", ["Offered"]] },
                  then: 1,
                  else: 0
                }
              }
            },
            joinedCount: {
              $sum: {
                $cond: {
                  if: { $in: ["$status", ["Joined"]] },
                  then: 1,
                  else: 0
                }
              }
            }
          }
        }
      ];
  
      try {
        const result = await totallogs.aggregate(pipeline);
        success(res, 200, true, "Data retrieved successfully", result);
      } catch (err) {
        console.error("Error occurred:", err);
        
      }
    })
  )
  
 
  
  

  .get("/offered/",asyncHandler(async (req, res) => {
    console.log("req?.query",req.query)
    try {
      success(res, 200, true, "Get Successfully", await crud.getDocument(candidatelog, { job_id:req?.query?.job_id,status:{$in:["Offered"]}},{},{populate:"candidate_owner"}));
    } catch (err) {
      throw new Error(err);
    } 
    
    
  }))
  .get("/joined/",asyncHandler(async (req, res) => {
    console.log("req?.query",req.query)
    try {
      success(res, 200, true, "Get Successfully", await crud.getDocument(candidatelog, { job_id:req?.query?.job_id,status:{$in:["Joined"]}},{},{populate:"candidate_owner"}));
    } catch (err) {
      throw new Error(err);
    } 
    
    
  }))
  .get("/filled/",asyncHandler(async (req, res) => {
    console.log("req?.query",req.query)
    try {
      success(res, 200, true, "Get Successfully", await crud.getDocument(totallogs, {status:{$in:["Joined"]}},{},{}));
    } catch (err) {
      throw new Error(err);
    } 
    
    
  }))
  .get("/logsubmission/",asyncHandler(async (req, res) => {
    console.log("req?.query",req.query)
    try {
      let data={status:{$in:["Client submission",
      "Client Duplicate",]}}
      if(req?.query?.job_id){
        
         return success(res, 200, true, "Get Successfully", await crud.getDocument(totallogs, {job_id:req?.query?.job_id,...data },{},{}));

      }
      success(res, 200, true, "Get Successfully", await crud.getDocument(totallogs, data,{},{}));
    } catch (err) {
      throw new Error(err);
    } 
    
    
  }))
  .get("/logsubmittedcount/",asyncHandler(async (req, res) => {
    console.log("req?.query",req.query)
    try {
      let data={status:{$in:["Submitted"]}}
      if(req?.query?.job_id){
        
         return success(res, 200, true, "Get Successfully", await crud.getDocument(totallogs, {job_id:req?.query?.job_id,...data },{},{}));

      }
      success(res, 200, true, "Get Successfully", await crud.getDocument(totallogs, data,{},{}));
    } catch (err) {
      throw new Error(err);
    } 
    
    
  }))

  .get("/totalsubmission/",asyncHandler(async (req, res) => {
    console.log("req?.query",req.query)
    try {
      let data={status:{$in:["Client submission",]}}
    
      success(res, 200, true, "Get Successfully", await crud.getDocument(totallogs, data,{},{}));
    } catch (err) {
      throw new Error(err);
    } 
    
    
  }))
  .get("/logoffered/",asyncHandler(async (req, res) => {
    console.log("req?.query",req.query)
    try {
      let data={status:{$in:["Offered"]}}
      if(req?.query?.job_id){
        
         return success(res, 200, true, "Get Successfully", await crud.getDocument(totallogs, {job_id:req?.query?.job_id,...data },{},{}));

      }
      success(res, 200, true, "Get Successfully", await crud.getDocument(totallogs, data,{},{}));
    } catch (err) {
      throw new Error(err);
    } 
    
    
  }))
  .get("/logjoined/",asyncHandler(async (req, res) => {
    console.log("req?.query",req.query)
    try {
      let data={status:{$in:["Joined"]}}
      if(req?.query?.job_id){
        
         return success(res, 200, true, "Get Successfully", await crud.getDocument(totallogs, {job_id:req?.query?.job_id,...data },{},{}));

      }
      success(res, 200, true, "Get Successfully", await crud.getDocument(totallogs, data,{},{}));
    } catch (err) {
      throw new Error(err);
    } 
    
    
  }))
  .get("/loginterview/",asyncHandler(async (req, res) => {
    console.log("req?.query",req.query)
    try {
      let data={status:{ $in: [
        "L1 schedule",
        "L1 feedback pending",
        "L1 No show",
        "L1 select",
        "L1 Hold",
        "L1 Reject",
        "L2 schedule",
        "L2 feedback pending",
      "L2 No show",
        "L2 select",
        "L2 Hold",
        "L2 Reject",
        "L3 schedule",
        "L3 feedback pending",
        "L3 No show",
        "L3 select",
        "L3 Hold",
        "L3 Reject",
        "Position Hold",
      ]}}
      if(req?.query?.job_id){
        
         return success(res, 200, true, "Get Successfully", await crud.getDocument(totallogs, {job_id:req?.query?.job_id,...data },{},{}));

      }
      success(res, 200, true, "Get Successfully", await crud.getDocument(totallogs, data,{},{}));
    } catch (err) {
      throw new Error(err);
    } 
    
    
  }))
  .get("/test/",asyncHandler(async (req, res) => {
    console.log("req?.query",req.query)
    try {
      let match = {};
      if (req.query.job_id) {
        match.job_id = req.query.job_id;
      }
     
      if(req?.query?.job_id){
        const aggregationPipeline = [
          { $match: match },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
          // Add more aggregation stages as needed
        ];
        let result = await totallogs.aggregate(aggregationPipeline)
        
         return success(res, 200, true, "Get Successfully",result);

      }
      success(res, 200, true, "Get Successfully", await crud.getDocument(totallogs, data,{},{}));
    } catch (err) {
      throw new Error(err);
    } 
    
    
  }))
 
  .get("/weeksubmissions/", authAdmin,asyncHandler(async (req, res) => {
    console.log("req?.query",req.query)
    try {
     
      // Get the current date
  const currentDate = new Date();

  // Calculate the start of the week (Sunday) for the current date
  const startOfWeek = new Date(currentDate);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

  // Calculate the end of the week (Saturday) for the current date
  const endOfWeek = new Date(currentDate);
  endOfWeek.setHours(23, 59, 59, 999);
  endOfWeek.setDate(currentDate.getDate() + (6 - currentDate.getDay()));

  // Calculate the start of the current month
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

  // Calculate the end of the current month
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);


     let Weektotalcount=  await totallogs.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfWeek,
              $lte: endOfWeek,
              
            },
            status: {
              $in: ['Client submission'] // Add your status values here
            }
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 }
          }
        }
      ])
      console.log("======================Week Total==========================",Weektotalcount);
      let  monthotalcount=  await totallogs.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfMonth,
              $lte: endOfMonth,
              
            },
            status: {
              $in: ['Client submission'] // Add your status values here
            }
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 }
          }
        }
      ])
      let yourscount =
      await totallogs.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfWeek,
              $lte: endOfWeek,
              
            },
          
            status: {
              $in: ['Client submission'] // Add your status values here
            },
            created_by:{
              $in:[req?.user?._id]
            }
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 }
          }
        }
      ])
      let yourscountmonth =
      await totallogs.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfMonth,
              $lte: endOfMonth,
              
            },
          
            status: {
              $in: ['Client submission'] // Add your status values here
            },
            created_by:{
              $in:[req?.user?._id]
            }
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 }
          }
        }
      ])
      if(Weektotalcount.length<=0){
        Weektotalcount=[{
           count:0
        }]
      }
      if(yourscount.length<=0){
        yourscount=[{
           count:0
        }]
      }
      if(monthotalcount.length<=0){
        monthotalcount=[{
           count:0
        }]
      }
      if(yourscountmonth.length<=0){
        yourscountmonth=[{
           count:0
        }]
      }

      let weekdata=[
        {
        x: 'Yours',
        y: Number(yourscount[0]?.count), 
         r: '60', text: `${yourscount[0]?.count}`
      
      },
      {
        x: 'By Team',
        y: Weektotalcount[0]?.count, 
         r: '80',
       text: `${Weektotalcount[0]?.count}`
                            
      }, ]
      let monthdata=[
        {
        x: 'Yours',
        y: Number(yourscountmonth[0]?.count), 
         r: '60', text: `${yourscountmonth[0]?.count}`
      
      },
      {
        x: 'By Team',
        y: monthotalcount[0]?.count, 
         r: '80',
       text: `${monthotalcount[0]?.count}`
                            
      }, ]
    
     data={
      week :weekdata,
      month:monthdata
     }

      success(res, 200, true, "Get Successfully", data);
    } catch (err) {
      throw new Error(err);
    } 
    
    
  }))
  .get("/weeksubmissions/", authAdmin,asyncHandler(async (req, res) => {
    console.log("req?.query",req.query)
    try {
     
      // Get the current date
  const currentDate = new Date();

  // Calculate the start of the week (Sunday) for the current date
  const startOfWeek = new Date(currentDate);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

  // Calculate the end of the week (Saturday) for the current date
  const endOfWeek = new Date(currentDate);
  endOfWeek.setHours(23, 59, 59, 999);
  endOfWeek.setDate(currentDate.getDate() + (6 - currentDate.getDay()));

  // Calculate the start of the current month
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

  // Calculate the end of the current month
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);


     let Weektotalcount=  await totallogs.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfWeek,
              $lte: endOfWeek,
              
            },
            status: {
              $in: ['Client submission'] // Add your status values here
            }
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 }
          }
        }
      ])
      console.log("======================Week Total==========================",Weektotalcount);
      let  monthotalcount=  await totallogs.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfMonth,
              $lte: endOfMonth,
              
            },
            status: {
              $in: ['Client submission'] // Add your status values here
            }
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 }
          }
        }
      ])
      let yourscount =
      await totallogs.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfWeek,
              $lte: endOfWeek,
              
            },
          
            status: {
              $in: ['Client submission'] // Add your status values here
            },
            created_by:{
              $in:[req?.user?._id]
            }
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 }
          }
        }
      ])
      let yourscountmonth =
      await totallogs.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfMonth,
              $lte: endOfMonth,
              
            },
          
            status: {
              $in: ['Client submission'] // Add your status values here
            },
            created_by:{
              $in:[req?.user?._id]
            }
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 }
          }
        }
      ])
      if(Weektotalcount.length<=0){
        Weektotalcount=[{
           count:0
        }]
      }
      if(yourscount.length<=0){
        yourscount=[{
           count:0
        }]
      }
      if(monthotalcount.length<=0){
        monthotalcount=[{
           count:0
        }]
      }
      if(yourscountmonth.length<=0){
        yourscountmonth=[{
           count:0
        }]
      }
    
     data={
       weekCount:Weektotalcount,
       yourscountweek:yourscount,
       monthotalcount:monthotalcount,
       yourscountmonth:yourscountmonth
     }

      success(res, 200, true, "Get Successfully", data);
    } catch (err) {
      throw new Error(err);
    } 
    
    
  }))


  .get("/grap", authAdmin,asyncHandler(async (req, res) => {
     console.log("requser",req.user)
    
    try {
        const data=[]
      for (let month = 1; month <= 12; month++) {
        const startDate = new Date(`${req?.query?.year}-${month}-01T00:00:00Z`);
        const endDate = new Date(`${req?.query?.year}-${month + 1}-01T00:00:00Z`);
         let pipeline;
       if(req?.user?.role=="SuperAdmin"){
        pipeline = [
          {
            $match: {
               
              createdAt: {
                $gt: startDate,
                $lt: endDate,
              },
              status: {
                $in: ['Client submission'] // Add your status values here
              },
            },
          },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
            },
          },
        ];
       }
       else{
        pipeline = [
          {
            $match: {
               
              createdAt: {
                $gt: startDate,
                $lt: endDate,
              },

              status: {    
                $in: ['Client submission'] // Add your status values here
              },
              created_by:{
                $in:[req?.user?._id]
              }

            },
          },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
            },
          },
        ];
       }
    
        const result = await totallogs.aggregate(pipeline)
        
         
    
        if (result.length > 0) {
            let monthName =getMonthName(month)
            data.push({
                type:monthName,
                submissions:result[0]?.count
            })

        } else {
          let monthName =getMonthName(month)
           data.push({
             type:monthName,
             submissions:result.length
           })
        }
      }
    
      // Close the MongoDB connection
   
      success(res, 200, true, "Get Successfully", data);
    
    // Helper function to get the month name

    } catch (err) {
      throw new Error(err);
    } 
    
    
  }))


  // Dashord InterView Date get
  .get("/schedule",asyncHandler(async (req, res) => {
    
   
   try {

    const dateString = req.query.date; // Assuming you're passing the date string in the query parameters
    const date = new Date(dateString);

    // Set the time to midnight for accurate date comparison
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    // Calculate the end of the day
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
     // Get the current date
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set the time to midnight for accurate date comparison

  // Calculate the start and end timestamps for today
  // const startOfDay = today;
  // const endOfDay = new Date(today);
  endOfDay.setDate(endOfDay.getDate() + 1);
       
     let data = await interview.find({
      // starttime:{
      //   $lt: today
      // },
      date: {
        $gte: req.query.date? startOfDay:today,
        $lt: req.query.data?endOfDay:endOfDay

      
      },
      status:{
        $in:["L1 schedule", "L2 schedule","L3 schedule"]
      }
     
      
     }).populate({
      path: 'candidate_id',
      select:"first_name last_name",
      populate: {
        path: 'job_id',
        model: 'jobs',
      select:"job_title",

        populate:{
          path: 'client_id',
        model: 'clients',
        select:"name"


        }
      },
    })
     // Close the MongoDB connection
  
     success(res, 200, true, "Get Successfully", data );
   
   // Helper function to get the month name

   } catch (err) {
     throw new Error(err);
   } 
   
   
 }))

 .get("/schedulelist",asyncHandler(async (req, res) => {
    
   try{
  let data = await interview.find({}).populate({
    path: 'candidate_id',
    populate: {
      path: 'job_id',
      model: 'jobs',
      populate:{ 
        path: 'client_id',
      model: 'clients',


      }
    },
  })
   // Close the MongoDB connection

   success(res, 200, true, "Get Successfully", data );
 
 // Helper function to get the month name

 } catch (err) {
    throw new Error(err);
  } 
  
  
}))



module.exports = router;
