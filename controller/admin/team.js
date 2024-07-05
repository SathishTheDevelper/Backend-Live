const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const { teams, admin,goaltypes, totallogs } = require("../../utils/schemaMaster");
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
    success(res, 201, true, "Create Successfully", await crud.insertOne(teams, req.body));
  } catch (err) {
    throw new Error(err);
  }
})


router.post('/', methods.add )


methods.goaltype =asyncHandler(async (req, res) => {
    try {
      success(res, 201, true, "Create Successfully", await crud.insertOne(goaltypes, req.body));
    } catch (err) {
      throw new Error(err);
    }
  })
  
  
  router.post('/goaltype', methods.goaltype )


methods.users=asyncHandler(async (req, res) => {


    try {
   let inteam = await crud.getDocument(admin, {
        
    parent_id:{
        $eq:req.params.id
    }
 },{},{})
 let notteam = await crud.getDocument(admin, {
        
    parent_id:{
        $ne:req.params.id
    }
 },{ name :1, email_id:1, parent_id:1},{})
      success(res, 200, true, "Get Successfully",{inteam,notteam});
    } catch (err) {
      throw new Error(err);
    } 
  })
   router.get('/teamusers/:id',methods.users );



   methods.teamselect=asyncHandler(async (req, res) => {
    try {
        let aggregateQuery=[
          
          
          {
            $project:{
              label:"$team_name",
              value:"$_id"
            }
          }
          ]
  
      success(res, 200, true, "Get Successfully", await teams.aggregate(aggregateQuery));
    } catch (err) {
      throw new Error(err);
    } 
  })
   router.get('/teamselect',methods.teamselect );
//getall


