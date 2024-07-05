const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const { event, workingdays, holidays, leave_request, employee, hrlogged, candidatelog } = require("../../utils/schemaMaster");
const { workexperience } = require("../../utils/schemaMaster");
const { success } = require("../../utils/response");
const crud_service = require("../../utils/crud_service");
const validateId = require('../../utils/validateId');
const { authAdmin } = require('../../middlewares/authMiddlewares');
const upload = require('../../utils/upload');
const mongoose = require('mongoose');

const sendEmail = require("../../utils/sendMail");

const crud = new crud_service();

const methods ={authAdmin}


//create





methods.addadminTimesheet =asyncHandler(async (req, res) => {

  if(req?.user) {
    req.body.created_by=req?.user?._id
    req.body.company_id=req.user?.company_id
  }
   
  let data={
    client_id: new mongoose.Types.ObjectId(req.body.client_id),
    project_id: new mongoose.Types.ObjectId(req.body.project_id),
    StartTime:req.body.StartTime,
    logged_houres:req.body.logged_houres,
    startend_time:req.body.startend_time,
    employee_id:req.body.employee_id,
    EndTime:req.body.EndTime,
    timesheet:req?.file?.path||"",
    type:req.body.type||"Pending"
  }
    
try {
  success(res, 201, true, "Create Successfully", await crud.insertOne(event, data)
  );
} catch (err) {
  throw new Error(err);
}
})


router.post('/adminadd', upload.single("timesheet"), methods.authAdmin,methods.addadminTimesheet )
methods.mailsend =asyncHandler(async (req, res) => {

 req.body.employee_id = req.user?._id
 req.body.email=req.user?.email_id
 req.body.name=req.user?.name
 req.body.To =[...req.body.To,"sathish.kumar@technoladders.com"]
 const currentDate = new Date();

 // Function to format a date as "YYYY-MM-DD"
 const formatDate = (date) => {
   const year = date.getFullYear();
   const month = String(date.getMonth() + 1).padStart(2, '0');
   const day = String(date.getDate()).padStart(2, '0');
 
   return `${year}-${month}-${day}`;
 };
 
 // Format the current date
 const currentDateString = formatDate(currentDate);
 const yesterdayDate = new Date(currentDate);
 yesterdayDate.setDate(currentDate.getDate() - 1);
 
 // Function to format a date as "YYYY-MM-DD"
 const formatDate1 = (date) => {
   const year = date.getFullYear();
   const month = String(date.getMonth() + 1).padStart(2, '0');
   const day = String(date.getDate()).padStart(2, '0');
 
   return `${year}-${month}-${day}`;
 };
 
 // Format yesterday's date
 const yesterdayDateString = formatDate1(yesterdayDate);

 // Get tomorrow's date by adding one day


// Assuming you have the provided StartTime and EndTime strings
const providedStartTime = `${yesterdayDateString}T18:30:00.000Z`;
const providedEndTime = `${currentDateString}T18:30:00.000Z`;


   
  let data={
    ...req.body,
    StartTime:providedStartTime,
EndTime:providedEndTime,

    // client_id: new mongoose.Types.ObjectId(req.body.client_id),
    // project_id: new mongoose.Types.ObjectId(req.body.project_id),
    // StartTime:req.body.StartTime,
    // logged_houres:req.body.logged_houres,
    // employee_id:req.body.employee_id,
    // EndTime:req.body.EndTime,
    // timesheet:req?.file?.path||"",
    // type:req.body.type||"Pending"
  } 


  // Set the time to the beginning of the current day (midnight)
  // const currentDate = new Date();

  currentDate.setHours(0, 0, 0, 0);
  let todaycreated =  await candidatelog.find({
    createdAt: { $gte: currentDate },
    candidate_owner:new mongoose.Types.ObjectId(req.user?._id)
  }).populate({
    path: "job_id",
    model: "jobs",
    populate: {
      path: "client_id",  
      model: "clients",
    },
  })

  console.log("todaycreated",todaycreated)


 let resposne =  await sendEmail(req.body,todaycreated);
 console.log("resposne",resposne)
    
try {
  success(res, 201, true, "Create Successfully", await crud.insertOne(hrlogged, data)
  );
} catch (err) {
  throw new Error(err);
}
})


router.post('/mailsend',methods.authAdmin, methods.mailsend )
 methods.add =asyncHandler(async (req, res) => {

    let result = [];

    for (const item of req.body) {
      if (item.logged_houres > "6:00") {
        item.days_worked = 1;
      }
      item.employee_id = new mongoose.Types.ObjectId(req?.user?._id)

      console.log("item",item)
  
      // Assuming crud.insertOne returns a promise
      const insertResult = await crud.insertOne(event, {
          ...item,
          
            created_by:req?.user?._id,
            company_id:req.user?.company_id,
          
      });
      result.push(insertResult);
    }
//    let result = req.body.map( async(item)=>{

//       if(item.logged_houres >"6:00"){
//          item.days_worked=1
//       }
//         await crud.insertOne(event, item)
//     })
  try {
    success(res, 201, true, "Create Successfully", result);
  } catch (err) {
    throw new Error(err);
  }
})


router.post('/', methods.authAdmin,  methods.add )

