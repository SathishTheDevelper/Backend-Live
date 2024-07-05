var { SendMailClient } = require("zeptomail");




const clientSendMail = async (clientdeatil,candidatedetails,loginer) => {
  console.log("To",clientdeatil  )
  console.log("candidatedetails",candidatedetails)
  console.log("loginer",loginer)
  const url = "api.zeptomail.in/";
  const token = "Zoho-enczapikey PHtE6r1bEL/p3zMm8UIEsfW7RcKiMtkt9OpjeQFGs4sUDvAFGk1d/dwoxzaw+B1/VqJBHPWbwNlts+6d4OuBcGi8Zm8ZXGqyqK3sx/VYSPOZsbq6x00euFsSdEzaUo7ue9Vr1iLTuNjcNA==";
  let client = new SendMailClient({url, token});
  try{ 
    loginer?.role !=="SuperAdmin" ?
   await client.sendMail({
    "from": 
    {
      "address":loginer?.email_id,
      "name": loginer?.name
  },
     "to": 
   
    [
        ...loginer?.reportmanager?.length>0 && loginer.reportmanager,
      // {"email_address": {
      //     "address": "Tag@technoladders.com",
      //     "name":  ""
      //   }
      // },
      {"email_address": {
          "address": "sathish.kumar@technoladders.com",
          "name":  ""
        }
      }
    ]
  ,
  
  "cc": 
   
  [
      ...loginer?.cc?.length>0 && loginer.cc,
  //   {"email_address": {
  //       "address": "Tag@technoladders.com",
  //       "name":  ""
  //     }
  //   },
  //   {"email_address": {
  //       "address": "sathish.kumar@technoladders.com",
  //       "name":  ""
  //     }
  //   }
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
  
    "subject": `Candidate Created`,
    "htmlbody": `<div>
    <p>Hi there, </p>
    The candidate named <a href=https://zive2.technoladders.com/candidates/${candidatedetails?._id}><strong>${candidatedetails?.first_name} ${candidatedetails?.last_name||""}</strong> </a> Submitted for the <a href=https://zive2.technoladders.com/jobs/${clientdeatil?._id}><strong>${clientdeatil?.job_title}</strong> </a> position with <strong>${clientdeatil?.client_id[0]?.name}</strong>
    
    <table border="1" cellspacing="0" cellpadding="5" style="border-collapse: collapse; margin-top:10px ;  ">
    <thead>
      <tr>
        <th>Candidate Name</th>
        <th>Email</th>
        <th>Phone</th>
        <th>Current CTC</th>
        <th>Expected CTC</th>
        <th>Notice Period</th>
        <th>Resume</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${candidatedetails?.first_name}</td>
        <td>${candidatedetails?.email_id}</td>
        <td>${candidatedetails?.phone_no}</td>
        <td>${candidatedetails?.current_ctc}</td>
        <td>${candidatedetails?.expected_ctc}</td>
        <td>${candidatedetails?.notice_period}</td>
        <td><a href="https://apiv1.technoladders.com/${candidatedetails?.resume}">view</a></td>
      </tr>
    </tbody>
  </table>
   
       </div>`,
}) 
:"" 
  console.log("Success");
}
catch(error) { console.log("error",error)}}

module.exports = clientSendMail;