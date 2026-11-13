module.exports = (app)=>{
    const express = require('../http');
    const user = require('../controllers/user.controller');
    const middleware = require("../middlewares/uploads");

    app.post('/api/userSignUp', user.userSignUp);

    app.post('/api/userLogin',user.userLogin);

    app.put('/api/changeUserPassword/:usersRegId', user.changeUserPassword);

//  Add Home Loan request //
    app.post('/api/loanOfferDetail', middleware.homeloan.fields([
        { name: "aadharFront", maxCount: 1 },
        { name: "aadharBack", maxCount: 1 },
        { name: "panCard", maxCount: 1 },
        { name: "electricityBill", maxCount: 1 },
        { name: "propertyFront", maxCount: 1 },
        { name: "propertyInside", maxCount: 1 },
        { name: "propertyTaxReceipt", maxCount: 1 },
        { name: "bankStatement", maxCount: 1 },
        { name: "incomeTaxReturnFile", maxCount: 1 },
        { name: "salarySlipOrOfferLetter", maxCount: 1 },
        { name: "forBusiness", maxCount: 1 },
        { name: "propertyPaper", maxCount: 1 },
    ]), user.homeLoanDetail);
    
    // Put home loan 
    app.put('/api/updateHomeLoanDetail/:id', middleware.homeloan.fields([
        { name: "aadharFront", maxCount: 1 },
        { name: "aadharBack", maxCount: 1 },
        { name: "panCard", maxCount: 1 },
        { name: "electricityBill", maxCount: 1 },
        { name: "propertyFront", maxCount: 1 },
        { name: "propertyInside", maxCount: 1 },
        { name: "propertyTaxReceipt", maxCount: 1 },
        { name: "bankStatement", maxCount: 1 },
        { name: "incomeTaxReturnFile", maxCount: 1 },
        { name: "salarySlipOrOfferLetter", maxCount: 1 },
        { name: "forBusiness", maxCount: 1 },
        { name: "propertyPaper", maxCount: 1 },
    ]),user.updateHomeLoanDetailById)

    //  Get Home Loan request
    app.get('/api/getHomeLoan',user.getHomeLoanDetails);  

    //  Get By Id Home Loan request
    app.get('/api/getHomeLoanById/:id',user.getHomeLoanDetailById);  

    
// =====================================================================
    //Add Credit Card request
    app.post('/api/creditCardDetail', middleware.creditCard.fields([
        { name: "aadharFront", maxCount: 1 },
        { name: "aadharBack", maxCount: 1 },
        { name: "panCard", maxCount: 1 },
        { name: "electricityBill", maxCount: 1 },
        { name: "bankStatement", maxCount: 1 },
        { name: "salarySlipOrOfferLetter", maxCount: 1 },
       
    ]), user.creditCardDetail); 
 //Update Credit Card request
    app.put('/api/updateCreditCardDetail/:id', middleware.creditCard.fields([
        { name: "aadharFront", maxCount: 1 },
        { name: "aadharBack", maxCount: 1 },
        { name: "panCard", maxCount: 1 },
        { name: "electricityBill", maxCount: 1 },
        { name: "bankStatement", maxCount: 1 },
        { name: "salarySlipOrOfferLetter", maxCount: 1 },
       
    ]), user.updateCreditCardDetail); 
    
    // get Api Credit Card request
    app.get('/api/getCreditCardDetails', user.getCreditCardDetails);
    // get  Crby Id edit Card request
    app.get('/api/getCreditCardDetailsById/:id', user.getCreditCardDetailsById);
//  ===================================================================

    // Add Car loan
    app.post('/api/carLoanDetail', middleware.carLoan.fields([
    { name: "aadharFront", maxCount: 1 },
    { name: "aadharBack", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
    { name: "electricityBillOrRentAgreement", maxCount: 1 },
    { name: "carPhoto", maxCount: 1 },
    { name: "bankStatement", maxCount: 1 },
    { name: "salarySlipOrOfferLetter", maxCount: 1 },
    { name: "businessDocuments", maxCount: 1 },
    { name: "carRC", maxCount: 1 },
    { name: "carQuotation", maxCount: 1 },
    { name: "insurance", maxCount: 1 },
   
]), user.carLoanDetail);

   // Update Car loan 
  app.put('/api/updateCarLoanDetail/:id', middleware.carLoan.fields([
    { name: "aadharFront", maxCount: 1 },
    { name: "aadharBack", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
    { name: "electricityBillOrRentAgreement", maxCount: 1 },
    { name: "carPhoto", maxCount: 1 },
    { name: "bankStatement", maxCount: 1 },
    { name: "salarySlipOrOfferLetter", maxCount: 1 },
    { name: "businessDocuments", maxCount: 1 },
    { name: "carRC", maxCount: 1 },
    { name: "carQuotation", maxCount: 1 },
    { name: "insurance", maxCount: 1 },
   
]), user.updateCarLoanDetail);

// GET all car loan details 
app.get('/api/getcarLoanDetails', user.getAllCarLoanDetails);

// GET car loan details By id
app.get('/api/getcarLoanDetailsById/:id', user.getCarLoanById);
// ================================================================================

// Define the route for business loan details with file uploads
app.post('/api/businessLoanDetail', middleware.businessLoan.fields([
    { name: "aadharFront", maxCount: 1 },
    { name: "aadharBack", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
    { name: "electricityBillOrRentAgreement", maxCount: 1 },
    { name: "bankStatement", maxCount: 1 },
    { name: "incomeTaxReturnFile", maxCount: 1 },
    { name: "businessDocuments", maxCount: 1 }
]), user.businessLoanDetail);
// Define the route for business loan details with file uploads
app.put('/api/updateBusinessLoanDetail/:id', middleware.businessLoan.fields([
    { name: "aadharFront", maxCount: 1 },
    { name: "aadharBack", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
    { name: "electricityBillOrRentAgreement", maxCount: 1 },
    { name: "bankStatement", maxCount: 1 },
    { name: "incomeTaxReturnFile", maxCount: 1 },
    { name: "businessDocuments", maxCount: 1 }
]), user.updateBusinessLoanDetail);
// GET all business loan details
app.get('/api/getBusinessLoanDetails', user.getAllBusinessLoanDetails);
// GET  business loan details by Id
app.get('/api/getBusinessLoanDetailsById/:id', user.getBusinessLoanById);


// ===================================================================================

// Add project funding loan details 
app.post('/api/projectfundingLoanDetail', middleware.projectfundingLoan.fields([
    { name: "aadharFront", maxCount: 1 },
    { name: "aadharBack", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
    { name: "electricityBillOrRentAgreement", maxCount: 1 },
    { name: "bankStatement", maxCount: 1 },
    { name: "incomeTaxReturnFile", maxCount: 1 },
    { name: "businessDocuments", maxCount: 1 }
]), user.projectfundiingLoanDetail);
// Update project funding loan details 
app.put('/api/updateProjectfundingLoanDetail/:id', middleware.projectfundingLoan.fields([
    { name: "aadharFront", maxCount: 1 },
    { name: "aadharBack", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
    { name: "electricityBillOrRentAgreement", maxCount: 1 },
    { name: "bankStatement", maxCount: 1 },
    { name: "incomeTaxReturnFile", maxCount: 1 },
    { name: "businessDocuments", maxCount: 1 }
]), user.updateProjectFundingLoanDetail);
// GET all project funding loan details 
app.get('/api/getprojectfundingLoanDetails', user.getAllProjectfundiingLoanDetails);
// GET  project funding loan details by Id 
app.get('/api/getprojectfundingLoanDetailsById/:id', user.getProjectfundiingLoanById);

// ===================================================================================

// Add construction detail
app.post("/api/addconstructionLoanDetail", middleware.constructionLoan.fields([
   { name: "aadharFront", maxCount: 1 },
    { name: "aadharBack", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
    { name: "electricityBill", maxCount: 1 },
    { name: "propertyFront", maxCount: 1 },
    { name: "propertyInside", maxCount: 1 },
    { name: "propertyTaxReceipt", maxCount: 1 },
    { name: "bankStatement", maxCount: 1 },
    { name: "incomeTaxReturnFile", maxCount: 1 },
    { name: "salarySlipOrOfferLetter", maxCount: 1 },
    { name: "forBusiness", maxCount: 1 },
    { name: "propertyPaper", maxCount: 1 },
  ]),
    user.constructionLoanDetail
  );
// Update Construction Loan
app.put("/api/updateConstructionLoanDetail/:id", middleware.constructionLoan.fields([
   { name: "aadharFront", maxCount: 1 },
    { name: "aadharBack", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
    { name: "electricityBill", maxCount: 1 },
    { name: "propertyFront", maxCount: 1 },
    { name: "propertyInside", maxCount: 1 },
    { name: "propertyTaxReceipt", maxCount: 1 },
    { name: "bankStatement", maxCount: 1 },
    { name: "incomeTaxReturnFile", maxCount: 1 },
    { name: "salarySlipOrOfferLetter", maxCount: 1 },
    { name: "forBusiness", maxCount: 1 },
    { name: "propertyPaper", maxCount: 1 },
  ]),
    user.updateConstructionLoanDetail
  ); 
// GET all construction loan applications
app.get('/api/getAllConstructionLoanDetails', user.getAllConstructionLoanDetails);
// Get construction detail by Id
app.get('/api/getConstructionLoanDetailsById/:id', user.getConstructionLoanById);

// ======================================================================================
app.post('/api/personalLoanApplication',middleware.personalLoan.fields([
      { name: "aadharFront", maxCount: 1 },
      { name: "aadharBack", maxCount: 1 },
      { name: "panCard", maxCount: 1 },
      { name: "electricityBillOrRentAgreement", maxCount: 1 },
      { name: "bankStatement", maxCount: 1 },
      { name: "incomeTaxReturnFile", maxCount: 1 },
      { name: "salarySlips", maxCount: 1 },
      { name: "offerLetter", maxCount: 1 },
    ]),
    user.perLoanDetail
  );
app.put('/api/updatePersonalLoanApplication/:id',middleware.personalLoan.fields([
      { name: "aadharFront", maxCount: 1 },
      { name: "aadharBack", maxCount: 1 },
      { name: "panCard", maxCount: 1 },
      { name: "electricityBillOrRentAgreement", maxCount: 1 },
      { name: "bankStatement", maxCount: 1 },
      { name: "incomeTaxReturnFile", maxCount: 1 },
      { name: "salarySlips", maxCount: 1 },
      { name: "offerLetter", maxCount: 1 },
    ]),
    user.updatePerLoanDetail
  ); 
app.get('/api/getAllpersonalLoanApplication', user.getAllPerLoanDetails);
app.get('/api/getpersonalLoanApplicationById/:id', user.getPerLoanDetailById);
// ======================================================================================
// pradhan mantri modra yojna loan
  app.post('/api/pradhanmantrimodrayojnaLoanApplication',middleware.pradhanmantriLoan.fields([
      { name: "aadharFront", maxCount: 1 },
      { name: "aadharBack", maxCount: 1 },
      { name: "panCard", maxCount: 1 },
      { name: "electricityBillOrRentAgreement", maxCount: 1 },
      { name: "bankStatement", maxCount: 1 },
      { name: "incomeTaxReturnFile", maxCount: 1 },
      { name: "salarySlips", maxCount: 1 },
      { name: "offerLetter", maxCount: 1 },
    ]),
    user.pradhanMantriLoanDetail
  );
  app.put('/api/updatePradhanmantrimodrayojnaLoanApplication/:id',middleware.pradhanmantriLoan.fields([
      { name: "aadharFront", maxCount: 1 },
      { name: "aadharBack", maxCount: 1 },
      { name: "panCard", maxCount: 1 },
      { name: "electricityBillOrRentAgreement", maxCount: 1 },
      { name: "bankStatement", maxCount: 1 },
      { name: "incomeTaxReturnFile", maxCount: 1 },
      { name: "salarySlips", maxCount: 1 },
      { name: "offerLetter", maxCount: 1 },
    ]),
    user.updatePradhanMantriLoanDetail
  );
  
  app.get('/api/getAllpradhanmantrimodrayojnaLoanApplication', user.getAllPradhanMantriLoanDetails);
  app.get('/api/getpradhanmantrimodrayojnaLoanApplicationById/:id', user.getPradhanMantriLoanDetailById);

// ==========================================================================================
  app.post(
    '/api/kisanCreditLoanApplication',
    middleware.kisanCreditLoan.fields([
      { name: "aadharFront", maxCount: 1 },
      { name: "aadharBack", maxCount: 1 },
      { name: "panCard", maxCount: 1 },
      { name: "electricityBill", maxCount: 1 },
      { name: "bankStatement", maxCount: 1 },
      { name: "incomeTaxReturnFile", maxCount: 1 },
      { name: "pawti", maxCount: 1 },
      { name: "khasraCopy", maxCount: 1 },
      
    ]),
    user.kisanCreditLoan
  );
   app.put(
    '/api/updatekisanCreditLoanApplication/:id',
    middleware.kisanCreditLoan.fields([
      { name: "aadharFront", maxCount: 1 },
      { name: "aadharBack", maxCount: 1 },
      { name: "panCard", maxCount: 1 },
      { name: "electricityBill", maxCount: 1 },
      { name: "bankStatement", maxCount: 1 },
      { name: "incomeTaxReturnFile", maxCount: 1 },
      { name: "pawti", maxCount: 1 },
      { name: "khasraCopy", maxCount: 1 },
      
    ]),
    user.updateKisanCreditLoan
  ); 
  app.get('/api/getAllkisanloans', user.getAllKisanCreditLoans);
  app.get('/api/getkisanloansById/:id', user.getKisanCreditLoanById);

// ===============================================================================================
//    Add plot Loan request
  app.post('/api/addPlotPurchaseLoanOfferDetail', middleware.PlotPurchaseloan.fields([
    { name: "aadharFront", maxCount: 1 },
    { name: "aadharBack", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
    { name: "electricityBill", maxCount: 1 },
    { name: "propertyFront", maxCount: 1 },
    { name: "propertyInside", maxCount: 1 },
    { name: "propertyTaxReceipt", maxCount: 1 },
    { name: "bankStatement", maxCount: 1 },
    { name: "incomeTaxReturnFile", maxCount: 1 },
    { name: "salarySlipOrOfferLetter", maxCount: 1 },
    { name: "forBusiness", maxCount: 1 },
    { name: "propertyPaper", maxCount: 1 },
]), user.PlotPurchaseLoanDetail);

 // Put plot loan 
    app.put('/api/updatePlotPurchaseLoanDetail/:id', middleware.PlotPurchaseloan.fields([
    { name: "aadharFront", maxCount: 1 },
    { name: "aadharBack", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
    { name: "electricityBill", maxCount: 1 },
    { name: "propertyFront", maxCount: 1 },
    { name: "propertyInside", maxCount: 1 },
    { name: "propertyTaxReceipt", maxCount: 1 },
    { name: "bankStatement", maxCount: 1 },
    { name: "incomeTaxReturnFile", maxCount: 1 },
    { name: "salarySlipOrOfferLetter", maxCount: 1 },
    { name: "forBusiness", maxCount: 1 },
    { name: "propertyPaper", maxCount: 1 },
]),user.updatePlotPurchaseLoanById)

//  Get plot Loan request
app.get('/api/getPlotPurchaseLoan',user.getPlotPurchaseLoanDetails);  

//  Get By Id plot Loan request
app.get('/api/getPlotPurchaseLoanById/:id',user.getPlotPurchaseLoanDetailById);  

// ================================================================================

//    Add plot Constructionloan Loan request
  app.post('/api/addPlotPurchaseConstructionLoanOfferDetail', middleware.PlotPurchaseConstructionloan.fields([
    { name: "aadharFront", maxCount: 1 },
    { name: "aadharBack", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
    { name: "electricityBill", maxCount: 1 },
    { name: "propertyFront", maxCount: 1 },
    { name: "propertyInside", maxCount: 1 },
    { name: "propertyTaxReceipt", maxCount: 1 },
    { name: "bankStatement", maxCount: 1 },
    { name: "incomeTaxReturnFile", maxCount: 1 },
    { name: "salarySlipOrOfferLetter", maxCount: 1 },
    { name: "forBusiness", maxCount: 1 },
    { name: "propertyPaper", maxCount: 1 },
]), user.PlotPurchaseConstructionLoanDetail);


 // Put plot Constructionloan Loan request 
    app.put('/api/updatePlotPurchaseConstructionLoanOfferDetail/:id', middleware.PlotPurchaseConstructionloan.fields([
    { name: "aadharFront", maxCount: 1 },
    { name: "aadharBack", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
    { name: "electricityBill", maxCount: 1 },
    { name: "propertyFront", maxCount: 1 },
    { name: "propertyInside", maxCount: 1 },
    { name: "propertyTaxReceipt", maxCount: 1 },
    { name: "bankStatement", maxCount: 1 },
    { name: "incomeTaxReturnFile", maxCount: 1 },
    { name: "salarySlipOrOfferLetter", maxCount: 1 },
    { name: "forBusiness", maxCount: 1 },
    { name: "propertyPaper", maxCount: 1 },
]),user.updatePlotPurchaseConstructionLoanById)

//  Get plot Constructionloan Loan request
app.get('/api/getPlotPurchaseConstructionLoan',user.getPlotPurchaseConstructionLoanDetails);  

//  Get By Id plot Constructionloan Loan request
app.get('/api/getPlotPurchaseConstructionLoanById/:id',user.getPlotPurchaseConstructionLoanDetailById);

//  ===============================================================================
 //    Add flat Loan request
 app.post('/api/addFlatPurchaseLoanOfferDetail', middleware.FlatePurchaseloan.fields([
  { name: "aadharFront", maxCount: 1 },
  { name: "aadharBack", maxCount: 1 },
  { name: "panCard", maxCount: 1 },
  { name: "electricityBill", maxCount: 1 },
  { name: "propertyFront", maxCount: 1 },
  { name: "propertyInside", maxCount: 1 },
  { name: "propertyTaxReceipt", maxCount: 1 },
  { name: "bankStatement", maxCount: 1 },
  { name: "incomeTaxReturnFile", maxCount: 1 },
  { name: "salarySlipOrOfferLetter", maxCount: 1 },
  { name: "forBusiness", maxCount: 1 },
  { name: "propertyPaper", maxCount: 1 },
]), user.FlatePurchaseLoanDetail);
 //    Update flat Loan request
app.put('/api/updateFlatPurchaseLoanOfferDetail/:id',
  middleware.FlatePurchaseloan.fields([
    { name: "aadharFront", maxCount: 1 },
    { name: "aadharBack", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
    { name: "electricityBill", maxCount: 1 },
    { name: "propertyFront", maxCount: 1 },
    { name: "propertyInside", maxCount: 1 },
    { name: "propertyTaxReceipt", maxCount: 1 },
    { name: "bankStatement", maxCount: 1 },
    { name: "incomeTaxReturnFile", maxCount: 1 },
    { name: "salarySlipOrOfferLetter", maxCount: 1 },
    { name: "forBusiness", maxCount: 1 },
    { name: "propertyPaper", maxCount: 1 },
  ]),
  user.updateFlatePurchaseLoanDetail
);
//  Get flat Loan request
app.get('/api/getFlatPurchaseLoan',user.getFlatePurchaseLoanDetails);  

//  Get By Id flat Loan request
app.get('/api/getFlatPurchaseLoanById/:id',user.getFlatePurchaseLoanDetailById); 

// =============================================================================================
//    Add Loan against Property Loan request
app.post('/api/addLoanagainstPropertyOfferDetail', middleware.LoanagainstProperty.fields([
  { name: "aadharFront", maxCount: 1 },
  { name: "aadharBack", maxCount: 1 },
  { name: "panCard", maxCount: 1 },
  { name: "electricityBill", maxCount: 1 },
  { name: "propertyFront", maxCount: 1 },
  { name: "propertyInside", maxCount: 1 },
  { name: "propertyTaxReceipt", maxCount: 1 },
  { name: "bankStatement", maxCount: 1 },
  { name: "incomeTaxReturnFile", maxCount: 1 },
  { name: "salarySlipOrOfferLetter", maxCount: 1 },
  { name: "forBusiness", maxCount: 1 },
  { name: "propertyPaper", maxCount: 1 },
]), user.LoanagainstPropertyDetail);

app.put(
  "/api/updateLoanAgainstPropertyDetail/:id",
  middleware.LoanagainstProperty.fields([
    { name: "aadharFront", maxCount: 1 },
    { name: "aadharBack", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
    { name: "electricityBill", maxCount: 1 },
    { name: "propertyFront", maxCount: 1 },
    { name: "propertyInside", maxCount: 1 },
    { name: "propertyTaxReceipt", maxCount: 1 },
    { name: "bankStatement", maxCount: 1 },
    { name: "incomeTaxReturnFile", maxCount: 1 },
    { name: "salarySlipOrOfferLetter", maxCount: 1 },
    { name: "forBusiness", maxCount: 1 },
    { name: "propertyPaper", maxCount: 1 },
  ]),
  user.updateLoanAgainstPropertyDetail
);
//  Get Loan against Property Loan request
app.get('/api/getLoanagainstProperty',user.getLoanagainstPropertyDetails);  

//  Get By Id Loan against Property Loan request
app.get('/api/getLoanagainstPropertyById/:id',user.getLoanagainstPropertyDetailById);  

// ================================================================================================
//    Add Commercial Property Purchase Loan request
app.post('/api/addCommercialPropertyPurchaseOfferDetail', middleware.CommercialPropertyPurchase.fields([
  { name: "aadharFront", maxCount: 1 },
  { name: "aadharBack", maxCount: 1 },
  { name: "panCard", maxCount: 1 },
  { name: "electricityBill", maxCount: 1 },
  { name: "propertyFront", maxCount: 1 },
  { name: "propertyInside", maxCount: 1 },
  { name: "propertyTaxReceipt", maxCount: 1 },
  { name: "bankStatement", maxCount: 1 },
  { name: "incomeTaxReturnFile", maxCount: 1 },
  { name: "salarySlipOrOfferLetter", maxCount: 1 },
  { name: "forBusiness", maxCount: 1 },
  { name: "propertyPaper", maxCount: 1 },
]), user.CommercialPropertyPurchaseDetail);

//    update Commercial Property Purchase Loan request
app.put('/api/updateCommercialPropertyPurchaseOfferDetail/:id', middleware.CommercialPropertyPurchase.fields([
  { name: "aadharFront", maxCount: 1 },
  { name: "aadharBack", maxCount: 1 },
  { name: "panCard", maxCount: 1 },
  { name: "electricityBill", maxCount: 1 },
  { name: "propertyFront", maxCount: 1 },
  { name: "propertyInside", maxCount: 1 },
  { name: "propertyTaxReceipt", maxCount: 1 },
  { name: "bankStatement", maxCount: 1 },
  { name: "incomeTaxReturnFile", maxCount: 1 },
  { name: "salarySlipOrOfferLetter", maxCount: 1 },
  { name: "forBusiness", maxCount: 1 },
  { name: "propertyPaper", maxCount: 1 },
]), user.updateCommercialPropertyPurchaseDetail);

//  Get Commercial Property Purchase Loan request
app.get('/api/getCommercialPropertyPurchaseProperty',user.getCommercialPropertyPurchaseDetails);  

//  Get By Id Commercial Property Purchase Loan request
app.get('/api/getCommercialPropertyPurchasePropertyById/:id',user.getCommercialPropertyPurchaseDetailById);  

// ========================================================================================================
//  Add Commercial Property Mortgage Loan request
app.post('/api/addCommercialPropertyMortgageOfferDetail', middleware.CommercialPropertyMortgage.fields([
  { name: 'aadharFront', maxCount: 1 },
  { name: 'aadharBack', maxCount: 1 },
  { name: 'panCard', maxCount: 1 },
  { name: 'electricityBill', maxCount: 1 },
  { name: 'propertyFront', maxCount: 1 },
  { name: 'propertyInside', maxCount: 1 },
  { name: 'propertyTaxReceipt', maxCount: 1 },
  { name: 'bankStatement', maxCount: 1 },
  { name: 'incomeTaxReturnFile', maxCount: 1 },
  { name: 'salarySlipOrOfferLetter', maxCount: 1 },
  { name: 'forBusiness', maxCount: 1 },
  { name: 'propertyPaper', maxCount: 1 },
]), user.CommercialPropertyMortgageDetail);

//  Update Commercial Property Mortgage Loan request
app.put('/api/updateCommercialPropertyMortgageOfferDetail/:id', middleware.CommercialPropertyMortgage.fields([
  { name: 'aadharFront', maxCount: 1 },
  { name: 'aadharBack', maxCount: 1 },
  { name: 'panCard', maxCount: 1 },
  { name: 'electricityBill', maxCount: 1 },
  { name: 'propertyFront', maxCount: 1 },
  { name: 'propertyInside', maxCount: 1 },
  { name: 'propertyTaxReceipt', maxCount: 1 },
  { name: 'bankStatement', maxCount: 1 },
  { name: 'incomeTaxReturnFile', maxCount: 1 },
  { name: 'salarySlipOrOfferLetter', maxCount: 1 },
  { name: 'forBusiness', maxCount: 1 },
  { name: 'propertyPaper', maxCount: 1 },
]), user.updateCommercialPropertyMortgageDetail);

//  Get Commercial Property Mortgage Loan request
app.get('/api/getCommercialPropertyMortgageProperty',user.getCommercialPropertyMortgageDetails);  

//  Get By Id Commercial Property Mortgage Loan request
app.get('/api/getCommercialPropertyMortgagePropertyById/:id',user.getCommercialPropertyMortgageDetailById);  

// ============================================================================================================

// add Balance Transfer
app.post('/api/addBalanceTransferDetail', middleware.balancetransfer.fields([
    { name: "aadharFront", maxCount: 1 },
    { name: "aadharBack", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
    { name: "electricityBillOrRentAgreement", maxCount: 1 },
    { name: "officeShopProof", maxCount: 1 },
    { name: "propertyPhotoFront", maxCount: 1 },
    { name: "propertyPhotoInside", maxCount: 1 },
    { name: "bankStatement", maxCount: 1 },
    { name: "incomeTaxReturnFile", maxCount: 1 },
    { name: "businessProof", maxCount: 1 },
    { name: "loanAccountStatement", maxCount: 1 },
    { name: "listOfDocuments", maxCount: 1 },
    { name: "foreclosureLetter", maxCount: 1 },
]), user.addBalanceTransferDetail);

// update Balance Transfer
app.put('/api/updateBalanceTransferDetail/:id', middleware.balancetransfer.fields([
    { name: "aadharFront", maxCount: 1 },
    { name: "aadharBack", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
    { name: "electricityBillOrRentAgreement", maxCount: 1 },
    { name: "officeShopProof", maxCount: 1 },
    { name: "propertyPhotoFront", maxCount: 1 },
    { name: "propertyPhotoInside", maxCount: 1 },
    { name: "bankStatement", maxCount: 1 },
    { name: "incomeTaxReturnFile", maxCount: 1 },
    { name: "businessProof", maxCount: 1 },
    { name: "loanAccountStatement", maxCount: 1 },
    { name: "listOfDocuments", maxCount: 1 },
    { name: "foreclosureLetter", maxCount: 1 },
]), user.updateBalanceTransferDetail);

//  Get Balance Transfers Loan request
app.get('/api/getBalancetransfersProperty',user.getAllBalanceTransferDetails);

//  Get By Id Balance Transfers Loan request
app.get('/api/getBalancetransfersPropertyById/:id',user.getBalanceTransferById);

// ============================================================================================================
// Balance Transfer Top Up 
// Add Api
app.post('/api/addBalanceTransferTopUpDetail', middleware.balancetransfertopup.fields([
   { name: 'aadharFront', maxCount: 1 },
  { name: 'aadharBack', maxCount: 1 },
  { name: 'panCard', maxCount: 1 },
  { name: 'electricityOrRentAgreement', maxCount: 1 },
  { name: 'officeShopElectricityOrRent', maxCount: 1 },
  { name: 'propertyPhotoFront', maxCount: 1 },
  { name: 'propertyPhotoInside', maxCount: 1 },
  { name: 'bankStatementLastYear', maxCount: 1 },
  { name: 'incomeTaxReturnFile', maxCount: 1 },
  { name: 'forBusinessDocuments', maxCount: 1 },
  { name: 'loanAccountStatement', maxCount: 1 },
  { name: 'listOfDocumentsByBank', maxCount: 1 },
  { name: 'foreclosureLetter', maxCount: 1 }
]), user.addBalanceTransferTopUpDetail);
// Update Api
app.put('/api/updateBalanceTransferTopUpDetail/:id', middleware.balancetransfertopup.fields([
    { name: 'aadharFront', maxCount: 1 },
  { name: 'aadharBack', maxCount: 1 },
  { name: 'panCard', maxCount: 1 },
  { name: 'electricityOrRentAgreement', maxCount: 1 },
  { name: 'officeShopElectricityOrRent', maxCount: 1 },
  { name: 'propertyPhotoFront', maxCount: 1 },
  { name: 'propertyPhotoInside', maxCount: 1 },
  { name: 'bankStatementLastYear', maxCount: 1 },
  { name: 'incomeTaxReturnFile', maxCount: 1 },
  { name: 'forBusinessDocuments', maxCount: 1 },
  { name: 'loanAccountStatement', maxCount: 1 },
  { name: 'listOfDocumentsByBank', maxCount: 1 },
  { name: 'foreclosureLetter', maxCount: 1 }
]), user.updateBalanceTransferTopUpDetail);
// Get Api
app.get('/api/getAllBalancetransfersTopUp',user.getAllBalanceTransferTopUp);
// Get By Id
app.get('/api/getBalancetransfersTopUpById/:id',user.getBalanceTransferTopUpById);

// ============================================================================================================
// add education loan
app.post('/api/addEducationLoan',middleware.educationloan.fields([
    { name: "admissionLetter", maxCount: 1 },
    { name: "previousMarkSheets", maxCount: 1 },
    { name: "feeStructure", maxCount: 1 },
]),user.addEducationLoanApplication)

// add education loan
app.put('/api/updateEducationLoan/:id',middleware.educationloan.fields([
    { name: "admissionLetter", maxCount: 1 },
    { name: "previousMarkSheets", maxCount: 1 },
    { name: "feeStructure", maxCount: 1 },
]),user.updateEducationLoanApplication)

//  Get By Id education loan request
app.get('/api/getEducationLoanById/:id',user.getEducationLoanApplicationById);

//  Get all education loan request
app.get('/api/getAllEducationLoan',user.getAllEducationLoanApplications);

// ==============================================================================================================

// add Gold loan
app.post('/api/addGoldLoan',user.addGoldLoanApplication)
app.put('/api/updateGoldLoan/:id',user.updateGoldLoanApplication)

//  Get By Id Gold loan request
app.get('/api/getGoldLoanById/:id',user.getGoldLoanApplicationById);

//  Get all Gold loan request
app.get('/api/getAllGoldLoan',user.getAllGoldLoanApplications);

// ==============================================================================================================

//  Add Home Renovation Loan request //
    app.post('/api/addHomeRenovationDetail', middleware.homeloanrenovation.fields([
        { name: "aadharFront", maxCount: 1 },
        { name: "aadharBack", maxCount: 1 },
        { name: "panCard", maxCount: 1 },
        { name: "electricityBill", maxCount: 1 },
        { name: "propertyFront", maxCount: 1 },
        { name: "propertyInside", maxCount: 1 },
        { name: "propertyTaxReceipt", maxCount: 1 },
        { name: "bankStatement", maxCount: 1 },
        { name: "incomeTaxReturnFile", maxCount: 1 },
        { name: "salarySlipOrOfferLetter", maxCount: 1 },
        { name: "forBusiness", maxCount: 1 },
        { name: "propertyPaper", maxCount: 1 },
    ]), user.homeRenovationLoanDetail);

//  Update Home Renovation Loan request //
    app.put('/api/updateHomeRenovationDetail/:id', middleware.homeloanrenovation.fields([
        { name: "aadharFront", maxCount: 1 },
        { name: "aadharBack", maxCount: 1 },
        { name: "panCard", maxCount: 1 },
        { name: "electricityBill", maxCount: 1 },
        { name: "propertyFront", maxCount: 1 },
        { name: "propertyInside", maxCount: 1 },
        { name: "propertyTaxReceipt", maxCount: 1 },
        { name: "bankStatement", maxCount: 1 },
        { name: "incomeTaxReturnFile", maxCount: 1 },
        { name: "salarySlipOrOfferLetter", maxCount: 1 },
        { name: "forBusiness", maxCount: 1 },
        { name: "propertyPaper", maxCount: 1 },
    ]), user.updateHomeRenovationLoanDetail);
 
//  Get Home Renovation Loan request
    app.get('/api/getHomeRenovationLoan',user.getHomeRenovationLoanDetails);  

//  Get By Id Home Renovation Loan request
    app.get('/api/getHomeRenovationLoanById/:id',user.getHomeRenovationLoanDetailById); 

// ==============================================================================================================
// Insurance loan                                                    
app.post('/api/addInsuranceLoan', user.addInsuranceLoan);            
app.put('/api/updateInsuranceLoan/:id', user.updateInsuranceLoan);            
app.get('/api/getAllInsuranceLoan', user.getAllInsuranceLoans);      
app.get('/api/getInsuranceLoanById/:id', user.getInsuranceLoanById);      

// Automobile Insurance loan                                                    
app.post('/api/addAutomobileLoan', user.addAutomobileLoan);            
app.put('/api/updateAutomobileLoan/:id', user.updateAutomobileLoan);            
app.get('/api/getAllAutomobileLoan', user.getAllAutomobileLoan);      
app.get('/api/getAutomobileLoanById/:id', user.getAutomobileLoanById);  


// Investment Plan
app.post('/api/addInvestment', user.addInvestment);            
app.put('/api/updateInvestment/:id', user.updateInvestment);            
app.get('/api/getAllInvestment', user.getAllInvestmentPlan);      
app.get('/api/getInvestmentById/:id', user.getInvestmentById); 

// ========================= Our Services ================================

// CA Services
app.post('/api/addCaServices', user.addCaServices);
app.put('/api/update-ca-service/:id', user.updateCaServices);
app.get('/api/getAllCaServices', user.getAllCaServices);

// Real State Services
app.post('/api/addRealStateServices', user.addRealState);
app.put('/api/updateRealStateServices/:id', user.updateRealState);
app.get('/api/getAllRealStateServices', user.getAllRealState);

// DSA Services
app.post('/api/addDsaServices', user.addDsaService);
app.put('/api/updateDsaServices/:id', user.updateDsaService);
app.get('/api/getAllDsaServices', user.getAllDsaService);

// Legal Documentation
app.post('/api/addLegalDocumentationService', user.addLegalDocumentationService);
app.put('/api/updateLegalDocumentationService/:id', user.updateLegalDocumentationService);
app.get('/api/getAllLegalDocumentationService', user.getAllLegalDocumentationService);

// Government Business
app.post('/api/addGovernmentBusinessService', user.addGovernmentBusinessService);
app.put('/api/updateGovernmentBusinessService/:id', user.updateGovernmentBusinessService);
app.get('/api/getAllGovernmentBusinessService', user.getAllGovernmentBusinessService);

// Digital Marketing
app.post('/api/addDigitalMarketingService', user.addDigitalMarketingService);
app.put('/api/updateDigitalMarketingService/:id', user.updateDigitalMarketingService);
app.get('/api/getAllDigitalMarketingService', user.getAllDigitalMarketingService);

// Credit Score
app.post('/api/addCreditScoreService', user.addCreditScoreService);
app.post('/api/checkCreditScore', user.checkCreditScore);
app.put('/api/updateCreditScoreService/:id', user.updateCreditScoreService);
app.get('/api/getAllCreditScoreService', user.getAllCreditScoreService);

// E-Stamp 
app.post('/api/addEStampService', user.addEStampService);
app.put('/api/updateEStampService/:id', user.updateEStampService);
app.get('/api/getAllEStampService', user.getAllEStampService);

// Business Consultation
app.post('/api/addBusinessConsultation', user.addBusinessConsultationService);
app.put('/api/updateBusinessConsultation/:id', user.updateBusinessConsultationService);
app.get('/api/getAllBusinessConsultation', user.getAllBusinessConsultationService);

// ========================= ITR Information ================================
// Submit ITR Information Form
app.post('/api/submitITRInformation', user.submitITRInformation);
// Get all ITR Information (with optional query params: ?formType=job&status=pending)
app.get('/api/getAllITRInformation', user.getAllITRInformation);
// Get ITR Information by ID
app.get('/api/getITRInformationById/:id', user.getITRInformationById);
// Update ITR Information
app.put('/api/updateITRInformation/:id', user.updateITRInformation);
// Delete ITR Information
app.delete('/api/deleteITRInformation/:id', user.deleteITRInformation);

// ========================= MSME Registration ================================
// Submit MSME Registration Form (API 135 - Look here: postman-examples/MSME_API_Guide.md)
app.post('/api/submitMSMERegistration', user.submitMSMERegistration);
// Get all MSME Registrations (API 136 - Look here: postman-examples/MSME_API_Guide.md) (optional query: ?userId=123&organisationType=Proprietor&status=pending)
app.get('/api/getAllMSMERegistrations', user.getAllMSMERegistrations);
// Get MSME Registration by ID
app.get('/api/getMSMERegistrationById/:id', user.getMSMERegistrationById);
// Update MSME Registration
app.put('/api/updateMSMERegistration/:id', user.updateMSMERegistration);
// Delete MSME Registration
app.delete('/api/deleteMSMERegistration/:id', user.deleteMSMERegistration);

// ========================= Gumasta License ================================
// Submit Gumasta License Form (API 137 - Look here: postman-examples/Gumasta_API_Guide.md)
app.post('/api/submitGumastaLicense', user.submitGumastaLicense);
// Get all Gumasta Licenses (API 136 - Look here: postman-examples/Gumasta_API_Guide.md) (optional query: ?userId=123&designation=Owner&status=pending)
app.get('/api/getAllGumastaLicenses', user.getAllGumastaLicenses);
// Get Gumasta License by ID
app.get('/api/getGumastaLicenseById/:id', user.getGumastaLicenseById);
// Update Gumasta License
app.put('/api/updateGumastaLicense/:id', user.updateGumastaLicense);
// Delete Gumasta License
app.delete('/api/deleteGumastaLicense/:id', user.deleteGumastaLicense);

// ========================= Cashfree Payment Gateway ================================
// Create Cashfree order
app.post('/api/cashfree/createOrder', user.createCashfreeOrder);
// Get order by orderId
app.get('/api/cashfree/getOrder/:orderId', user.getCashfreeOrder);
// Get all payments for an order
app.get('/api/cashfree/getPayments/:orderId', user.getCashfreeOrderPayments);
// Webhook callback endpoint from Cashfree dashboard
app.post('/api/cashfree/webhook', express.raw({ type: 'application/json' }), user.cashfreeWebhook);


}