methods.hr_timesheet=asyncHandler(async (req, res) => {

  if(req?.user) {
    req.body.created_by=req?.user?._id
    req.body.company_id=req.user?.company_id
  }
    
  try {


  // Your original pipeline

    const startOfMonth = new Date();
    startOfMonth.setHours(0, 0, 0, 0);
    startOfMonth.setDate(1);
    
    const endOfMonth = new Date();
    endOfMonth.setHours(23, 59, 59, 999);
    endOfMonth.setMonth(startOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    let filter={
      employee_id:new mongoose.Types.ObjectId(req.user?._id),
      StartTime: {
        $gte:  req?.query?.firstDayOfMonth? new Date(req?.query?.firstDayOfMonth):startOfMonth,
        $lt:  req?.query?.lastDayOfMonth? new Date(req?.query?.lastDayOfMonth):endOfMonth
      },
    
    }
 

     let data=  await hrlogged.find({...filter}).populate({
      path: "leave_id",
      model: "leaverequests",
      populate: {
        path: "leave_id",  
        model: "leaves",
      },}).lean()
 
                          

      let publicholiays=await holidays.find({
        StartTime: {
          $gte:  req?.query?.firstDayOfMonth? new Date(req?.query?.firstDayOfMonth):startOfMonth,
        $lt:  req?.query?.lastDayOfMonth? new Date(req?.query?.lastDayOfMonth):endOfMonth
      },
      })
      // let Leaves=await leave_request.find({
      //   StartTime: {
      //     $gte:startOfMonth,
      //     $lt:endOfMonth,
      // },
      // })

      let senddata=[
        ...publicholiays,
         ...data,

      ]
  console.log("data",data)
  success(res, 200, true, "Get Successfully", senddata);
} catch (err) {
  console.log("err",err)
  throw new Error(err);
} 
})
router.get('/hr_timesheet',methods.authAdmin,methods.hr_timesheet );


//getall
methods.getAll=asyncHandler(async (req, res) => {


    
    try {

  
    // Your original pipeline

      const startOfMonth = new Date();
      startOfMonth.setHours(0, 0, 0, 0);
      startOfMonth.setDate(1);
      
      const endOfMonth = new Date();
      endOfMonth.setHours(23, 59, 59, 999);
      endOfMonth.setMonth(startOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);
      let filter={
        StartTime: {
          $gte:  req?.query?.firstDayOfMonth? new Date(req?.query?.firstDayOfMonth):new Date("2024-02-29T18:30:00.000Z"),
          $lt:  req?.query?.lastDayOfMonth? new Date(req?.query?.lastDayOfMonth):endOfMonth
        },
      
      }
      if(req.query.employee_id){
        filter.employee_id =req.query.employee_id
      }
      if(req.query.type){
        filter.type ="Approved"
      }
      

       let data= await event.find({...filter}).lean().populate({
        path: 'client_id',
        select: ' id name', // Specify the fields you want to select from the populated document
      }).populate({
        path: 'project_id',
        select: ' id project_name', // Specify the fields you want to select from the populated document
      })
   
                            

        let publicholiays=await holidays.find({
          StartTime: {
            $gte:  req?.query?.firstDayOfMonth? new Date(req?.query?.firstDayOfMonth):startOfMonth,
          $lt:  req?.query?.lastDayOfMonth? new Date(req?.query?.lastDayOfMonth):endOfMonth
        },
        })
        // let Leaves=await leave_request.find({
        //   StartTime: {
        //     $gte:startOfMonth,
        //     $lt:endOfMonth,
        // },
        // })

        let senddata=[
          ...publicholiays,
           ...data,

        ]
    console.log("data",data)
    success(res, 200, true, "Get Successfully", senddata);
  } catch (err) {
    console.log("err",err)
    throw new Error(err);
  } 
})
 router.get('/',methods.getAll );
 methods.fetchrequests=asyncHandler(async (req, res) => {

 



        
  
    
     

    
    try {

  
    // Your original pipeline

    // const startOfWeek = new Date();
    // startOfWeek.setHours(0, 0, 0, 0);
    // startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    // const endOfWeek = new Date();
    // endOfWeek.setHours(23, 59, 59, 999);
    // endOfWeek.setDate(startOfWeek.getDate() + 6 - startOfWeek.getDay());
   
  let aggregate=[
    {
      $match: {

        
      type: {
          $eq:"Pending",
          
      },
      status: {
        $ne:"Leave",
        
    },
    }
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $lookup: {
        from: 'employees',
        localField: 'employee_id',
        foreignField: '_id',
        as: 'employeedetails',
      },
    },
    {
      $lookup: {
        from: 'clients',
        localField: 'client_id',
        foreignField: '_id',
        as: 'cleintdetails',
      },
    },
    {
      $lookup: {
        from: 'projects',
        localField: 'project_id',
        foreignField: '_id',
        as: 'projects',
      },
    },
    {
      $project: {
       
        action: "$_id",
        name: {
          $concat: [
            { $arrayElemAt: ['$employeedetails.firstname', 0] },
            ' ',
            { $arrayElemAt: ['$employeedetails.lastname', 0] },
          ],
        },
        client: { $arrayElemAt: ['$cleintdetails.name', 0] },
        project: { $arrayElemAt: ['$projects.project_name', 0] },
        type:"$type",
        LoggedHours:"$logged_houres",
        EndTime:"$StartTime",
        _id: 0,
        createdAt:1
      },
    },
   

  ]
    
        let data= await event.aggregate(aggregate)
      
    


    success(res, 200, true, "Get Successfully", data);
  } catch (err) {
    console.log("err",err)
    throw new Error(err);
  } 
})
 router.get('/fetchrequests/',methods.fetchrequests );

 methods.fetchrequestsnonbillable=asyncHandler(async (req, res) => {

 



        
  
    
     

    
  try {


  // Your original pipeline

  // const startOfWeek = new Date();
  // startOfWeek.setHours(0, 0, 0, 0);
  // startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  
  // const endOfWeek = new Date();
  // endOfWeek.setHours(23, 59, 59, 999);
  // endOfWeek.setDate(startOfWeek.getDate() + 6 - startOfWeek.getDay());
 
let aggregate=[
  {
    $match: {

      
    type: {
        $eq:"Pending",
        
    },}
  },
  {
    $sort: {
      createdAt: -1,
    },
  },
  {
    $lookup: {
      from: 'admins',
      localField: 'employee_id',
      foreignField: '_id',
      as: 'employeedetails',
    },
  },

  {
    $project: {
     
      action: "$_id",
      name: 
      { $arrayElemAt: ['$employeedetails.name', 0] },

      
      type:"$type",
      loginhour:1,
      logouthour:1,
      TotalLoggedHours:"$total_logged_hours",
      break_timings:"$break_logged_hours",
      _id: 0,
      createdAt:1
    },
  },
 

]
  
      let data= await hrlogged.aggregate(aggregate)
    
  


  success(res, 200, true, "Get Successfully", data);
} catch (err) {
  console.log("err",err)
  throw new Error(err);
} 
})
router.get('/fetchrequestsnonbillable/',methods.fetchrequestsnonbillable );

 methods.admintimesheet=asyncHandler(async (req, res) => {

 
    
  const startOfMonth = new Date();
  startOfMonth.setHours(0, 0, 0, 0);
  startOfMonth.setDate(1);
  
  const endOfMonth = new Date();
  endOfMonth.setHours(23, 59, 59, 999);
  endOfMonth.setMonth(startOfMonth.getMonth() + 1);
  endOfMonth.setDate(0);

    
    try {


    // Your original pipeline
    const pipeline = [
      {
        $match: {
          StartTime: {
            $gte:  req?.query?.firstDayOfMonth? new Date(req?.query?.firstDayOfMonth):startOfMonth,
            $lt:  req?.query?.lastDayOfMonth? new Date(req?.query?.lastDayOfMonth):endOfMonth
          },

          ...(req.query.employee_id  && { 'employee_id': new mongoose.Types.ObjectId(req.query.employee_id) }),
          ...(req.query.type  && { 'type' :req.query.type }),
        }

      },
      {
        $group: {
          _id: '$employee_id',
          totalLoggedMinutes: {
            $sum: {
              $add: [
                {
                  $multiply: [
                    { $toInt: { $arrayElemAt: [{ $split: ['$logged_houres', ':'] }, 0] } }, // extract hours
                    60,
                  ],
                },
                { $toInt: { $arrayElemAt: [{ $split: ['$logged_houres', ':'] }, 1] } }, // extract minutes
              ],
            },
          },
          project: { $first: '$project_id' }, // Assuming each employee has only one project during the time period
        },
      },
      {
        $project: {
          _id: 0,
          employee_id: '$_id',
          totalLoggedHours: {
            $concat: [
              { $toString: { $trunc: { $divide: ['$totalLoggedMinutes', 60] } } },
              ':',
              { $toString: { $mod: ['$totalLoggedMinutes', 60] } },
            ],
          },
          project: 1,
        },
      },
      {
        $lookup: {
          from: 'employees',
          let: { employee_id: "$employee_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$employee_id"] },
              },
            },
            {
              $project: {
                _id: 0,
                firstname: 1,
                lastname: 1,
              },
            },
          ],
          as: 'employeeDetails',
        },
      },
      {
        $unwind: '$employeeDetails',
      },
      {
        $project: {
          _id: 0,
          id: "$employee_id",
          text: {
            $concat: [
              '$employeeDetails.firstname',
              ' ',
              '$employeeDetails.lastname',
              "(",
              '$totalLoggedHours',
             ")"

            ],
          },
        },
      },
      
    ];

 
        let data= await event.aggregate(pipeline)
     
     console.log("data",data)
      const employeedata = await employee.find({}, { id: 1, firstname: 1, lastname: 1 });
     console.log("employeedata", employeedata);
     let senddata= []
     employeedata?.map((item)=>{
       let exist =data.find((e)=>e.id ==String(item._id))
       console.log("senddata",exist)
       if(exist){
          senddata.push(exist)
       }
       else{
          senddata.push({
          id:item?._id,
          text:`${item.firstname} ${item.lastname} (00:00)`
        })
         
       }
     })
     


    success(res, 200, true, "Get Successfully", req.query.employee_id ? data:senddata);
  } catch (err) {
    console.log("err",err)
    throw new Error(err);
  } 
})
 router.get('/admintimesheet/',methods.admintimesheet );

 methods.attenecehours=asyncHandler(async (req, res) => {

 
    
  const startOfMonth = new Date();
  startOfMonth.setHours(0, 0, 0, 0);
  startOfMonth.setDate(1);
  
  const endOfMonth = new Date();
  endOfMonth.setHours(23, 59, 59, 999);
  endOfMonth.setMonth(startOfMonth.getMonth() + 1);
  endOfMonth.setDate(0);

    
    try {


    // Your original pipeline
    const pipeline = [
      {
        $match: {
          // StartTime: {
          //   $gte:  req?.query?.firstDayOfMonth? new Date(req?.query?.firstDayOfMonth):startOfMonth,
          //   $lt:  req?.query?.lastDayOfMonth? new Date(req?.query?.lastDayOfMonth):endOfMonth
          // },

          ...(req.query.employee_id  && { 'employee_id': new mongoose.Types.ObjectId(req.query.employee_id) }),
         
        }

      },
      {
        $group: {
          _id: '$employee_id',
          totalLoggedMinutes: {
            $sum: {
              $add: [
                {
                  $multiply: [
                    { $toInt: { $arrayElemAt: [{ $split: ['$total_logged_hours', ':'] }, 0] } }, // extract hours
                    60,
                  ],
                },
                { $toInt: { $arrayElemAt: [{ $split: ['$total_logged_hours', ':'] }, 1] } }, // extract minutes
              ],
            },
          },
          totalBreakMinutes: {
            $sum: {
              $add: [
                {
                  $multiply: [
                    { $toInt: { $arrayElemAt: [{ $split: ['$break_logged_hours', ':'] }, 0] } }, // extract hours
                    60,
                  ],
                },
                { $toInt: { $arrayElemAt: [{ $split: ['$break_logged_hours', ':'] }, 1] } }, // extract minutes
              ],
            },
          },
        // Assuming each employee has only one project during the time period
        },
      },
      {
        $project: {
          _id: 1,
          employee_id: '$_id',
          totalLoggedHours: {
            $concat: [
              { $toString: { $trunc: { $divide: ['$totalLoggedMinutes', 60] } } },
              ':',
              { $toString: { $mod: ['$totalLoggedMinutes', 60] } },
            ],
          },
          totalBreakHours: {
            $concat: [
              { $toString: { $trunc: { $divide: ['$totalBreakMinutes', 60] } } },
              ':',
              { $toString: { $mod: ['$totalBreakMinutes', 60] } },
            ],
          },
         
        },
      },
      {
        $lookup: {
          from: 'employees',
          let: { employee_id: "$employee_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$employee_id"] },
              },
            },
            {
              $project: {
                _id: 0,
                firstname: 1,
                lastname: 1,
              },
            },
          ],
          as: 'employeeDetails',
        },
      },
      {
        $unwind: '$employeeDetails',
      },
      {
        $project: {
          _id: 1,
          id: "$employee_id",
          totallogged:"$totalLoggedHours",
          totalBreak:"$totalBreakHours",
          text: {
            $concat: [
              '$employeeDetails.firstname',
              ' ',
              '$employeeDetails.lastname',
             

            ],
          },
        },
      },
      
    ];

 
        let data= await hrlogged.aggregate(pipeline)
     
     console.log("data",data)
    
     


    success(res, 200, true, "Get Successfully", data);
  } catch (err) {
    console.log("err",err)
    throw new Error(err);
  } 
})
 router.get('/attenecehours/',methods.attenecehours );

 
 methods.billableattenence=asyncHandler(async (req, res) => {

 
    
  const startOfMonth = new Date();
  startOfMonth.setHours(0, 0, 0, 0);
  startOfMonth.setDate(1);
  
  const endOfMonth = new Date();
  endOfMonth.setHours(23, 59, 59, 999);
  endOfMonth.setMonth(startOfMonth.getMonth() + 1);
  endOfMonth.setDate(0);

    
    try {


    // Your original pipeline
    const pipeline = [
      {
        $match: {
          // StartTime: {
          //   $gte:  req?.query?.firstDayOfMonth? new Date(req?.query?.firstDayOfMonth):startOfMonth,
          //   $lt:  req?.query?.lastDayOfMonth? new Date(req?.query?.lastDayOfMonth):endOfMonth
          // },

          ...(req.query.employee_id  && { 'employee_id': new mongoose.Types.ObjectId(req.query.employee_id) }),
         
        }

      },
      {
        $group: {
          _id: '$employee_id',
          totalLoggedMinutes: {
            $sum: {
              $add: [
                {
                  $multiply: [
                    { $toInt: { $arrayElemAt: [{ $split: ['$total_logged_hours', ':'] }, 0] } }, // extract hours
                    60,
                  ],
                },
                { $toInt: { $arrayElemAt: [{ $split: ['$total_logged_hours', ':'] }, 1] } }, // extract minutes
              ],
            },
          },
          totalBreakMinutes: {
            $sum: {
              $add: [
                {
                  $multiply: [
                    { $toInt: { $arrayElemAt: [{ $split: ['$break_logged_hours', ':'] }, 0] } }, // extract hours
                    60,
                  ],
                },
                { $toInt: { $arrayElemAt: [{ $split: ['$break_logged_hours', ':'] }, 1] } }, // extract minutes
              ],
            },
          },
        // Assuming each employee has only one project during the time period
        },
      },
      {
        $project: {
          _id: 1,
          employee_id: '$_id',
          totalLoggedHours: {
            $concat: [
              { $toString: { $trunc: { $divide: ['$totalLoggedMinutes', 60] } } },
              ':',
              { $toString: { $mod: ['$totalLoggedMinutes', 60] } },
            ],
          },
          totalBreakHours: {
            $concat: [
              { $toString: { $trunc: { $divide: ['$totalBreakMinutes', 60] } } },
              ':',
              { $toString: { $mod: ['$totalBreakMinutes', 60] } },
            ],
          },
         
        },
      },
      {
        $lookup: {
          from: 'employees',
          let: { employee_id: "$employee_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$employee_id"] },
              },
            },
            {
              $project: {
                _id: 0,
                firstname: 1,
                lastname: 1,
              },
            },
          ],
          as: 'employeeDetails',
        },
      },
      {
        $unwind: '$employeeDetails',
      },
      {
        $project: {
          _id: 1,
          id: "$employee_id",
          totallogged:"$totalLoggedHours",
          totalBreak:"$totalBreakHours",
          text: {
            $concat: [
              '$employeeDetails.firstname',
              ' ',
              '$employeeDetails.lastname',
             

            ],
          },
        },
      },
      
    ];

 
        let data= await event.aggregate(pipeline)
     
     console.log("data",data)
    
     


    success(res, 200, true, "Get Successfully", data);
  } catch (err) {
    console.log("err",err)
    throw new Error(err);
  } 
})
 router.get('/billableattenence/',methods.billableattenence );
 methods.adminnonbillable=asyncHandler(async (req, res) => {

 
    
  const startOfMonth = new Date();
  startOfMonth.setHours(0, 0, 0, 0);
  startOfMonth.setDate(1);
  
  const endOfMonth = new Date();
  endOfMonth.setHours(23, 59, 59, 999);
  endOfMonth.setMonth(startOfMonth.getMonth() + 1);
  endOfMonth.setDate(0);

    
    try {


    // Your original pipeline
    const pipeline = [
      // {
      //   // $match: {
      //   //   // StartTime: {
      //   //   //   $gte:  req?.query?.firstDayOfMonth? new Date(req?.query?.firstDayOfMonth):startOfMonth,
      //   //   //   $lt:  req?.query?.lastDayOfMonth? new Date(req?.query?.lastDayOfMonth):endOfMonth
      //   //   // },

      //   //   // ...(req.query.employee_id  && { 'employee_id': new mongoose.Types.ObjectId(req.query.employee_id) }),
      //   //   // ...(req.query.type  && { 'type' :req.query.type }),
      //   // }

      // },
      {
        $group: {
          _id: '$employee_id',
          totalLoggedMinutes: {
            $sum: {
              $add: [
                {
                  $multiply: [
                    { $toInt: { $arrayElemAt: [{ $split: ['$total_logged_hours', ':'] }, 0] } }, // extract hours
                    60,
                  ],
                },
                { $toInt: { $arrayElemAt: [{ $split: ['$total_logged_hours', ':'] }, 1] } }, // extract minutes
              ],
            },
          },
         // Assuming each employee has only one project during the time period
        },
      },
      {
        $project: {
          _id: 0,
          employee_id: '$_id',
          totalLoggedHours: {
            $concat: [
              { $toString: { $trunc: { $divide: ['$totalLoggedMinutes', 60] } } },
              ':',
              { $toString: { $mod: ['$totalLoggedMinutes', 60] } },
            ],
          },
          
        },
      },
      {
        $lookup: {
          from: 'employees',
          let: { employee_id: "$employee_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$employee_id"] },
              },
            },
            {
              $project: {
                _id: 0,
                firstname: 1,
                lastname: 1,
              },
            },
          ],
          as: 'employeeDetails',
        },
      },
      {
        $unwind: '$employeeDetails',
      },
      {
        $project: {
          _id: 0,
          id: "$employee_id",
          text: {
            $concat: [
              '$employeeDetails.firstname',
              ' ',
              '$employeeDetails.lastname',
              "\n(",
              '$totalLoggedHours',
             ")"

            ],
          },
        },
      },
      
    ];

 
        let data= await hrlogged.aggregate(pipeline)
     
     console.log("data -----------",data)
      const employeedata = await employee.find({salary_type:'Non Billable'}, { id: 1, firstname: 1, lastname: 1 });
     console.log("employeedata", employeedata);
     let senddata= []
     employeedata?.map((item)=>{
       let exist =data.find((e)=>e.id ==String(item._id))
       console.log("senddata",exist)
       if(exist){
          senddata.push(exist)
       }
       else{
          senddata.push({
          id:item?._id,
          text:`${item.firstname} ${item.lastname} 
          (00:00)`
        })
         
       }
     })
     


    success(res, 200, true, "Get Successfully", req.query.employee_id ? data:senddata);
  } catch (err) {
    console.log("err",err)
    throw new Error(err);
  } 
})
 router.get('/adminnonbillable/',methods.adminnonbillable );


 methods.getAllReport=asyncHandler(async (req, res) => {


    // Assume you have variables to store the selected client_id and project_id
    
  
      // Add $match stages for client_id and project_id only if they are provided
   
  
      // Continue with the remaining stages of your original pipeline
      // pipeline.push(
      // {
      //     $group: {
      //     _id: {
      //         month: { $month: '$StartTime' },
      //         // project_id: '$project_id',
      //     },
      //     totalLoggedMinutes: {
      //         $sum: {
      //         $add: [
      //             {
      //             $multiply: [
      //                 { $toInt: { $arrayElemAt: [{ $split: ['$logged_houres', ':'] }, 0] } }, // extract hours
      //                 60,
      //             ],
      //             },
      //             { $toInt: { $arrayElemAt: [{ $split: ['$logged_houres', ':'] }, 1] } }, // extract minutes
      //         ],
      //         },
      //     },
      //     },
      // },
      // // {
      // //     $lookup: {
      // //     from: 'projects', // Replace with the actual name of the "projects" collection
      // //     localField: '_id.project_id',
      // //     foreignField: '_id',
      // //     as: 'projectData',
      // //     },
      // // },
      // // {
      // //     $unwind: '$projectData',
      // // },
      // {
      //     $project: {
      //     _id: 0,
      //     month: '$_id.month',
      //     // project_id: '$_id.project_id',
      //     // projectName: '$projectData.name',
      //     totalLoggedHours: {
      //         $concat: [
      //         { $toString: { $trunc: { $divide: ['$totalLoggedMinutes', 60] } } },
      //         ':',
      //         { $toString: { $mod: ['$totalLoggedMinutes', 60] } },
      //         ],
      //     },
      //     },
      // }
      // );
  
  
  
          
          // Output the intermediate result after each stage for debugging
      
       
  
      
      try {
  
     
      // Your original pipeline
      const pipeline = [
      {
          $match: {
  
            $or: [
              {
                  StartTime: {
                      $gte: new Date(`2024-01-01T00:00:00.000Z`),
                      $lt: new Date(`2025-01-01T00:00:00.000Z`),
                  },
              },
              {
                  EndTime: {
                      $gte: new Date(`2024-01-01T00:00:00.000Z`),
                      $lt: new Date(`2025-02-01T00:00:00.000Z`),
                  },
              },
          ],
          // StartTime: {
          //     $gte: new Date(`2024-01-01T00:00:00.000Z`),
          //     $lt: new Date(`2025-01-01T00:00:00.000Z`),
          // },
        
          ...(req?.query?.employee_id && { 'employee_id': new mongoose.Types.ObjectId(req?.query?.employee_id) }),
          ...(req?.query?.client_id && { 'client_id': new mongoose.Types.ObjectId(req?.query?.client_id) }),
          ...(req?.query?.project_id && { 'project_id': new mongoose.Types.ObjectId(req?.query?.project_id) }),
          ...(req?.query?.type  && { 'type' :req.query.type }),
          // ...(req?.query?.month  && { 'month' :req.query.month }),

          },
      },
      ];
   
  
      pipeline.push(
          {
              $group: {
              _id: {
                  month: { $month: '$EndTime' },
                  project_id: '$project_id',
              },
              totalLoggedMinutes: {
                  $sum: {
                  $add: [
                      {
                      $multiply: [
                          { $toInt: { $arrayElemAt: [{ $split: ['$logged_houres', ':'] }, 0] } }, // extract hours
                          60,
                      ],
                      },
                      { $toInt: { $arrayElemAt: [{ $split: ['$logged_houres', ':'] }, 1] } }, // extract minutes
                  ],
                  },
              },
              },
          },
          {
              $lookup: {
              from: 'projects', // Replace with the actual name of the "projects" collection
              localField: '_id.project_id',
              foreignField: '_id',
              as: 'projectData',
              },
          },
          {
              $unwind: '$projectData',
          },

          {
            $addFields: {
                monthName: {
                    $switch: {
                        branches: [
                            { case: { $eq: ['$_id.month', 1] }, then: 'January' },
                            { case: { $eq: ['$_id.month', 2] }, then: 'February' },
                            { case: { $eq: ['$_id.month', 3] }, then: 'March' },
                            { case: { $eq: ['$_id.month', 4] }, then: 'April' },
                            { case: { $eq: ['$_id.month', 5] }, then: 'May' },
                            { case: { $eq: ['$_id.month', 6] }, then: 'June' },
                            { case: { $eq: ['$_id.month', 7] }, then: 'July' },
                            { case: { $eq: ['$_id.month', 8] }, then: 'Auguest' },
                            { case: { $eq: ['$_id.month', 9] }, then: 'Septemper' },
                            { case: { $eq: ['$_id.month', 10] }, then: 'October' },
                            { case: { $eq: ['$_id.month', 11] }, then: 'November' },
                            { case: { $eq: ['$_id.month', 12] }, then: 'December' },
                            // Add more cases for other months
                        ],
                        default: 'Unknown',
                    },
                },
            },
        },
          {
              $project: {
              _id: 0,
              month: '$_id.month',
              monthName: 1,
              project_id: '$_id.project_id',
              projectName: '$projectData.project_name',
              totalLoggedHours: {
                  $concat: [
                  { $toString: { $trunc: { $divide: ['$totalLoggedMinutes', 60] } } },
                  ':',
                  { $toString: { $mod: ['$totalLoggedMinutes', 60] } },
                  ],
              },
              },
          },{
            $project: {
              month: 1, 
              monthName: 1,// Project the month as a separate field
              project_id: 1,
              projectName: 1,
              totalLoggedHours: 1,
            },
          },
          );
  
  
      pipeline.forEach((stage, index) => {
          console.log(`Stage ${index + 1}:`);
          console.log(JSON.stringify(stage, null, 2));
        });
          let data= await event.aggregate(pipeline)
      console.log("data",data)
      if(req.query.month){
        let monthwisesenddata= data.filter((item)=>item.month == req.query.month)
       success(res, 200, true, "Get Successfully", monthwisesenddata);
    
       }
      success(res, 200, true, "Get Successfully", data);
    } catch (err) {
      console.log("err",err)
      throw new Error(err);
    } 
  })
  
   router.get('/report',methods.getAllReport );
   methods.employeewiseReport=asyncHandler(async (req, res) => {

    console.log("req.query",req.query)

   
       
  
      
    let filter={
      year :2024,
      ...req.query,   
    }
    if(req.query.year){
     filter.year = 2024
    }
    let workingdaysMonth= await crud.getDocument(workingdays, {year:req.query.year||"2024"},{},{})
    console.log("working days",workingdaysMonth) 

   
   try {

    
   // Your original pipeline
   const pipeline = [
     {
         $match: {
          $or: [
            {
                StartTime: {
                    $gte: new Date(`2024-01-01T00:00:00.000Z`),
                    $lt: new Date(`2025-01-01T00:00:00.000Z`),
                },
            },
            {
                EndTime: {
                    $gte: new Date(`2024-01-01T00:00:00.000Z`),
                    $lt: new Date(`2025-02-01T00:00:00.000Z`),
                },
            },
          ],
            //  StartTime: {
            //      $gte: new Date(`2024-01-01T00:00:00.000Z`),
            //      $lt: new Date(`2025-01-01T00:00:00.000Z`),
            //  },
              ...(req?.query?.employee_id && { 'employee_id': new mongoose.Types.ObjectId(req?.query?.employee_id) }),
          ...(req.query.type  && { 'type' :req.query.type }),

         },
     },
     {
         $group: {
             _id: {
                 month: { $month: '$EndTime' },
                  employee_id: '$employee_id',
             },
             totalLoggedMinutes: {
                 $sum: {
                     $add: [
                         {
                             $multiply: [
                                 { $toInt: { $arrayElemAt: [{ $split: ['$logged_houres', ':'] }, 0] } }, // extract hours
                                 60,
                             ],
                         },
                         { $toInt: { $arrayElemAt: [{ $split: ['$logged_houres', ':'] }, 1] } }, // extract minutes
                     ],
                 },
             },
             totalDayWorked: { $sum: '$days_worked' },
             totalLeaveDays: {
                 $sum: {
                     $cond: {
                         if: { $eq: ['$status', 'Leave'] },
                         then: 1,
                         else: 0,
                     },
                 },
             },
         },
     },
     {
         $lookup: {
             from: 'employees',
             localField: '_id.employee_id',
             foreignField: '_id',
             as: 'projectData',
         },
     },
     {
         $unwind: '$projectData',
     },
     {
       $addFields: {
           monthName: {
               $switch: {
                   branches: [
                       { case: { $eq: ['$_id.month', 1] }, then: 'January' },
                       { case: { $eq: ['$_id.month', 2] }, then: 'February' },
                       { case: { $eq: ['$_id.month', 3] }, then: 'March' },
                       { case: { $eq: ['$_id.month', 4] }, then: 'April' },
                       { case: { $eq: ['$_id.month', 5] }, then: 'May' },
                       { case: { $eq: ['$_id.month', 6] }, then: 'June' },
                       { case: { $eq: ['$_id.month', 7] }, then: 'July' },
                       { case: { $eq: ['$_id.month', 8] }, then: 'Auguest' },
                       { case: { $eq: ['$_id.month', 9] }, then: 'Septemper' },
                       { case: { $eq: ['$_id.month', 10] }, then: 'October' },
                       { case: { $eq: ['$_id.month', 11] }, then: 'November' },
                       { case: { $eq: ['$_id.month', 12] }, then: 'December' },
                       // Add more cases for other months
                   ],
                   default: 'Unknown',
               },
           },
       },
   },
     {
         $project: {
             _id: 0,
             month: '$_id.month',
             working_days:'$totalDayWorked',
             days_leave:"$totalLeaveDays",
             monthName: 1,
             employee_id: '$_id.employee_id',
             projectName: '$projectData.firstname',
             totalLoggedHours: {
                 $concat: [
                     { $toString: { $trunc: { $divide: ['$totalLoggedMinutes', 60] } } },
                     ':',
                     { $toString: { $mod: ['$totalLoggedMinutes', 60] } },
                 ],
             },
         },
     },
     {
         $project: {
             month: 1,
             monthName: 1,
             employee_id: 1,
             projectName: 1,
             totalLoggedHours: 1,
             days_leave:1,
             working_days:1

         },
     },
 ];


  //  pipeline.forEach((stage, index) => {
  //      console.log(`Stage ${index + 1}:`);
  //      console.log(JSON.stringify(stage, null, 2));
  //    });
       let data= await event.aggregate(pipeline)
   let senddata=[]
   data?.map((item)=>{
     let no_of_workingdays=workingdaysMonth[0]?.workingDays?.find((days)=>days.key == item.month) 
     
     senddata.push({
        ...item,
        no_of_workingdays:no_of_workingdays? no_of_workingdays?.workingDays :0
     })
     
     
   })
   if(req.query.month){
    let monthwisesenddata= senddata.filter((item)=>item.month == req.query.month)
   success(res, 200, true, "Get Successfully", monthwisesenddata);

   }
   success(res, 200, true, "Get Successfully", senddata);

 } catch (err) {
   console.log("err",err)
   throw new Error(err);
 } 
  })


   router.get('/employeewisereport',methods.employeewiseReport);
   methods.nonbillablereport=asyncHandler(async (req, res) => {

    console.log("req.query",req.query)

   
       
  
      
    let filter={
      year :2024,
      ...req.query,   
    }
    if(req.query.year){
     filter.year = 2024
    }
    let workingdaysMonth= await crud.getDocument(workingdays, {year:req.query.year||"2024"},{},{})
    console.log("working days",workingdaysMonth) 

   
   try {

    
   // Your original pipeline
   const pipeline = [
     {
         $match: {
          $or: [
            {
                StartTime: {
                    $gte: new Date(`2024-01-01T00:00:00.000Z`),
                    $lt: new Date(`2025-01-01T00:00:00.000Z`),
                },
            },
            {
                EndTime: {
                    $gte: new Date(`2024-01-01T00:00:00.000Z`),
                    $lt: new Date(`2025-02-01T00:00:00.000Z`),
                },
            },
          ],
            //  StartTime: {
            //      $gte: new Date(`2024-01-01T00:00:00.000Z`),
            //      $lt: new Date(`2025-01-01T00:00:00.000Z`),
            //  },
              ...(req?.query?.employee_id && { 'employee_id': new mongoose.Types.ObjectId(req?.query?.employee_id) }),
          ...(req.query.type  && { 'type' :req.query.type }),

         },
     },
     {
         $group: {
             _id: {
                 month: { $month: '$EndTime' },
                  employee_id: '$employee_id',
             },
             totalLoggedMinutes: {
                 $sum: {
                     $add: [
                         {
                             $multiply: [
                                 { $toInt: { $arrayElemAt: [{ $split: ['$total_logged_hours', ':'] }, 0] } }, // extract hours
                                 60,
                             ],
                         },
                         { $toInt: { $arrayElemAt: [{ $split: ['$total_logged_hours', ':'] }, 1] } }, // extract minutes
                     ],
                 },
             },
             totalDayWorked: { $sum: '$days_worked' },
             totalLeaveDays: {
                 $sum: {
                     $cond: {
                         if: { $eq: ['$status', 'Leave'] },
                         then: 1,
                         else: 0,
                     },
                 },
             },
         },
     },
     {
         $lookup: {
             from: 'admins',
             localField: '_id.employee_id',
             foreignField: '_id',
             as: 'projectData',
         },
     },
     {
         $unwind: '$projectData',
     },
     {
       $addFields: {
           monthName: {
               $switch: {
                   branches: [
                       { case: { $eq: ['$_id.month', 1] }, then: 'January' },
                       { case: { $eq: ['$_id.month', 2] }, then: 'February' },
                       { case: { $eq: ['$_id.month', 3] }, then: 'March' },
                       { case: { $eq: ['$_id.month', 4] }, then: 'April' },
                       { case: { $eq: ['$_id.month', 5] }, then: 'May' },
                       { case: { $eq: ['$_id.month', 6] }, then: 'June' },
                       { case: { $eq: ['$_id.month', 7] }, then: 'July' },
                       { case: { $eq: ['$_id.month', 8] }, then: 'Auguest' },
                       { case: { $eq: ['$_id.month', 9] }, then: 'Septemper' },
                       { case: { $eq: ['$_id.month', 10] }, then: 'October' },
                       { case: { $eq: ['$_id.month', 11] }, then: 'November' },
                       { case: { $eq: ['$_id.month', 12] }, then: 'December' },
                       // Add more cases for other months
                   ],
                   default: 'Unknown',
               },
           },
       },
   },
     {
         $project: {
             _id: 0,
             month: '$_id.month',
             working_days:'$totalDayWorked',
             days_leave:"$totalLeaveDays",
             monthName: 1,
             employee_id: '$_id.employee_id',
             projectName: '$projectData.name',
             totalLoggedHours: {
                 $concat: [
                     { $toString: { $trunc: { $divide: ['$totalLoggedMinutes', 60] } } },
                     ':',
                     { $toString: { $mod: ['$totalLoggedMinutes', 60] } },
                 ],
             },
         },
     },
     {
         $project: {
             month: 1,
             monthName: 1,
             employee_id: 1,
             projectName: 1,
             totalLoggedHours: 1,
             days_leave:1,
             working_days:1

         },
     },
 ];


  //  pipeline.forEach((stage, index) => {
  //      console.log(`Stage ${index + 1}:`);
  //      console.log(JSON.stringify(stage, null, 2));
  //    });
       let data= await hrlogged.aggregate(pipeline)
   let senddata=[]
   data?.map((item)=>{
     let no_of_workingdays=workingdaysMonth[0]?.workingDays?.find((days)=>days.key == item.month) 
     
     senddata.push({
        ...item,
        no_of_workingdays:no_of_workingdays? no_of_workingdays?.workingDays :0
     })
     
     
   })
   if(req.query.month){
    let monthwisesenddata= senddata.filter((item)=>item.month == req.query.month)
   success(res, 200, true, "Get Successfully", monthwisesenddata);

   }
   success(res, 200, true, "Get Successfully", senddata);

 } catch (err) {
   console.log("err",err)
   throw new Error(err);
 } 
  })


   router.get('/nonbillablereport',methods.nonbillablereport);


   methods.nonbillablevents=asyncHandler(async (req, res) => {


    
    try {

  
    // Your original pipeline

      const startOfMonth = new Date();
      startOfMonth.setHours(0, 0, 0, 0);
      startOfMonth.setDate(1);
      
      const endOfMonth = new Date();
      endOfMonth.setHours(23, 59, 59, 999);
      endOfMonth.setMonth(startOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);
      let filter={
        StartTime: {
          $gte:  req?.query?.firstDayOfMonth? new Date(req?.query?.firstDayOfMonth):new Date("2024-02-29T18:30:00.000Z"),
          $lt:  req?.query?.lastDayOfMonth? new Date(req?.query?.lastDayOfMonth):endOfMonth
        },
      
      }
      if(req.query.employee_id){
        filter.employee_id =req.query.employee_id
      }
      if(req.query.type){
        filter.type ="Approved"
      }

       let data= await hrlogged.find({...filter}).lean()
   
                            

        let publicholiays=await holidays.find({
          StartTime: {
            $gte:  req?.query?.firstDayOfMonth? new Date(req?.query?.firstDayOfMonth):startOfMonth,
          $lt:  req?.query?.lastDayOfMonth? new Date(req?.query?.lastDayOfMonth):endOfMonth
        },
        })
        // let Leaves=await leave_request.find({
        //   StartTime: {
        //     $gte:startOfMonth,
        //     $lt:endOfMonth,
        // },
        // })

        let senddata=[
          ...publicholiays,
           ...data,

        ]
    console.log("data",data)
    success(res, 200, true, "Get Successfully", senddata);
  } catch (err) {
    console.log("err",err)
    throw new Error(err);
  } 
})
 router.get('/nonbillablevents',methods.nonbillablevents );


   methods.loggedhoursweek=asyncHandler(async (req, res) => {
   
    const today = new Date();
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 6, 23, 59, 59);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
  // let weekcountforleaves= await crud.getDocument(Holidays, {
  //   StartTime: {
  //     $gte: startOfWeek,
  //     $lt: endOfWeek,
  //   },
  // },{},{})

  
//   let weekcountforyours= await crud.getDocument(event, {
//     // employee_id: req.query?.employee_id,
//     StartTime: {
//       $gte: startOfWeek,
//       $lt: endOfWeek,
//     },
//   },{},{})

//   let totalHours = 0;
// let totalMinutes = 0;
//     weekcountforyours.reduce((acc, match) => {
//     // Assuming 'hours' is a string in the format 'HH:mm'
//     const [hours, minutes] = match.logged_houres.split(':');
//     totalHours += parseInt(hours);
//     totalMinutes += parseInt(minutes);
//   }, 0);

//   totalHours += Math.floor(totalMinutes / 60);
//    totalMinutes = totalMinutes % 60;
  
//   console.log("weekcountforyours",weekcountforyours)



   
  // const today = new Date();
const startOfYear = new Date(today.getFullYear(), 0, 1);
const endOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59);

   const aggregationPipeline = [
      {
          $match: {
  
            
          StartTime: {
              $gte: new Date(`2024-01-01T00:00:00.000Z`),
              $lt: new Date(`2025-01-01T00:00:00.000Z`),
          },
        
          ...(req?.query?.emplyee_id && { 'employee_id': new mongoose.Types.ObjectId(req?.query?.emplyee_id) }),
          },
      },
      ];
    
  
      aggregationPipeline.push(
          {
              $group: {
              _id: {
                  month: { $month: '$EndTime' },
                  
              },
              totalLoggedMinutes: {
                  $sum: {
                  $add: [
                      {
                      $multiply: [
                          { $toInt: { $arrayElemAt: [{ $split: ['$logged_houres', ':'] }, 0] } }, // extract hours
                          60,
                      ],
                      },
                      { $toInt: { $arrayElemAt: [{ $split: ['$logged_houres', ':'] }, 1] } }, // extract minutes
                  ],
                  },
              },
              },
          },
       

          {
            $addFields: {
                monthName: {
                    $switch: {
                        branches: [
                            { case: { $eq: ['$_id.month', 1] }, then: 'Jan' },
                            { case: { $eq: ['$_id.month', 2] }, then: 'Feb' },
                            { case: { $eq: ['$_id.month', 3] }, then: 'Mar' },
                            { case: { $eq: ['$_id.month', 4] }, then: 'Apr' },
                            { case: { $eq: ['$_id.month', 5] }, then: 'May' },
                            { case: { $eq: ['$_id.month', 6] }, then: 'June' },
                            { case: { $eq: ['$_id.month', 7] }, then: 'July' },
                            { case: { $eq: ['$_id.month', 8] }, then: 'Aug' },
                            { case: { $eq: ['$_id.month', 9] }, then: 'Sep' },
                            { case: { $eq: ['$_id.month', 10] }, then: 'Oct' },
                            { case: { $eq: ['$_id.month', 11] }, then: 'Nov' },
                            { case: { $eq: ['$_id.month', 12] }, then: 'Dec' },
                            // Add more cases for other months
                        ],
                        default: 'Unknown',
                    },
                },
            },
        },
          {
              $project: {
              _id: 0,
              month: '$_id.month',
              monthName: 1,
           
              totalLoggedHours: {
                  $concat: [
                  { $toString: { $trunc: { $divide: ['$totalLoggedMinutes', 60] } } },
                  ':',
                  { $toString: { $mod: ['$totalLoggedMinutes', 60] } },
                  ],
              },
              },
          },{
            $project: {
              month: 1, 
              monthName: 1,// Project the month as a separate field
           
              totalLoggedHours: 1,
            },
          },
          );
  
  
          aggregationPipeline.forEach((stage, index) => {
          console.log(`Stage ${index + 1}:`);
          console.log(JSON.stringify(stage, null, 2));
        });
       

        function getMonthName(month) {
          const monthNames = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
          ];
          return monthNames[month - 1];
        }


