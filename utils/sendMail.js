var { SendMailClient } = require("zeptomail");




const sendMail = async (options,todaycreated) => {
  console.log("To",options)
  const url = "api.zeptomail.in/";
  const token = "Zoho-enczapikey PHtE6r1bEL/p3zMm8UIEsfW7RcKiMtkt9OpjeQFGs4sUDvAFGk1d/dwoxzaw+B1/VqJBHPWbwNlts+6d4OuBcGi8Zm8ZXGqyqK3sx/VYSPOZsbq6x00euFsSdEzaUo7ue9Vr1iLTuNjcNA==";
  let client = new SendMailClient({url, token});

  try{ 
    //  await client.sendMail({
    //     "from": 
    //     {
    //       "address":options.email,
    //       "name": options.name
    //   },
    //     "to":
    //       // [
    //       //   {"email_address": {
    //       //     "address": "Sathish.kumar@technoladders.com",
    //       //     "name":  "sathish"
    //       //   }
    //       // }
    //       // ],
      
    //      options.To.map(recipient => ({
    //       "email_address": {
    //         "address": recipient,
    //         "name":  ""
    //       }
    //     })),
    //     "cc": options.Cc && options.Cc.map(ccRecipient => ({
    //       "email_address": {
    //         "address": ccRecipient,
    //         "name":""
    //       }
    //     })),
      
    //     "subject": options?.subject,
    //     "htmlbody": `<div><p>Total Logged Hours :${options?.total_logged_hours},  Break Time :${options?.break_logged_hours}<p></div>${options?.description}
    //  `,
    // })
  console.log("Success");
}
catch(error) { console.log("error",error)}
}

module.exports = sendMail;