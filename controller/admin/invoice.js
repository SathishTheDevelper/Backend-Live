const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const { invoice, clients, record_payment, expense } = require("../../utils/schemaMaster");
const { success } = require("../../utils/response");
const crud_service = require("../../utils/crud_service");
const validateId = require('../../utils/validateId');
const { authAdmin } = require('../../middlewares/authMiddlewares');
const multer = require('multer')
const upload = multer({limits:{fieldSize:25*1024*1024}})
const crud = new crud_service();

const methods ={authAdmin}

//Create Invoice
methods.add =asyncHandler(async (req, res) => {

    const postData = req.body;
    const filesData = req.files;

    let createData = Object.assign({}, postData);
    let invoiceCount = await crud.getCount(invoice,{}) + 1
    createData["invoice_number"] = "INV-" + invoiceCount.toString().padStart(4, '0')

    if(filesData){
        filesData.forEach(file => {
            createData[file.fieldname] = file
        });
    }

    try {
        success(res, 201, true, "Create Successfully", await crud.insertOne(invoice, createData));
    } catch (err) {
        throw new Error(err);
    }
})
router.post('/',upload.any(),methods.add)


methods.invoicecard = asyncHandler(async (req, res) => {
    try {
        let matchCriteria = {};

        // Check for time intervals
        if (req.query.time_interval === "Year") {
            matchCriteria.invoice_date = {
                $gte: new Date(new Date().getFullYear(), 0, 1),
                $lt: new Date(new Date().getFullYear() + 1, 0, 1)
            };
        } else if (req.query.time_interval === "Month") {
            matchCriteria.invoice_date = {
                $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
            };
        } else if (req.query.time_interval === "Week") {
            // Assuming the week starts on Sunday
            let firstDayOfWeek = new Date();
            firstDayOfWeek.setDate(firstDayOfWeek.getDate() - firstDayOfWeek.getDay());
            let lastDayOfWeek = new Date(firstDayOfWeek);
            lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 7);
            matchCriteria.invoice_date = {
                $gte: firstDayOfWeek,
                $lt: lastDayOfWeek
            };
        } else if (req.query.time_interval === "Today") {
            matchCriteria.invoice_date = {
                $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                $lt: new Date(new Date().setHours(23, 59, 59, 999))
            };
        }
        else if (req.query.time_interval === "Custom") {
             if(req.query.range == "Monthly Wise"){
                const [year, month] = req.query.date.split('-');
                const startDate = new Date(year, month - 1, 1); // month is 0-indexed in Date constructor
                const endDate = new Date(year, month, 0);
                matchCriteria.invoice_date = {
                    $gte:startDate,
                    $lt: endDate
                };
             }
             if (req.query.range === "WeeklyWise") {
                const [yearStr, weekStr] = req.query.date.split('-'); // Split the string into year and week number
                const year = parseInt(yearStr); // Convert year string to integer
                const week = parseInt(weekStr.replace('th', '')); // Extract week number and remove 'th'
            
                // Calculate the start and end dates of the specified week
                const startDate = new Date(year, 0, 1 + (week - 1) * 7); // Assuming weeks start from the beginning of the year
                const endDate = new Date(year, 0, 1 + week * 7 - 1); // Assuming weeks end at the end of the week
            
                // Adjust endDate to avoid crossing into the next month or year
                if (endDate.getMonth() !== startDate.getMonth()) {
                    endDate.setMonth(startDate.getMonth());
                    endDate.setDate(startDate.getDate() + 6); // Set endDate to the end of the week
                }
            
                // MongoDB query for invoice_date field
                matchCriteria.invoice_date = {
                    $gte: startDate,
                    $lt: endDate
                };
            }
           

        }

        const aggregationAll = [
            { $match: matchCriteria },
            {
                $group: {
                    _id: null,
                    totalInvoices: { $sum: 1 },
                    totalAmount: { $sum: { $toDouble: "$total_amount" } }
                }
            }
        ];

        const aggregationPaid = [
            { $match: { ...matchCriteria, status: "Paid" } },
            {
                $group: {
                    _id: null,
                    totalInvoices: { $sum: 1 },
                    totalAmount: { $sum: { $toDouble: "$total_amount" } }
                }
            }
        ];

        const aggregationOverdue = [
            { $match: { ...matchCriteria, due_date: { $lt: new Date() } } },
            {
                $group: {
                    _id: null,
                    totalInvoices: { $sum: 1 },
                    totalAmount: { $sum: { $toDouble: "$total_amount" } }
                }
            }
        ];

        const aggregationdraft = [
            { $match: { ...matchCriteria, status: "Draft" } },
            {
                $group: {
                    _id: null,
                    totalInvoices: { $sum: 1 },
                    totalAmount: { $sum: { $toDouble: "$total_amount" } }
                }
            }
        ];

        const all = await invoice.aggregate(aggregationAll);
        const Paid = await invoice.aggregate(aggregationPaid);
        const Overdue = await invoice.aggregate(aggregationOverdue);
        const Draft = await invoice.aggregate(aggregationdraft);

        let senddata = {
            all,
            Paid,
            Overdue,
            Draft
        };

        success(res, 200, true, "Get Successfully", senddata);
    } catch (err) {
        throw new Error(err);
    }
});

