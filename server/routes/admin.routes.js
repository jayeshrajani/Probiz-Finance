module.exports = (app)=>{
    const middleware = require("../middlewares/uploads");
     
    const admin  = require('../controllers/admin.controller');

    const employee = require('../controllers/employee.controller');

    app.post('/api/createAdmin', admin.createAdmin);

    app.post('/api/adminLogin', admin.adminLogin);

    app.get('/api/getAllUsers', admin.getAllUsers);

    app.post('/api/addContactUs',admin.addContactUs);  

    app.get('/api/getContactUs',admin.getContactUs);   

    app.delete('/api/deleteContactUs/:id',admin.deleteContactUs);   
    
    app.post('/api/addNewsLatters',admin.addNewsLetters);  

    app.get('/api/getNewsLetter',admin.getNewsLetters);   

    app.delete('/api/deleteNewsLetter/:id',admin.deleteNewsLetter);   

// ======================= property =========================
    app.post('/api/addProperty',middleware.property.fields([
      { name: "propertyImage", maxCount: 10 },
      { name: "propertyVideo", maxCount: 1 },
    ]),admin.AddProperty);        

    app.put('/api/updateProperty/:id',middleware.property.fields([
      { name: "propertyImage", maxCount: 10 },
      { name: "propertyVideo", maxCount: 1 },
    ]),admin.UpdatePropertyById);

    app.get('/api/getAllProperty',admin.getAllProperties); 

    app.get('/api/getPropertyById/:id',admin.getPropertyById);  
    
    app.delete('/api/deleteProperty/:id',admin.deleteProperty);   
    
    app.get('/api/getFilterProperties', admin.getFilteredProperties);

// ============================ In house =================================
    
  app.post('/api/addInHouseProperty', admin.addPropertyInHouse);            
  app.get('/api/getAllInHouseProperty',admin.getAllPropertyInHouse);        
  app.get('/api/getInHousePropertyById/:id',admin.getPropertyInHouseById);  
  app.delete('/api/deleteInHouseProperty/:id',admin.deletePropertyInHouse); 
  app.put('/api/updateInHouseProperty/:id',admin.updatePropertyInHouseById); 

// ===================== Dashboard Apis ================================

  app.get('/api/getCountForDashboard',admin.getDashboardCounts);        

// ====================== Admin Roles =====================================

  app.post('/api/addRoleByAdmin',admin.AddRole);
  app.put('/api/updateRoleByAdmin/:id',admin.UpdateRole);
  app.delete('/api/deleteRoleByAdmin/:id',admin.DeleteRole);
  app.get('/api/getAllRolesByAdmin',admin.GetRole);

// ===================== Employee =======================================

  app.post('/api/addEmployee',employee.AddEmployee);
  app.get('/api/getAllEmployee',employee.GetAllEmployee);
  app.put('/api/updateEmployee/:id',employee.UpdateEmployee);
  app.delete('/api/deleteEmployee/:id',employee.DeleteEmployee);

// ===================== Area Management =======================================

  app.post('/api/bulkAddAreas', admin.bulkAddAreas);
  app.get('/api/getAllAreas', admin.getAllAreas);
  app.get('/api/getAreaById/:id', admin.getAreaById);
  app.put('/api/updateArea/:id', admin.updateArea);
  app.delete('/api/deleteArea/:id', admin.deleteArea);

}