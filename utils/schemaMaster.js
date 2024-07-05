const mongoose = require('mongoose');
const version = { timestamps: true, versionKey: false };
//Import Schema
const import_admin_login_schema = require('../models/admin_login');
const import_event_schema = require('../models/Event');
const import_employee_schema = require("../models/employee");
const import_workexperience_schema = require("../models/workexperience");
const import_Job_schema = require("../models/job");
const import_Candidate_schema = require("../models/candidate");
const import_statuslogsSchema_schema = require("../models/statuslog");
const import_skilsSchema_schema = require("../models/skils");
const import_Locations_schema = require("../models/locations");
const import_totallog_schema = require("../models/totallog");
const import_Interview_schema = require("../models/interview");
const import_Clints_schema = require("../models/clients");
const import_Projects_schema = require("../models/project");
const import_ProjectEmployess_schema = require("../models/projectemployee");
const import_Roles_schema = require("../models/roles");

const importExpenseSchema = require("../models/expense")
const importInvoiceSchema = require("../models/invoice")
const importRecordPaymentSchema = require("../models/payment_records")
const importEndClientSchema = require("../models/endclient")
const importCandidatelogSchema = require("../models/candidatelog")
const importLeavesSchema = require("../models/leave")
const importWorkigDaysSchema = require("../models/workingdays")
const importHolidaySchema = require("../models/holidays")
const importLeaveRequestSchema = require("../models/leave_request")
const importHr_loggedSchema = require("../models/hr_looged")
const importCompanySchema = require("../models/company")
const importThemeSchema = require("../models/themecolor")
const importTeamSchema = require("../models/teams")
const importGoalSchema = require("../models/goaltypes")
const importContactSchema = require("../models/contacts")
const importAccountSchema = require("../models/account")
const importListSchema = require("../models/list")
const importSpacesSchema = require("../models/space")
const importSpaceListSchema = require("../models/spaceList")




//Creating Schema
const create_admin_login_schema = mongoose.Schema(import_admin_login_schema, version);
const create_event_schema = mongoose.Schema(import_event_schema, version);
const create_employee_schema = mongoose.Schema(import_employee_schema, version);
const create_work_schema = mongoose.Schema(import_workexperience_schema, version);
const create_Job_schema = mongoose.Schema(import_Job_schema, version);
const create_Candidate_schema = mongoose.Schema(import_Candidate_schema, version);
const create_statuslog_schema = mongoose.Schema(import_statuslogsSchema_schema, version);
const create_skils_schema = mongoose.Schema(import_skilsSchema_schema, version);
const create_location_schema = mongoose.Schema(import_Locations_schema, version);
const create_totallog_schema = mongoose.Schema(import_totallog_schema, version);
const create_interview_schema = mongoose.Schema(import_Interview_schema, version);
const create_clints_schema = mongoose.Schema(import_Clints_schema, version);
const create_projects_schema = mongoose.Schema(import_Projects_schema, version);
const create_projectemployees_schema = mongoose.Schema(import_ProjectEmployess_schema, version);
const create_Roles_schema = mongoose.Schema(import_Roles_schema, version);


const createExpenseSchema = mongoose.Schema(importExpenseSchema, version);
const createInvoiceSchema = mongoose.Schema(importInvoiceSchema, version);
const createRecordPaymentSchema = mongoose.Schema(importRecordPaymentSchema, version);
const createEndClientSchema = mongoose.Schema(importEndClientSchema, version);
const createCandidatelogSchema = mongoose.Schema(importCandidatelogSchema, version);
const createLeaveSchema = mongoose.Schema(importLeavesSchema, version);
const createWorkingDaysSchema = mongoose.Schema(importWorkigDaysSchema, version);
const createHolidaySchema = mongoose.Schema(importHolidaySchema, version);
const createLeaveRequestSchema = mongoose.Schema(importLeaveRequestSchema, version);
const createHR_LoggedSchema = mongoose.Schema(importHr_loggedSchema, version);
const createCompanySchema = mongoose.Schema(importCompanySchema, version);
const createThemeSchema = mongoose.Schema(importThemeSchema, version);
const createTeamSchema = mongoose.Schema(importTeamSchema, version);
const createGoalSchema = mongoose.Schema(importGoalSchema, version);
const createContacSchema = mongoose.Schema(importContactSchema, version);
const createAccountSchema = mongoose.Schema(importAccountSchema, version);
const createListSchema = mongoose.Schema(importListSchema, version);
const createSpaceSchema = mongoose.Schema(importSpacesSchema, version);
const createSpaceListSchema = mongoose.Schema(importSpaceListSchema, version);


