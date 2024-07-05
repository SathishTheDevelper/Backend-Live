const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const { clients, projectemployess, projects, candidatelog, job,admin } = require("../../utils/schemaMaster");
const { workexperience } = require("../../utils/schemaMaster");
const { success } = require("../../utils/response");
const crud_service = require("../../utils/crud_service");
const validateId = require('../../utils/validateId');
const { authAdmin } = require('../../middlewares/authMiddlewares');
const upload = require('../../utils/upload');

const mongoose = require('mongoose');

const crud = new crud_service();

const methods ={authAdmin}




//create
 methods.add =asyncHandler(async (req, res) => {
   req.body.created_by =req?.user?._id
   req.body.company_id= req.user?.company_id

  try {
    let data =await crud.insertOne(clients, req.body)
     if(data.contact_persons?.length>0){
       data.contact_persons?.map( async(item)=>{
          let created ={
             name:item?.name,
             email_id:item?.email,
             password:"Welcome@9091",
             role:"Client",
             company_id:req.user?.company_id,
             client_id:data?._id,


          }
        await crud.insertOne(admin, created)
       })
     }
    success(res, 201, true, "Create Successfully",data );
  } catch (err) {
    throw new Error(err);
  }
})


router.post('/',authAdmin, methods.add )


//getall

const getProjectsData = async (clientId, status) => {
  const query = { client_id: clientId };
  if (status) {
    query.status = status;
  }
  return await crud.getDocument(projects, query, {}, {});
};

const getEmployeesData = async (clientId) => {
  return await crud.getDocument(projectemployess, { client_id: clientId }, {}, { populate: "employee_id" });
};



