const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const { job,locations,skils,endclients, clients} = require("../../utils/schemaMaster");
const { workexperience } = require("../../utils/schemaMaster");
const { success } = require("../../utils/response");
const crud_service = require("../../utils/crud_service");
const validateId = require('../../utils/validateId');
const { authAdmin } = require('../../middlewares/authMiddlewares');
const upload = require('../../utils/upload');
const { default: mongoose } = require("mongoose");
const JobCreateSendMail = require("../../utils/JobCreatedMail");


const crud = new crud_service();

const methods ={authAdmin}


//create
 methods.add =asyncHandler(async (req, res) => {
    if(req?.user) {
      req.body.created_by=req?.user?._id
      req.body.company_id=req.user?.company_id
    }
  try {


    let added=await crud.insertOne(job, req.body) 
    
    let update =await crud.updateById(clients, req.body?.client_id[0],{updatedAt:new Date()},{ new: true })
     await JobCreateSendMail(added)
     if(req.body.job_location&&req.body.job_location?.length>0){
    
        Promise.all(req.body.job_location.map( async(item)=>{
          let dataexist= await locations.find({name:item})
         
          if(dataexist?.length ==0){
             await locations.create({name:item})
          }
        }))
     } 
     if(req.body.skils&&req.body.skils?.length>0){
    
       Promise.all(req.body.skils.map( async(item)=>{
        let dataexist= await skils.find({name:item})
        
        if(dataexist?.length ==0){
           let created= await crud.insertOne(skils, {name:item}) 
           console.log("bb",created)
        }
      }))
   }
   if(req.body.end_client&&req.body.end_client?.length>0){
    console.log("____________im WorkingSkill")
     Promise.all(req.body.end_client.map( async(item)=>{
      let dataexist= await endclients.find({name:item})
      
      if(dataexist?.length ==0){
         let created= await crud.insertOne(endclients, {name:item,client_id:req.body.client_id[0]}) 
         console.log("bb",created)
      }
    }))
 }

    success(res, 201, true, "Create Successfully", );
  } catch (err) {
    throw new Error(err);
  }
})


router.post('/',methods.authAdmin, methods.add )





