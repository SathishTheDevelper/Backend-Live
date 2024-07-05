const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const { expense } = require("../../utils/schemaMaster");
const { success } = require("../../utils/response");
const crud_service = require("../../utils/crud_service");
const validateId = require('../../utils/validateId');
const { authAdmin } = require('../../middlewares/authMiddlewares');
const upload = require("../../utils/upload");

const crud = new crud_service();

const methods ={authAdmin}

//Create Expense
methods.add =asyncHandler(async (req, res) => {
    console.log("is it:",req.body)
    console.log("files:",req.files)
    if(req?.user) {
        req.body.created_by=req?.user?._id
        req.body.company_id=req.user?.company_id
      }
 if(req?.file) req.body.expense_attachment=req?.file?.path   
    // const postData = req.body;
    // const filesData = req.files;

    // let createData = Object.assign({}, postData);

    // if(filesData){
    //     filesData.forEach(file => {
    //         createData[file.fieldname] = file
    //     });
    // }

    try {
        success(res, 201, true, "Create Successfully", await crud.insertOne(expense, req.body));
    } catch (err) {
        console.log("adding:",err)
        throw new Error(err);
    }
})
router.post('/',upload.single("attachment"),methods.add)

//Edit Expense
methods.edit =asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);
    const check = await crud.getOneDocumentById(expense,id,{},{});

    let dataBody = req.body
    let fileBody = req.files

    console.log("req:",req.body)

    if(dataBody?.expense_attachment && !fileBody?.length){
        let fileBodyObj = JSON.parse(dataBody?.expense_attachment)
        console.log("file type",typeof(fileBodyObj))
        dataBody["expense_attachment"] = fileBodyObj
    }else if(fileBody?.length){
        fileBody.forEach(file => {
            dataBody[file.fieldname] = file
        });
    }

    if(!dataBody?.expense_attachment && !fileBody?.length){
        dataBody["expense_attachment"] = null;
    }

    if (!check) throw new Error('Data not Found!')
    try {
        success(res, 200, true, 'Update Successfully', await crud.updateById(expense, id, dataBody, { new: true }));
    } catch (err) {
        throw new Error(err);
    } 
})  
router.put('/:id',upload.any(),methods.edit )
methods.getGraph = asyncHandler(async (req, res) => {
    const aggregationPipelineSalary = [
        {
            $match: {
                expense_type: "Salary",
                // Additional match criteria if needed
            },
        },
        {
            $group: {
                _id: {
                    month: { $month: '$expense_date' },
                },
                totalExpenseCost: { $sum: "$expense_cost" },
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
                monthName:1,
                expense: '$totalExpenseCost',
            },
        },
    ];
    const aggregationPipelineOthers = [
        {
            $match: {
                expense_type: "Others",
                // Additional match criteria if needed
            },
        },
        {
            $group: {
                _id: {
                    month: { $month: '$expense_date' },
                },
                totalExpenseCost: { $sum: "$expense_cost" },
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
                monthName:1,
                expense: '$totalExpenseCost',
            },
        },
    ];

    try {
        const expenseSalary = await expense.aggregate(aggregationPipelineSalary);
        const expenseOthers = await expense.aggregate(aggregationPipelineOthers);
        function getMonthName(month) {
            const monthNames = [
              'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
            ];
            return monthNames[month - 1];
          }
          let data1=[]
          let data2=[]
          if(expenseSalary?.length>0){

            for (let index = 1; index <= 12; index++) {
             const monthExists = expenseSalary.find(item => item.month === index);
             if(monthExists){
                data1.push(
                //  x:monthExists?.monthName,
                 monthExists.expense,
                //  toolTipMappingName: monthExists?.monthName,
               
             
                 // LoggedHours:monthExists.totalLoggedHours?.split(":")[0]
             )
             }
             else{
                data1.push(
         
                 0
                
               
               
              
             )
             }
              
            }
         
          
         }
         if(expenseOthers?.length>0){

            for (let index = 1; index <= 12; index++) {
             const monthExists = expenseOthers.find(item => item.month === index);
             if(monthExists){
               data2.push(
                
                 monthExists.expense,
                
               
             
                 // LoggedHours:monthExists.totalLoggedHours?.split(":")[0]
             )
             }
             else{
               data2.push(
         
                
                 0
                 
               
               
              
             )
             }
              
            }
         
          
         }
         let senddata={
            data1,
            data2
         }

        success(res, 200, true, "Get Successfully", senddata);
    } catch (err) {
        throw new Error(err);
    }
});

router.get('/graph', methods.getGraph);
methods.others = asyncHandler(async (req, res) => {
    const aggregationPipelineSalary = [
        {
            $match: {
                expense_type: "Others",
                // Additional match criteria if needed
            },
        },
        {
            $group: {
                _id: "$others_type",
                totalExpenseCost: { $sum: "$expense_cost" },
            },
        },
       
        {
            $project: {
                _id: 0,
                month: '$_id',
                
                expense: '$totalExpenseCost',
            },
        },
    ];
   

    try {
        const expenseSalary = await expense.aggregate(aggregationPipelineSalary);
         const data1=[]
         const data2=[]
       expenseSalary?.map((item)=>{
          data1.push(item.month)
          data2.push(item.expense)
       })
       

        success(res, 200, true, "Get Successfully", {data1,data2});
    } catch (err) {
        throw new Error(err);
    }
});

