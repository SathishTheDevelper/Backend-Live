const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const { accounts, contacts, lists } = require("../../utils/schemaMaster");
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
    success(res, 201, true, "Create Successfully", await crud.insertOne(accounts, req.body));
  } catch (err) {
    throw new Error(err);
  }
})




router.post('/', methods.add )


methods.listadd =asyncHandler(async (req, res) => {

    req.body.created_by =req.user._id
  try {
    success(res, 201, true, "Create Successfully", await crud.insertOne(lists, req.body));
  } catch (err) {
    throw new Error(err);
  }
})




router.post('/listadd',methods.authAdmin, methods.listadd )

methods.accountadd =asyncHandler(async (req, res) => {
   req.body.created_by =req?.user._id
   const check = await crud.getOneDocument(accounts, {name:req.body.name}, {}, {});
   if(check)  throw new Error('Already Exist!')

  try {
  
 
    success(res, 201, true, "Create Successfully", await crud.insertOne(accounts,{
         ...req.body,
         _id:req.body.id
    } ));

  
     
    

     
  } catch (err) {
    throw new Error(err);
  }
})


router.post('/accountadd',methods.authAdmin, methods.accountadd )

methods.contactadd =asyncHandler(async (req, res) => {
  req.body.created_by =req?.user._id

 try {
   let creadetddata =req.body.people?.map(async(item)=>{
     let data ={
       ...item,
       contact_owner:req.user._id,
       account_id:req.body.account_id
      
     }
   const check = await crud.getOneDocument(contacts, {name:data.name}, {}, {});

   if(check)
   { 
    throw new Error('Already Exist!')
}
else{
   await crud.insertOne(contacts, data)

}

   })
  
   success(res, 201, true, "Create Successfully",creadetddata) ;
   
     
   

    
 } catch (err) {
   throw new Error(err);
 }
})
router.post('/contactadd',methods.authAdmin, methods.contactadd )


methods.contactListAdd = asyncHandler(async (req, res) => {
  req.body.created_by = req?.user._id;

  try {
    const contactPromises = req.body.contacts.map(async (item) => {
      const data = {
        ...item,
        contact_owner: req.user._id,
        account_id: item?.account?.id,
      };

      // Check if account exists
      let account;
      if (item.account?.id) {
        account = await crud.getOneDocumentById(accounts, item.account.id, {}, {});
      } else if (item.organization_name) {
        account = await crud.getOneDocument(accounts, {name:item.organization_name }, {}, {});
      }

      if (!account) {
         console.log("---------------lihugygv",item)
        // Create account if it doesn't exist
        const newAccount = {
          ...(item.account || {}),
          ...(item.organization_name && { name: item.organization_name }),
          ...(item.account?.id && { _id: item.account.id }),
        };
        account = await crud.insertOne(accounts, newAccount);
      }

      // Check if contact with the same name exists
      const existingContact = await crud.getOneDocument(contacts, { name: data.name }, {}, {});
      if (existingContact) {
        console.log("Contact already exists:", data.name);
        return null; // Skip inserting duplicate contact
      }

      // Insert the contact
      await crud.insertOne(contacts, { ...data, account_id: account._id });
      console.log("Contact inserted:", data.name);
      return data;
    });

    // Execute all promises concurrently
    const createdContacts = await Promise.all(contactPromises);

    // Filter out null values (skipped duplicates)
    const filteredContacts = createdContacts.filter((contact) => contact !== null);

    success(res, 201, true, "Contacts created successfully", filteredContacts);
  } catch (err) {
    // Handle errors gracefully
    console.error("Error creating contacts:", err);
    // Handle or rethrow the error
    throw new Error(err);
  }
});



router.post('/contactListAdd',methods.authAdmin, methods.contactListAdd )




methods.getselect=asyncHandler(async (req, res) => {


  let  data=await accounts.aggregate([
   {
     $project:{
       label:"$account_name",
       value:"$_id"
     }
   }
  ])
 try {
   success(res, 200, true, "Get Successfully",data);
 } catch (err) {
   throw new Error(err);
 } 
})
router.get('/getselect',methods.getselect );


methods.getlistSelect=asyncHandler(async (req, res) => {


  let  data=await lists.aggregate([
   {
     $project:{
       label:"$name",
       value:"$_id"
     }
   }
  ])
 try {
   success(res, 200, true, "Get Successfully",data);
 } catch (err) {
   throw new Error(err);
 } 
})
router.get('/getlistSelect',methods.getlistSelect );

methods.getlist=asyncHandler(async (req, res) => {


 try {
  let  data=await lists.find()

   success(res, 200, true, "Get Successfully",data);
 } catch (err) {
   throw new Error(err);
 } 
})
router.get('/getlist',methods.getlist );