methods.Jobget=asyncHandler(async (req, res) => {

  let id=req.query?.candidate_id||"65b68ed89bc87d4d035101ec"
  const aggregationPipeline = [
    {

      $match: {
        job_id: { $exists: true, $ne: null },
      _id:new mongoose.Types.ObjectId(id),
         // Filter documents where job_id exists and is not null
      },

    }, 
    {
      $lookup: {
        from: 'jobs',
        localField: 'job_id',
        foreignField: '_id',
        as: 'jobs',
      },
    },
    {
      $unwind: '$jobs',
    },

    {
      $project:{
          value: "$jobs._id",

          label:"$jobs.job_title",
         
             
    }
  }
    // Add more stages as needed
  ];
   let result =await candidatelog.aggregate(aggregationPipeline)

  try {
    success(res, 200, true, "Get Successfully",result);
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/jobget',methods.Jobget );

 methods.clientbillable=asyncHandler(async (req, res) => {

  let id=req.query?.candidate_id||"65b68ed89bc87d4d035101ec"

 let projection={
  "client_billing":1,
  "job_id":1,
  "mode_of_hiring":1,
  "salary_type":1,



 }


  try {
    let result =await crud.getOneDocument(candidatelog,{...req.query},{},{populate:"job_id"})
    success(res, 200, true, "Get Successfully",result);
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/clientbillable/:id',methods.clientbillable );
 
 methods.getAll = asyncHandler(async (req, res) => {
  try {
    // Create indexes
    await Promise.all([
      mongoose.connection.collection('clients').createIndex({ _id: 1 }, { name: "id_index" }),
      mongoose.connection.collection('clients').createIndex({ name: 1 }, { name: "name_index" }),
      mongoose.connection.collection('projects').createIndex({ client_id: 1 }),
      mongoose.connection.collection('projects').createIndex({ status: 1 }),
      mongoose.connection.collection('projectemployees').createIndex({ client_id: 1 }),
      mongoose.connection.collection('projectemployees').createIndex({ clientbilling_salarytype: 1 }),
      mongoose.connection.collection('projectemployees').createIndex({ expected_Ctc_type: 1 }),
    ]);

    // Aggregation pipeline
    const sendData = await clients.aggregate([
      {
        $match: {
          company_id: { $eq: req.user?.company_id},
          // job_id : { $regex: new RegExp(req?.query?.job_title, 'i') }
  
        },
      },
      {
        $lookup: {
          from: "projects",
          let: { client_id: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$client_id", "$$client_id"] } } },
            { $project: { status: 1 } } // Only retrieve necessary fields
          ],
          as: "clientProjects"
        }
      },
      {
        $lookup: {
          from: "projectemployees",
          let: { client_id: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$client_id", "$$client_id"] } } },
            { $project: { clientbilling_salarytype: 1, client_billing: 1, expected_Ctc_type: 1, expected_ctc: 1 } } // Only retrieve necessary fields
          ],
          as: "clientEmployees"
        }
      },
      {
        $addFields: {
          createdAt: "$createdAt",
          ongoingProjects: {
            $filter: {
              input: "$clientProjects",
              as: "project",
              cond: { $eq: ["$$project.status", "Ongoing"] }
            }
          },
          completedProjects: {
            $filter: {
              input: "$clientProjects",
              as: "project",
              cond: { $eq: ["$$project.status", "completed"] }
            }
          },
          totalRevenue: {
            $sum: {
              $map: {
                input: "$clientEmployees",
                as: "employee",
                in: {
                  $cond: [
                    { $eq: ["$$employee.clientbilling_salarytype", "Monthly"] },
                    "$$employee.client_billing",
                    {
                      $cond: [
                        { $eq: ["$$employee.clientbilling_salarytype", "Per Hour"] },
                        { $multiply: ["$$employee.client_billing", 160] },
                        { $divide: ["$$employee.client_billing", 12] }
                      ]
                    }
                  ]
                }
              }
            }
          },
          totalSalary: {
            $sum: {
              $map: {
                input: "$clientEmployees",
                as: "employee",
                in: {
                  $cond: [
                    { $eq: ["$$employee.expected_Ctc_type", "Monthly"] },
                    "$$employee.expected_ctc",
                    {
                      $cond: [
                        { $eq: ["$$employee.expected_Ctc_type", "Per Hour"] },
                        { $multiply: ["$$employee.expected_ctc", 160] },
                        { $divide: ["$$employee.expected_ctc", 12] }
                      ]
                    }
                  ]
                }
              }
            }
          }
        }
      },
      {
        $project: {
          _id: "$_id",
          name: "$name",
          createdAt: "$createdAt",
          ongoing: { $size: "$ongoingProjects" },
          completed: { $size: "$completedProjects" },
          totalprojects: { $size: "$clientProjects" },
          active_employess: { $size: "$clientEmployees" },
          revenue: "$totalRevenue",
          salary: "$totalSalary"
        }
      },
      { $sort: { createdAt: -1 } },
      { $limit: 100 } // Adjust the limit based on your needs
    ]) // Convert cursor to array for faster response

    // Respond with the data
    success(res, 200, true, "Get Successfully", sendData);
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
});

 router.get('/',authAdmin,methods.getAll );

 methods.getSelct=asyncHandler(async (req, res) => {
  try {
    
   let result = await clients.aggregate([
    {
      $match: {
        company_id: { $eq: req.user?.company_id},
        // job_id : { $regex: new RegExp(req?.query?.job_title, 'i') }

      },
    },
    {
      $project: {
   
      label: '$name',
      value: '$_id',
    
      },
  }
   ])
    // const clientsData = await crud.getDocument(clients, { ...req.query }, {}, {populate:"parent"});

   

        
     success(res, 200, true, "Get Successfully", result);
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/getselect',authAdmin,methods.getSelct );  
 
 methods.saveandsent=asyncHandler(async (req, res) => {
  try {
    
   let result = await clients.aggregate([
    {
      $match: {
        _id: { $eq:new mongoose.Types.ObjectId(req?.params?.id) },
        // job_id : { $regex: new RegExp(req?.query?.job_title, 'i') }

      },
    },
    {
      $unwind: '$contact_persons', // Unwind the Contact_person array
    },
    {
      $match: {
        'contact_persons.department': { $eq:'Accounts & Finance'}, // Match documents where Contact_person.department is 'Account'
        // Add more conditions if needed
      },
    },
    {
      $project: {
        label: '$contact_persons.name', // Assuming 'name' is the field you want to use as the label
        value: '$contact_persons.email', // Assuming '_id' is the unique identifier for Contact_person
      },
    },
  
   ])
    // const clientsData = await crud.getDocument(clients, { ...req.query }, {}, {populate:"parent"});

   

        
     success(res, 200, true, "Get Successfully", result);
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/saveandsent/:id',authAdmin,methods.saveandsent );
 methods.getSelctAssign=asyncHandler(async (req, res) => {

  try {
    console.log("req?.user?._id",req?.user?._id)
    
   let result = await projectemployess.aggregate([
     
      {

        $match: {
         
        employee_id:new mongoose.Types.ObjectId(req.user._id),
           // Filter documents where job_id exists and is not null
        },
  
      }, 
      {
        $group: {
          _id: "$client_id",
          // Include entire document in 'employees' array
        },
      },
       {
        $lookup: {
          from: "clients", // Assuming the name of your clients collection
          localField: "_id",
          foreignField: "_id",
          as: "clientDetails",
        },
      },
     
      {
        $project: {
          _id: 1,
          clientDetails: { $arrayElemAt: ["$clientDetails", 0] },
        },
      },
      {
        $project: {
          _id:0,
          label: { $ifNull: ["$clientDetails.name", "Unknown"] }, // Replace "Unknown" with a default value if name is null
          value: "$_id",
          
          // employees: 1,
        },
      },
   ])
    // const clientsData = await crud.getDocument(clients, { ...req.query }, {}, {populate:"parent"});

   

        
     success(res, 200, true, "Get Successfully", result);
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/getselectassign',methods.authAdmin, methods.getSelctAssign );


 methods.select=asyncHandler(async (req, res) => {
  let required_projection = {
    "name":1
  }
  const clientsData = await crud.getDocument(clients, { ...req.query }, {...required_projection}, {});
  try {
    success(res, 201, true, "data Successfully", clientsData);
  } catch (err) {
    throw new Error(err);
  }

 })
 router.get('/select',methods.select );


 //getone
 methods.pbfReport = asyncHandler(async (req, res) => {
 
  try {
    let filter = {
      job_id: { $exists: true, $ne: null }
    };

    if (req.query.startOfMonth && req.query.endOfMonth) {
      filter.createdAt = { $gte: req.query.startOfMonth, $lte: req.query.endOfMonth };
    }

    if (req.query.candidate_owner) {
      filter.candidate_owner = req.query.candidate_owner;
    }
    if (req.user?.role =="Vendor") {
      filter.candidate_owner = req.user?._id;
    }


    const getCandidates = await candidatelog
      .find({ ...filter })
      .populate({
        path: "candidate_owner",
      })
      .populate({
        path: "job_id",
        model: "jobs",
        match: { 
          ...req.query.client_id &&{"client_id": { $in: [req.query.client_id] } }},

        populate: {
          path: "client_id",
          model: "clients",

       
        },
      })
      .populate("candidateoriginal_id")
      .sort({ createdAt: -1 });

    success(res, 200, true, "Get Successfully", getCandidates);
  } catch (err) {
    throw new Error(err);
  }
});

router.get('/pbfreport',methods.authAdmin, methods.pbfReport);


 
 methods.clientReport = asyncHandler(async (req, res) => {
  try {
    const startOfYear = new Date();
startOfYear.setHours(0, 0, 0, 0);
startOfYear.setMonth(0, 1); // Set to the first day of the current year

const endOfYear = new Date();
endOfYear.setHours(23, 59, 59, 999);
endOfYear.setMonth(11, 31); 

    const aggregateQuery = [
      
      {
        $sort: {
          updatedAt: -1,
        },
      },
      {
        $lookup: {
          from: "totallogs",
          localField: "_id",
          foreignField: "client_id",
          as: "totallogs",
        },
      },
      {
        $lookup: {
          from: "jobs",
          localField: "_id",
          foreignField: "client_id",
          as: "jobs",
        },
      },
      {
        $addFields: {
          totallogs: {
            $filter: {
              input: "$totallogs", 
              cond: {
                $and: [
                  { $gte: ["$$this.createdAt", startOfYear] },
                  { $lte: ["$$this.createdAt", endOfYear] },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          Allsubmissions: {
            $size: {
              $filter: { input: "$totallogs", cond: { $eq: ["$$this.status", "Submitted"] } },
            },
          },
          Offered: {
            $size: {
              $filter: { input: "$totallogs", cond: { $eq: ["$$this.status", "Offered"] } },
            },
          },
          clientScreenReject: {
            $size: {
              $filter: { input: "$totallogs", cond: { $eq: ["$$this.status", "Client screen Reject"] } },
            },
          },
          clientSubmission: {
            $size: {
              $filter: { input: "$totallogs", cond: { $eq: ["$$this.status", "Client submission"] } },
            },
          },
          Interview: {
            $size: {
              $filter: { input: "$totallogs", cond: { $eq: ["$$this.status", "L1 schedule"] } },
            },
          },
          joined: {
            $size: {
              $filter: { input: "$totallogs", cond: { $eq: ["$$this.status", "Joined"] } },
            },
          },
          jobCount: { $size: "$jobs" },
        },
      },
    ];

    const createIndexes = async () => {
      await mongoose.connection.collection('clients').createIndex({ _id: 1 });
      await mongoose.connection.collection('totallogs').createIndex({ client_id: 1, createdAt: 1 });
      await mongoose.connection.collection('jobs').createIndex({ client_id: 1 });
    };
     await createIndexes();
    const reports = await clients.aggregate(aggregateQuery);
  success(res, 200, true, "Get Successfully", reports);
    
  }
 catch(e){
  console.log("e")
 }})

 router.get('/clientreport',methods.authAdmin, methods.clientReport)
 methods.clientwisejobreport = asyncHandler(async (req, res) => {
  try {
    const startOfYear = new Date();
startOfYear.setHours(0, 0, 0, 0);
startOfYear.setMonth(0, 1); // Set to the first day of the current year

const endOfYear = new Date();
endOfYear.setHours(23, 59, 59, 999);
endOfYear.setMonth(11, 31); 
  
    const aggregateQuery = [
      {
        $sort: {
          updatedAt: -1,
        },
      },
      {
        $match: {
          client_id: {
           
              $eq:new mongoose.Types.ObjectId(req.params.id),
          
          },
        },
      },
      {
        $lookup: {
          from: "totallogs",
          localField: "_id",
          foreignField: "job_id",
          as: "totallogs",
        },
      },
        {
    $lookup: {
      from: "jobs",
      localField: "_id",
      foreignField: "client_id",
      as: "jobs",
    },
  },
      // {
      //   $addFields: {
      //     totallogs: {
      //       $filter: {
      //         input: "$totallogs",
      //         cond: {
      //           $and: [
      //             { $gte: ["$$this.createdAt", startOfYear] },
      //             { $lte: ["$$this.createdAt", endOfYear] },
      //           ],
      //         },
      //       },
      //     },
      //   },
      // },
      {
        $project: {
          _id: 1,
          job_title: 1,
          Allsubmissions: {
            $size: {
              $filter: { input: "$totallogs", cond: { $eq: ["$$this.status", "Submitted"] } },
            },
          },
          Offered: {
            $size: {
              $filter: { input: "$totallogs", cond: { $eq: ["$$this.status", "Offered"] } },
            },
          },
          clientScreenReject: {
            $size: {
              $filter: { input: "$totallogs", cond: { $eq: ["$$this.status", "Client screen Reject"] } },
            },
          },
          clientSubmission: {
            $size: {
              $filter: { input: "$totallogs", cond: { $eq: ["$$this.status", "Client submission"] } },
            },
          },
          Interview: {
            $size: {
              $filter: { input: "$totallogs", cond: { $eq: ["$$this.status", "L1 schedule"] } },
            },
          },
          joined: {
            $size: {
              $filter: { input: "$totallogs", cond: { $eq: ["$$this.status", "Joined"] } },
            },
          },
        },
      },
    ];
 
    const reports = await job.aggregate(aggregateQuery);
  success(res, 200, true, "Get Successfully", reports);
    
  }
 catch(err){
  console.log("err",err)
 }})

 router.get('/clientwisejobreport/:id', methods.clientwisejobreport)

methods.getOne=asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(clients, id, {}, {});
  if(!check) throw new Error('Data not Found!')
  try {
  success(res, 200, true, "Get Successfully", await crud.getOneDocumentById(clients, id,{},{}));
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/:id', methods.getOne)




//Edit
methods.edit =asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(clients,id,{},{});
  if (!check) throw new Error('Data not Found!')
  try {
    success(res, 200, true, 'Update Successfully', await crud.updateById(clients, id, req.body, { new: true }));
  } catch (err) {
    throw new Error(err);
  } 
})

 router.put('/:id',methods.edit )


//delete
  .delete('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);
    const check = await crud.getOneDocumentById(clients, id, {}, {});
    if(!check) throw new Error('Data not Found!')
    try {
      success(res, 200, true, "Delete Successfully", await crud.deleteById(clients, id));
    } catch (err) {
      throw new Error(err);
    } 
})) 











module.exports = router;