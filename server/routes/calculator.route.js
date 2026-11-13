module.exports = (app) => {

    const sipController = require('../controllers/sip.controller')

    const carLoan = require('../controllers/calLoanCalculator.controller')

    const fixDeposit = require('../controllers/fixDeposit.controller')

    const ppf = require('../controllers/ppfCalculator.controller')
    
    const mutualFund = require('../controllers/mutualFund.controller')
    
    const gst = require('../controllers/gstCalculator.controller')

    const rdCalc = require('../controllers/rdCalculator.controoler')

     const salary = require('../controllers/salary.controller')

     const ssy = require('../controllers/ssyCalculator.controller')

     const homeLoan = require('../controllers/homeLoan.controller');

    const eligibility = require('../controllers/eligibility.contoller');


    app.post('/api/sipCalculator',sipController.sipCalculator)
  
    app.post('/api/carLoanEMICalculator',carLoan.carLoanEMICalculator)
   
    app.post('/api/fixedDepositCalculator',fixDeposit.fixedDepositCalculator)

    app.post('/api/ppfCalculator',ppf.ppfCalculator)

    app.post('/api/mutualFundOneTimeInvestment',mutualFund.mutualFundOneTimeInvestment)

    app.post('/api/rdCalculator',rdCalc.rdCalculator)

    app.post('/api/gstCalculator',gst.gstCalculator)

    app.post('/api/salaryCalculator',salary.salaryCalculator)

    app.post('/api/sukanyaSamriddhiYojna',ssy.sukanyaSamriddhiYojna)

    app.post('/api/homeLoanCalculator',homeLoan.homeLoanCalculator)

    app.post('/api/eligibilityCalculator',eligibility.eligibilityCalculator)

    






}
