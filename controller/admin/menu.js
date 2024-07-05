const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const { skils, roles } = require("../../utils/schemaMaster");
const { success, error } = require("../../utils/response");
const crud_service = require("../../utils/crud_service");
const validateId = require('../../utils/validateId');
const { authAdmin } = require('../../middlewares/authMiddlewares');
const crud = new crud_service();



const accessList= [
  {
    module:"Employee",
    url:"/infopage",
    icon:"UserOutlined",
    component:"EmployeeDashboard",
    
    
    permissions:[
      "View All Employees",
      "Edit Employee Details",
      "Delete Employee Record"

    ]
  },
  {
    module:"Clients",
    url:"/clients",
    icon:"clientlogo",
    component:"ClientDashboard",
    permissions:[
      "Add Client",
      "Add Project",
      "Assign Employee"

    ]
  },
  {
    module:"Jobs",
    component:"JobDashboard",
    url:"/jobs",
    permissions:[
      "Create Job",
      "Add Candidate",
      "View Job Detail",
      "Update Status",
      "View Candidate Info",
      "DownloadCandidate",
      "View Profit",
     
      "viewClient",
      "AssignIcon",
      "Edit",
      "ViewFilter",

    

    ],
    icon:"JobsLogo",
  },
  {
    module:"Zive X",
    component:"Candidates",
    url:"/candidates",
  
    permissions:[
      "viewCandidate"
  
    ],
    icon:"candidatesLogo",
  },
  {
    module:"AddCandidate",
    component:"AddCandidate",
    url:"/addcandidate",
  
    permissions:[
      "viewCandidate"
  
    ],
    icon:"PlusOutlined",
  },
  {
    module:"Reports",
    component:"pbf",
    url:"/pbf-report",
  
    permissions:[
      "viewReport",
      "viewClient",
      "viewFilter"
  
    ],
    icon:"ReconciliationOutlined",
  },
  {
    module:"Timesheet",
    component:"TimesheetDashboard",

    url:"/TimesheetAdmin",
    icon:"TimesheetLogo",


    permissions:[
      "View Timesheet",
      "Add Log Hours",
      "View Reports",
     

    ]
  },
  {
    module:"Leaves",
    url:"/leave-admin",
    icon:"LeavesLogo",
    permissions:[
      "New Requests",
      "Leaves History",
      "Approval Status",
      "Leave Management",
      "View Candidate Info"
     

    ]
  },
  {
    module:"Accounts",
    url:"/invoice-expence",
    icon:"Invoicelogo",
    component:"Accounts",
    permissions:[
      "Add Invoice",
      "Record Payment",
      "Add Expense",
     
     

    ]
  },
  {
    module:"Company",
     url:"/account",
     component:"Invoicelogo",
     icon:"Invoicelogo",
    
    permissions:[
      "View Company"
  
    ]
  },
  {
    module:"Contacts",
     url:"/contacts",
     component:"ProfilesEmployee",
     icon:"candidatesLogo",
    
    permissions:[
      "View Contacts",
  
    ]
  },
  // {
  //   module:"Reports",
  //   url:"/Reports",
  //    icon:"ReportsLogo",

  //   permissions:[
  //     "Invoice Summary",
  //     "Expense Summary",
  //     "Payment Summary",
  //     "Profit vs Loss"
     
     

  //   ]
  // },
  {
    module:"FileManager",
    url:"/filemanager",
    icon:"FolderOpenOutlined",
    component:"FileMngrDashboard",
    permissions:[
      "Employee Documents",
      "Accounts",
      "Timesheet",
      "SOW"
     
     

    ]
  },
  {
    module:"User Management",
     url:"/usermanagement",
     component:"UserManageMent",
     icon:"candidatesLogo",
    
    permissions:[
      "Add Employee",
      "Create New Role",
      "Assign User"

    ]
  },
  {
    module:"Settings",
    url:"/setting",
    icon:"Settingslogo",
    component:"Setting",
    permissions:[
      "View Settings",
     

    ]
  },
  {
    module:"Company",
    url:"/company",
    icon:"Companylogo",
    component:"Company",
    permissions:[
      "View Company",
     

    ]
  },
  // {
  //   module:"UserSettings",
  //    url:"/editEmployee",
  //    component:"EditEmployee",
  //    icon:"UserManageMentLogo",
    
  //   permissions:[

  //   ]
  // }
]
const accessListBlatform= [
  // {
  //   module:"Employee",
  //   url:"/Employee",
  //   icon:"EmployeesLogo",
  //   component:"EmployeeDashboard",
    
    
  //   permissions:[
  //     "View All Employees",
  //     "Edit Employee Details",
  //     "Delete Employee Record"

  //   ]
  // },
  {
    module:"Clients",
    url:"/clients",
    icon:"clientlogo",
    component:"ClientDashboard",
    permissions:[
      "Add Client",
      "Add Project",
      "Assign Employee"

    ]
  },
  {
    module:"Jobs",
    component:"JobDashboard",
    url:"/jobs",
    permissions:[
      "Create Job",
      "Add Candidate",
      "View Job Detail",
      "Update Status",
      "View Candidate Info",
      "DownloadCandidate",
      "View Profit",
      
      "viewClient",
      "AssignIcon",
      "Edit",
      "ViewFilter",

    

    ],
    icon:"JobsLogo",
  },
  // {
  //   module:"Zive X",
  //   component:"Candidates",
  //   url:"/candidates",
  
  //   permissions:[
  //     "viewCandidate"
  
  //   ],
  //   icon:"candidatesLogo",
  // },
  {
    module:"AddCandidate",
    component:"AddCandidate",
    url:"/addcandidate",
  
    permissions:[
      "viewCandidate"
  
    ],
    icon:"PlusOutlined",
  },
  // {
  //   module:"Pbf Report",
  //   component:"pbf",
  //   url:"/pbf-report",
  
  //   permissions:[
  //     "viewCandidate"
  
  //   ],
  //   icon:"ReconciliationOutlined",
  // },
  // {
  //   module:"Timesheet",
  //   component:"TimesheetDashboard",

  //   url:"/TimesheetAdmin",
  //   icon:"TimesheetLogo",


  //   permissions:[
  //     "View Timesheet",
  //     "Add Log Hours",
  //     "View Reports",
     

  //   ]
  // },
  // {
  //   module:"Leaves",
  //   url:"/leave-admin",
  //   icon:"LeavesLogo",
  //   permissions:[
  //     "New Requests",
  //     "Leaves History",
  //     "Approval Status",
  //     "Leave Management",
  //     "View Candidate Info"
     

  //   ]
  // },
  // {
  //   module:"Accounts",
  //   url:"/invoice-expence",
  //   icon:"Invoicelogo",
  //   component:"Accounts",
  //   permissions:[
  //     "Add Invoice",
  //     "Record Payment",
  //     "Add Expense",
     
     

  //   ]
  // },
  // {
  //   module:"Reports",
  //   url:"/Reports",
  //    icon:"ReportsLogo",

  //   permissions:[
  //     "Invoice Summary",
  //     "Expense Summary",
  //     "Payment Summary",
  //     "Profit vs Loss"
     
     

  //   ]
  // },
  // {
  //   module:"FileManager",
  //   url:"/FileManager",
  //   icon:"FolderLogo",
  //   component:"FileMngrDashboard",
  //   permissions:[
  //     "Employee Documents",
  //     "Accounts",
  //     "Timesheet",
  //     "SOW"
     
     

  //   ]
  // },
  {
    module:"UserManagement",
     url:"/usermanagement",
     component:"UserManageMent",
     icon:"candidatesLogo",
    
    permissions:[
      "Add Employee",
      "Create New Role",
      "Assign User"

    ]
  },
  {
    module:"Settings",
    url:"/setting",
    icon:"Settingslogo",
    component:"Setting",
    permissions:[
      "View Settings",
     

    ]
  },
  // {
  //   module:"UserSettings",
  //    url:"/editEmployee",
  //    component:"EditEmployee",
  //    icon:"UserManageMentLogo",
    
  //   permissions:[

  //   ]
  // }
]
const accessListPermission= [
//   {
//   module:"Employee",
//   url:"/Employee",
//   icon:"EmployeesLogo",
//   component:"EmployeeDashboard",
  
  
//   permissions:[
//     "View All Employees",
//     "Edit Employee Details",
//     "Delete Employee Record"

//   ]
// },
{
  module:"Clients",
  url:"/clients",
  icon:"clientlogo",
  component:"ClientDashboard",
  permissions:[
    "Add Client",
    "Add Project",
    "Assign Employee"

  ]
},
{
  module:"Jobs",
  component:"JobDashboard",
  url:"/jobs",
  permissions:[
    "Create Job",
    "Add Candidate",
    "View Job Detail",
    "Update Status",
    "viewClient",
    "AssignIcon",
    "Edit",
    "ViewFilter",
    "View Candidate Info"

  ],
  icon:"JobsLogo",
},
{
  module:"ZiveX",
  component:"Candidates",
  url:"/candidates",

  permissions:[
    "viewCandidate"

  ],
  icon:"candidatesLogo",
},
{
  module:"AddCandidate",
  component:"AddCandidate",
  url:"/addcandidate",

  permissions:[
    "Add Candidate"

  ],
  icon:"PlusOutlined",
},
{
  module:"Reports",
  component:"pbf",
  url:"/pbf-report",

  permissions:[
    "viewReport",
    "viewClient",
    "viewFilter"

  ],
  icon:"ReconciliationOutlined",
},
{
  module:"Timesheet",
  component:"TimesheetDashboard",

  url:"/Timesheet",
  icon:"TimesheetLogo",


  permissions:[
    "View Timesheet",
    "Add Log Hours",
    "View Reports",
   

  ]
},
{
  module:"Leaves",
  url:"/Leave",
  icon:"LeavesLogo",
  permissions:[
    "New Requests",
    "Leaves History",
    "Approval Status",
    "Leave Management",
    "View Candidate Info"
   

  ]
},
{
  module:"Accounts",
  url:"/invoice-expence",
  icon:"Invoicelogo",
  component:"Accounts",
  permissions:[
    "Add Invoice",
    "Record Payment",
    "Add Expense",
   
   

  ]
},
{
  module:"Reports",
  url:"/Reports",
   icon:"ReportsLogo",

  permissions:[
    "Invoice Summary",
    "Expense Summary",
    "Payment Summary",
    "Profit vs Loss"
   
   

  ]
},
{
  module:"FileManager",
  url:"/filemanager",
  icon:"FolderOpenOutlined",
  component:"FileMngrDashboard",
  permissions:[
    "Employee Documents",
    "Accounts",
    "Timesheet",
    "SOW"
   
   

  ]
},
{
  module:"UserManagement",
   url:"/usermanagement",
   component:"UserManageMent",
   icon:"candidatesLogo",
  
  permissions:[
    "Add Employee",
    "Create New Role",
    "Assign User"

  ]
},
{
  module:"Company",
   url:"/account",
   component:"Invoicelogo",
   icon:"account",
  
  permissions:[
    "View Profile"

  ]
},
{
  module:"Contacts",
   url:"/contacts",
   component:"ProfilesEmployee",
   icon:"candidatesLogo",
  
  permissions:[
    "View Profile"

  ]
},
{
  module:"Profile",
   url:"/myprofiles",
   component:"ProfilesEmployee",
   icon:"candidatesLogo",
  
  permissions:[
    "View Profile"

  ]
},

]
const accessListVendor= [
  //   {
  //   module:"Employee",
  //   url:"/Employee",
  //   icon:"EmployeesLogo",
  //   component:"EmployeeDashboard",
    
    
  //   permissions:[
  //     "View All Employees",
  //     "Edit Employee Details",
  //     "Delete Employee Record"
  
  //   ]
  // },
  // {
  //   module:"Clients",
  //   url:"/clients",
  //   icon:"clientlogo",
  //   component:"ClientDashboard",
  //   permissions:[
  //     "Add Client",
  //     "Add Project",
  //     "Assign Employee"
  
  //   ]
  // },
  {
    module:"Jobs",
    component:"JobDashboard",
    url:"/jobs",
    permissions:[
      "Create Job",
      "Add Candidate",
      "View Job Detail",
      "Update Status",
      "viewClient",
      "AssignIcon",
      "Edit",
      "ViewFilter",

      "View Candidate Info"
  
    ],
    icon:"JobsLogo",
  },
  // {
  //   module:"ZiveX",
  //   component:"Candidates",
  //   url:"/candidates",
  
  //   permissions:[
  //     "viewCandidate"
  
  //   ],
  //   icon:"candidatesLogo",
  // },
  // {
  //   module:"AddCandidate",
  //   component:"AddCandidate",
  //   url:"/addcandidate",
  
  //   permissions:[
  //     "Add Candidate"
  
  //   ],
  //   icon:"PlusOutlined",
  // },
  {
    module:"Reports",
    component:"Reports",
    url:"/pbf-report",
  
    permissions:[
      "viewReport",
      "viewClient",
      "viewFilter",
  
    ],
    icon:"ReconciliationOutlined",
  },
  // {
  //   module:"Timesheet",
  //   component:"TimesheetDashboard",
  
  //   url:"/Timesheet",
  //   icon:"TimesheetLogo",
  
  
  //   permissions:[
  //     "View Timesheet",
  //     "Add Log Hours",
  //     "View Reports",
     
  
  //   ]
  // },
  // {
  //   module:"Leaves",
  //   url:"/Leave",
  //   icon:"LeavesLogo",
  //   permissions:[
  //     "New Requests",
  //     "Leaves History",
  //     "Approval Status",
  //     "Leave Management",
  //     "View Candidate Info"
     
  
  //   ]
  // },
  // {
  //   module:"Accounts",
  //   url:"/invoice-expence",
  //   icon:"Invoicelogo",
  //   component:"Accounts",
  //   permissions:[
  //     "Add Invoice",
  //     "Record Payment",
  //     "Add Expense",
     
     
  
  //   ]
  // },
  // {
  //   module:"Reports",
  //   url:"/Reports",
  //    icon:"ReportsLogo",
  
  //   permissions:[
  //     "Invoice Summary",
  //     "Expense Summary",
  //     "Payment Summary",
  //     "Profit vs Loss"
     
     
  
  //   ]
  // },
  // {
  //   module:"FileManager",
  //   url:"/filemanager",
  //   icon:"FolderOpenOutlined",
  //   component:"FileMngrDashboard",
  //   permissions:[
  //     "Employee Documents",
  //     "Accounts",
  //     "Timesheet",
  //     "SOW"
     
     
  
  //   ]
  // },
  // {
  //   module:"UserManagement",
  //    url:"/usermanagement",
  //    component:"UserManageMent",
  //    icon:"candidatesLogo",
    
  //   permissions:[
  //     "Add Employee",
  //     "Create New Role",
  //     "Assign User"
  
  //   ]
  // },
  // {
  //   module:"Profile",
  //    url:"/myprofiles",
  //    component:"ProfilesEmployee",
  //    icon:"candidatesLogo",
    
  //   permissions:[
  //     "View Profile"
  
  //   ]
  // },
  
  ]
  const accessListClient= [
    //   {
    //   module:"Employee",
    //   url:"/Employee",
    //   icon:"EmployeesLogo",
    //   component:"EmployeeDashboard",
      
      
    //   permissions:[
    //     "View All Employees",
    //     "Edit Employee Details",
    //     "Delete Employee Record"
    
    //   ]
    // },
    // {
    //   module:"Clients",
    //   url:"/clients",
    //   icon:"clientlogo",
    //   component:"ClientDashboard",
    //   permissions:[
    //     "Add Client",
    //     "Add Project",
    //     "Assign Employee"
    
    //   ]
    // },
    {
      module:"Jobs",
      component:"JobDashboard",
      url:"/jobs",
      permissions:[
        "Create Job",
        "Add Candidate",
        "View Job Detail",
        "Update Status",
        "viewClient",
        "AssignIcon",
        "Edit",
        "ViewFilter",
  
        "View Candidate Info"
    
      ],
      icon:"JobsLogo",
    },
    // {
    //   module:"ZiveX",
    //   component:"Candidates",
    //   url:"/candidates",
    
    //   permissions:[
    //     "viewCandidate"
    
    //   ],
    //   icon:"candidatesLogo",
    // },
    // {
    //   module:"AddCandidate",
    //   component:"AddCandidate",
    //   url:"/addcandidate",
    
    //   permissions:[
    //     "Add Candidate"
    
    //   ],
    //   icon:"PlusOutlined",
    // },
    {
      module:"Reports",
      component:"Reports",
      url:"/pbf-report",
    
      permissions:[
        "viewReport",
        "viewClient",
        "viewFilter",
    
      ],
      icon:"ReconciliationOutlined",
    },
    // {
    //   module:"Timesheet",
    //   component:"TimesheetDashboard",
    
    //   url:"/Timesheet",
    //   icon:"TimesheetLogo",
    
    
    //   permissions:[
    //     "View Timesheet",
    //     "Add Log Hours",
    //     "View Reports",
       
    
    //   ]
    // },
    // {
    //   module:"Leaves",
    //   url:"/Leave",
    //   icon:"LeavesLogo",
    //   permissions:[
    //     "New Requests",
    //     "Leaves History",
    //     "Approval Status",
    //     "Leave Management",
    //     "View Candidate Info"
       
    
    //   ]
    // },
    // {
    //   module:"Accounts",
    //   url:"/invoice-expence",
    //   icon:"Invoicelogo",
    //   component:"Accounts",
    //   permissions:[
    //     "Add Invoice",
    //     "Record Payment",
    //     "Add Expense",
       
       
    
    //   ]
    // },
    // {
    //   module:"Reports",
    //   url:"/Reports",
    //    icon:"ReportsLogo",
    
    //   permissions:[
    //     "Invoice Summary",
    //     "Expense Summary",
    //     "Payment Summary",
    //     "Profit vs Loss"
       
       
    
    //   ]
    // },
    // {
    //   module:"FileManager",
    //   url:"/filemanager",
    //   icon:"FolderOpenOutlined",
    //   component:"FileMngrDashboard",
    //   permissions:[
    //     "Employee Documents",
    //     "Accounts",
    //     "Timesheet",
    //     "SOW"
       
       
    
    //   ]
    // },
    // {
    //   module:"UserManagement",
    //    url:"/usermanagement",
    //    component:"UserManageMent",
    //    icon:"candidatesLogo",
      
    //   permissions:[
    //     "Add Employee",
    //     "Create New Role",
    //     "Assign User"
    
    //   ]
    // },
    // {
    //   module:"Profile",
    //    url:"/myprofiles",
    //    component:"ProfilesEmployee",
    //    icon:"candidatesLogo",
      
    //   permissions:[
    //     "View Profile"
    
    //   ]
    // },
    
    ]

