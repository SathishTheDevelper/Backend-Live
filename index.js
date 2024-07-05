const express = require('express');
const bodyParser = require('body-parser');
const dbConnect = require("./config/db");
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const app = express();
const pdf = require('pdf-parse');
const dotenv = require('dotenv').config();
const PORT = process.env.PORT || 6000;
const cookieParser = require('cookie-parser');
const XLSX = require('xlsx');
const morgon = require('morgan');
const cors = require('cors');
const asyncHandler = require("express-async-handler");

const path = require('path');
const upload = require("./utils/upload");
const crud_service = require("./utils/crud_service");
const fs = require('fs');

const { roles, candidate, candidatelog, totallogs, statuslog,skils,locations, accounts, contacts } = require("./utils/schemaMaster");
const { authAdmin } = require('./middlewares/authMiddlewares');
const { success } = require('./utils/response');
const crud = new crud_service();
const ResumeParser = require('resume-parser-extended');
const resumeParser = require('resume-parser');


//DataBase Connection
dbConnect();
app.use(morgon('dev'));
app.use(cors());
// app.use(bodyParser.json());
app.use(bodyParser.json({limit: '500mb'}));
app.use(bodyParser.urlencoded({limit: '500mb', extended: true}));
app.use(cookieParser());


app.use('/uploads', express.static(path.join(__dirname, '/uploads')))
app.use('/resumeparser', (req,res)=>{
  const resumeFilePath = './uploads/naukri_avinashlavale[3y_0m].pdf';

  parsePDF(resumeFilePath).then((pdfText) => {
    // Parse PDF text
    console.log(pdfText);
});

})

app.use("/test",(req,res)=>{
     res.json({
       message:"Hii Welcome to.........."
     })
})


async function parsePDF(filePath) {
  try {
      const data = await pdf(filePath);
      return data.text;
  } catch (error) {
      console.error('Error parsing PDF:', error);
      return null;
  }
}