router.get('/invoicecard', methods.invoicecard);

methods.getGraph = asyncHandler(async (req, res) => {
    const aggregationPipelineSalary = [
        {
            $addFields: {
                total_amount_numeric: { $toDouble: "$total_amount" } // Convert total_amount to a double
            }
        },
        {
            $group: {
                _id: {
                    month: { $month: '$invoice_date' },
                },
                totalExpenseCost: { $sum: "$total_amount_numeric" }, // Sum the numeric values
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
                monthName: 1,
                expense: '$totalExpenseCost',
            },
        },
    ];
    
    const aggregationPipelineOthers = [
        {
            $match: {
                 due_date: { $lt: new Date() } 
                // Additional match criteria if needed
            },
        },
        {
            $addFields: {
                total_amount_numeric: { $toDouble: "$total_amount" } // Convert total_amount to a double
            }
        },
        {
            $group: {
                _id: {
                    month: { $month: '$invoice_date' },
                },
                totalExpenseCost: { $sum: "$total_amount_numeric" }, // Sum the numeric values
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
                monthName: 1,
                expense: '$totalExpenseCost',
            },
        },
    ];

    const aggregationPipelinePaid = [
        {
            $addFields: {
                total_amount_numeric: { $toDouble: "$paid_amount" } // Convert total_amount to a double
            }
        },
        {
            $group: {
                _id: {
                    month: { $month: '$invoice_date' },
                },
                totalExpenseCost: { $sum: "$total_amount_numeric" }, // Sum the numeric values
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
                monthName: 1,
                expense: '$totalExpenseCost',
            },
        },
    ];
      const aggregationDueamount = [
        {
            $addFields: {
                total_amount_numeric: { $toDouble: "$total_amount" } // Convert total_amount to a double
            }
        },
        {
            $group: {
                _id: {
                    month: { $month: '$due_date' },
                },
                totalExpenseCost: { $sum: "$total_amount_numeric" }, // Sum the numeric values
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
                monthName: 1,
                expense: '$totalExpenseCost',
            },
        },
    ];

 

    try {
        const expenseSalary = await invoice.aggregate(aggregationPipelineSalary);
        const expenseOthers = await invoice.aggregate(aggregationPipelineOthers);
        const expensePaid = await invoice.aggregate(aggregationPipelinePaid);
        const invoicedueamount = await invoice.aggregate(aggregationDueamount);
        function getMonthName(month) {
            const monthNames = [
              'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
            ];
            return monthNames[month - 1];
          }
          let data1=[]
          let data2=[]
          let data3=[]
          let data4=[]
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
         if(expensePaid?.length>0){

            for (let index = 1; index <= 12; index++) {
             const monthExists = expensePaid.find(item => item.month === index);
             if(monthExists){
               data3.push(
                
                 monthExists.expense,
                
               
             
                 // LoggedHours:monthExists.totalLoggedHours?.split(":")[0]
             )
             }
             else{
               data3.push(
         
                
                 0
                 
               
               
              
             )
             }
              
            }
         
          
         }
         if(invoicedueamount?.length>0){

            for (let index = 1; index <= 12; index++) {
             const monthExists = invoicedueamount.find(item => item.month === index);
             if(monthExists){
               data4.push(
                
                 monthExists.expense,
                
               
             
                 // LoggedHours:monthExists.totalLoggedHours?.split(":")[0]
             )
             }
             else{
               data4.push(
         
                
                 0
                 
               
               
              
             )
             }
              
            }
         
          
         }
         let senddata={
            data1,
            data3,
            data2,
            data4
         }

        success(res, 200, true, "Get Successfully", senddata);
    } catch (err) {
        throw new Error(err);
    }
});