const methods ={authAdmin}


//create
 methods.add =asyncHandler(async (req, res) => {
  try {
    success(res, 201, true, "Create Successfully", await crud.insertOne(skils, req.body));
  } catch (err) {
    throw new Error(err);
  }
})


router.post('/', methods.add )


//getall

const getAllMenuList = async (role, permission,company_id) => {
  if (role === "Admin" || role === "SuperAdmin") {
    console.log("im Working------------------",company_id)

    if(company_id){
      console.log("im Working")
      return accessListBlatform.map((e) => ({
        path: e.url,
        component: e.component,
        name: e.module,
        options: e.permissions,
        module_name: e.module_name, 
        order_no: e.order_no,
        parent: e.parent,
        icon: e.icon,
      }));
    }
  
    return accessList.map((e) => ({
      path: e.url,
      component: e.component,
      name: e.module,
      options: e.permissions,
      module_name: e.module_name, 
      order_no: e.order_no,
      parent: e.parent,
      icon: e.icon,
    }));
  } 
  
  
  else {
     if(role === "Vendor"){
      const get_access = await crud.getOneDocumentById(roles, { _id: permission }, {}, {});
      const menu_listtvendor = accessListVendor.reduce((acc, e) => {
        const module_name = e.module;
        const module_access = get_access[module_name];
        if (module_access && module_access.length > 0) {
          acc.push({
            path: e.url,
            component: e.component,
            name: e.module,
            options: module_access,
            icon: e.icon,
            module_name: module_name,
          });
        }
        return acc;
      }, []);
    return menu_listtvendor;

       
     }
     if(role === "Client"){

      const menu_listClient = accessListClient.map((e) => ({
        path: e.url,
        component: e.component,
        name: e.module,
        options: e.permissions,
        module_name: e.module_name, 
        order_no: e.order_no,
        parent: e.parent,
        icon: e.icon,
      }))
       
      
    return menu_listClient;

       
     }
    const get_access = await crud.getOneDocumentById(roles, { _id: permission }, {}, {});
    const menu_list = accessListPermission.reduce((acc, e) => {
      const module_name = e.module;
      const module_access = get_access[module_name];
      if (module_access && module_access.length > 0) {
        acc.push({
          path: e.url,
          component: e.component,
          name: e.module,
          options: module_access,
          icon: e.icon,
          module_name: module_name,
        });
      }
      return acc;
    }, []);
    return menu_list;
  }
};
methods.getAll = asyncHandler(async (req, res) => {
  const { role, permission,company_id } = req?.user;
  try {
    const menuList = await getAllMenuList(role, permission,company_id);
    console.log("menus",menuList)
    success(res, 200, true, "Get Successfully", menuList);
  } catch (err) {
    throw new Error(err);
  }
});

router.get('/', methods.authAdmin, methods.getAll);


 //getone

methods.getOne=asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(skils, id, {}, {});
  if(!check) throw new Error('Data not Found!')
  try {
  success(res, 200, true, "Get Successfully", await crud.getOneDocumentById(skils, id,{},{}));
  } catch (err) {
    throw new Error(err);
  } 
})
 router.get('/:id', methods.getOne)


//Edit
methods.edit =asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id);
  const check = await crud.getOneDocumentById(skils,id,{},{});
  if (!check) throw new Error('Data not Found!')
  try {
    success(res, 200, true, 'Update Successfully', await crud.updateById(skils, id, req.body, { new: true }));
  } catch (err) {
    throw new Error(err);
  } 
})

 router.put('/:id',methods.edit )


//delete
  .delete('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);
    const check = await crud.getOneDocumentById(skils, id, {}, {});
    if(!check) throw new Error('Data not Found!')
    try {
      success(res, 200, true, "Delete Successfully", await crud.deleteById(skils, id));
    } catch (err) {
      throw new Error(err);
    } 
}))











module.exports = router;