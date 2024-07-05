var { SendMailClient } = require("zeptomail");




const sendStatusChange = async (options) => {
  console.log("To",options)
  const url = "api.zeptomail.in/";
  const token = "Zoho-enczapikey PHtE6r1bEL/p3zMm8UIEsfW7RcKiMtkt9OpjeQFGs4sUDvAFGk1d/dwoxzaw+B1/VqJBHPWbwNlts+6d4OuBcGi8Zm8ZXGqyqK3sx/VYSPOZsbq6x00euFsSdEzaUo7ue9Vr1iLTuNjcNA==";
  let client = new SendMailClient({url, token});
  try{ 
//    options?.user?.role !=="SuperAdmin" ?
//    await client.sendMail({
//     "from": 
//     {
//       "address":options?.Toemail,
//       "name": options?.Toname
//   },
//      "to": 
   
//     [
//       ...options?.user?.reportmanager?.length>0 && options?.user?.reportmanager,
//       {"email_address": {
//           "address": "sathish.kumar@technoladders.com",
//           "name":  ""
//         }
//       }
//     ]
//   ,
//   "cc": 
   
//   [
//       ...options?.user?.cc?.length>0 && options?.user?.cc,
//   //   {"email_address": {
//   //       "address": "Tag@technoladders.com",
//   //       "name":  ""
//   //     }
//   //   },
  
//   ],
   
  
//     "subject": `Candidate status has been changed`,
//     "htmlbody": `<div>
//     <p>Hi there, </p>
//    The status of the candidate <a href=https://zive2.technoladders.com/candidates/${options?.status?.candidateoriginal_id?.id}><strong>${options?.status?.first_name} ${options?.status?.last_name||""}</strong></a>  submitted for the position of <a href=https://zive2.technoladders.com/jobs/${options?.status?.job_id?._id}><strong>${options?.status?.job_id?.job_title}</strong></a>  has been updated from <strong>${options.previous}</strong> to <strong>${options?.status?.status}</strong>
//        </div>`,
// }) :"" 
//   console.log("Success");
}
catch(error) { console.log("error",error)}}

module.exports = sendStatusChange;