router.get('/others', methods.others);


methods.expensedata = asyncHandler(async (req, res) => {
    try {
        let filter = {};

       let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        let skip = (page - 1) * limit;  

        // Check for time intervals
        if (req.query.time_interval === "Year") {
            filter.createdAt = {
                $gte: new Date(new Date().getFullYear(), 0, 1),
                $lt: new Date(new Date().getFullYear() + 1, 0, 1)
            };
        } else if (req.query.time_interval === "Month") {
            filter.createdAt = {
                $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
            };
        } else if (req.query.time_interval === "Week") {
            // Assuming the week starts on Sunday
            let firstDayOfWeek = new Date();
            firstDayOfWeek.setDate(firstDayOfWeek.getDate() - firstDayOfWeek.getDay());
            let lastDayOfWeek = new Date(firstDayOfWeek);
            lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 7);
            filter.createdAt = {
                $gte: firstDayOfWeek,
                $lt: lastDayOfWeek
            };
        } else if (req.query.time_interval === "Today") {
            filter.createdAt = {
                $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                $lt: new Date(new Date().setHours(23, 59, 59, 999))
            };
        }
       const total  =await expense.countDocuments(filter)
        const data = await expense.find(filter).populate("employee_id").skip(skip)
        .limit(limit);
        success(res, 200, true, "Get Successfully", {total,data});
    } catch (err) {
        throw new Error(err);
    }
});




router.get('/expensedata', methods.expensedata);
methods.piechart = asyncHandler(async (req, res) => {
    const aggregationPipelineSalary = [
       
        {
            $group: {
                _id:"$expense_type",
                totalExpenseCost: { $sum: "$expense_cost" },
            },
          
        },
        {
            $project: {
                x: "$_id",
                y:"$totalExpenseCost",
                r: "60", 
                text:"$totalExpenseCost",
                _id:0


              
            },
        },
      
    ];
 

    try {
        const expenseSalary = await expense.aggregate(aggregationPipelineSalary);
        // const expenseOthers = await expense.aggregate(aggregationPipelineOthers);
        // function getMonthName(month) {
        //     const monthNames = [
        //       'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        //       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
        //     ];
        //     return monthNames[month - 1];
        //   }
      
         let total=0
          const sendedArray =[]
         expenseSalary?.map((currentValue) => {
            
            total += Number(currentValue.y || 0);
            
             sendedArray.push({
                ...currentValue,
                text:new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR'
                  }).format(currentValue.text)
             })
               
         
});
          let sendData=[
            {
                x:"Total",
                y:total,
                r:"80",
                text:`${new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR'
                  }).format(total)}`
            },
            ...sendedArray
            
          ]


        
        // let weekdata=[
        //     {
        //     x: 'Yours',
        //     y: Number(yoursWeekloggedHoures[0]?.totalLoggedHours?.split(":")[0]), 
        //      r: '60', text: `${yoursWeekloggedHoures[0]?.totalLoggedHours}`
          
        //   },
        //   {
        //     x: 'Total',
        //     y: 40, 
        //      r: '80',
        //    text: `40:00`
                                
        //   }, ]
        
       

        success(res, 200, true, "Get Successfully", sendData);
    } catch (err) {
        throw new Error(err);
    }
});

router.get('/piechart', methods.piechart);


//Get All - Expenses
methods.getAll=asyncHandler(async (req, res) => {

    // let aggregate =[
    //     {
    //         $lookup: {
    //         from: "employees",
    //         localField: "employee_id",
    //         foreignField: "_id",
    //         as: "expense_for"
    //         },
    //     },
    //     {
            
    //             $unwind: '$expense_for',
               
    //     },
        
    //     {
    //         $project: {
    //             expense_cost:1,
    //             expense_type:1,
    //             expense_date:1,
    //             expense_desc:1,
    //             expense_attachment:1,
    //             expense_for:"$expense_for.firstname"
    //         }
    //     }
    // ]

    let expense_rows = await expense.find().populate("employee_id")

    try {
        success(res, 200, true, "Get Successfully", expense_rows);
    } catch (err) {
        throw new Error(err);
    } 
})
router.get('/',methods.getAll );
  
//Get By ID - Expense
methods.getOne=asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);
    const check = await crud.getOneDocumentById(expense, id, {}, {});
    if(!check) throw new Error('Data not Found!')
    try {
        success(res, 200, true, "Get Successfully", await crud.getOneDocumentById(expense, id,{},{}));
    } catch (err) {
        throw new Error(err);
    }
})
router.get('/:id', methods.getOne)

//Delete Expense
.delete('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);
    const check = await crud.getOneDocumentById(expense, id, {}, {});
    if(!check) throw new Error('Data not Found!')
    try {
      success(res, 200, true, "Delete Successfully", await crud.deleteById(expense, id));
    } catch (err) {
      throw new Error(err);
    } 
}))

module.exports = router;