methods.goal=asyncHandler(async (req, res) => {
    try {
      let aggregateQuery=[
       
        {
          $lookup:{
            from:"admins",
            localField:"_id",
            foreignField:"parent_id",
            as:"children"
            
          }
        },
        {
            $project: {
            parent_id:"$parent_id",
               name :"$team_name",
               children:"$children"  
            }
        }


        
          
      
    ]
      success(res, 200, true, "Get Successfully", await teams.aggregate(aggregateQuery));
    } catch (err) {
      throw new Error(err);
    } 
  })
   router.get('/goal',methods.goal );
   methods.editgoaltype=asyncHandler(async (req, res) => {
     const {id} =req.params
    try {

     let data =   await goaltypes.updateOne(
        { _id: id, "assigned.parent": String(req.user?._id) },
        { $set: { "assigned.$.count": req.body.count||0 } }
      )
      
      success(res, 200, true, "Update Successfull",data );
    } catch (err) {
      throw new Error(err);
    } 
  })
   router.put('/editgoaltype/:id',methods.authAdmin, methods.editgoaltype );
   methods.Dashboard=asyncHandler(async (req, res) => {
    try {

      let now = new Date();
let startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
let endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (6 - now.getDay()));
let startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
let endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
let quarter = Math.floor((now.getMonth() + 3) / 3); // Calculate the current quarter
let startOfQuarter = new Date(now.getFullYear(), (quarter - 1) * 3, 1); // Start of the quarter
let endOfQuarter = new Date(now.getFullYear(), quarter * 3, 0); 
let startOfYear = new Date(now.getFullYear(), 0, 1); // Start of the year
let endOfYear = new Date(now.getFullYear(), 11, 31); // End of the year
      let {id}=req.params
      console.log("id",req.user?._id)

      let aggregate= [
          {
            $match: {
              assigned: {
                $elemMatch: {
                  parent:String(req.user?._id)
                }
              }
            }
          },
          {
  $project: {
    goaltype_name:1,
    
    matchedAssigned: {
      $filter: {
        input: "$assigned",
        as: "item",
        cond: { $eq: ["$$item.parent", String(req.user?._id)] }
      }
    }
  }
}

        ]

      
        // let aggregatenotmatch= [
        //   {
        //     $match: {
        //       assigned: {
        //           $not: {
        //               $elemMatch: {
        //                   parent: id
        //               }
        //             }
                  
        //       }
        //     }
        //   },
        //   {
        //     $project: {
        //       goaltype_name:1,
              
        //       matchedAssigned: {
        //         $filter: {
        //           input: "$assigned",
        //           as: "item",
        //           cond: { $eq: ["$$item.parent", id] }
        //         }
        //       }
        //     }
        //   }
          
        // ]

        let match =await goaltypes.aggregate(aggregate)
        console.log("llllmatch",match)

       let senddata=[]
     
        for (const ma of match) {
          if (ma.goaltype_name === "Submissions") {
            console.log("llll")
             if(ma.matchedAssigned[0].target =="Weekly"){
              try {
                let data = await totallogs.aggregate([
                  {
                    $match: {
                      createdAt: {
                        $gte: startOfWeek,
                        $lte: endOfWeek
                      },
                      created_by:new mongoose.Types.ObjectId(id)// Match documents created by the specified user
                    }
                  },
                  {
                    $match: {
                      status: "Client submission" // Match documents with status "submission"
                    }
                  },
                  {
                    $group: {
                      _id: "$status",
                      count: { $sum: 1 } // Count the number of submissions
                    }
                  }
                ]);
                console.log("hhhhhworkinghh", data);
                if(data.length > 0) {
                  senddata.push({
                    goaltype_name: ma.goaltype_name,
                    target:ma.matchedAssigned[0]?.target,

                    duration:ma.matchedAssigned[0]?.duration,
                    count: data[0].count
                  })
                }
                else{
                  senddata.push({
                    goaltype_name: ma.goaltype_name,
                    target:ma.matchedAssigned[0]?.target,
                    duration:ma.matchedAssigned[0]?.duration,
                    count: 3
                  })
                }
              } catch (error) {
                console.error(error);
                // Handle error
              }
             }
             if(ma.matchedAssigned[0].target =="Monthly"){
              try {
                let data = await totallogs.aggregate([
                  {
                    $match: {
                      createdAt: {
                        $gte: startOfMonth,
                        $lte: endOfMonth
                      },
                      created_by:req.user?._id// Match documents created by the specified user
                    }
                  },
                  {
                    $match: {
                      status: "Client submission" // Match documents with status "submission"
                    }
                  },
                  {
                    $group: {
                      _id: "$status",
                      count: { $sum: 1 } // Count the number of submissions
                    }
                  }
                ]);
                console.log("hhhhhworkinghh", data);
                if(data.length > 0) {
                  senddata.push({
                    goaltype_name: ma.goaltype_name,
                    target:ma.matchedAssigned[0]?.target,

                    duration:ma.matchedAssigned[0]?.duration,
                    count: data[0].count
                  })
                }
                else{
                  senddata.push({
                    goaltype_name: ma.goaltype_name,
                    target:ma.matchedAssigned[0]?.target,
                    duration:ma.matchedAssigned[0]?.duration,
                    count: 3
                  })
                }
              } catch (error) {
                console.error(error);
                // Handle error
              }
             }
             if(ma.matchedAssigned[0].target =="Quarterly"){
              try {
                let data = await totallogs.aggregate([
                  {
                    $match: {
                      createdAt: {
                        $gte: startOfQuarter,
                        $lte: endOfQuarter
                      },
                      created_by:new mongoose.Types.ObjectId(id)// Match documents created by the specified user
                    }
                  },
                  {
                    $match: {
                      status: "Client submission" // Match documents with status "submission"
                    }
                  },
                  {
                    $group: {
                      _id: "$status",
                      count: { $sum: 1 } // Count the number of submissions
                    }
                  }
                ]);
                console.log("hhhhhworkinghh", data);
                if(data.length > 0) {
                  senddata.push({
                    goaltype_name: ma.goaltype_name,
                    target:2,

                    duration:ma.matchedAssigned[0]?.duration,
                    count: data[0].count
                  })
                }
                else{
                  senddata.push({
                    goaltype_name: ma.goaltype_name,
                    target:ma.matchedAssigned[0]?.target,
                    duration:ma.matchedAssigned[0]?.duration,
                    count: 3
                  })
                }
              } catch (error) {
                console.error(error);
                // Handle error
              }
             }
             if(ma.matchedAssigned[0].target =="Yearly"){
              try {
                let data = await totallogs.aggregate([
                  {
                    $match: {
                      createdAt: {
                        $gte: startOfYear,
                        $lte: endOfYear
                      },
                      created_by:new mongoose.Types.ObjectId(id)// Match documents created by the specified user
                    }
                  },
                  {
                    $match: {
                      status: "Client submission" // Match documents with status "submission"
                    }
                  },
                  {
                    $group: {
                      _id: "$status",
                      count: { $sum: 1 } // Count the number of submissions
                    }
                  }
                ]);
                console.log("hhhhhworkinghh", data);
                if(data.length > 0) {
                  senddata.push({
                    goaltype_name: ma.goaltype_name,
                    target:2,

                    duration:ma.matchedAssigned[0]?.duration,
                    count: data[0].count
                  })
                }
                else{
                  senddata.push({
                    goaltype_name: ma.goaltype_name,
                    target:ma.matchedAssigned[0]?.target,
                    duration:ma.matchedAssigned[0]?.duration,
                    count: 0
                  })
                }
              } catch (error) {
                console.error(error);
                // Handle error
              }
             }
             
            try {
              let data = await totallogs.aggregate([
                {
                  $match: {
                    createdAt: {
                      $gte: startOfWeek,
                      $lte: endOfWeek
                    },
                    created_by:new mongoose.Types.ObjectId(id)// Match documents created by the specified user
                  }
                },
                {
                  $match: {
                    status: "Client submission" // Match documents with status "submission"
                  }
                },
                {
                  $group: {
                    _id: "$status",
                    count: { $sum: 1 } // Count the number of submissions
                  }
                }
              ]);
              console.log("hhhhhworkinghh", data);
              if(data.length > 0) {
                senddata.push({
                  goaltype_name: ma.goaltype_name,
                  target:2,

                  duration:ma.matchedAssigned[0]?.duration,
                  count: data[0].count
                })
              }
              else{
                senddata.push({
                  goaltype_name: ma.goaltype_name,
                  target:ma.matchedAssigned[0]?.target,
                  duration:ma.matchedAssigned[0]?.duration,
                  count: 0
                })
              }
            } catch (error) {
              console.error(error);
              // Handle error
            }
          }
          else if (ma.goaltype_name === "Onboard") {
            console.log("llll")
            try {

              let data = await totallogs.aggregate([
                {
                  $match: {
                    createdAt: {
                      $gte: startOfWeek,
                      $lte: endOfWeek
                    },
                    created_by:new mongoose.Types.ObjectId(req?.user?._id)// Match documents created by the specified user
                  }
                },
                {
                  $match: {
                    status: "Offered" // Match documents with status "submission"
                  }
                },
                {
                  $group: {
                    _id: "$status",
                    count: { $sum: 1 } // Count the number of submissions
                  }
                }
              ]);
              console.log("hhhhhworkinghh", data);
              if(data.length > 0) {
                senddata.push({
                  goaltype_name: ma.goaltype_name,
                  duration:ma.matchedAssigned[0]?.duration,
                  _id:ma._id,

                  target:ma.matchedAssigned[0]?.target,

                  count: ma.matchedAssigned[0]?.count
                })
              }
              else{
                senddata.push({
                  goaltype_name: ma.goaltype_name,
                  target:ma.matchedAssigned[0]?.target,
                  duration:ma.matchedAssigned[0]?.duration,
                  _id:ma._id,

                  count:3
                })
              }
            } catch (error) {
              console.error(error);
              // Handle error
            }
          }
          
          else if (ma.goaltype_name === "Revenue") {
            console.log("Revenuellllllllll")
           try {

             let data = await totallogs.aggregate([
               {
                 $match: {
                   createdAt: {
                     $gte: startOfWeek,
                     $lte: endOfWeek
                   },
                   created_by:new mongoose.Types.ObjectId(req?.user?._id)// Match documents created by the specified user
                 }
               },
               {
                 $match: {
                   status: "Offered" // Match documents with status "submission"
                 }
               },
               {
                 $group: {
                   _id: "$status",
                   count: { $sum: 1 } // Count the number of submissions
                 }
               }
             ]);
             console.log("hhhhhworkinghh", data);
             if(data.length > 0) {
               senddata.push({
                 goaltype_name: ma.goaltype_name,
                 duration:ma.matchedAssigned[0]?.duration,
                 _id:ma._id,

                 target:500000,

                 count: 200000
               })
             }
             else{
               senddata.push({
                 goaltype_name: ma.goaltype_name,
                 target:500000,
                 
                 duration:ma.matchedAssigned[0]?.duration,
                 _id:ma._id,

                 count:200000
               })
             }
           } catch (error) {
             console.error(error);
             // Handle error
           }
         }
          else if (ma.goaltype_name === "Profit") {
         
         try {

           let data = await totallogs.aggregate([
             {
               $match: {
                 createdAt: {
                   $gte: startOfWeek,
                   $lte: endOfWeek
                 },
                 created_by:new mongoose.Types.ObjectId(req?.user?._id)// Match documents created by the specified user
               }
             },
             {
               $match: {
                 status: "Offered" // Match documents with status "submission"
               }
             },
             {
               $group: {
                 _id: "$status",
                 count: { $sum: 1 } // Count the number of submissions
               }
             }
           ]);
           console.log("hhhhhworkinghh", data);
           if(data.length > 0) {
             senddata.push({
               goaltype_name: ma.goaltype_name,
               duration:ma.matchedAssigned[0]?.duration,
               _id:ma._id,

               target:ma.matchedAssigned[0]?.target,

               count: ma.matchedAssigned[0]?.count
             })
           }
           else{
             senddata.push({
               goaltype_name: ma.goaltype_name,
               target:ma.matchedAssigned[0]?.target,
               duration:ma.matchedAssigned[0]?.duration,
               _id:ma._id,

               count: 200000
             })
           }
         } catch (error) {
           console.error(error);
           // Handle error
         }
       }
       else{
        try {

          let data = await totallogs.aggregate([
            {
              $match: {
                createdAt: {
                  $gte: startOfWeek,
                  $lte: endOfWeek
                },
                created_by:new mongoose.Types.ObjectId(req?.user?._id)// Match documents created by the specified user
              }
            },
            {
              $match: {
                status: "Offered" // Match documents with status "submission"
              }
            },
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 } // Count the number of submissions
              }
            }
          ]);
          console.log("hhhhhworkinghh", data);
          if(data.length > 0) {
            senddata.push({
              goaltype_name: ma.goaltype_name,
              duration:ma.matchedAssigned[0]?.duration,
              _id:ma._id,

              target:ma.matchedAssigned[0]?.target,

              count: ma.matchedAssigned[0]?.count
            })
          }
          else{
            senddata.push({
              goaltype_name: ma.goaltype_name,
              target:ma.matchedAssigned[0]?.target,
              duration:ma.matchedAssigned[0]?.duration,
              _id:ma._id,

              count: 200000
            })
          }
        } catch (error) {
          console.error(error);
          // Handle error
        }
      
        }
        }
        
      
        // let notmatch=await goaltypes.aggregate(aggregatenotmatch)
  
    success(res, 200, true, "Get Successfully",{senddata,match});
  } catch (err) {
    throw new Error(err);
  } 
  })
   router.get('/Dashboard',methods.authAdmin,methods.Dashboard );
   methods.goaltypes=asyncHandler(async (req, res) => {
    try {

        let now = new Date();
let startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
let endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (6 - now.getDay()));
let startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
let endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
let quarter = Math.floor((now.getMonth() + 3) / 3); // Calculate the current quarter
let startOfQuarter = new Date(now.getFullYear(), (quarter - 1) * 3, 1); // Start of the quarter
let endOfQuarter = new Date(now.getFullYear(), quarter * 3, 0); 
let startOfYear = new Date(now.getFullYear(), 0, 1); // Start of the year
let endOfYear = new Date(now.getFullYear(), 11, 31); // End of the year
        let {id}=req.params

        let aggregate= [
            {
              $match: {
                assigned: {
                  $elemMatch: {
                    parent:id
                  }
                }
              }
            },
            {
    $project: {
      goaltype_name:1,
      
      matchedAssigned: {
        $filter: {
          input: "$assigned",
          as: "item",
          cond: { $eq: ["$$item.parent", id] }
        }
      }
    }
  }

          ]

        
          let aggregatenotmatch= [
            {
              $match: {
                assigned: {
                    $not: {
                        $elemMatch: {
                            parent: id
                        }
                      }
                    
                }
              }
            },
            {
              $project: {
                goaltype_name:1,
                
                matchedAssigned: {
                  $filter: {
                    input: "$assigned",
                    as: "item",
                    cond: { $eq: ["$$item.parent", id] }
                  }
                }
              }
            }
            
          ]

          let match =await goaltypes.aggregate(aggregate)
         let senddata=[]
       
          for (const ma of match) {
            if (ma.goaltype_name === "Submissions") {
              console.log("llll")
               if(ma.matchedAssigned[0].target =="Weekly"){
                try {
                  let data = await totallogs.aggregate([
                    {
                      $match: {
                        createdAt: {
                          $gte: startOfWeek,
                          $lte: endOfWeek
                        },
                        created_by:new mongoose.Types.ObjectId(id)// Match documents created by the specified user
                      }
                    },
                    {
                      $match: {
                        status: "Client submission" // Match documents with status "submission"
                      }
                    },
                    {
                      $group: {
                        _id: "$status",
                        count: { $sum: 1 } // Count the number of submissions
                      }
                    }
                  ]);
                  console.log("hhhhhworkinghh", data);
                  if(data.length > 0) {
                    senddata.push({
                      goaltype_name: ma.goaltype_name,
                      target:2,
  
                      duration:ma.matchedAssigned[0]?.duration,
                      count: data[0].count
                    })
                  }
                  else{
                    senddata.push({
                      goaltype_name: ma.goaltype_name,
                      target:ma.matchedAssigned[0]?.target,
                      duration:ma.matchedAssigned[0]?.duration,
                      count: 0
                    })
                  }
                } catch (error) {
                  console.error(error);
                  // Handle error
                }
               }
               if(ma.matchedAssigned[0].target =="Monthly"){
                try {
                  let data = await totallogs.aggregate([
                    {
                      $match: {
                        createdAt: {
                          $gte: startOfMonth,
                          $lte: endOfMonth
                        },
                        created_by:new mongoose.Types.ObjectId(id)// Match documents created by the specified user
                      }
                    },
                    {
                      $match: {
                        status: "Client submission" // Match documents with status "submission"
                      }
                    },
                    {
                      $group: {
                        _id: "$status",
                        count: { $sum: 1 } // Count the number of submissions
                      }
                    }
                  ]);
                  console.log("hhhhhworkinghh", data);
                  if(data.length > 0) {
                    senddata.push({
                      goaltype_name: ma.goaltype_name,
                      target:2,
  
                      duration:ma.matchedAssigned[0]?.duration,
                      count: data[0].count
                    })
                  }
                  else{
                    senddata.push({
                      goaltype_name: ma.goaltype_name,
                      target:ma.matchedAssigned[0]?.target,
                      duration:ma.matchedAssigned[0]?.duration,
                      count: 0
                    })
                  }
                } catch (error) {
                  console.error(error);
                  // Handle error
                }
               }
               if(ma.matchedAssigned[0].target =="Quarterly"){
                try {
                  let data = await totallogs.aggregate([
                    {
                      $match: {
                        createdAt: {
                          $gte: startOfQuarter,
                          $lte: endOfQuarter
                        },
                        created_by:new mongoose.Types.ObjectId(id)// Match documents created by the specified user
                      }
                    },
                    {
                      $match: {
                        status: "Client submission" // Match documents with status "submission"
                      }
                    },
                    {
                      $group: {
                        _id: "$status",
                        count: { $sum: 1 } // Count the number of submissions
                      }
                    }
                  ]);
                  console.log("hhhhhworkinghh", data);
                  if(data.length > 0) {
                    senddata.push({
                      goaltype_name: ma.goaltype_name,
                      target:2,
  
                      duration:ma.matchedAssigned[0]?.duration,
                      count: data[0].count
                    })
                  }
                  else{
                    senddata.push({
                      goaltype_name: ma.goaltype_name,
                      target:ma.matchedAssigned[0]?.target,
                      duration:ma.matchedAssigned[0]?.duration,
                      count: 0
                    })
                  }
                } catch (error) {
                  console.error(error);
                  // Handle error
                }
               }
               if(ma.matchedAssigned[0].target =="Yearly"){
                try {
                  let data = await totallogs.aggregate([
                    {
                      $match: {
                        createdAt: {
                          $gte: startOfYear,
                          $lte: endOfYear
                        },
                        created_by:new mongoose.Types.ObjectId(id)// Match documents created by the specified user
                      }
                    },
                    {
                      $match: {
                        status: "Client submission" // Match documents with status "submission"
                      }
                    },
                    {
                      $group: {
                        _id: "$status",
                        count: { $sum: 1 } // Count the number of submissions
                      }
                    }
                  ]);
                  console.log("hhhhhworkinghh", data);
                  if(data.length > 0) {
                    senddata.push({
                      goaltype_name: ma.goaltype_name,
                      target:2,
  
                      duration:ma.matchedAssigned[0]?.duration,
                      count: data[0].count
                    })
                  }
                  else{
                    senddata.push({
                      goaltype_name: ma.goaltype_name,
                      target:ma.matchedAssigned[0]?.target,
                      duration:ma.matchedAssigned[0]?.duration,
                      count: 0
                    })
                  }
                } catch (error) {
                  console.error(error);
                  // Handle error
                }
               }
               
              try {
                let data = await totallogs.aggregate([
                  {
                    $match: {
                      createdAt: {
                        $gte: startOfWeek,
                        $lte: endOfWeek
                      },
                      created_by:new mongoose.Types.ObjectId(id)// Match documents created by the specified user
                    }
                  },
                  {
                    $match: {
                      status: "Client submission" // Match documents with status "submission"
                    }
                  },
                  {
                    $group: {
                      _id: "$status",
                      count: { $sum: 1 } // Count the number of submissions
                    }
                  }
                ]);
                console.log("hhhhhworkinghh", data);
                if(data.length > 0) {
                  senddata.push({
                    goaltype_name: ma.goaltype_name,
                    target:2,

                    duration:ma.matchedAssigned[0]?.duration,
                    count: data[0].count
                  })
                }
                else{
                  senddata.push({
                    goaltype_name: ma.goaltype_name,
                    target:ma.matchedAssigned[0]?.target,
                    duration:ma.matchedAssigned[0]?.duration,
                    count: 0
                  })
                }
              } catch (error) {
                console.error(error);
                // Handle error
              }
            }
            else if (ma.goaltype_name === "Onboard") {
              console.log("llll")
              try {

                let data = await totallogs.aggregate([
                  {
                    $match: {
                      createdAt: {
                        $gte: startOfWeek,
                        $lte: endOfWeek
                      },
                      created_by:new mongoose.Types.ObjectId(id)// Match documents created by the specified user
                    }
                  },
                  {
                    $match: {
                      status: "Offered" // Match documents with status "submission"
                    }
                  },
                  {
                    $group: {
                      _id: "$status",
                      count: { $sum: 1 } // Count the number of submissions
                    }
                  }
                ]);
                console.log("hhhhhworkinghh", data);
                if(data.length > 0) {
                  senddata.push({
                    goaltype_name: ma.goaltype_name,
                    duration:ma.matchedAssigned[0]?.duration,
                    target:ma.matchedAssigned[0]?.target,

                    count: data[0].count
                  })
                }
                else{
                  senddata.push({
                    goaltype_name: ma.goaltype_name,
                    target:ma.matchedAssigned[0]?.target,
                    duration:ma.matchedAssigned[0]?.duration,
                    count: 0
                  })
                }
              } catch (error) {
                console.error(error);
                // Handle error
              }
            }

            else if (ma.goaltype_name === "Revenue") {
              console.log("Revenuellllllllll")
             try {
 
               let data = await totallogs.aggregate([
                 {
                   $match: {
                     createdAt: {
                       $gte: startOfWeek,
                       $lte: endOfWeek
                     },
                     created_by:new mongoose.Types.ObjectId(req?.user?._id)// Match documents created by the specified user
                   }
                 },
                 {
                   $match: {
                     status: "Offered" // Match documents with status "submission"
                   }
                 },
                 {
                   $group: {
                     _id: "$status",
                     count: { $sum: 1 } // Count the number of submissions
                   }
                 }
               ]);
               console.log("hhhhhworkinghh", data);
               if(data.length > 0) {
                 senddata.push({
                   goaltype_name: ma.goaltype_name,
                   duration:ma.matchedAssigned[0]?.duration,
                   _id:ma._id,
 
                   target:500000,
 
                   count: 0
                 })
               }
               else{
                 senddata.push({
                   goaltype_name: ma.goaltype_name,
                   target:500000,
                   
                   duration:ma.matchedAssigned[0]?.duration,
                   _id:ma._id,
 
                   count:0
                 })
               }
             } catch (error) {
               console.error(error);
               // Handle error
             }
           }
            else if (ma.goaltype_name === "Profit") {
           
           try {

             let data = await totallogs.aggregate([
               {
                 $match: {
                   createdAt: {
                     $gte: startOfWeek,
                     $lte: endOfWeek
                   },
                   created_by:new mongoose.Types.ObjectId(req?.user?._id)// Match documents created by the specified user
                 }
               },
               {
                 $match: {
                   status: "Offered" // Match documents with status "submission"
                 }
               },
               {
                 $group: {
                   _id: "$status",
                   count: { $sum: 1 } // Count the number of submissions
                 }
               }
             ]);
             console.log("hhhhhworkinghh", data);
             if(data.length > 0) {
               senddata.push({
                 goaltype_name: ma.goaltype_name,
                 duration:ma.matchedAssigned[0]?.duration,
                 _id:ma._id,

                 target:ma.matchedAssigned[0]?.target,

                 count: ma.matchedAssigned[0]?.count
               })
             }
             else{
               senddata.push({
                 goaltype_name: ma.goaltype_name,
                 target:ma.matchedAssigned[0]?.target,
                 duration:ma.matchedAssigned[0]?.duration,
                 _id:ma._id,

                 count: ma.matchedAssigned[0]?.count
               })
             }
           } catch (error) {
             console.error(error);
             // Handle error
           }
         }
         else{
          try {

            let data = await totallogs.aggregate([
              {
                $match: {
                  createdAt: {
                    $gte: startOfWeek,
                    $lte: endOfWeek
                  },
                  created_by:new mongoose.Types.ObjectId(req?.user?._id)// Match documents created by the specified user
                }
              },
              {
                $match: {
                  status: "Offered" // Match documents with status "submission"
                }
              },
              {
                $group: {
                  _id: "$status",
                  count: { $sum: 1 } // Count the number of submissions
                }
              }
            ]);
            console.log("hhhhhworkinghh", data);
            if(data.length > 0) {
              senddata.push({
                goaltype_name: ma.goaltype_name,
                duration:ma.matchedAssigned[0]?.duration,
                _id:ma._id,

                target:ma.matchedAssigned[0]?.target,

                count: ma.matchedAssigned[0]?.count
              })
            }
            else{
              senddata.push({
                goaltype_name: ma.goaltype_name,
                target:ma.matchedAssigned[0]?.target,
                duration:ma.matchedAssigned[0]?.duration,
                _id:ma._id,

                count:0
              })
            }
          } catch (error) {
            console.error(error);
            // Handle error
          }
        
          }
         }
      
           
         
          
        
          let notmatch=await goaltypes.aggregate(aggregatenotmatch)
    
      success(res, 200, true, "Get Successfully",{senddata,match,notmatch});
    } catch (err) {
      throw new Error(err);
    } 
  })
   router.get('/goaltypes/:id',methods.goaltypes );
   methods.calculations=asyncHandler(async (req, res) => {
    try {
        // let {id}=req.params

        let aggregate= [
            {
                $unwind: "$assigned" // Unwind the assigned array to flatten it
              },
              {
                $lookup: {
                  from: "totallogs", // The collection to perform the lookup on
                  localField: "assigned.parent", // The field in the current collection to match
                  foreignField: "created_by", // The field in the parent collection to match
                  as: "parent" // The field to store the matched parent document
                }
              },
            
          ]
        

          let match =await goaltypes.aggregate(aggregate)
        //   let notmatch=await goaltypes.aggregate(aggregatenotmatch)
    
      success(res, 200, true, "Get Successfully",match);
    } catch (err) {
      throw new Error(err);
    } 
  })
   router.get('/calculations/',methods.calculations ); 