methods.getCompany=asyncHandler(async (req, res) => {
  try {
      const today =new Date()
      const startOfWeek = new Date(today);
startOfWeek.setDate(today.getDate() - today.getDay()); // Set to Sunday of the current week
startOfWeek.setHours(0, 0, 0, 0); // Set to the beginning of the day (midnight)

// Calculate the end of the week (Saturday)
const endOfWeek = new Date(today);
endOfWeek.setDate(today.getDate() + (6 - today.getDay())); // Set to Saturday of the current week
endOfWeek.setHours(23, 59, 59, 999); // Set to the end of the day (just before midnight)

console.log("Start of the week:", startOfWeek);
console.log("End of the week:", endOfWeek);
const startOfToday = new Date(today);
startOfToday.setHours(0, 0, 0, 0); // Set to the beginning of the day (midnight)

// Set the end of today
const endOfToday = new Date(today);
endOfToday.setHours(23, 59, 59, 999)

let aggregateMonthQuery;
if(req.query.filter == "Year"){
  aggregateMonthQuery = [
    {
      $match: {
        createdAt: { 
          $gte: new Date(today.getFullYear(), today.getMonth(), 1), // Start of the current month
          $lte: new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999), // End of the current month
        },
        created_by: mongoose.Schema.Types.ObjectId(req.user?._id)
        
      }
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        clientSubmissionCount: { $sum: 1 }
      }
    },
   
    {
      $group: {
        _id: null,
        data: {
          $push: {
            month: {
              $switch: {
                branches: [
                  { case: { $eq: ["$_id", 1] }, then: "Jan" },
                  { case: { $eq: ["$_id", 2] }, then: "Feb" },
                  { case: { $eq: ["$_id", 3] }, then: "Mar" },
                  { case: { $eq: ["$_id", 4] }, then: "Apr" },
                  { case: { $eq: ["$_id", 5] }, then: "May" },
                  { case: { $eq: ["$_id", 6] }, then: "Jun" },
                  { case: { $eq: ["$_id", 7] }, then: "Jul" },
                  { case: { $eq: ["$_id", 8] }, then: "Aug" },
                  { case: { $eq: ["$_id", 9] }, then: "Sep" },
                  { case: { $eq: ["$_id", 10] }, then: "Oct" },
                  { case: { $eq: ["$_id", 11] }, then: "Nov" },
                  { case: { $eq: ["$_id", 12] }, then: "Dec" }
                ],
                default: "Unknown"
              }
            },
            clientSubmissionCount: "$clientSubmissionCount"
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        data: {
          $map: {
            input: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            as: "monthdata",
            in: {
              $cond: [
                { $in: ["$$monthdata", "$data.month"] },
                { $arrayElemAt: ["$data.clientSubmissionCount", { $indexOfArray: ["$data.month", "$$monthdata"] }] },
                0
              ]
            }
          }
        }
      }
    }
  ];
}
  else if(req.query.filter == "Week"){
    aggregateMonthQuery = [
      {
        $match: {
          createdAt: { $gte: startOfWeek, $lte: endOfWeek },
          created_by: new mongoose.Types.ObjectId(req.user?._id)

          // status: "Client submission"
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" },
          clientSubmissionCount: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          data: {
            $push: {
              dayOfWeek: {
                $switch: {
                  branches: [
                    { case: { $eq: ["$_id", 1] }, then: "Sun" },
                    { case: { $eq: ["$_id", 2] }, then: "Mon" },
                    { case: { $eq: ["$_id", 3] }, then: "Tue" },
                    { case: { $eq: ["$_id", 4] }, then: "Wed" },
                    { case: { $eq: ["$_id", 5] }, then: "Thu" },
                    { case: { $eq: ["$_id", 6] }, then: "Fri" },
                    { case: { $eq: ["$_id", 7] }, then: "Sat" }
                  ],
                  default: ""
                }
              },
              clientSubmissionCount: "$clientSubmissionCount"
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          data: {
            $map: {
              input: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
              as: "day",
              in: {
                $cond: [
                  { $in: ["$$day", "$data.dayOfWeek"] },
                  { $arrayElemAt: ["$data.clientSubmissionCount", { $indexOfArray: ["$data.dayOfWeek", "$$day"] }] },
                  0
                ]
              }
            }
          }
        }
      }
    ];
  }
  else{
    aggregateMonthQuery = [
      {
        $match: {
          createdAt: { $gte: startOfWeek, $lte: endOfWeek },
          created_by: mongoose.Schema.Types.ObjectId(req.user?._id)

          // status: "Client submission"
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" },
          clientSubmissionCount: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          data: {
            $push: {
              dayOfWeek: {
                $switch: {
                  branches: [
                    { case: { $eq: ["$_id", 1] }, then: "Sun" },
                    { case: { $eq: ["$_id", 2] }, then: "Mon" },
                    { case: { $eq: ["$_id", 3] }, then: "Tue" },
                    { case: { $eq: ["$_id", 4] }, then: "Wed" },
                    { case: { $eq: ["$_id", 5] }, then: "Thu" },
                    { case: { $eq: ["$_id", 6] }, then: "Fri" },
                    { case: { $eq: ["$_id", 7] }, then: "Sat" }
                  ],
                  default: ""
                }
              },
              clientSubmissionCount: "$clientSubmissionCount"
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          data: {
            $map: {
              input: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
              as: "day",
              in: {
                $cond: [
                  { $in: ["$$day", "$data.dayOfWeek"] },
                  { $arrayElemAt: ["$data.clientSubmissionCount", { $indexOfArray: ["$data.dayOfWeek", "$$day"] }] },
                  0
                ]
              }
            }
          }
        }
      }
    ];
  }

    
    

     let senddata =await accounts.aggregate(aggregateMonthQuery)
    


   
    
    success(res, 200, true, "Get Successfully", senddata);
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/getcompanys',methods.authAdmin,methods.getCompany );

 methods.getContacts=asyncHandler(async (req, res) => {
  try {
      const today =new Date()
      const startOfWeek = new Date(today);
startOfWeek.setDate(today.getDate() - today.getDay()); // Set to Sunday of the current week
startOfWeek.setHours(0, 0, 0, 0); // Set to the beginning of the day (midnight)

// Calculate the end of the week (Saturday)
const endOfWeek = new Date(today);
endOfWeek.setDate(today.getDate() + (6 - today.getDay())); // Set to Saturday of the current week
endOfWeek.setHours(23, 59, 59, 999); // Set to the end of the day (just before midnight)

console.log("Start of the week:", startOfWeek);
console.log("End of the week:", endOfWeek);
const startOfToday = new Date(today);
startOfToday.setHours(0, 0, 0, 0); // Set to the beginning of the day (midnight)

// Set the end of today
const endOfToday = new Date(today);
endOfToday.setHours(23, 59, 59, 999)

let aggregateMonthQuery;
  if(req.query.filter == "Year"){
    aggregateMonthQuery = [
      {
        $match: {
          createdAt: { 
            $gte: new Date(today.getFullYear(), today.getMonth(), 1), // Start of the current month
            $lte: new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999), // End of the current month
          },
          
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          clientSubmissionCount: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      },
      {
        $group: {
          _id: null,
          data: {
            $push: {
              month: {
                $switch: {
                  branches: [
                    { case: { $eq: ["$_id", 1] }, then: "Jan" },
                    { case: { $eq: ["$_id", 2] }, then: "Feb" },
                    { case: { $eq: ["$_id", 3] }, then: "Mar" },
                    { case: { $eq: ["$_id", 4] }, then: "Apr" },
                    { case: { $eq: ["$_id", 5] }, then: "May" },
                    { case: { $eq: ["$_id", 6] }, then: "Jun" },
                    { case: { $eq: ["$_id", 7] }, then: "Jul" },
                    { case: { $eq: ["$_id", 8] }, then: "Aug" },
                    { case: { $eq: ["$_id", 9] }, then: "Sep" },
                    { case: { $eq: ["$_id", 10] }, then: "Oct" },
                    { case: { $eq: ["$_id", 11] }, then: "Nov" },
                    { case: { $eq: ["$_id", 12] }, then: "Dec" }
                  ],
                  default: "Unknown"
                }
              },
              clientSubmissionCount: "$clientSubmissionCount"
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          data: {
            $map: {
              input: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
              as: "month",
              in: {
                $cond: [
                  { $in: ["$$month", "$data.month"] },
                  { $arrayElemAt: ["$data.clientSubmissionCount", { $indexOfArray: ["$data.month", "$$month"] }] },
                  0
                ]
              }
            }
          }
        }
      }
    ];
  }
  else if(req.query.filter == "Week"){
    aggregateMonthQuery = [
      {
        $match: {
          createdAt: { $gte: startOfWeek, $lte: endOfWeek },
          // status: "Client submission"
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" },
          clientSubmissionCount: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          data: {
            $push: {
              dayOfWeek: {
                $switch: {
                  branches: [
                    { case: { $eq: ["$_id", 1] }, then: "Sun" },
                    { case: { $eq: ["$_id", 2] }, then: "Mon" },
                    { case: { $eq: ["$_id", 3] }, then: "Tue" },
                    { case: { $eq: ["$_id", 4] }, then: "Wed" },
                    { case: { $eq: ["$_id", 5] }, then: "Thu" },
                    { case: { $eq: ["$_id", 6] }, then: "Fri" },
                    { case: { $eq: ["$_id", 7] }, then: "Sat" }
                  ],
                  default: ""
                }
              },
              clientSubmissionCount: "$clientSubmissionCount"
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          data: {
            $map: {
              input: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
              as: "day",
              in: {
                $cond: [
                  { $in: ["$$day", "$data.dayOfWeek"] },
                  { $arrayElemAt: ["$data.clientSubmissionCount", { $indexOfArray: ["$data.dayOfWeek", "$$day"] }] },
                  0
                ]
              }
            }
          }
        }
      }
    ];
  }
  else{
    aggregateMonthQuery = [
      {
        $match: {
          createdAt: { $gte: startOfWeek, $lte: endOfWeek },
          // status: "Client submission"
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" },
          clientSubmissionCount: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          data: {
            $push: {
              dayOfWeek: {
                $switch: {
                  branches: [
                    { case: { $eq: ["$_id", 1] }, then: "Sun" },
                    { case: { $eq: ["$_id", 2] }, then: "Mon" },
                    { case: { $eq: ["$_id", 3] }, then: "Tue" },
                    { case: { $eq: ["$_id", 4] }, then: "Wed" },
                    { case: { $eq: ["$_id", 5] }, then: "Thu" },
                    { case: { $eq: ["$_id", 6] }, then: "Fri" },
                    { case: { $eq: ["$_id", 7] }, then: "Sat" }
                  ],
                  default: ""
                }
              },
              clientSubmissionCount: "$clientSubmissionCount"
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          data: {
            $map: {
              input: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
              as: "day",
              in: {
                $cond: [
                  { $in: ["$$day", "$data.dayOfWeek"] },
                  { $arrayElemAt: ["$data.clientSubmissionCount", { $indexOfArray: ["$data.dayOfWeek", "$$day"] }] },
                  0
                ]
              }
            }
          }
        }
      }
    ];
  }

    
    

     let senddata =await contacts.aggregate(aggregateMonthQuery)
    


   
    
    success(res, 200, true, "Get Successfully", senddata);
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/getcontacts',methods.authAdmin,methods.getContacts );


//getall
methods.getAll=asyncHandler(async (req, res) => {

  const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    
   let data = await accounts
    .find()
    .sort({ createdAt: -1 })
    .skip((page-1) * limit )
    .limit(limit)
    

  // Count total number of documents
  const total = await accounts.countDocuments();

  // Calculate total pages
 
// default limit to 10 if not provided

    // Calculate the skip value based on the current page and limit
    
  try {
    success(res, 200, true, "Get Successfully", {
       data,total
    });
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/',methods.getAll );









 //getone

methods.getOne=asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(accounts, id, {}, {});
  if(!check) throw new Error('Data not Found!')
  try {
  success(res, 200, true, "Get Successfully", await crud.getOneDocumentById(accounts, id,{},{}));
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/:id', methods.getOne)


 methods.statusChange =asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(accounts,id,{},{});
  if (!check) throw new Error('Data not Found!')
  try {
    success(res, 200, true, 'Update Successfully', await crud.updateById(accounts, id, req.body, { new: true }));
  } catch (err) {
    throw new Error(err);
  } 
})

 router.put('/status/:id',methods.statusChange )


 methods.listsave =asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(contacts,id,{},{});
  if (!check) throw new Error('Data not Found!')
  try {
    success(res, 200, true, 'Saved  Successfully', await crud.updateById(contacts, id, req.body, { new: true }));
  } catch (err) {
    throw new Error(err);
  } 
})

 router.put('/listsave/:id',methods.listsave )


//Edit
methods.edit =asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(accounts,id,{},{});
  if (!check) throw new Error('Data not Found!')
  try {
    success(res, 200, true, 'Update Successfully', await crud.updateById(accounts, id, req.body, { new: true }));
  } catch (err) {
    throw new Error(err);
  } 
})

 router.put('/:id',methods.edit )


//delete
  .delete('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);
    const check = await crud.getOneDocumentById(accounts, id, {}, {});
    if(!check) throw new Error('Data not Found!')
    try {
      success(res, 200, true, "Delete Successfully", await crud.deleteById(accounts, id));
    } catch (err) {
      throw new Error(err);
    } 
}))











module.exports = router;