//getall
methods.getAll=asyncHandler(async (req, res) => {
  let company_id=req?.user?.company_id|| null;
  const createIndexes = async () => {
    await mongoose.connection.collection('jobs').createIndex({ status: 1 });
    await mongoose.connection.collection('jobs').createIndex({ job_title: 1 });
    await mongoose.connection.collection('totallogs').createIndex({ job_id: 1 });
    await mongoose.connection.collection('clients').createIndex({ _id: 1 });
    // await mongoose.connection.collection('admins').createIndex({ _id: 1 });
  };

  await createIndexes();


  let filter={}
  if(req.query.status ){
    filter.status ={ $in: req?.query?.status }
  }
  if(req.query.job_title){
    filter.job_title = { $regex: new RegExp(req.query.job_title, 'i') }
    filter.job_id = { $regex: new RegExp(req.query.job_title, 'i') }
  }
  if(req.query.client_id){
    filter.client_id = req.query.client_id
    // filter. = { $regex: new RegExp(req.query.job_title, 'i') }
  }
  if(req.query.created_by){
    filter.created_by = req.query.created_by
    // filter. = { $regex: new RegExp(req.query.job_title, 'i') }
  }
  if(company_id){
    filter.company_id = company_id
    // filter. = { $regex: new RegExp(req.query.job_title, 'i') }
  }
  if(req.user?.role == "Client"){
        filter.client_id =  { $in: [new mongoose.Types.ObjectId(req.user?.client_id)]}
    
  }
  if(company_id == null ){
    req?.user?.role == "Vendor" ?
    
        filter.assign = { $in: [new mongoose.Types.ObjectId(req.user?._id)]}
        // job_id : { $regex: new RegExp(req?.query?.job_title, 'i') }
     
         
        

     
     :
   
        // filtercompany_id = { $eq: req.user?.company_id},
        // job_id : { $regex: new RegExp(req?.query?.job_title, 'i') }

      
    
    filter.company_id = company_id
    // filter. = { $regex: new RegExp(req.query.job_title, 'i') }
  }

  

  let aggregate = [
   
    {
      ...(req?.user?.role =="Vendor" ?
      {$lookup: {
        from: "totallogs",
        localField: "assign",
        foreignField: "created_by",
        as: "screening"
      }}
      :
      {$lookup: {
        from: "totallogs",
        localField: "_id",
        foreignField: "job_id",
        as: "screening"
      }})

    },
   
    {
      $lookup: {
        from: "clients",
        localField: "client_id",
        foreignField: "_id",
        as: "Clients"
      }
    },
    {
      $lookup: {
        from: "admins",
        localField: "created_by",
        foreignField: "_id",
        as: "done_by"
      }
    },
    {
      $sort: {
        createdAt: -1, // Sorting in descending order
      }
    }
  ];
  
   if(req?.query?.status){
      aggregate.unshift({
        $match: {
          status: { $in: req?.query?.status },
          ...(req?.query?.client_id && {client_id: { $in: [new mongoose.Types.ObjectId(req?.query?.client_id)] }}),
          ...(req?.user?.role == "Client" && {client_id: { $in: [new mongoose.Types.ObjectId(req?.user?.client_id)] }}),
          ...(req?.query?.created_by && {created_by:new mongoose.Types.ObjectId(req?.query?.created_by)}),
        
        }
      })
   }
   if (req?.query?.job_title) {
    aggregate.unshift({
      $match: {
        job_title: { $regex: new RegExp(req?.query?.job_title, 'i') },
        // job_id : { $regex: new RegExp(req?.query?.job_title, 'i') }

      },
    });
  }
  if (company_id) {
    aggregate.unshift({
      $match: {
        company_id: { $eq: req.user?.company_id},
        // job_id : { $regex: new RegExp(req?.query?.job_title, 'i') }

      },
    });
  }

  if(company_id == null ){
      req?.user?.role == "Vendor" ?
      aggregate.unshift({
        $match: {
          assign: { $in: [new mongoose.Types.ObjectId(req.user?._id)]},
          // job_id : { $regex: new RegExp(req?.query?.job_title, 'i') }
  
        },
      }) :
      aggregate.unshift({
        $match: {
          company_id: { $eq: req.user?.company_id},
          // job_id : { $regex: new RegExp(req?.query?.job_title, 'i') }
  
        },
      });
    }
   
   
    const page = parseInt(req.query.page)||1;
    const limit = parseInt(req.query.limit)||10;
    aggregate.push(
      { $skip: (page - 1) * limit },
      { $limit: limit }
    );
  
  let data =await job.aggregate(aggregate)
  const totalCount = await job.countDocuments(filter); 




//   let query = {};

// if (req?.query?.status) {
//   query.status = req.query.status;
// }

// const page = parseInt(req.query.page) || 1;
// const limit = parseInt(req.query.limit) || 10;

// let data = await job
//   .find(query)

//   .populate({
//     path: "client_id",
  
//   })
//   .populate({
//     path: "created_by",
   
//   })
//   .skip((page - 1) * limit)
//   .limit(limit);

  try {
    success(res, 200, true, "Get Successfully", {total:totalCount,data:data});
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/', authAdmin,methods.getAll ); 

 methods.AssignjobFetch=asyncHandler(async (req, res) => {
 
  let aggregate =[

 
  {
    $lookup: {
      from: "clients",
      localField: "client_id",
      foreignField: "_id",
      as: "Clients"
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
  {
    $sort: {
      createdAt: -1, // Sorting in descending order
    },
  }

  
 
  
 
]
   if(req?.query?.status){
      aggregate.unshift({
        $match: {
          status: { $eq: req?.query?.status }
        }
      })
   }
   
   
  
  
  let data =await job.aggregate(aggregate)



//   let query = {};

// if (req?.query?.status) {
//   query.status = req.query.status;
// }

// const page = parseInt(req.query.page) || 1;
// const limit = parseInt(req.query.limit) || 10;

// let data = await job
//   .find(query)

//   .populate({
//     path: "client_id",
  
//   })
//   .populate({
//     path: "created_by",
   
//   })
//   .skip((page - 1) * limit)
//   .limit(limit);

  try {
    success(res, 200, true, "Get Successfully", data);
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/assignjob',methods.AssignjobFetch ); 

//  methods.getAlljobs=asyncHandler(async (req, res) => {
  
//   try {
//     success(res, 200, true, "Get Successfully", crud.getDocument(job,{...req?.query},{},{}));
//   } catch (err) {
//     throw new Error(err);
//   } 
// })
//  router.get('/',methods.getAlljobs );


 //getone

methods.getOne=asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(job, id, {}, {});
  if(!check) throw new Error('Data not Found!')
  try {

    const getSingle=await job.findById(id).populate({
      path: "client_id",
    }).populate({
      path: "assigneddata.assign",
      model: "admin",
      select:"name"
    })
  success(res, 200, true, "Get Successfully", getSingle);
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/:id', methods.getOne)

 methods.getOneEdit=asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  validateId(id);
  const check = await crud.getOneDocumentById(job, id, {}, {});
  if(!check) throw new Error('Data not Found!')
  try {
  success(res, 200, true, "Get Successfully", await crud.getOneDocumentById(job, id,{},{}));
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/edit/:id', methods.getOneEdit)


//Edit

methods.edit =asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(job,id,{},{});
  if (!check) throw new Error('Data not Found!')
  try {
let updateDate=await crud.updateById(job, id, req.body, { new: true })
success(res, 200, true, "Status Change Successfully", updateDate);


} 

   catch (err) {
    throw new Error(err);
  } 
})

 router.put('/status/:id',methods.edit )
methods.edit =asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(job,id,{},{});
  if (!check) throw new Error('Data not Found!')
  try {
let updateDate=await crud.updateById(job, id, req.body, { new: true })
if(req.body.locations&&req.body.job_location?.length>0){
  Promise.all(req.body.job_location.map( async(item)=>{
    let dataexist= await locations.find({name:item})
    if(dataexist.length==0){
       await locations.create({name:item})
    }
  }))
} 
if(req.body.skils&&req.body.skils?.length>0){
 Promise.all(req.body.skils.map( async(item)=>{
  let dataexist= await skils.find({name:item})
   
  if(dataexist?.length ==0){
     let created= await crud.insertOne(skils, {name:item}) 
     console.log("bb",created)
  }
}))
}
    success(res, 200, true, 'Update Successfully',updateDate );
  } catch (err) {
    throw new Error(err);
  } 
})

 router.put('/:id',methods.edit )


//delete
  .delete('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);
    const check = await crud.getOneDocumentById(job, id, {}, {});
    if(!check) throw new Error('Data not Found!')
    try {
      success(res, 200, true, "Delete Successfully", await crud.deleteById(job, id));
    } catch (err) {
      throw new Error(err);
    } 
}))











module.exports = router;