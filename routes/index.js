var admin_baseurl = '/api/v1/';

module.exports = (app) => {
  // Super Admin Panel
  app.use(admin_baseurl,require("../controller/admin/admin_login"));
  app.use(admin_baseurl+'employee', require("../controller/admin/employee"));
  app.use(admin_baseurl+'job', require("../controller/admin/job"));
  app.use(admin_baseurl+'candidate', require("../controller/admin/candidate"));
  app.use(admin_baseurl+'skills', require("../controller/admin/skils"));
  app.use(admin_baseurl+'events', require("../controller/admin/event"));
  app.use(admin_baseurl+'location', require("../controller/admin/location"));
  app.use(admin_baseurl+'clients', require("../controller/admin/clients"));
  app.use(admin_baseurl+'projects', require("../controller/admin/project"));
  app.use(admin_baseurl+'projectemployess', require("../controller/admin/projectemployee"));
  app.use(admin_baseurl+'roles', require("../controller/admin/role"));
  app.use(admin_baseurl+'menues', require("../controller/admin/menu"));
  

  app.use(admin_baseurl+'expense', require("../controller/admin/expense"));
  app.use(admin_baseurl+'invoice', require("../controller/admin/invoice"));
  app.use(admin_baseurl+'endclients', require("../controller/admin/endclient"));

  app.use(admin_baseurl+'work-experience', require("../controller/admin/workexperience"));
  app.use(admin_baseurl+'payment-records', require("../controller/admin/payment_records"));

  app.use(admin_baseurl+'file-mngr', require("../controller/admin/file_mngr"));
  app.use(admin_baseurl+'leave', require("../controller/admin/leave"));
  app.use(admin_baseurl+'theme', require("../controller/admin/theme"));
  app.use(admin_baseurl+'team', require("../controller/admin/team"));
  app.use(admin_baseurl+'contact', require("../controller/admin/contact"));
  app.use(admin_baseurl+'account', require("../controller/admin/account"));
  app.use(admin_baseurl+'space', require("../controller/admin/space"));



  // Employee Dashbord

  



}