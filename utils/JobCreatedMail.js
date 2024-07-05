var { SendMailClient } = require("zeptomail");
const { job, admin } = require("./schemaMaster");
const crud_service = require("./crud_service");
const crud = new crud_service();



const JobCreateSendMail = async (jobdetail) => {
    


  const url = "api.zeptomail.in/";
  const token = "Zoho-enczapikey PHtE6r1bEL/p3zMm8UIEsfW7RcKiMtkt9OpjeQFGs4sUDvAFGk1d/dwoxzaw+B1/VqJBHPWbwNlts+6d4OuBcGi8Zm8ZXGqyqK3sx/VYSPOZsbq6x00euFsSdEzaUo7ue9Vr1iLTuNjcNA==";
  let client = new SendMailClient({url, token});
  try{ 
     const check= await crud.getOneDocumentById(job, jobdetail?._id,{},{populate:"client_id created_by"})
     console.log("check",check)

     let aggregateQuery=[
        {
          $match: {
  
         
          role: {
            $in: ['HR']
          },
        
          },
      },
      
      {
        $project:{
             _id:0,
            email_address:{
                address:"$email_id",
                name:"$name"
            }
        }
      }
      ]
    let data =await admin.aggregate(aggregateQuery)

     console.log("data",data)
    
   await client.sendMail({
    "from": 
    {
      "address":check?.created_by?.email_id,
      "name": check?.created_by?.name
  },
     "to": 
   
    [
    //   {"email_address": {
    //     "address": "sowmiyan.p@technoladders.com",
    //     "name":  "Sowmiyan"
    //   }
    // }
         ...check?.created_by?.reportmanager?.length>0 && check?.created_by?.reportmanager,
     
      // {"email_address": {
      //     "address": "sathish.kumar@technoladders.com",
      //     "name":  ""
      //   }
      // }
    ]
  ,
  
  "cc": 
   
  [
      //  ...data,
  //   {"email_address": {
  //       "address": "Tag@technoladders.com",
  //       "name":  ""
  //     }
  //   },
        {"email_address": {
        "address": "sangeeth@technoladders.com",
        "name":  ""
      }
    },
    {"email_address": {
        "address": "sathish.kumar@technoladders.com",
        "name":  ""
      }
    }
  ]
,
    // "cc": 
    // [
    //     {"email_address": {
    //     "address": "sangeeth@technoladders.com",
    //     "name":  ""
    //   }
    // },
    // ],
    
    // options.Cc && options.Cc.map(ccRecipient => ({
    //   "email_address": {
    //     "address": ccRecipient,
    //     "name":""
    //   }
    // })),
  
    "subject": `Job Created`,
    "htmlbody": `<div>
    <p>Hi there, </p>
    The <strong>${check?.job_title}</strong> has been created for <strong>${check?.client_id[0]?.name} </strong>.
   
       </div>`,
}) 

  console.log("data",data);
}
catch(error) { console.log("error",error)}}

module.exports = JobCreateSendMail;