methods.goaltype=asyncHandler(async (req, res) => {
     const {id}=req.params
    try {
  
      success(res, 200, true, "Get Successfully", await crud.getOneDocumentById(admin, id,{
        name:1,goaltypes:1
    },{}));
    } catch (err) {
      throw new Error(err);
    } 
  })
   router.get('/goaltype/:id',methods.goaltype );
methods.getAll=asyncHandler(async (req, res) => {
  try {

    success(res, 200, true, "Get Successfully", await crud.getDocument(teams, {...req.query},{},{}));
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/',methods.getAll );


 //getone

methods.getOne=asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(teams, id, {}, {});
  if(!check) throw new Error('Data not Found!')
  try {
  success(res, 200, true, "Get Successfully", await crud.getOneDocumentById(teams, id,{},{}));
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/:id', methods.getOne)


 methods.adduser =asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);
    const check = await crud.getOneDocumentById(admin,id,{},{});
    if (!check) throw new Error('Data not Found!')
    try {
      success(res, 200, true, 'Update Successfully', await crud.updateById(admin, id, req.body, { new: true }));
    } catch (err) {
      throw new Error(err);
    } 
  })
 router.put('/add/:id',methods.adduser )
 methods.goalcondition =asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);
    const check = await crud.getOneDocumentById(goaltypes,id,{},{});
    if (!check) throw new Error('Data not Found!')
    try {
      req.body.assigned =[
         ...check?.assigned,
         ...req.body.assigned
      ]
      success(res, 200, true, 'Update Successfully', await crud.updateById(goaltypes, id, req.body, { new: true }));
    } catch (err) {
      throw new Error(err);
    } 
  })
 router.put('/goalcondition/:id',methods.goalcondition )


//Edit
methods.edit =asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(teams,id,{},{});
  if (!check) throw new Error('Data not Found!')
  try {
    success(res, 200, true, 'Update Successfully', await crud.updateById(teams, id, req.body, { new: true }));
  } catch (err) {
    throw new Error(err);
  } 
})

 router.put('/:id',methods.edit )


//delete
  .delete('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);
    const check = await crud.getOneDocumentById(teams, id, {}, {});
    if(!check) throw new Error('Data not Found!')
    try {
      success(res, 200, true, "Delete Successfully", await crud.deleteById(teams, id));
    } catch (err) {
      throw new Error(err);
    } 
}))











module.exports = router;