let data=[]
const result =  await event.aggregate(aggregationPipeline);
console.log("result",result)
if(result.length>0){

   for (let index = 1; index <= 12; index++) {
    const monthExists = result.find(item => item.month === index);
    if(monthExists){
      data.push(
     
        monthExists.totalLoggedHours?.split(":")[0],
      
        // LoggedHours:monthExists.totalLoggedHours?.split(":")[0]
    )
    }
    else{
      data.push(

        
        0
        
     
    )
    }
     
   }
  result.map((item)=>{
  
  })
 
}



const senddata={

  result:data
}
  
    try {
    success(res, 200, true, "Get Successfully", senddata);
    } catch (err) {
      throw new Error(err);
    } 
  })
   router.get('/loghoursweek', methods.loggedhoursweek)

   methods.loghoursmonth=asyncHandler(async (req, res) => {
   
    const today = new Date();
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
  // let weekcountforleaves= await crud.getDocument(Holidays, {
  //   StartTime: {
  //     $gte: startOfWeek,
  //     $lt: endOfWeek,
  //   },
  // },{},{})

  
//   let weekcountforyours= await crud.getDocument(event, {
//     // employee_id: req.query?.employee_id,
//     StartTime: {
//       $gte: startOfWeek,
//       $lt: endOfWeek,
//     },
//   },{},{})

//   let totalHours = 0;
// let totalMinutes = 0;
//     weekcountforyours.reduce((acc, match) => {
//     // Assuming 'hours' is a string in the format 'HH:mm'
//     const [hours, minutes] = match.logged_houres.split(':');
//     totalHours += parseInt(hours);
//     totalMinutes += parseInt(minutes);
//   }, 0);

//   totalHours += Math.floor(totalMinutes / 60);
//    totalMinutes = totalMinutes % 60;
  
//   console.log("weekcountforyours",weekcountforyours)








   
  // const today = new Date();

  const aggregationPipeline = [
    {
      $match: {
        StartTime: {
          $gte: req.query.firstDayOfMonth ? new Date(req.query.firstDayOfMonth):startOfMonth,
        
          $lt: req.query.lastDayOfMonth ? new Date(req.query.lastDayOfMonth):endOfMonth ,
        },
        ...(req?.query?.emplyee_id && { 'employee_id': new mongoose.Types.ObjectId(req?.query?.emplyee_id) }),
      },
    },
    {
      $group: {
        _id: '$employee_id',
        totalLoggedMinutes: {
          $sum: {
            $add: [
              {
                $multiply: [
                  { $toInt: { $arrayElemAt: [{ $split: ['$logged_houres', ':'] }, 0] } }, // extract hours
                  60,
                ],
              },
              { $toInt: { $arrayElemAt: [{ $split: ['$logged_houres', ':'] }, 1] } }, // extract minutes
            ],
          },
        },
      },
    },
    {
      $lookup: {
        from: 'employees', // Replace with the actual name of your employees collection
        localField: '_id',
        foreignField: '_id',
        as: 'employeeData',
      },
    },
  
    {
      $project: {
        _id: 0,
        employeeData: { $arrayElemAt: ['$employeeData', 0] }, // Extract the first element of the array
        totalLoggedHours: {
          $concat: [
            { $toString: { $trunc: { $divide: ['$totalLoggedMinutes', 60] } } },
            ':',
            { $toString: { $mod: ['$totalLoggedMinutes', 60] } },
          ],
        },
      },
    },
    {
      $project: {
        x:"$employeeData.firstname",
         y: { $arrayElemAt: [{ $split: ['$totalLoggedHours', ':'] }, 0] },
        Rate:"200",

        text:"$totalLoggedHours",
        // employeeData: 1,
        // totalLoggedHours: 1,
      },
    },
  ];
  
  
  
       
       

        function getMonthName(month) {
          const monthNames = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
          ];
          return monthNames[month - 1];
        }


// let data=[]
 const result =  await event.aggregate(aggregationPipeline);
// console.log("result",result)
// if(result.length>0){

//    for (let index = 1; index <= 12; index++) {
//     const monthExists = result.find(item => item.month === index);
//     if(monthExists){
//       data.push({
//         x:monthExists?.monthName,
//         y:monthExists.totalLoggedHours?.split(":")[0],
//         text:monthExists.totalLoggedHours,
//         Rate:200
//         // LoggedHours:monthExists.totalLoggedHours?.split(":")[0]
//     })
//     }
//     else{
//       data.push({

//         x:getMonthName(index),
//         y:0,
//         text:"0:00",
//         Rate:200
     
//     })
//     }
     
//    }
//   result.map((item)=>{
  
//   })
 
// }


// const senddata={
 
//   result:data
// }
  
    try {
    success(res, 200, true, "Get Successfully", result);
    } catch (err) {
      throw new Error(err);
    } 
  })
   router.get('/loghoursmonth', methods.loghoursmonth)

 //getone
 methods.attenenceSingle=asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);

  const startDate = new Date('2024-03-01T00:00:00.000Z');
  const endDate = new Date('2024-03-31T23:59:59.999Z');
  // const check = await crud.getOneDocumentById(event, id, {}, {});
  // if(!check) throw new Error('Data not Found!')
  try {
    let singledata=await crud.getDocument(hrlogged, {
      employee_id:id,
      StartTime: { $gte: startDate, $lt: endDate }},{},{populate:"employee_id"})
     let senddata={
       present:[],
       absent:[]
     }
     singledata?.map((item)=>{
      senddata.name=item.employee_id?.name,
      senddata.email=item.employee_id?.email_id||"-",
      senddata.present.push(new Date(item?.StartTime)?.getDate())
     })
  success(res, 200, true, "Get Successfully",senddata );
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/attenenceSingle/:id', methods.attenenceSingle)

 methods.attenenceBillableSingle=asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);

  const startDate = new Date('2024-03-01T00:00:00.000Z');
  const endDate = new Date('2024-03-31T23:59:59.999Z');
  // const check = await crud.getOneDocumentById(event, id, {}, {});
  // if(!check) throw new Error('Data not Found!')
  try {
    let singledata=await crud.getDocument(event, {
      employee_id:id,
      // StartTime: { $gte: startDate, $lt: endDate }
    },{},{populate:"employee_id"}
      )
     let senddata={
       present:[],
       absent:[]
     }
     singledata?.map((item)=>{
      senddata.name=item.employee_id?.name,
      senddata.email=item.employee_id?.email_id||"-",
      senddata.present.push(new Date(item?.StartTime)?.getDate())
     })
  success(res, 200, true, "Get Successfully",senddata );
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/attenenceBillableSingle/:id', methods.attenenceBillableSingle)

 methods.fetchDatewise=asyncHandler(async (req, res) => {
  const { id } = req.params;
  // validateId(id);

  const startOfToday = req.query?.date? new Date(req.query.date):new Date("2024-03-06");
  startOfToday.setUTCHours(0, 0, 0, 0);

  // Get tomorrow's date at midnight (start of the next day)
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setUTCDate(startOfToday.getUTCDate() + 1);
  // const check = await crud.getOneDocumentById(event, id, {}, {});
  // if(!check) throw new Error('Data not Found!')
  try {
    let singledata=await crud.getDocument(hrlogged, {
      ...req.query.employee_id && {employee_id:req.query.employee_id},
      StartTime: { $gte: startOfToday, $lt:startOfTomorrow}},{},{populate:"employee_id"})
   
   
  success(res, 200, true, "Get Successfully",singledata );
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/fetchDatewise/', methods.fetchDatewise)

methods.getOne=asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(event, id, {}, {});
  if(!check) throw new Error('Data not Found!')
  try {
  success(res, 200, true, "Get Successfully", await crud.getOneDocumentById(event, id,{},{}));
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/:id', methods.getOne)


 methods.editadmin =asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(event,id,{},{});
  if (!check) throw new Error('Data not Found!')
  try {


    let data={
      client_id: new mongoose.Types.ObjectId(req.body.client_id),
      project_id: new mongoose.Types.ObjectId(req.body.project_id),
      StartTime:req.body.StartTime,
      logged_houres:req.body.logged_houres,
      startend_time:req.body.startend_time,

      EndTime:req.body.EndTime,
      timesheet:req?.file?.path||""
    }
    console.log("data",data)
    success(res, 200, true, 'Update Successfully', await crud.updateById(event, id, data, { new: true }));
  } catch (err) {
    throw new Error(err);
  } 
})

 router.put('/adminedit/:id', upload.single("timesheet"),methods.editadmin )

//Edit
methods.edit =asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(event,id,{},{});
  if (!check) throw new Error('Data not Found!')
  try {

    let data={
      client_id: new mongoose.Types.ObjectId(req.body.client_id),
      project_id: new mongoose.Types.ObjectId(req.body.project_id),
      startend_time:req.body.startend_time,
      StartTime:req.body.StartTime,
      logged_houres:req.body.logged_houres,
      EndTime:req.body.EndTime,
    }
    console.log("data",data)
    success(res, 200, true, 'Update Successfully', await crud.updateById(event, id, data, { new: true }));
  } catch (err) {
    throw new Error(err);
  } 
})

 router.put('/:id',methods.edit )
 methods.nonbillable_status =asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(hrlogged,id,{},{});
  if (!check) throw new Error('Data not Found!')
  try {

 
    success(res, 200, true, 'Update Successfully', await crud.updateById(hrlogged, id, req.body, { new: true }));
  } catch (err) {
    throw new Error(err);
  } 
})

 router.put('/nonbillable_status/:id',methods.nonbillable_status )
 methods.status =asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(event,id,{},{});
  if (!check) throw new Error('Data not Found!')
  try {

 
    success(res, 200, true, 'Update Successfully', await crud.updateById(event, id, req.body, { new: true }));
  } catch (err) {
    throw new Error(err);
  } 
})

 router.put('/status/:id',methods.status )



//delete
  .delete('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);
    const check = await crud.getOneDocumentById(event, id, {}, {});
    if(!check) throw new Error('Data not Found!')
    try {
      success(res, 200, true, "Delete Successfully", await crud.deleteById(event, id));
    } catch (err) {
      throw new Error(err);
    } 
}))











module.exports = router;