//Creating Model
const create_admin_login_model = mongoose.model('admin', create_admin_login_schema);
const create_event_model = mongoose.model('event', create_event_schema);
const create_employee_model = mongoose.model("employee", create_employee_schema);
const create_workexperience_model = mongoose.model("workexperience", create_work_schema);
const create_Job_model = mongoose.model("jobs", create_Job_schema);
const create_Candidate_model = mongoose.model("candidates", create_Candidate_schema);
const create_Statuslog_model = mongoose.model("statuslogs", create_statuslog_schema);
const create_Skills_model = mongoose.model("skills", create_skils_schema);
const create_Locations_model = mongoose.model("locations", create_location_schema);
const create_Totallogs_model = mongoose.model("totallogs", create_totallog_schema);
const create_Interview_model = mongoose.model("interview", create_interview_schema);
const create_Clients_model = mongoose.model("clients", create_clints_schema);
const create_Projects_model = mongoose.model("projects", create_projects_schema);
const create_ProjectEmployee_model = mongoose.model("projectemployees", create_projectemployees_schema);
const create_Roles_model = mongoose.model("roles", create_Roles_schema);



const createExpenseModel = mongoose.model("expense", createExpenseSchema);
const createInvoiceModel = mongoose.model("invoice", createInvoiceSchema);
const createRecordPaymentModel = mongoose.model("record-payment", createRecordPaymentSchema);
const createEndClientModel = mongoose.model("endclient", createEndClientSchema);
const createCandidatelogtModel = mongoose.model("candidatelogs", createCandidatelogSchema);
const createLeavesModel = mongoose.model("leaves", createLeaveSchema);
const createWorkingDaysModel = mongoose.model("workingdays", createWorkingDaysSchema);
const createHolidayModel = mongoose.model("holidays", createHolidaySchema);
const createLeaveRequestModel = mongoose.model("leaverequests", createLeaveRequestSchema);
const createHR_LoggedModel = mongoose.model("hr_logged", createHR_LoggedSchema);
const createCompanudModel = mongoose.model("company", createCompanySchema);
const createThemeModel = mongoose.model("theme", createThemeSchema);
const createTeamModel = mongoose.model("teams", createTeamSchema);
const createGoalModel = mongoose.model("goaltypes", createGoalSchema);
const createContactModel = mongoose.model("contacts", createContacSchema);
const createAccountModel = mongoose.model("accounts", createAccountSchema);
const createListModel = mongoose.model("lists", createListSchema);
const createSpaceModel = mongoose.model("spaces", createSpaceSchema);
const createSpaceListModel = mongoose.model("spaceLists", createSpaceListSchema);


module.exports = {
  admin: create_admin_login_model,
  employee:create_employee_model,
  workexperience:create_workexperience_model,
  job:create_Job_model,
  candidate:create_Candidate_model,
  statuslog:create_Statuslog_model,
  skils:create_Skills_model,
  locations:create_Locations_model,
  totallogs:create_Totallogs_model,
  interview:create_Interview_model,
  clients:create_Clients_model,
  projects:create_Projects_model,
  projectemployess:create_ProjectEmployee_model,
  roles:create_Roles_model,
  expense : createExpenseModel,
  invoice : createInvoiceModel,
  record_payment : createRecordPaymentModel,
  endclients:createEndClientModel,
  candidatelog:createCandidatelogtModel,
  event:create_event_model,
  leaves:createLeavesModel,
  workingdays:createWorkingDaysModel,
  holidays:createHolidayModel,
  leave_request:createLeaveRequestModel,
  hrlogged:createHR_LoggedModel,
  company:createCompanudModel,
  theme:createThemeModel,
  teams:createTeamModel,
  goaltypes:createGoalModel,
  contacts:createContactModel,
  accounts:createAccountModel,
  lists:createListModel,
  spaces:createSpaceModel,
  spaceList:createSpaceListModel
};