router.get('/graph', methods.getGraph);


methods.invoiceData = asyncHandler(async (req, res) => {
    try {
        let filter = {};
        if (req.query.status == "All") {
            filter = {};
        } 
        else if (req.query.status == "Sent") {
            filter = { status: "Sent",
            due_date: { $gte: new Date() } };
        }
        else if (req.query.status == "Paid") {
            filter = { status: "Paid" };
        } else if (req.query.status == "Overdue") {
            filter = { due_date: { $lt: new Date() } };
        } else if (req.query.status == "Draft") {
            filter = { status: "Draft" };
        }

        // Check for time intervals
        if (req.query.time_interval === "Year") {
            filter.invoice_date = {
                $gte: new Date(new Date().getFullYear(), 0, 1),
                $lt: new Date(new Date().getFullYear() + 1, 0, 1)
            };
        } else if (req.query.time_interval === "Month") {
            filter.invoice_date = {
                $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
            };
        } else if (req.query.time_interval === "Week") {
            // Assuming the week starts on Sunday
            let firstDayOfWeek = new Date();
            firstDayOfWeek.setDate(firstDayOfWeek.getDate() - firstDayOfWeek.getDay());
            let lastDayOfWeek = new Date(firstDayOfWeek);
            lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 7);
            filter.invoice_date = {
                $gte: firstDayOfWeek,
                $lt: lastDayOfWeek
            };
        } else if (req.query.time_interval === "Today") {
            filter.invoice_date = {
                $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                $lt: new Date(new Date().setHours(23, 59, 59, 999))
            };
        }
        else if (req.query.time_interval === "Custom") {
            if(req.query.range == "Monthly Wise"){
               const [year, month] = req.query.date.split('-');
               const startDate = new Date(year, month - 1, 1); // month is 0-indexed in Date constructor
               const endDate = new Date(year, month, 0);
               filter.invoice_date = {
                   $gte:startDate,
                   $lt: endDate
               };
            }
            if (req.query.range === "WeeklyWise") {
                const [yearStr, weekStr] = req.query.date.split('-'); // Split the string into year and week number
                const year = parseInt(yearStr); // Convert year string to integer
                const week = parseInt(weekStr.replace('th', '')); // Extract week number and remove 'th'
            
                // Calculate the start and end dates of the specified week
                const startDate = new Date(year, 0, 1 + (week - 1) * 7); // Assuming weeks start from the beginning of the year
                const endDate = new Date(year, 0, 1 + week * 7 - 1); // Assuming weeks end at the end of the week
            
                // Adjust endDate to avoid crossing into the next month or year
                if (endDate.getMonth() !== startDate.getMonth()) {
                    endDate.setMonth(startDate.getMonth());
                    endDate.setDate(startDate.getDate() + 6); // Set endDate to the end of the week
                }
            
                // MongoDB query for invoice_date field
                filter.invoice_date = {
                    $gte: startDate,
                    $lte: endDate
                };
            }
            
          

       }

        const result = await invoice.find(filter).populate("client_id");
        success(res, 200, true, "Get Successfully", result);
    } catch (err) {
        throw new Error(err);
    }
});