function readFileContent(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error('Error reading file:', error.message || error);
    return null;
  }
}
app.use("/excel",upload.single('excelFile'),authAdmin, async(req,res)=>{
  if (!req.file) {
    return res.status(400).send('No file uploaded.');

  }
  const excelFilePath = req?.file?.path;
 

  const workbook = XLSX.readFile(excelFilePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert sheet data to JSON
  const jsonData = XLSX.utils.sheet_to_json(sheet);
  console.log("fff",jsonData)
  
  let senddata=[]
 let sucess=jsonData?.map( async(item)=>{


let data = {
    first_name:item?.FirstName||"",
    last_name:item?.LastName||"",
    phone_no:`+91 ${item?.PhoneNumber}`,
    email_id:item?.Email,
     current_ctc:item?.Current_ctc,
    expected_ctc:item?.Expected_ctc,
    to_exp_from:item?.Experience_years||0,
    to_exp_to:item?.Experience_months||0, 
    re_exp_from:item?.RelExperience_years||0,
    re_exp_to:item?.RelExperience_months||0,
    offer_details:item?.OfferDetails,
    notice_period:item?.NoticePeriod,
    candidate_owner:req?.user?._id,
    current_location:item?.CurrentLocation,
    preferred_location:item?.PreferredLocation? item?.PreferredLocation?.split(","):[],
  

    skills:item?.Technical_Skills?item?.Technical_Skills.split(","):[]

  }

  const exist = await crud.getOneDocument(candidate,{ email_id: data.email_id },{},{});
 
  if( !exist){
   
    let created = await crud.insertOne(candidate,data);
    // if(created.skills.length>0){
    //   created.skills.map( async(item)=>{
    //     let dataexist= await skils.findOne({name:item})
    //     console.log("fff",dataexist)
        
    //     if(dataexist == null){
    //      console.log("ddddddddddddddddddddd")
    //        if(item){
    //        let created= await crud.insertOne(skils, {name:item}) 
    //        console.log("created",created)
               
    //        }
          
    //     }
    //   })
    // }
    let createdlog=await crud.insertOne(candidatelog,{...data,candidateoriginal_id:created?._id})
    let logs = await crud.insertOne(statuslog, {
      candidate_id: createdlog._id,
      children: [
        {
          status: created.status,
          created_by: created.candidate_owner,
        },
      ],
    });
    //  const totallogsdata =await crud.insertOne(totallogs,{
    //   job_id:created.job_id,
    //   candidate_id:createdlog._id,
    //   created_by:req?.user?._id,
    //   status:created.status
    // })
  }



 


//   if(data?.skills&&data?.skills.length>0){

//     console.log("skilss",data?.skills)
     
//     Promise.all(
//       data?.skills.map( async(item)=>{
//      let dataexist= await skils.find({name:item})
//      console.log("fff",dataexist,)
     
//      if(dataexist.length ===0){
//       console.log("ddddddddddddddddddddd")
//         if(item){
//         let created= await crud.insertOne(skils, {name:item}) 
            
//         }
       
//      }
//    }))
// }
// if(data?.preferred_location&&data?.preferred_location?.length>0){
     
//   Promise.all(data?.preferred_location?.map( async(item)=>{
//    let dataexist= await locations.find({name:item})
   
//    if(dataexist?.length === 0){
//       if(item){
//         let created= await crud.insertOne(locations, {name:item}) 
//       }
     
//    }
//  }))
// }



}
 
)


  // Send response
  res.json({jsonData})
})
app.use("/leads", upload.single('leadFile'), authAdmin, async (req, res) => {
  if (!req.file) {
      return res.status(400).send('No file uploaded.');
  }

  const excelFilePath = req.file.path;

  const workbook = XLSX.readFile(excelFilePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert sheet data to JSON
  const jsonData = XLSX.utils.sheet_to_json(sheet);

  let sendData = [];
  let processedCompanies = []; // Track processed companies

  let success = jsonData.map(async (item) => {
      // Normalize account_name (trim and capitalize first letter)
      let normalizedAccountName = item?.COMPANY?.trim().charAt(0).toUpperCase() + item?.COMPANY?.trim().slice(1);

      // Remove "EY Technology Solutions" from the string and trim again


      // Check if the normalized account_name is not empty and not already processed
      if (normalizedAccountName !== "" && !processedCompanies.includes(normalizedAccountName)) {
          // Mark the company as processed
          processedCompanies.push(normalizedAccountName);

          // Check if the normalized account_name already exists
          const existingAccount = await crud.getOneDocument(accounts, { name: normalizedAccountName }, {}, {});
          let accountId;

          if (existingAccount) {
              // Account already exists, use its ID
              accountId = existingAccount._id;
          } else {
              // Account doesn't exist, create a new one
              const addedData = {
                  name: normalizedAccountName,
                  website_url: item.COMPANYWEBSITE,
                  created_by: req.user._id,
                 
                  linkedin_url: item.COMPANYLINKEDIN,
                  facebook_url:item.COMPANYFACEBOOK,
                  twitter_url:item.COMPANYTWITTER,
                  location:item.LOCATION,
                  num_contacts:Number(item.EMPLOYEES||0),
                  logo_url:item.IMAGE,
                  industry: item.INDUSTRY
              };
              const addedAccount = await crud.insertOne(accounts, addedData);
              accountId = addedAccount._id;
          }

          // Create contact data
          const contactData = {
              name:item.NAME,
           
              title: item.TITLE || "",
              email_id: item.EmailAddress||"",
              account_id: accountId,
              email_Status: item.EmailStatus||"",
              industry: item.INDUSTRY,
              linkedin_url: item.LINKEDINACCOUNT,
              city: item.City,
              state: item.State,
              country: item.LOCATION,
              email_Send: item.EmailSent,
              comment: item.Comment || "",
              contact_owner: req.user._id,
              
          };

          // Insert contact data
          const createdContact = await crud.insertOne(contacts, contactData);

          sendData.push(createdContact); // Push created contact to the sendData array
      }
  });

  // Wait for all promises to resolve
  await Promise.all(success);

  // Send response
  res.json({ jsonData });
});


 

app.use("/sendData", authAdmin,
  asyncHandler(async(req,res)=>{
  

    if (req?.user) req.body.candidate_owner = req?.user?._id;
    console.log("fffff",req.body.candidate_owner)
  
  const regex = /(\d+)y (\d+)m/;
  
  let saveData={
      gender:req?.body?.gender||"",
      dob:req?.body?.birthDate||"",
      current_location:req?.body?.city||"",
      to_exp_from:req?.body?.totalExperience?Number(req?.body?.rawTotalExperience?.split(".")[0]):0,
      to_exp_to:req?.body?.totalExperience?Number(req?.body?.rawTotalExperience?.split(".")[1]):0||0,
      roll_name:req.body.role||"",
      re_exp_from:0,
      re_exp_to:0,
      current_ctc:req?.body?.ctc?Number(req?.body?.ctcValue):0,
      expected_ctc:req?.body?.expectedCtc?Number(req?.body?.expectedCtcValue):0,
      jobType:req?.body?.jobType||"",
      empStatus:req?.body?.empStatus||"",
      preferred_location: req?.body?.prefLocation?req?.body?.prefLocation.split(","):[],
     
      first_name:req?.body?.name||"",
      phone_no:req?.body?.mphone?`+91 ${req?.body?.mphone}`:"",
      notice_period:req?.body?.noticePeriod||"",
      projects:req?.body?.projects||[],
      candidate_owner:req.body.candidate_owner,
      workExperiences:req?.body?.workExperiences||[],
      educations:req?.body?.educations||[],
      summary:req?.body?.summary||"",
      skills:req.body.keywords.split(",")||[],
  
      skillMatrix:req?.body?.skills||[],
      address:req?.body?.contactAddress||"",
      last_name:"",
      email_id:req?.body?.email||""
  
  
  
    }
  
  
    const exist = await crud.getOneDocument(candidate,{ email_id: saveData.email_id },{},{});
     if(!exist){
      let result =  await crud.insertOne(candidate,saveData)
      let resultCatelog =  await crud.insertOne(candidatelog,{candidateoriginal_id:result._id,...saveData})
      let logs = await crud.insertOne(statuslog, {
        candidate_id: resultCatelog._id,
        children: [
          {
            status: result.status,
            created_by: result.candidate_owner,
          },
        ],
      });
       const totallogsdata =await crud.insertOne(totallogs,{
        job_id:result.job_id,
        candidate_id:resultCatelog._id,
        created_by:req?.user?._id,
  
        status:"DatabaseAdd"
      })
      if(saveData.preferred_location&&saveData.preferred_location?.length>0){
        let data=[...saveData.preferred_location,saveData.current_location] 
         
     Promise.all(data.map( async(item)=>{
      let dataexist= await locations.find({name:item})
      
      if(dataexist?.length ==0){
         let created= await crud.insertOne(locations, {name:item}) 
        
      }
    
    }))
    
     
    
    
    
    }
    success(res, 201, true, "Created Successfully You Go to Serach Next Candidate", );
  
     }
    
  
  
     else{
      throw  Error('Candidate Already Exist!')
     }
  
  
  
  
     
  
  
  
  
    
   })
 )

app.use("/skillonly",upload.single('excelFile'), async(req,res)=>{
  if (!req.file) {
    return res.status(400).send('No file uploaded.');

  }
  const excelFilePath = req?.file?.path;
 

  const workbook = XLSX.readFile(excelFilePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert sheet data to JSON
  const jsonData = XLSX.utils.sheet_to_json(sheet);
  console.log("fff",jsonData)
  const excel_to_array = [];
  const prev_data = await skils.find({}).select({ name: 1, _id: 0 });
  const prev_data_array = prev_data.map((obj) => obj.name);
  for (let i = 0; i < jsonData.length; i++) {
    if (jsonData[i]?.Technical_Skills!=null) {
      excel_to_array.push(jsonData[i]?.Technical_Skills.trim());
    } 
  }
  const final_array = [];
  const ress = excel_to_array?.join(",").split(",");
  const newArray = ress?.map((str) => str.trim().replace(/\r\n/g, ""));
  const arrayWithoutDuplicates = [...new Set(newArray)];
  const combinedSet = [...prev_data_array, ...arrayWithoutDuplicates];
  const final_set = [...new Set(combinedSet)];
  for(let i = 0; i < final_set.length; i++){
    if(prev_data_array.includes(final_set[i])){
      continue
    }
    if (final_set[i] != "") {
      final_array.push(final_set[i]);
      await crud.insertOne(skils, { name: final_set[i] });
    } 
    
  }
  res.send(final_array);

 
  
//   let senddata=[]
//  let sucess= jsonData?.map( async(item)=>{


// let data = {
//     // first_name:item?.FirstName||"",
//     // last_name:item?.LastName||"",
//     // phone_no:`+91 ${item?.PhoneNumber}`,
//     // email_id:item?.Email,
//     //  current_ctc:item?.Current_ctc,
//     // expected_ctc:item?.Expected_ctc,
//     // to_exp_from:item?.Experience_years||0,
//     // to_exp_to:item?.Experience_months||0, 
//     // re_exp_from:item?.RelExperience_years||0,
//     // re_exp_to:item?.RelExperience_months||0,
//     // offer_details:item?.OfferDetails,
//     // notice_period:item?.NoticePeriod,
//     // candidate_owner:req?.user?._id,
//     // current_location:item?.CurrentLocation,
//     // preferred_location:item?.PreferredLocation? item?.PreferredLocation?.split(","):[],
  

//     skills:item?.Technical_Skills?item?.Technical_Skills.split(","):[]

//   }

//   const existingSkills = new Set();

// // Assume 'skillsData' is an array of skills from your MongoDB query
// const skillsData = await skils.find()

 
// // Populate the set with existing skill names
// skillsData.forEach(skill => {
//   existingSkills.add(skill?.name.trim().toLowerCase()); // Convert to lowercase for case-insensitive comparison
// });

// // Your loop for processing new skills
// for (const newItem of data?.skills) {
//   const itemName = newItem?.trim().toLowerCase(); // Convert to lowercase for case-insensitive comparison

//   // Check if the skill already exists
//   if (existingSkills.has(itemName)) {
//     console.log(`Skill "${newItem}" already exists. Skipping creation.`);
//     continue;
//   }

//   // If the skill doesn't exist, create a new entry
//   const createdSkill = await crud.insertOne(skils, { name: itemName });
//   console.log('Created', createdSkill);

//   // Add the new skill name to the existing skills set
//   existingSkills.add(itemName);
// }



//   // if (data?.skills?.length > 0) {
//   //   for await (const item of data.skills) {
//   //     // Check if the item contains spaces
//   //     // if (item.includes(' ')) {
//   //     //   console.log(`Skipping item "${item}" due to spaces.`);
//   //     //   continue; // Skip to the next iteration
//   //     // }
  
//   //     let dataexist = await skils.find({ name: item?.trim() });
//   //     console.log("fff", dataexist);
  
//   //     if (dataexist.length >0) {
//   //       console.log(`Skill "${item}" already exists. Skipping creation.`);
       
//   //     } else {
//   //        if(item){
//   //         let created = await crud.insertOne(skils, { name: item.trim() });
//   //         console.log("created", created);
//   //        }
//   //       // Skill doesn't exist, create a new entry
       
//   //     }
//   //   }
//   // }
   
//   })

  // res.json({sucess})
})
app.use("/location-only",upload.single('excelFile'), async(req,res)=>{
  if (!req.file) {
    return res.status(400).send('No file uploaded.');

  }
  const excelFilePath = req?.file?.path;
 

  const workbook = XLSX.readFile(excelFilePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert sheet data to JSON
  const jsonData = XLSX.utils.sheet_to_json(sheet);
  console.log("fff",jsonData)
  const excel_to_array = [];
  const prev_data = await locations.find({}).select({ name: 1, _id: 0 });
  const prev_data_array = prev_data.map((obj) => obj.name);
  for (let i = 0; i < jsonData.length; i++) {
    if (jsonData[i]?.PreferredLocation!=null) {
      excel_to_array.push(jsonData[i]?.PreferredLocation.trim());
    } 
  }
  const final_array = [];
  const ress = excel_to_array?.join(",").split(",");
  const newArray = ress?.map((str) => str.trim().replace(/\r\n/g, ""));
  const arrayWithoutDuplicates = [...new Set(newArray)];
  const combinedSet = [...prev_data_array, ...arrayWithoutDuplicates];
  const final_set = [...new Set(combinedSet)];
  for(let i = 0; i < final_set.length; i++){
    if(prev_data_array.includes(final_set[i])){ 
      continue
    }
    if (final_set[i] != "") {
      final_array.push(final_set[i]);
      await crud.insertOne(locations, { name: final_set[i] });
    } 
    
  }
  res.send(final_array);

 
  
//   let senddata=[]
//  let sucess= jsonData?.map( async(item)=>{


// let data = {
//     // first_name:item?.FirstName||"",
//     // last_name:item?.LastName||"",
//     // phone_no:`+91 ${item?.PhoneNumber}`,
//     // email_id:item?.Email,
//     //  current_ctc:item?.Current_ctc,
//     // expected_ctc:item?.Expected_ctc,
//     // to_exp_from:item?.Experience_years||0,
//     // to_exp_to:item?.Experience_months||0, 
//     // re_exp_from:item?.RelExperience_years||0,
//     // re_exp_to:item?.RelExperience_months||0,
//     // offer_details:item?.OfferDetails,
//     // notice_period:item?.NoticePeriod,
//     // candidate_owner:req?.user?._id,
//     // current_location:item?.CurrentLocation,
//     // preferred_location:item?.PreferredLocation? item?.PreferredLocation?.split(","):[],
  

//     skills:item?.Technical_Skills?item?.Technical_Skills.split(","):[]

//   }

//   const existingSkills = new Set();

// // Assume 'skillsData' is an array of skills from your MongoDB query
// const skillsData = await skils.find()

 
// // Populate the set with existing skill names
// skillsData.forEach(skill => {
//   existingSkills.add(skill?.name.trim().toLowerCase()); // Convert to lowercase for case-insensitive comparison
// });

// // Your loop for processing new skills
// for (const newItem of data?.skills) {
//   const itemName = newItem?.trim().toLowerCase(); // Convert to lowercase for case-insensitive comparison

//   // Check if the skill already exists
//   if (existingSkills.has(itemName)) {
//     console.log(`Skill "${newItem}" already exists. Skipping creation.`);
//     continue;
//   }

//   // If the skill doesn't exist, create a new entry
//   const createdSkill = await crud.insertOne(skils, { name: itemName });
//   console.log('Created', createdSkill);

//   // Add the new skill name to the existing skills set
//   existingSkills.add(itemName);
// }



//   // if (data?.skills?.length > 0) {
//   //   for await (const item of data.skills) {
//   //     // Check if the item contains spaces
//   //     // if (item.includes(' ')) {
//   //     //   console.log(`Skipping item "${item}" due to spaces.`);
//   //     //   continue; // Skip to the next iteration
//   //     // }
  
//   //     let dataexist = await skils.find({ name: item?.trim() });
//   //     console.log("fff", dataexist);
  
//   //     if (dataexist.length >0) {
//   //       console.log(`Skill "${item}" already exists. Skipping creation.`);
       
//   //     } else {
//   //        if(item){
//   //         let created = await crud.insertOne(skils, { name: item.trim() });
//   //         console.log("created", created);
//   //        }
//   //       // Skill doesn't exist, create a new entry
       
//   //     }
//   //   }
//   // }
   
//   })

  // res.json({sucess})
})

const newdata = [];
newdata?.map(function(data) {
  inc = data

})

//   if(data?.skills&&data?.skills.length>0){

//     console.log("skilss",data?.skills)
     
//     Promise.all(
//       data?.skills.map( async(item)=>{
//      let dataexist= await skils.find({name:item})
//      console.log("fff",dataexist,)
     
//      if(dataexist.length ===0){
//       console.log("ddddddddddddddddddddd")
//         if(item){
//         let created= await crud.insertOne(skils, {name:item}) 
            
//         }
       
//      }
//    }))
// }
// if(data?.preferred_location&&data?.preferred_location?.length>0){
     
//   Promise.all(data?.preferred_location?.map( async(item)=>{
//    let dataexist= await locations.find({name:item})
   
//    if(dataexist?.length === 0){
//       if(item){
//         let created= await crud.insertOne(locations, {name:item}) 
//       }
     
//    }
//  }))
// }



   


  // Send response



const init = async()=>{
   const data=await roles.find()
   if(data?.length==0){
    predefinedPermission=[
      {
        
        name: 'SuperAdmin',
        Clients: [ 'Add Client', 'Add Project', 'Assign Employee' ],
        Accounts: [ 'Add Invoice', 'Record Payment', 'Add Expense' ],
        Employee: [
          'View All Employees',
          'Edit Employee Details',
          'Delete Employee Record'
        ],
        FileManager: [ 'Employee Documents', 'Accounts', 'Timesheet', 'SOW' ],
        Jobs: [
          'Create Job',
          'Add Candidate',
          'View Job Detail',
          'Update Status',
          'View Candidate Info'
        ],
        Leaves: [
          'New Requests',
          'Leaves History',
          'Approval Status',
          'Leave Management',
          'View Candidate Info'
        ],
        Reports: [
          'Invoice Summary',
          'Expense Summary',
          'Payment Summary',
          'Profit vs Loss'
        ],
        Timesheet: [ 'View Timesheet', 'Add Log Hours', 'View Reports' ],
        UserManagement: [ 'Add Employee', 'Create New Role', 'Assign User' ],
        userSettings:[],
        status: true,
        
      },
      {
        
        name: 'HR',
        Clients: [],
        Accounts: [],
        Employee: [],
        FileManager: [],
        Jobs: [
          'Create Job',
          'Add Candidate',
          'View Job Detail',
          'Update Status',
          'View Candidate Info'
        ],
        Leaves: [],
        Reports: [],
        Timesheet: [],
        UserManagement: [],
        status: true,
       
      }, 
      {
        
        name: 'Employee',
        Clients: [],
        Accounts: [],
        Employee: [],
        FileManager: [],
        Jobs: [
          'Create Job',
          'Add Candidate',
          'View Job Detail',
          'Update Status',  
          'View Candidate Info'
        ],
        Leaves: [],
        Reports: [],
        Timesheet: [],
        UserManagement:['Add Employee', 'Create New Role', 'Assign User'],
        UserSettings:["OnBoarding"],

        status: true,
       
      },
    ]
       const add=await roles.insertMany(predefinedPermission)
       
   }
  
}
init()

//Routes
require("./routes/")(app);
//Error Handler



app.use(notFound);
app.use(errorHandler);

//Create Server
app.listen(8080, () => {
  console.log(`Server is running at port 8080`);
})