router.get('/invoicedata', methods.invoiceData);



//Edit Invoice
methods.edit =asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);
    const check = await crud.getOneDocumentById(invoice,id,{},{});

    let dataBody = req.body
    let fileBody = req.files

    console.log("req:",req.body)

    if(dataBody?.invoice_attachment && !fileBody?.length){
        let fileBodyObj = JSON.parse(dataBody?.invoice_attachment)
        dataBody["invoice_attachment"] = fileBodyObj
    }else if(fileBody?.length){
        fileBody.forEach(file => {
            dataBody[file.fieldname] = file
        });
    }

    if(!dataBody?.invoice_attachment && !fileBody?.length){
        dataBody["invoice_attachment"] = null;
    }

    if (!check) throw new Error('Data not Found!')
    try {
        success(res, 200, true, 'Update Successfully', await crud.updateById(invoice, id, dataBody, { new: true }));
    } catch (err) {
        throw new Error(err);
    } 
})  
router.put('/:id',upload.any(),methods.edit )




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

//Get All - Invoices
methods.getAll=asyncHandler(async (req, res) => {

    let aggregate =[
        {
            $lookup: {
                from: "clients",
                localField: "client_id",
                foreignField: "_id",
                as: "client_name"
            },
        },
        {
            $project: {
                invoice_date: 1,
                invoice_number: 1,
                order_number: 1,
                invoice_date: 1,
                invoice_terms: 1,
                due_date: 1,
                subject: 1,
                tableData: 1,
                total_amount:1,

                customer_notes: 1,
                adjustments: 1,
                terms: 1,
                invoice_attachment: 1,
                invoice_status:1,
                invoice_tds: 1,
                total_bill: 1,
               client_id: { $arrayElemAt: ['$client_name.name', 0] },
            }
        }
    ]

    //let old_data = await crud.getDocument(invoice, {...req.query},{},{})
    let invoice_rows = await invoice.aggregate(aggregate)

    try {
        success(res, 200, true, "Get Successfully", invoice_rows);
    } catch (err) {
        throw new Error(err);
    }
})
router.get('/',methods.getAll );

methods.formDetails=asyncHandler(async (req, res) => {

    let required_projection = {
        "name":1
    }

    let invoiceCount = await crud.getCount(invoice,{}) + 1
    let new_invoice_num = "INV-" + invoiceCount.toString().padStart(4, '0')

    //tds and tax details should also be sent from here

    const clientsData = await crud.getDocument(clients, { ...req.query }, {...required_projection}, {});
    let responseObj = {
        "clientsList":clientsData,
        "invoice_num":new_invoice_num
    }
    try {
        success(res, 201, true, "data Successfully", responseObj);
    } catch (err) {
        throw new Error(err);
    }

})
router.get('/form-details',methods.formDetails );

//Get By ID - Invoice
methods.getOne=asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);
  
    try {
      
        success(res, 200, true, "Get Successfully", await crud.getOneDocumentById(invoice, id, {}, {populate:"client_id"})
        );
    } catch (err) {
        throw new Error(err);
    }
})
router.get('/:id', methods.getOne)

//Delete Invoice
.delete('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);
    const check = await crud.getOneDocumentById(invoice, id, {}, {});
    if(!check) throw new Error('Data not Found!')
    try {
      success(res, 200, true, "Delete Successfully", await crud.deleteById(invoice, id));
    } catch (err) {
      throw new Error(err);
    } 
}))

module.exports = router;