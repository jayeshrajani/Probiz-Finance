const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config/auth.config");
const user = require('../models/user.model');
const LoanOffer = require('../models/homeloan.model');
const CreditCard = require('../models/creditcard.model');
const CarLoanApplication = require('../models/carLoan.model');
const BusinessLoanApplication = require('../models/bloan.model');
const ProjectFundingLoanApplication = require('../models/projectFunding.model');
const ConstructionLoanApplication = require('../models/constructionLoan.model');
const PersonalLoan = require('../models/pLoan.module');
const KisanCredit = require('..//models/kisanCreditCard.model');
const PlotPurchase = require('../models/plotpurchase.model');
const PlotPurchaseConstruction = require('../models/plotPurchaseConstruction.model');
const FlatePurchase = require('../models/flatepurchase.model');
const LoanagainstProperty = require('../models/loanagainstProperty.model');
const CommercialPropertyPurchase = require('../models/commercialPropertyPurchase');
const CommercialPropertyMortagePurchase = require('../models/commercialPropertyMortagePurchase')
const HealthInsurance = require('../models/healthInsurance');
const Investment = require('../models/investment.model');
const Automobile = require('../models/automobile.model');
const PradhanMantri = require('../models/pradhanmantri.model');
const BalanceTransfer = require('../models/balanceTransfer.model');
const EducationLoanApplication = require('../models/education.model')
const GoldLoan = require('../models/gold.model');
const HomeRenovation = require('../models/homerenovation.model');
const CAServices = require('../models/caService.model');
const RealState = require('../models/realState.model');
const DsaService = require('../models/dsaService.model');
const legalDoc = require('../models/legalDoc.model');
const GovernmentBusiness = require('../models/governmentBusi.model');
const DigitalMarketing = require('../models/digitalMarketing.model');
const CreditScore = require('../models/creditScore.model');
const EStamp = require('../models/eStamp.model');
const BusinessConsultation = require('../models/businessConsultation.model');
const BalanceTransferTopUp = require('../models/balanceTransferTopUp.model');
const ITRInformation = require('../models/itrInformation.model');
const MSMERegistration = require('../models/msmeRegistration.model');
const GumastaLicense = require('../models/gumastaLicense.model');


function generateToken(userid) {
  return jwt.sign({ id: userid }, config.secret, { expiresIn: 15552000 });
}

function withoutPassword(doc) {
  const { password, ...rest } = doc.toObject();
  return rest;
}

exports.checkCreditScore = async (req, res) => {
  try {
    const payload = req.body || {};
    return res.status(200).json({
      status: true,
      message: 'Credit score check endpoint is enabled but the external provider is not configured in this environment.',
      data: {
        score: null,
        band: 'unavailable',
        panNumber: payload.panNumber || payload.pan || null,
        mobileNumber: payload.mobileNumber || payload.mobile || null,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to process credit score request', status: 500 });
  }
};

exports.createCashfreeOrder = async (req, res) => {
  try {
    const payload = req.body || {};
    const orderId = `cf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    return res.status(200).json({
      status: 'SUCCESS',
      message: 'Cashfree order stub created successfully.',
      data: {
        orderId,
        orderAmount: payload.orderAmount || 0,
        orderCurrency: payload.orderCurrency || 'INR',
        customerDetails: payload.customerDetails || {},
        paymentSessionId: payload.paymentSessionId || '',
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to create Cashfree order', status: 500 });
  }
};

exports.getCashfreeOrder = async (req, res) => {
  try {
    const { orderId } = req.params || {};
    return res.status(200).json({
      status: 'SUCCESS',
      message: 'Cashfree order lookup stub.',
      data: {
        orderId,
        orderStatus: 'ACTIVE',
        orderAmount: 0,
        orderCurrency: 'INR',
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to fetch Cashfree order', status: 500 });
  }
};

exports.getCashfreeOrderPayments = async (req, res) => {
  try {
    const { orderId } = req.params || {};
    return res.status(200).json({
      status: 'SUCCESS',
      message: 'Cashfree payments lookup stub.',
      data: {
        orderId,
        payments: [],
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to fetch Cashfree payments', status: 500 });
  }
};

exports.cashfreeWebhook = async (req, res) => {
  try {
    if (Buffer.isBuffer(req.body)) {
      const raw = req.body.toString('utf8');
      if (raw) {
        console.log('Cashfree webhook received:', raw.slice(0, 500));
      }
    }
    return res.status(200).send('OK');
  } catch (error) {
    return res.status(500).send('Webhook processing failed');
  }
};

exports.userSignUp = async (req, res) => {
  let user_Email = req.body.user_Email ? req.body.user_Email : "";
  let user_Name = req.body.user_Name ? req.body.user_Name : "";
  let country_code = req.body.country_code ? req.body.country_code : "";

  let mobile_no = req.body.mobile_no ? req.body.mobile_no : "";
  let password = req.body.password ? req.body.password : "";
  let confirmPassword = req.body.confirmPassword
    ? req.body.confirmPassword
    : "";
  var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  var passformat = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s)/;

  try {
    if (user_Email === null || user_Email === "") {
      return res
        .status(400)
        .send({ message: "email is required", status: 200 });
    } else {
      if (!user_Email.match(mailformat)) {
        return res
          .status(400)
          .send({ message: "email is not in correct form", status: 400 });
      } else {
        if (user_Name === "" || user_Name === null) {
          return res
            .status(400)
            .send({ message: "Full name is required", status: 200 });
        } else {
          if (country_code === "" || country_code === null) {
            return res
              .status(400)
              .send({ message: "Country code is required", status: 200 });
          } else {
            if (mobile_no === null || mobile_no === "") {
              return res.status(400).send({
                message: "Mobile Number is required",
                status: 400,
              });
            } else {
              if (mobile_no.length < 7) {
                return res.status(400).send({
                  message: "Mobile number cannot be less than 7 digits. ",
                  status: 400,
                });
              } else {
                if (mobile_no.length > 15) {
                  return res.status(400).send({
                    message:
                      "Mobile numbers cannot be more than 15 digits long.",
                    status: 400,
                  });
                } else {
                  if (isNaN(mobile_no)) {
                    return res.status(400).send({
                      message: "Mobile number must only contains digits",
                      status: 400,
                    });
                  } else {
                    if (password === null || password === "") {
                      return res.status(400).send({
                        message: "Password is required",
                        status: 400,
                      });
                    } else {
                      if (password.length < 8) {
                        return res.status(400).send({
                          message:
                            "Password must be a combination of 8 characters long ( including at least one uppercase and one lowercase letter,a number, and a symbol)",
                          status: 400,
                        });
                      } else {
                        if (!password.match(passformat)) {
                          return res.status(400).send({
                            message:
                              "Password must be a combination of 8 characters long ( including at least one uppercase and one lowercase letter,a number, and a symbol)",
                            status: 400,
                          });
                        } else {
                          if (
                            confirmPassword === "" ||
                            confirmPassword === null
                          ) {
                            return res.status(400).send({
                              message: "confirm password is required",
                              status: 400,
                            });
                          } else {
                            if (confirmPassword !== password) {
                              return res.status(400).send({
                                message:
                                  "password and confirm password are not the same",
                                status: 400,
                              });
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }


    let checkEmail = await user.find({ user_Email: user_Email }).lean();
    if (checkEmail.length > 0) {
      return res
        .status(409)
        .send({ message: "Email already exists", status: 409 });
    }

    let checkMobileNo = await user.find({ mobile_no: mobile_no }).lean();
    if (checkMobileNo.length > 0) {
      return res
        .status(409)
        .send({ message: "Mobile number already exists", status: 409 });
    }

    let data = await user.create({
      user_Email: user_Email,
      user_Name: user_Name,

      country_code: country_code,
      mobile_no: mobile_no,
      password: bcrypt.hashSync(password, 8),
      confirmPassword: confirmPassword,
    });

    return res
      .status(200)
      .send({ data: withoutPassword(data), message: "Success", status: 200 });
  } catch (error) {
    return res
      .status(500)
      .send({ message: error.message, status: 500 });
  }
};
exports.userLogin = async (req, res) => {
  try {
    const user_Email = (req.body.user_Email || '').toLowerCase();
    const password = req.body.password || '';

    // Validation
    if (!user_Email || !password) {
      return res.status(400).send({ message: 'Please provide both email and password.', status: 400 });
    }

    const userData = await user.findOne({ "user_Email": user_Email, deleteFlag: false });

    if (!userData) {
      return res.status(404).send({ message: 'Your email is not registered with us.', status: 404 });
    }

    const passwordIsValid = bcrypt.compareSync(password, userData.password);
    if (!passwordIsValid) {
      return res.status(401).send({ message: 'Please enter a valid password.', status: 401 });
    }

    const token = generateToken(userData._id);
    return res.status(200).send({ accessToken: token, data: withoutPassword(userData), message: 'Login successful!', status: 200 });
  } catch (error) {
    return res.status(500).send({ message: 'Internal server error.', status: 500 });
  }
};
exports.changeUserPassword = async (req, res) => {
  try {
    const usersRegId = req.params.usersRegId;
    const oldPassword = req.body.oldPassword || '';
    const newPassword = req.body.newPassword || '';
    const confirmPassword = req.body.confirmPassword || '';
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s)/;


    // Validate request data
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).send({ message: 'All password fields must be provided', status: 400 });
    } else {
      if (!newPassword.match(passwordRegex)) {
        return res.status(400).send({ message: "Password must be a combination of 8 characters long ( including at least one uppercase and one lowercase letter,a number, and a symbol)", status: 400 });
      }
    }

    if (newPassword !== confirmPassword) {
      return res.status(401).send({ message: 'New password and confirm password do not match', status: 401 });
    }

    const existingUser = await user.findOne({ _id: usersRegId }).lean();
    if (!existingUser) {
      return res.status(404).send({ message: 'User not found', status: 404 });
    }

    const passwordIsValid = bcrypt.compareSync(oldPassword, existingUser.password);
    if (!passwordIsValid) {
      return res.status(401).send({ message: 'Incorrect old password', status: 401 });
    }

    await user.findOneAndUpdate({ _id: usersRegId }, { $set: { password: bcrypt.hashSync(newPassword, 8) } });

    return res.status(200).send({ message: 'Password changed successfully', status: 200 });
  } catch (err) {
    return res.status(500).send({ message: err.message || 'Error changing password', status: 500 });
  }
};
// POST API to handle home loan details
exports.homeLoanDetail = async (req, res) => {
  try {
    console.log("Request files:", req.files); // Debugging log

    // Validate required fields
    const requiredFields = [
      "fullName", "dateOfBirth", "address", "contactNumber"
    ];

    let missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
    }

    // Validate GST number if businessCertificate contains GST
    if (req.body.businessCertificate) {
      const businessCert = req.body.businessCertificate.toString().toLowerCase();
      if (businessCert.includes('gst')) {
        if (!req.body.gstNumber || req.body.gstNumber.trim() === '') {
          return res.status(400).json({ 
            error: 'GST number is required when GST is selected in business certificate' 
          });
        }
        // Validate GST number format (15 characters, alphanumeric)
        const gstNumber = req.body.gstNumber.trim();
        if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstNumber.toUpperCase())) {
          return res.status(400).json({ 
            error: 'Invalid GST number format. GST number should be 15 characters (e.g., 27ABCDE1234F1Z5)' 
          });
        }
      }
    }

    // Create new LoanOffer object
    const loanData = new LoanOffer({
      fullName: req.body.fullName,
      dateOfBirth: req.body.dateOfBirth,
      address: req.body.address,
      contactNumber: req.body.contactNumber,
      alternateContact: req.body.alternateContact || null,
      propertyType: req.body.propertyType,
      propertySize: req.body.propertySize,
      constructionSize: req.body.constructionSize,
      marketValue: req.body.marketValue,
      loanAmount: req.body.loanAmount,
      profession: req.body.profession,
      incomeType: req.body.incomeType,
      monthlyIncome: req.body.monthlyIncome,
      incomeTaxReturn: req.body.incomeTaxReturn || null,
      businessCertificate: req.body.businessCertificate || null,
      gstNumber: req.body.gstNumber ? req.body.gstNumber.toUpperCase().trim() : null,
      cibilScore: req.body.cibilScore,
      otherIncomeSource: req.body.otherIncomeSource || null,
      otherIncomeAmount: req.body.otherIncomeAmount || null,
      uploadedDocuments: {
        aadharFront: req.files?.aadharFront?.[0]?.location || null,
        aadharBack: req.files?.aadharBack?.[0]?.location || null,
        panCard: req.files?.panCard?.[0]?.location || null,
        electricityBill: req.files?.electricityBill?.[0]?.location || null,
        propertyFront: req.files?.propertyFront?.[0]?.location || null,
        propertyInside: req.files?.propertyInside?.[0]?.location || null,
        propertyTaxReceipt: req.files?.propertyTaxReceipt?.[0]?.location || null,
        bankStatement: req.files?.bankStatement?.[0]?.location || null,
        incomeTaxReturnFile: req.files?.incomeTaxReturnFile?.[0]?.location || null,
        salarySlipOrOfferLetter: req.files?.salarySlipOrOfferLetter?.[0]?.location || null,
        forBusiness: req.files?.forBusiness?.[0]?.location || null,
        propertyPaper: req.files?.propertyPaper?.[0]?.location || null,
      }
    });

    console.log("Loan Data:", loanData); // Debugging log before saving
    const savedLoanData = await loanData.save();
    res.status(201).json({ message: "Loan details submitted successfully", data: savedLoanData });

  } catch (error) {
    console.error("Error saving loan details:", error);
    res.status(500).json({ error: error.message });
  }
};

// PUT API to handle home loan details
exports.updateHomeLoanDetailById = async (req, res) => {
  try {
    const { id } = req.params;

    const existingLoan = await LoanOffer.findById(id);
    if (!existingLoan) {
      return res.status(404).json({ success: false, message: "Loan not found" });
    }

    // Validate GST number if businessCertificate contains GST
    const businessCert = req.body.businessCertificate || existingLoan.businessCertificate;
    if (businessCert) {
      const businessCertLower = businessCert.toString().toLowerCase();
      if (businessCertLower.includes('gst')) {
        const gstNumber = req.body.gstNumber || existingLoan.gstNumber;
        if (!gstNumber || gstNumber.trim() === '') {
          return res.status(400).json({ 
            success: false,
            error: 'GST number is required when GST is selected in business certificate' 
          });
        }
        // Validate GST number format (15 characters, alphanumeric)
        if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstNumber.trim().toUpperCase())) {
          return res.status(400).json({ 
            success: false,
            error: 'Invalid GST number format. GST number should be 15 characters (e.g., 27ABCDE1234F1Z5)' 
          });
        }
      }
    }

    // Prepare the updated document
    const updateData = {
      fullName: req.body.fullName || existingLoan.fullName,
      dateOfBirth: req.body.dateOfBirth || existingLoan.dateOfBirth,
      address: req.body.address || existingLoan.address,
      contactNumber: req.body.contactNumber || existingLoan.contactNumber,
      alternateContact: req.body.alternateContact || existingLoan.alternateContact,
      propertyType: req.body.propertyType || existingLoan.propertyType,
      propertySize: req.body.propertySize || existingLoan.propertySize,
      constructionSize: req.body.constructionSize || existingLoan.constructionSize,
      marketValue: req.body.marketValue || existingLoan.marketValue,
      loanAmount: req.body.loanAmount || existingLoan.loanAmount,
      profession: req.body.profession || existingLoan.profession,
      incomeType: req.body.incomeType || existingLoan.incomeType,
      monthlyIncome: req.body.monthlyIncome || existingLoan.monthlyIncome,
      incomeTaxReturn: req.body.incomeTaxReturn || existingLoan.incomeTaxReturn,
      businessCertificate: req.body.businessCertificate || existingLoan.businessCertificate,
      gstNumber: req.body.gstNumber ? req.body.gstNumber.toUpperCase().trim() : (existingLoan.gstNumber || null),
      cibilScore: req.body.cibilScore || existingLoan.cibilScore,
      otherIncomeSource: req.body.otherIncomeSource || existingLoan.otherIncomeSource,
      otherIncomeAmount: req.body.otherIncomeAmount || existingLoan.otherIncomeAmount,

      uploadedDocuments: {
        aadharFront: req.files?.aadharFront?.[0]?.location || existingLoan.uploadedDocuments?.aadharFront || null,
        aadharBack: req.files?.aadharBack?.[0]?.location || existingLoan.uploadedDocuments?.aadharBack || null,
        panCard: req.files?.panCard?.[0]?.location || existingLoan.uploadedDocuments?.panCard || null,
        electricityBill: req.files?.electricityBill?.[0]?.location || existingLoan.uploadedDocuments?.electricityBill || null,
        propertyFront: req.files?.propertyFront?.[0]?.location || existingLoan.uploadedDocuments?.propertyFront || null,
        propertyInside: req.files?.propertyInside?.[0]?.location || existingLoan.uploadedDocuments?.propertyInside || null,
        propertyTaxReceipt: req.files?.propertyTaxReceipt?.[0]?.location || existingLoan.uploadedDocuments?.propertyTaxReceipt || null,
        bankStatement: req.files?.bankStatement?.[0]?.location || existingLoan.uploadedDocuments?.bankStatement || null,
        incomeTaxReturnFile: req.files?.incomeTaxReturnFile?.[0]?.location || existingLoan.uploadedDocuments?.incomeTaxReturnFile || null,
        salarySlipOrOfferLetter: req.files?.salarySlipOrOfferLetter?.[0]?.location || existingLoan.uploadedDocuments?.salarySlipOrOfferLetter || null,
        forBusiness: req.files?.forBusiness?.[0]?.location || existingLoan.uploadedDocuments?.forBusiness || null,
        propertyPaper: req.files?.propertyPaper?.[0]?.location || existingLoan.uploadedDocuments?.propertyPaper || null,
      },
    };

    const updatedLoan = await LoanOffer.findByIdAndUpdate(id, updateData, { new: true });

    res.status(200).json({
      success: true,
      message: "Loan details updated successfully",
      data: updatedLoan,
    });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get Home Loan 
exports.getHomeLoanDetails = async (req, res) => {
  try {
    const loanDetails = await LoanOffer.find();

    if (!loanDetails || loanDetails.length === 0) {
      return res.status(404).json({ message: "No loan details found" });
    }

    res.status(200).json({ message: "Loan details retrieved successfully", data: loanDetails });
  } catch (error) {
    console.error("Error fetching loan details:", error);
    res.status(500).json({ error: error.message });
  }
};
// Get by Id Home Loan
exports.getHomeLoanDetailById = async (req, res) => {
  try {
    const { id } = req.params;
    const loanDetail = await LoanOffer.findById(id);

    if (!loanDetail) {
      return res.status(404).json({ message: "Loan detail not found" });
    }

    res.status(200).json({ message: "Loan detail retrieved successfully", data: loanDetail });
  } catch (error) {
    console.error("Error fetching loan detail:", error);
    res.status(500).json({ error: error.message });
  }
};
// ===================================================================================
// POST API to handle Credit Card details
exports.creditCardDetail = async (req, res) => {
  try {

    // Create new LoanOffer object
    const CardData = new CreditCard({
      fullName: req.body.fullName,
      dateOfBirth: req.body.dateOfBirth,
      address: req.body.address,
      contactNumber: req.body.contactNumber,
      alternateContact: req.body.alternateContact || null,
      profession: req.body.profession,
      monthlyIncome: req.body.monthlyIncome,
      cibilScore: req.body.cibilScore,
      incomeType: req.body.incomeType,
      uploadedDocuments: {
        aadharFront: req.files?.aadharFront?.[0]?.location || null,
        aadharBack: req.files?.aadharBack?.[0]?.location || null,
        panCard: req.files?.panCard?.[0]?.location || null,
        electricityBill: req.files?.electricityBill?.[0]?.location || null,
        bankStatement: req.files?.bankStatement?.[0]?.location || null,
        salarySlipOrOfferLetter: req.files?.salarySlipOrOfferLetter?.[0]?.location || null,

      }
    });

    console.log("Loan Data:", CardData); // Debugging log before saving
    const savedData = await CardData.save();
    res.status(201).json({ message: "Credit Card Detail submitted successfully", data: savedData });

  } catch (error) {
    console.error("Error Credit Card details:", error);
    res.status(500).json({ error: error.message });
  }
};
// PUT API to handle Credit Card details
exports.updateCreditCardDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the existing document
    const existing = await CreditCard.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Credit card application not found" });
    }

    const files = req.files || {};

    // Build updated data
    const updatedData = {
      fullName: req.body.fullName || existing.fullName,
      dateOfBirth: req.body.dateOfBirth || existing.dateOfBirth,
      address: req.body.address || existing.address,
      contactNumber: req.body.contactNumber || existing.contactNumber,
      alternateContact: req.body.alternateContact || existing.alternateContact,
      profession: req.body.profession || existing.profession,
      monthlyIncome: req.body.monthlyIncome || existing.monthlyIncome,
      cibilScore: req.body.cibilScore || existing.cibilScore,
      incomeType: req.body.incomeType || existing.incomeType,
      uploadedDocuments: {
        aadharFront: files?.aadharFront?.[0]?.location || existing.uploadedDocuments?.aadharFront || null,
        aadharBack: files?.aadharBack?.[0]?.location || existing.uploadedDocuments?.aadharBack || null,
        panCard: files?.panCard?.[0]?.location || existing.uploadedDocuments?.panCard || null,
        electricityBill: files?.electricityBill?.[0]?.location || existing.uploadedDocuments?.electricityBill || null,
        bankStatement: files?.bankStatement?.[0]?.location || existing.uploadedDocuments?.bankStatement || null,
        salarySlipOrOfferLetter: files?.salarySlipOrOfferLetter?.[0]?.location || existing.uploadedDocuments?.salarySlipOrOfferLetter || null,
      },
    };

    // Update and return the new document
    const updatedCard = await CreditCard.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      message: "Credit card application updated successfully",
      data: updatedCard,
    });
  } catch (error) {
    console.error("Error updating credit card detail:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// GET API to fetch all credit card details
exports.getCreditCardDetails = async (req, res) => {
  try {
    const creditCards = await CreditCard.find();
    res.status(200).json({ message: "Credit Card Details get successfully", data: creditCards });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Get by Id credit card details
exports.getCreditCardDetailsById = async (req, res) => {
  try {
    const creditCardId = req.params.id;
    const creditCard = await CreditCard.findById(creditCardId);

    if (!creditCard) {
      return res.status(404).json({ message: "Credit Card not found" });
    }

    res.status(200).json({
      message: "Credit Card details get successfully",
      data: creditCard,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// ===================================================================================
// POST API to handle Car Loan details
exports.carLoanDetail = async (req, res) => {
  try {

    // Create new Car Loan Application object
    const newApplication = new CarLoanApplication({
      fullName: req.body.fullName,
      dateOfBirth: req.body.dateOfBirth,
      address: req.body.address,
      contactNumber: req.body.contactNumber,
      alternateContactNumber: req.body.alternateContactNumber || null,
      carType: req.body.carType,
      carBrand: req.body.carBrand,
      brand: req.body.brand,
      yearOfMake: req.body.yearOfMake,
      onRoadPrice: req.body.onRoadPrice,
      loanAmountRequired: req.body.loanAmountRequired,
      profession: req.body.profession,
      incomeType: req.body.incomeType,
      totalMonthlyIncome: req.body.totalMonthlyIncome,
      cibilScore: req.body.cibilScore,
      otherIncomeSource: req.body.otherIncomeSource || null,
      otherIncomeAmount: req.body.otherIncomeSource === "true" ? req.body.otherIncomeAmount : undefined,
      uploadedDocuments: {
        aadharFront: req.files?.aadharFront?.[0]?.location || null,
        aadharBack: req.files?.aadharBack?.[0]?.location || null,
        panCard: req.files?.panCard?.[0]?.location || null,
        electricityBillOrRentAgreement: req.files?.electricityBillOrRentAgreement?.[0]?.location || null,
        carPhoto: req.files?.carPhoto?.[0]?.location || null,
        carRC: req.files?.carRC?.[0]?.location || null,
        carQuotation: req.files?.carQuotation?.[0]?.location || null,
        insurance: req.files?.insurance?.[0]?.location || null,
        bankStatement: req.files?.bankStatement?.[0]?.location || null,
        salarySlipOrOfferLetter: req.files?.salarySlipOrOfferLetter?.[0]?.location || null,
        businessDocuments: req.files?.businessDocuments?.[0]?.location || null,
      }
    });

    console.log("Car Loan Data:", newApplication); // Debugging log before saving
    const savedApplication = await newApplication.save();
    res.status(201).json({ message: "Car Loan Application submitted successfully", data: savedApplication });

  } catch (error) {
    console.error("Error in Car Loan Application:", error);
    res.status(500).json({ error: error.message });
  }
};
// PUT API to handle Car Loan details
exports.updateCarLoanDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await CarLoanApplication.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Car loan application not found" });
    }

    const files = req.files || {};

    const updatedData = {
      fullName: req.body.fullName || existing.fullName,
      dateOfBirth: req.body.dateOfBirth || existing.dateOfBirth,
      address: req.body.address || existing.address,
      contactNumber: req.body.contactNumber || existing.contactNumber,
      alternateContactNumber: req.body.alternateContactNumber || existing.alternateContactNumber,
      carType: req.body.carType || existing.carType,
      carBrand: req.body.carBrand || existing.carBrand,
      brand: req.body.brand || existing.brand,
      yearOfMake: req.body.yearOfMake || existing.yearOfMake,
      onRoadPrice: req.body.onRoadPrice || existing.onRoadPrice,
      loanAmountRequired: req.body.loanAmountRequired || existing.loanAmountRequired,
      profession: req.body.profession || existing.profession,
      incomeType: req.body.incomeType || existing.incomeType,
      totalMonthlyIncome: req.body.totalMonthlyIncome || existing.totalMonthlyIncome,
      cibilScore: req.body.cibilScore || existing.cibilScore,
      otherIncomeSource: req.body.otherIncomeSource ?? existing.otherIncomeSource,
      otherIncomeAmount:
        req.body.otherIncomeSource === "true"
          ? req.body.otherIncomeAmount
          : existing.otherIncomeAmount,
      uploadedDocuments: {
        aadharFront: files?.aadharFront?.[0]?.location || existing.uploadedDocuments?.aadharFront || null,
        aadharBack: files?.aadharBack?.[0]?.location || existing.uploadedDocuments?.aadharBack || null,
        panCard: files?.panCard?.[0]?.location || existing.uploadedDocuments?.panCard || null,
        electricityBillOrRentAgreement: files?.electricityBillOrRentAgreement?.[0]?.location || existing.uploadedDocuments?.electricityBillOrRentAgreement || null,
        carPhoto: files?.carPhoto?.[0]?.location || existing.uploadedDocuments?.carPhoto || null,
        carRC: files?.carRC?.[0]?.location || existing.uploadedDocuments?.carRC || null,
        carQuotation: files?.carQuotation?.[0]?.location || existing.uploadedDocuments?.carQuotation || null,
        insurance: files?.insurance?.[0]?.location || existing.uploadedDocuments?.insurance || null,
        bankStatement: files?.bankStatement?.[0]?.location || existing.uploadedDocuments?.bankStatement || null,
        salarySlipOrOfferLetter: files?.salarySlipOrOfferLetter?.[0]?.location || existing.uploadedDocuments?.salarySlipOrOfferLetter || null,
        businessDocuments: files?.businessDocuments?.[0]?.location || existing.uploadedDocuments?.businessDocuments || null,
      }
    };

    const updatedApplication = await CarLoanApplication.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      message: "Car Loan Application updated successfully",
      data: updatedApplication,
    });
  } catch (error) {
    console.error("Error updating car loan application:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get all car loan applications
exports.getAllCarLoanDetails = async (req, res) => {
  try {
    const carLoans = await CarLoanApplication.find();
    res.status(200).json({ message: "Car Loan Details get successfully", data: carLoans });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Get by Id car loan
exports.getCarLoanById = async (req, res) => {
  try {
    const { id } = req.params;

    const carData = await CarLoanApplication.findById(id);
    if (!carData) {
      return res.status(404).json({ status: 404, message: "Car detail not found" });
    }

    return res.status(200).json({ data: carData, status: 200, message: "Car detail get successfully" });
  } catch (error) {
    return res.status(500).json({ status: 500, error: error.message })
  }
}
// ======================================================================================
// POST API to handle Business Loan details
exports.businessLoanDetail = async (req, res) => {
  try {
    const {
      fullName,
      dateOfBirth,
      address,
      contactNumber,
      alternateContactNumber,
      businessName,

      loanAmountRequired,

      incomeType,
      totalMonthlyIncome,
      incomeTaxReturn,
      businessCertificate,
      cibilScore,
    } = req.body;

    // File paths from uploaded documents
    const uploadedDocs = req.files || {};

    const newApplication = new BusinessLoanApplication({
      fullName,
      dateOfBirth,
      address,
      contactNumber,
      alternateContactNumber,
      businessName,
      loanAmountRequired,
      incomeType,
      totalMonthlyIncome,
      incomeTaxReturn,
      businessCertificate,
      cibilScore,
      uploadedDocuments: {
        aadharFront: uploadedDocs.aadharFront?.[0]?.location || null,
        aadharBack: uploadedDocs.aadharBack?.[0]?.location || null,
        panCard: uploadedDocs.panCard?.[0]?.location || null,
        electricityBillOrRentAgreement: uploadedDocs.electricityBillOrRentAgreement?.[0]?.location || null,
        bankStatement: uploadedDocs.bankStatement?.[0]?.location || null,
        incomeTaxReturnFile: uploadedDocs.incomeTaxReturnFile?.[0]?.location || null,
        businessDocuments: uploadedDocs.businessDocuments?.[0]?.location || null,
      }
    });

    // Save to database
    const savedApplication = await newApplication.save();

    res.status(201).json({ message: "Application submitted successfully", data: savedApplication });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// PUT API to handle Business Loan details
exports.updateBusinessLoanDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const existingApplication = await BusinessLoanApplication.findById(id);

    if (!existingApplication) {
      return res.status(404).json({ error: "Business loan application not found" });
    }

    const uploadedDocs = req.files || {};

    const updatedData = {
      fullName: req.body.fullName || existingApplication.fullName,
      dateOfBirth: req.body.dateOfBirth || existingApplication.dateOfBirth,
      address: req.body.address || existingApplication.address,
      contactNumber: req.body.contactNumber || existingApplication.contactNumber,
      alternateContactNumber: req.body.alternateContactNumber || existingApplication.alternateContactNumber,
      businessName: req.body.businessName || existingApplication.businessName,
      loanAmountRequired: req.body.loanAmountRequired || existingApplication.loanAmountRequired,
      incomeType: req.body.incomeType || existingApplication.incomeType,
      totalMonthlyIncome: req.body.totalMonthlyIncome || existingApplication.totalMonthlyIncome,
      incomeTaxReturn: req.body.incomeTaxReturn || existingApplication.incomeTaxReturn,
      businessCertificate: req.body.businessCertificate || existingApplication.businessCertificate,
      cibilScore: req.body.cibilScore || existingApplication.cibilScore,
      uploadedDocuments: {
        aadharFront: uploadedDocs.aadharFront?.[0]?.location || existingApplication.uploadedDocuments?.aadharFront || null,
        aadharBack: uploadedDocs.aadharBack?.[0]?.location || existingApplication.uploadedDocuments?.aadharBack || null,
        panCard: uploadedDocs.panCard?.[0]?.location || existingApplication.uploadedDocuments?.panCard || null,
        electricityBillOrRentAgreement: uploadedDocs.electricityBillOrRentAgreement?.[0]?.location || existingApplication.uploadedDocuments?.electricityBillOrRentAgreement || null,
        bankStatement: uploadedDocs.bankStatement?.[0]?.location || existingApplication.uploadedDocuments?.bankStatement || null,
        incomeTaxReturnFile: uploadedDocs.incomeTaxReturnFile?.[0]?.location || existingApplication.uploadedDocuments?.incomeTaxReturnFile || null,
        businessDocuments: uploadedDocs.businessDocuments?.[0]?.location || existingApplication.uploadedDocuments?.businessDocuments || null,
      }
    };

    const updatedApplication = await BusinessLoanApplication.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ message: "Business loan application updated successfully", data: updatedApplication });
  } catch (error) {
    console.error("Error updating business loan:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get all business loan applications
exports.getAllBusinessLoanDetails = async (req, res) => {
  try {
    const businessLoans = await BusinessLoanApplication.find();
    res.status(200).json({ message: "Business Loan Details get successfully", data: businessLoans });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Get business loan application by ID
exports.getBusinessLoanById = async (req, res) => {
  try {
    const { id } = req.params;
    const loan = await BusinessLoanApplication.findById(id);
    if (!loan) {
      return res.status(404).json({ message: "Business loan application not found" });
    }
    res.status(200).json({
      message: "Business loan application fetched successfully",
      data: loan,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// =====================================================================================
// POST API to handle Project funding Loan details
exports.projectfundiingLoanDetail = async (req, res) => {
  try {
    const {
      fullName,
      dateOfBirth,
      address,
      contactNumber,
      alternateContactNumber,
      businessName,
      loanAmountRequired,
      incomeType,
      totalMonthlyIncome,
      incomeTaxReturn,
      businessCertificate,
      cibilScore,
    } = req.body;

    // File paths from uploaded documents
    const uploadedDocs = req.files || {};

    const newApplication = new ProjectFundingLoanApplication({
      fullName,
      dateOfBirth,
      address,
      contactNumber,
      alternateContactNumber,
      businessName,
      loanAmountRequired,
      incomeType,
      totalMonthlyIncome,
      incomeTaxReturn,
      businessCertificate,
      cibilScore,
      uploadedDocuments: {
        aadharFront: uploadedDocs?.aadharFront?.[0]?.location || null,
        aadharBack: uploadedDocs?.aadharBack?.[0]?.location || null,
        panCard: uploadedDocs?.panCard?.[0]?.location || null,
        electricityBillOrRentAgreement: uploadedDocs?.electricityBillOrRentAgreement?.[0]?.location || null,
        bankStatement: uploadedDocs?.bankStatement?.[0]?.location || null,
        incomeTaxReturnFile: uploadedDocs?.incomeTaxReturnFile?.[0]?.location || null,
        businessDocuments: uploadedDocs?.businessDocuments?.[0]?.location || null,
      }
    });

    // Save to database
    const savedApplication = await newApplication.save();

    res.status(201).json({ message: "Application submitted successfully", data: savedApplication });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// PUT API to handle Project funding Loan details
exports.updateProjectFundingLoanDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const existingApplication = await ProjectFundingLoanApplication.findById(id);
    if (!existingApplication) {
      return res.status(404).json({ message: "Application not found" });
    }

    const uploadedDocs = req.files || {};

    const updatedData = {
      fullName: req.body.fullName || existingApplication.fullName,
      dateOfBirth: req.body.dateOfBirth || existingApplication.dateOfBirth,
      address: req.body.address || existingApplication.address,
      contactNumber: req.body.contactNumber || existingApplication.contactNumber,
      alternateContactNumber: req.body.alternateContactNumber || existingApplication.alternateContactNumber,
      businessName: req.body.businessName || existingApplication.businessName,
      loanAmountRequired: req.body.loanAmountRequired || existingApplication.loanAmountRequired,
      incomeType: req.body.incomeType || existingApplication.incomeType,
      totalMonthlyIncome: req.body.totalMonthlyIncome || existingApplication.totalMonthlyIncome,
      incomeTaxReturn: req.body.incomeTaxReturn || existingApplication.incomeTaxReturn,
      businessCertificate: req.body.businessCertificate || existingApplication.businessCertificate,
      cibilScore: req.body.cibilScore || existingApplication.cibilScore,
      uploadedDocuments: {
        aadharFront: uploadedDocs?.aadharFront?.[0]?.location || existingApplication.uploadedDocuments?.aadharFront || null,
        aadharBack: uploadedDocs?.aadharBack?.[0]?.location || existingApplication.uploadedDocuments?.aadharBack || null,
        panCard: uploadedDocs?.panCard?.[0]?.location || existingApplication.uploadedDocuments?.panCard || null,
        electricityBillOrRentAgreement: uploadedDocs?.electricityBillOrRentAgreement?.[0]?.location || existingApplication.uploadedDocuments?.electricityBillOrRentAgreement || null,
        bankStatement: uploadedDocs?.bankStatement?.[0]?.location || existingApplication.uploadedDocuments?.bankStatement || null,
        incomeTaxReturnFile: uploadedDocs?.incomeTaxReturnFile?.[0]?.location || existingApplication.uploadedDocuments?.incomeTaxReturnFile || null,
        businessDocuments: uploadedDocs?.businessDocuments?.[0]?.location || existingApplication.uploadedDocuments?.businessDocuments || null
      }
    };

    const updatedApplication = await ProjectFundingLoanApplication.findByIdAndUpdate(
      id,
      updatedData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Application updated successfully",
      data: updatedApplication,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get all Project funding loan applications
exports.getAllProjectfundiingLoanDetails = async (req, res) => {
  try {
    const businessLoans = await ProjectFundingLoanApplication.find();
    res.status(200).json({ message: "Project funding Loan Details get successfully", data: businessLoans });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Get Project funding loan application by ID
exports.getProjectfundiingLoanById = async (req, res) => {
  try {
    const { id } = req.params;
    const loan = await ProjectFundingLoanApplication.findById(id);
    if (!loan) {
      return res.status(404).json({ message: "Project funding loan application not found" });
    }
    res.status(200).json({
      message: "Project funding loan application fetched successfully",
      data: loan,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// =====================================================================================
// POST API to handle construction Loan details
exports.constructionLoanDetail = async (req, res) => {
  try {
    console.log("Request files:", req.files); // Debugging log

    // Validate required fields
    const requiredFields = [
      "fullName", "dateOfBirth", "address", "contactNumber"
    ];

    let missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
    }



    // Create new LoanOffer object
    const loanData = new ConstructionLoanApplication({
      fullName: req.body.fullName,
      dateOfBirth: req.body.dateOfBirth,
      address: req.body.address,
      contactNumber: req.body.contactNumber,
      alternateContact: req.body.alternateContact || null,
      propertyType: req.body.propertyType,
      propertySize: req.body.propertySize,
      constructionSize: req.body.constructionSize,
      marketValue: req.body.marketValue,
      loanAmount: req.body.loanAmount,
      profession: req.body.profession,
      incomeType: req.body.incomeType,
      monthlyIncome: req.body.monthlyIncome,
      incomeTaxReturn: req.body.incomeTaxReturn || null,
      businessCertificate: req.body.businessCertificate || null,
      cibilScore: req.body.cibilScore,
      otherIncomeSource: req.body.otherIncomeSource || null,
      otherIncomeAmount: req.body.otherIncomeAmount || null,
      uploadedDocuments: {
        aadharFront: req.files?.aadharFront?.[0]?.location || null,
        aadharBack: req.files?.aadharBack?.[0]?.location || null,
        panCard: req.files?.panCard?.[0]?.location || null,
        electricityBill: req.files?.electricityBill?.[0]?.location || null,
        propertyFront: req.files?.propertyFront?.[0]?.location || null,
        propertyInside: req.files?.propertyInside?.[0]?.location || null,
        propertyTaxReceipt: req.files?.propertyTaxReceipt?.[0]?.location || null,
        bankStatement: req.files?.bankStatement?.[0]?.location || null,
        incomeTaxReturnFile: req.files?.incomeTaxReturnFile?.[0]?.location || null,
        salarySlipOrOfferLetter: req.files?.salarySlipOrOfferLetter?.[0]?.location || null,
        forBusiness: req.files?.forBusiness?.[0]?.location || null,
        propertyPaper: req.files?.propertyPaper?.[0]?.location || null,
      }
    });

    console.log("Loan Data:", loanData); // Debugging log before saving
    const savedLoanData = await loanData.save();
    res.status(201).json({ message: "Loan details submitted successfully", data: savedLoanData });

  } catch (error) {
    console.error("Error saving loan details:", error);
    res.status(500).json({ error: error.message });
  }
};

// Put api construction loan
exports.updateConstructionLoanDetail = async (req, res) => {
  try {
    const loanId = req.params.id;
    // console.log("Request files:", req.files); // Debugging

    const existingApplication = await ConstructionLoanApplication.findById(loanId);
    if (!existingApplication) {
      return res.status(404).json({ error: "Loan application not found" });
    }

    // Update with fallback to existing values
    existingApplication.fullName = req.body.fullName || existingApplication.fullName;
    existingApplication.dateOfBirth = req.body.dateOfBirth || existingApplication.dateOfBirth;
    existingApplication.address = req.body.address || existingApplication.address;
    existingApplication.contactNumber = req.body.contactNumber || existingApplication.contactNumber;
    existingApplication.alternateContact = req.body.alternateContact || existingApplication.alternateContact;
    existingApplication.propertyType = req.body.propertyType || existingApplication.propertyType;
    existingApplication.propertySize = req.body.propertySize || existingApplication.propertySize;
    existingApplication.constructionSize = req.body.constructionSize || existingApplication.constructionSize;
    existingApplication.marketValue = req.body.marketValue || existingApplication.marketValue;
    existingApplication.loanAmount = req.body.loanAmount || existingApplication.loanAmount;
    existingApplication.profession = req.body.profession || existingApplication.profession;
    existingApplication.incomeType = req.body.incomeType || existingApplication.incomeType;
    existingApplication.monthlyIncome = req.body.monthlyIncome || existingApplication.monthlyIncome;
    existingApplication.incomeTaxReturn = req.body.incomeTaxReturn || existingApplication.incomeTaxReturn;
    existingApplication.businessCertificate = req.body.businessCertificate || existingApplication.businessCertificate;
    existingApplication.cibilScore = req.body.cibilScore || existingApplication.cibilScore;
    existingApplication.otherIncomeSource = req.body.otherIncomeSource || existingApplication.otherIncomeSource;
    existingApplication.otherIncomeAmount = req.body.otherIncomeAmount || existingApplication.otherIncomeAmount;

    // Update uploaded documents
    existingApplication.uploadedDocuments = {
      aadharFront: req.files?.aadharFront?.[0]?.location || existingApplication.uploadedDocuments.aadharFront,
      aadharBack: req.files?.aadharBack?.[0]?.location || existingApplication.uploadedDocuments.aadharBack,
      panCard: req.files?.panCard?.[0]?.location || existingApplication.uploadedDocuments.panCard,
      electricityBill: req.files?.electricityBill?.[0]?.location || existingApplication.uploadedDocuments.electricityBill,
      propertyFront: req.files?.propertyFront?.[0]?.location || existingApplication.uploadedDocuments.propertyFront,
      propertyInside: req.files?.propertyInside?.[0]?.location || existingApplication.uploadedDocuments.propertyInside,
      propertyTaxReceipt: req.files?.propertyTaxReceipt?.[0]?.location || existingApplication.uploadedDocuments.propertyTaxReceipt,
      bankStatement: req.files?.bankStatement?.[0]?.location || existingApplication.uploadedDocuments.bankStatement,
      incomeTaxReturnFile: req.files?.incomeTaxReturnFile?.[0]?.location || existingApplication.uploadedDocuments.incomeTaxReturnFile,
      salarySlipOrOfferLetter: req.files?.salarySlipOrOfferLetter?.[0]?.location || existingApplication.uploadedDocuments.salarySlipOrOfferLetter,
      forBusiness: req.files?.forBusiness?.[0]?.location || existingApplication.uploadedDocuments.forBusiness,
      propertyPaper: req.files?.propertyPaper?.[0]?.location || existingApplication.uploadedDocuments.propertyPaper
    };

    // Save updates
    const updatedApplication = await existingApplication.save();
    res.status(200).json({
      message: "Loan application updated successfully",
      data: updatedApplication,
    });

  } catch (error) {
    console.error("Error updating loan details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// Get all construction loan applications
exports.getAllConstructionLoanDetails = async (req, res) => {
  try {
    const constructionLoans = await ConstructionLoanApplication.find();
    res.status(200).json({ message: "Construction Loan Details get successfully", data: constructionLoans });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Get By Id construction loan applications
exports.getConstructionLoanById = async (req, res) => {
  try {
    const { id } = req.params;
    const constructionLoan = await ConstructionLoanApplication.findById(id);

    if (!constructionLoan) {
      return res.status(404).json({ message: "Construction Loan not found" });
    }

    res.status(200).json({
      message: "Construction Loan fetched successfully",
      data: constructionLoan,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// ====================================================================================
// POST API to handle Personal Loan details
exports.perLoanDetail = async (req, res) => {
  try {
    const {
      fullName,
      dateOfBirth,
      address,
      contactNumber,
      alternateContactNumber,
      companyName,
      reportingManagerName,
      reportingManagerContactNumber,
      residenceType,
      loanAmountRequired,
      profession,
      incomeType,
      monthlySalary,
      incomeTaxReturn,
      cibilScore,
    } = req.body;



    const newApplication = new PersonalLoan({
      fullName,
      dateOfBirth,
      address,
      contactNumber,
      alternateContactNumber,
      companyName,
      reportingManagerName,
      reportingManagerContactNumber,
      residenceType,
      loanAmountRequired,
      profession,
      incomeType,
      monthlySalary,
      incomeTaxReturn,
      cibilScore,
      uploadedDocuments: {
        aadharFront: req.files?.aadharFront?.[0]?.location || null,
        aadharBack: req.files?.aadharBack?.[0]?.location || null,
        panCard: req.files?.panCard?.[0]?.location || null,
        electricityBillOrRentAgreement: req.files?.electricityBillOrRentAgreement?.[0]?.location || null,
        bankStatement: req.files?.bankStatement?.[0]?.location || null,
        salarySlips: req.files?.salarySlips?.[0]?.location || null,
        incomeTaxReturnFile: req.files?.incomeTaxReturnFile?.[0]?.location || null,
        offerLetter: req.files?.offerLetter?.[0]?.location || null,

      }

    });

    // Save to Database
    const savedApplication = await newApplication.save();
    res.status(201).json({ message: "Loan application submitted successfully", data: savedApplication });

  } catch (error) {
    console.error("Error submitting loan application:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
// PUT api to handle Personal Loan details
exports.updatePerLoanDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // Get existing loan data
    const existingLoan = await PersonalLoan.findById(id);
    if (!existingLoan) {
      return res.status(404).json({ error: "Personal loan record not found" });
    }

    // Destructure request body
    const {
      fullName,
      dateOfBirth,
      address,
      contactNumber,
      alternateContactNumber,
      companyName,
      reportingManagerName,
      reportingManagerContactNumber,
      residenceType,
      loanAmountRequired,
      profession,
      incomeType,
      monthlySalary,
      incomeTaxReturn,
      cibilScore,
    } = req.body;

    const updatedData = {
      fullName: fullName || existingLoan.fullName,
      dateOfBirth: dateOfBirth || existingLoan.dateOfBirth,
      address: address || existingLoan.address,
      contactNumber: contactNumber || existingLoan.contactNumber,
      alternateContactNumber: alternateContactNumber || existingLoan.alternateContactNumber,
      companyName: companyName || existingLoan.companyName,
      reportingManagerName: reportingManagerName || existingLoan.reportingManagerName,
      reportingManagerContactNumber: reportingManagerContactNumber || existingLoan.reportingManagerContactNumber,
      residenceType: residenceType || existingLoan.residenceType,
      loanAmountRequired: loanAmountRequired || existingLoan.loanAmountRequired,
      profession: profession || existingLoan.profession,
      incomeType: incomeType || existingLoan.incomeType,
      monthlySalary: monthlySalary || existingLoan.monthlySalary,
      incomeTaxReturn: incomeTaxReturn || existingLoan.incomeTaxReturn,
      cibilScore: cibilScore || existingLoan.cibilScore,
      uploadedDocuments: {
        aadharFront: req.files?.aadharFront?.[0]?.location || existingLoan.uploadedDocuments.aadharFront,
        aadharBack: req.files?.aadharBack?.[0]?.location || existingLoan.uploadedDocuments.aadharBack,
        panCard: req.files?.panCard?.[0]?.location || existingLoan.uploadedDocuments.panCard,
        electricityBillOrRentAgreement: req.files?.electricityBillOrRentAgreement?.[0]?.location || existingLoan.uploadedDocuments.electricityBillOrRentAgreement,
        bankStatement: req.files?.bankStatement?.[0]?.location || existingLoan.uploadedDocuments.bankStatement,
        salarySlips: req.files?.salarySlips?.[0]?.location || existingLoan.uploadedDocuments.salarySlips,
        incomeTaxReturnFile: req.files?.incomeTaxReturnFile?.[0]?.location || existingLoan.uploadedDocuments.incomeTaxReturnFile,
        offerLetter: req.files?.offerLetter?.[0]?.location || existingLoan.uploadedDocuments.offerLetter,
      }
    };

    const updatedLoan = await PersonalLoan.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      message: "Personal loan details updated successfully",
      data: updatedLoan,
    });
  } catch (error) {
    console.error("Error updating personal loan application:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// Get all personal loan applications
exports.getAllPerLoanDetails = async (req, res) => {
  try {
    const loanApplications = await PersonalLoan.find();

    if (loanApplications.length === 0) {
      return res.status(404).json({ message: "No loan applications found" });
    }

    res.status(200).json({ message: "All loan applications get successfully", data: loanApplications });
  } catch (error) {
    console.error("Error retrieving loan applications:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
// Get By Id personal loan 
exports.getPerLoanDetailById = async (req, res) => {
  try {
    const { id } = req.params;

    const loanApplication = await PersonalLoan.findById(id);

    if (!loanApplication) {
      return res.status(404).json({ message: "Loan application not found" });
    }

    res.status(200).json({
      message: "Loan application get successfully",
      data: loanApplication,
    });
  } catch (error) {
    console.error("Error get loan application by ID:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

//  ===================================================================================
// POST API to handle Pradhan Mantri Loan details
exports.pradhanMantriLoanDetail = async (req, res) => {
  try {
    const {
      fullName,
      dateOfBirth,
      address,
      contactNumber,
      alternateContactNumber,
      companyName,
      reportingManagerName,
      reportingManagerContactNumber,
      residenceType,
      loanAmountRequired,
      profession,
      incomeType,
      monthlySalary,
      incomeTaxReturn,
      cibilScore,
    } = req.body;



    const newApplication = new PradhanMantri({
      fullName,
      dateOfBirth,
      address,
      contactNumber,
      alternateContactNumber,
      companyName,
      reportingManagerName,
      reportingManagerContactNumber,
      residenceType,
      loanAmountRequired,
      profession,
      incomeType,
      monthlySalary,
      incomeTaxReturn,
      cibilScore,
      uploadedDocuments: {
        aadharFront: req.files?.aadharFront?.[0]?.location || null,
        aadharBack: req.files?.aadharBack?.[0]?.location || null,
        panCard: req.files?.panCard?.[0]?.location || null,
        electricityBillOrRentAgreement: req.files?.electricityBillOrRentAgreement?.[0]?.location || null,
        bankStatement: req.files?.bankStatement?.[0]?.location || null,
        salarySlips: req.files?.salarySlips?.[0]?.location || null,
        incomeTaxReturnFile: req.files?.incomeTaxReturnFile?.[0]?.location || null,
        offerLetter: req.files?.offerLetter?.[0]?.location || null,

      }

    });

    // Save to Database
    const savedApplication = await newApplication.save();
    res.status(201).json({ message: "Loan application submitted successfully", data: savedApplication });

  } catch (error) {
    console.error("Error submitting loan application:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
// PUT API to handle Pradhan Mantri Loan details
exports.updatePradhanMantriLoanDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const existingApplication = await PradhanMantri.findById(id);
    if (!existingApplication) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Merge new or existing values
    const updatedData = {
      fullName: req.body.fullName || existingApplication.fullName,
      dateOfBirth: req.body.dateOfBirth || existingApplication.dateOfBirth,
      address: req.body.address || existingApplication.address,
      contactNumber: req.body.contactNumber || existingApplication.contactNumber,
      alternateContactNumber: req.body.alternateContactNumber || existingApplication.alternateContactNumber,
      companyName: req.body.companyName || existingApplication.companyName,
      reportingManagerName: req.body.reportingManagerName || existingApplication.reportingManagerName,
      reportingManagerContactNumber: req.body.reportingManagerContactNumber || existingApplication.reportingManagerContactNumber,
      residenceType: req.body.residenceType || existingApplication.residenceType,
      loanAmountRequired: req.body.loanAmountRequired || existingApplication.loanAmountRequired,
      profession: req.body.profession || existingApplication.profession,
      incomeType: req.body.incomeType || existingApplication.incomeType,
      monthlySalary: req.body.monthlySalary || existingApplication.monthlySalary,
      incomeTaxReturn: req.body.incomeTaxReturn || existingApplication.incomeTaxReturn,
      cibilScore: req.body.cibilScore || existingApplication.cibilScore,
      uploadedDocuments: {
        aadharFront: req.files?.aadharFront?.[0]?.location || existingApplication.uploadedDocuments?.aadharFront || null,
        aadharBack: req.files?.aadharBack?.[0]?.location || existingApplication.uploadedDocuments?.aadharBack || null,
        panCard: req.files?.panCard?.[0]?.location || existingApplication.uploadedDocuments?.panCard || null,
        electricityBillOrRentAgreement: req.files?.electricityBillOrRentAgreement?.[0]?.location || existingApplication.uploadedDocuments?.electricityBillOrRentAgreement || null,
        bankStatement: req.files?.bankStatement?.[0]?.location || existingApplication.uploadedDocuments?.bankStatement || null,
        salarySlips: req.files?.salarySlips?.[0]?.location || existingApplication.uploadedDocuments?.salarySlips || null,
        incomeTaxReturnFile: req.files?.incomeTaxReturnFile?.[0]?.location || existingApplication.uploadedDocuments?.incomeTaxReturnFile || null,
        offerLetter: req.files?.offerLetter?.[0]?.location || existingApplication.uploadedDocuments?.offerLetter || null,
      }
    };

    const updatedApplication = await PradhanMantri.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      message: "Pradhan Mantri Loan application updated successfully",
      data: updatedApplication
    });
  } catch (error) {
    console.error("Error updating loan application:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all Pradhan Mantri loan applications
exports.getAllPradhanMantriLoanDetails = async (req, res) => {
  try {
    const loanApplications = await PradhanMantri.find();

    if (loanApplications.length === 0) {
      return res.status(404).json({ message: "No loan applications found" });
    }

    res.status(200).json({ message: "All loan applications get successfully", data: loanApplications });
  } catch (error) {
    console.error("Error retrieving loan applications:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
// Get By Id Pradhan Mantri loan 
exports.getPradhanMantriLoanDetailById = async (req, res) => {
  try {
    const { id } = req.params;

    const loanApplication = await PradhanMantri.findById(id);

    if (!loanApplication) {
      return res.status(404).json({ message: "Loan application not found" });
    }

    res.status(200).json({
      message: "Loan application get successfully",
      data: loanApplication,
    });
  } catch (error) {
    console.error("Error get loan application by ID:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
//  ===================================================================================

// POST API to handle kisan credit Loan details
exports.kisanCreditLoan = async (req, res) => {
  try {
    const {
      fullName,
      dateOfBirth,
      address,
      contactNumber,
      alternateContactNumber,
      residenceType,
      totalLand,
      pawti,
      incomeType,
      monthlySalary,
      incomeTaxReturn,
      cibilScore,
    } = req.body;

    const uploadedDocs = req.files || {};

    const newApplication = new KisanCredit({
      fullName,
      dateOfBirth,
      address,
      contactNumber,
      alternateContactNumber,
      residenceType,
      totalLand,
      pawti: pawti === "true",
      incomeType,
      monthlySalary,
      incomeTaxReturn: incomeTaxReturn === "true",
      cibilScore,
      uploadedDocuments: {
  aadharFront: req.files?.aadharFront?.[0]?.location || null,
  aadharBack: req.files?.aadharBack?.[0]?.location || null,
  panCard: req.files?.panCard?.[0]?.location || null,
  electricityBill: req.files?.electricityBill?.[0]?.location || null,
  bankStatement: req.files?.bankStatement?.[0]?.location || null,
  incomeTaxReturnFile: req.files?.incomeTaxReturnFile?.[0]?.location || null,
  pawti: req.files?.pawti?.[0]?.location || null,
  khasraCopy: req.files?.khasraCopy?.[0]?.location || null,
},
    });

    // Save to database
    const savedApplication = await newApplication.save();

    res.status(201).json({ message: "Application submitted successfully", data: savedApplication });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}

// PUT API to update Kisan Credit Loan details
exports.updateKisanCreditLoan = async (req, res) => {
  try {
    const { id } = req.params; // or use req.params.id depending on your routing

    const existing = await KisanCredit.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Application not found" });
    }

    const uploadedDocs = req.files || {};

    const updatedApplication = await KisanCredit.findByIdAndUpdate(
      id,
      {
        fullName: req.body.fullName || existing.fullName,
        dateOfBirth: req.body.dateOfBirth || existing.dateOfBirth,
        address: req.body.address || existing.address,
        contactNumber: req.body.contactNumber || existing.contactNumber,
        alternateContactNumber: req.body.alternateContactNumber || existing.alternateContactNumber,
        residenceType: req.body.residenceType || existing.residenceType,
        totalLand: req.body.totalLand || existing.totalLand,
        pawti: req.body.pawti === "true" || existing.pawti,
        incomeType: req.body.incomeType || existing.incomeType,
        monthlySalary: req.body.monthlySalary || existing.monthlySalary,
        incomeTaxReturn: req.body.incomeTaxReturn === "true" || existing.incomeTaxReturn,
        cibilScore: req.body.cibilScore || existing.cibilScore,

        uploadedDocuments: {
          aadharFront: uploadedDocs?.aadharFront?.[0]?.location || existing.uploadedDocuments?.aadharFront || null,
          aadharBack: uploadedDocs?.aadharBack?.[0]?.location || existing.uploadedDocuments?.aadharBack || null,
          panCard: uploadedDocs?.panCard?.[0]?.location || existing.uploadedDocuments?.panCard || null,
          electricityBill: uploadedDocs?.electricityBill?.[0]?.location || existing.uploadedDocuments?.electricityBill || null,
          bankStatement: uploadedDocs?.bankStatement?.[0]?.location || existing.uploadedDocuments?.bankStatement || null,
          incomeTaxReturnFile: uploadedDocs?.incomeTaxReturnFile?.[0]?.location || existing.uploadedDocuments?.incomeTaxReturnFile || null,
          pawti: uploadedDocs?.pawti?.[0]?.location || existing.uploadedDocuments?.pawti || null,
          khasraCopy: uploadedDocs?.khasraCopy?.[0]?.location || existing.uploadedDocuments?.khasraCopy || null,
        }
      },
      { new: true }
    );

    res.status(200).json({ message: "Application updated successfully", data: updatedApplication });
  } catch (error) {
    console.error("Error updating Kisan Credit Loan:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get all Kisan Credit loan applications
exports.getAllKisanCreditLoans = async (req, res) => {
  try {
    const loanApplications = await KisanCredit.find();

    if (loanApplications.length === 0) {
      return res.status(404).json({ message: "No Kisan Credit Loan applications found" });
    }

    res.status(200).json({ message: "All Kisan Credit Loan applications retrieved successfully", data: loanApplications });
  } catch (error) {
    console.error("Error retrieving Kisan Credit Loan applications:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
// Get a specific Kisan Credit Loan application by ID
exports.getKisanCreditLoanById = async (req, res) => {
  try {
    const { id } = req.params;

    const loanApplication = await KisanCredit.findById(id);

    if (!loanApplication) {
      return res.status(404).json({ message: "Kisan Credit Loan application not found" });
    }

    res.status(200).json({ message: "Kisan Credit Loan application retrieved successfully", data: loanApplication });
  } catch (error) {
    console.error("Error retrieving Kisan Credit Loan by ID:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ******************************* Plot Purchase Loans ********************************* 

// Add Plot Purchase Loans
exports.PlotPurchaseLoanDetail = async (req, res) => {
  try {
    console.log("Request files:", req.files); // Debugging log

    // Validate required fields
    const requiredFields = [
      "fullName", "dateOfBirth", "address", "contactNumber"
    ];

    let missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
    }

    // Validate uploaded documents


    // Create new LoanOffer object
    const loanData = new PlotPurchase({
      fullName: req.body.fullName,
      dateOfBirth: req.body.dateOfBirth,
      address: req.body.address,
      contactNumber: req.body.contactNumber,
      alternateContact: req.body.alternateContact || null,
      propertyType: req.body.propertyType,
      propertySize: req.body.propertySize,
      constructionSize: req.body.constructionSize,
      marketValue: req.body.marketValue,
      loanAmount: req.body.loanAmount,
      profession: req.body.profession,
      incomeType: req.body.incomeType,
      monthlyIncome: req.body.monthlyIncome,
      incomeTaxReturn: req.body.incomeTaxReturn || null,
      businessCertificate: req.body.businessCertificate || null,
      cibilScore: req.body.cibilScore,
      otherIncomeSource: req.body.otherIncomeSource || null,
      otherIncomeAmount: req.body.otherIncomeAmount || null,
      uploadedDocuments: {
        aadharFront: req.files?.aadharFront?.[0]?.location || null,
        aadharBack: req.files?.aadharBack?.[0]?.location || null,
        panCard: req.files?.panCard?.[0]?.location || null,
        electricityBill: req.files?.electricityBill?.[0]?.location || null,
        propertyFront: req.files?.propertyFront?.[0]?.location || null,
        propertyInside: req.files?.propertyInside?.[0]?.location || null,
        propertyTaxReceipt: req.files?.propertyTaxReceipt?.[0]?.location || null,
        bankStatement: req.files?.bankStatement?.[0]?.location || null,
        incomeTaxReturnFile: req.files?.incomeTaxReturnFile?.[0]?.location || null,
        salarySlipOrOfferLetter: req.files?.salarySlipOrOfferLetter?.[0]?.location || null,
        forBusiness: req.files?.forBusiness?.[0]?.location || null,
        propertyPaper: req.files?.propertyPaper?.[0]?.location || null,
      }
    });

    console.log("Loan Data:", loanData); // Debugging log before saving
    const savedLoanData = await loanData.save();
    res.status(201).json({ message: "Loan details submitted successfully", data: savedLoanData });

  } catch (error) {
    console.error("Error saving loan details:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update Plot Purchase Loans
exports.updatePlotPurchaseLoanById = async (req, res) => {
  try {
    const { id } = req.params;

    const existingData = await PlotPurchase.findById(id);
    if (!existingData) {
      return res.status(404).json({ success: false, message: "Loan not found" });
    }

    const updatedData = {
      fullName: req.body.fullName || existingData.fullName,
      dateOfBirth: req.body.dateOfBirth || existingData.dateOfBirth,
      address: req.body.address || existingData.address,
      contactNumber: req.body.contactNumber || existingData.contactNumber,
      alternateContact: req.body.alternateContact || existingData.alternateContact,
      propertyType: req.body.propertyType || existingData.propertyType,
      propertySize: req.body.propertySize || existingData.propertySize,
      constructionSize: req.body.constructionSize || existingData.constructionSize,
      marketValue: req.body.marketValue || existingData.marketValue,
      loanAmount: req.body.loanAmount || existingData.loanAmount,
      profession: req.body.profession || existingData.profession,
      incomeType: req.body.incomeType || existingData.incomeType,
      monthlyIncome: req.body.monthlyIncome || existingData.monthlyIncome,
      incomeTaxReturn: req.body.incomeTaxReturn || existingData.incomeTaxReturn,
      businessCertificate: req.body.businessCertificate || existingData.businessCertificate,
      cibilScore: req.body.cibilScore || existingData.cibilScore,
      otherIncomeSource: req.body.otherIncomeSource || existingData.otherIncomeSource,
      otherIncomeAmount: req.body.otherIncomeAmount || existingData.otherIncomeAmount,

      uploadedDocuments: {
        aadharFront: req.files?.aadharFront?.[0]?.location || existingData.uploadedDocuments?.aadharFront || null,
        aadharBack: req.files?.aadharBack?.[0]?.location || existingData.uploadedDocuments?.aadharBack || null,
        panCard: req.files?.panCard?.[0]?.location || existingData.uploadedDocuments?.panCard || null,
        electricityBill: req.files?.electricityBill?.[0]?.location || existingData.uploadedDocuments?.electricityBill || null,
        propertyFront: req.files?.propertyFront?.[0]?.location || existingData.uploadedDocuments?.propertyFront || null,
        propertyInside: req.files?.propertyInside?.[0]?.location || existingData.uploadedDocuments?.propertyInside || null,
        propertyTaxReceipt: req.files?.propertyTaxReceipt?.[0]?.location || existingData.uploadedDocuments?.propertyTaxReceipt || null,
        bankStatement: req.files?.bankStatement?.[0]?.location || existingData.uploadedDocuments?.bankStatement || null,
        incomeTaxReturnFile: req.files?.incomeTaxReturnFile?.[0]?.location || existingData.uploadedDocuments?.incomeTaxReturnFile || null,
        salarySlipOrOfferLetter: req.files?.salarySlipOrOfferLetter?.[0]?.location || existingData.uploadedDocuments?.salarySlipOrOfferLetter || null,
        forBusiness: req.files?.forBusiness?.[0]?.location || existingData.uploadedDocuments?.forBusiness || null,
        propertyPaper: req.files?.propertyPaper?.[0]?.location || existingData.uploadedDocuments?.propertyPaper || null,
      },
    };

    const updatedLoan = await PlotPurchase.findByIdAndUpdate(id, updatedData, { new: true });

    res.status(200).json({
      success: true,
      message: "Loan details updated successfully",
      data: updatedLoan,
    });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get Plot Purchase Loans
exports.getPlotPurchaseLoanDetails = async (req, res) => {
  try {
    const loanDetails = await PlotPurchase.find();

    if (!loanDetails || loanDetails.length === 0) {
      return res.status(404).json({ message: "No loan details found" });
    }

    res.status(200).json({ message: "Loan details retrieved successfully", data: loanDetails });
  } catch (error) {
    console.error("Error fetching loan details:", error);
    res.status(500).json({ error: error.message });
  }
};
// Get by Id Plot Purchase Loans
exports.getPlotPurchaseLoanDetailById = async (req, res) => {
  try {
    const { id } = req.params;
    const loanDetail = await PlotPurchase.findById(id);

    if (!loanDetail) {
      return res.status(404).json({ message: "Loan detail not found" });
    }

    res.status(200).json({ message: "Loan detail retrieved successfully", data: loanDetail });
  } catch (error) {
    console.error("Error fetching loan detail:", error);
    res.status(500).json({ error: error.message });
  }
};

// ************************************** plot purchase construction *********************

// Add Plot Purchase Construction Loans
exports.PlotPurchaseConstructionLoanDetail = async (req, res) => {
  try {
    console.log("Request files:", req.files); // Debugging log

    // Validate required fields
    const requiredFields = [
      "fullName", "dateOfBirth", "address", "contactNumber"
    ];

    let missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
    }

    // Create new LoanOffer object
    const loanData = new PlotPurchaseConstruction({
      fullName: req.body.fullName,
      dateOfBirth: req.body.dateOfBirth,
      address: req.body.address,
      contactNumber: req.body.contactNumber,
      alternateContact: req.body.alternateContact || null,
      propertyType: req.body.propertyType,
      propertySize: req.body.propertySize,
      constructionSize: req.body.constructionSize,
      marketValue: req.body.marketValue,
      loanAmount: req.body.loanAmount,
      profession: req.body.profession,
      incomeType: req.body.incomeType,
      monthlyIncome: req.body.monthlyIncome,
      incomeTaxReturn: req.body.incomeTaxReturn || null,
      businessCertificate: req.body.businessCertificate || null,
      cibilScore: req.body.cibilScore,
      otherIncomeSource: req.body.otherIncomeSource || null,
      otherIncomeAmount: req.body.otherIncomeAmount || null,
      uploadedDocuments: {
        aadharFront: req.files?.aadharFront?.[0]?.location || null,
        aadharBack: req.files?.aadharBack?.[0]?.location || null,
        panCard: req.files?.panCard?.[0]?.location || null,
        electricityBill: req.files?.electricityBill?.[0]?.location || null,
        propertyFront: req.files?.propertyFront?.[0]?.location || null,
        propertyInside: req.files?.propertyInside?.[0]?.location || null,
        propertyTaxReceipt: req.files?.propertyTaxReceipt?.[0]?.location || null,
        bankStatement: req.files?.bankStatement?.[0]?.location || null,
        incomeTaxReturnFile: req.files?.incomeTaxReturnFile?.[0]?.location || null,
        salarySlipOrOfferLetter: req.files?.salarySlipOrOfferLetter?.[0]?.location || null,
        forBusiness: req.files?.forBusiness?.[0]?.location || null,
        propertyPaper: req.files?.propertyPaper?.[0]?.location || null,
      }
    });

    console.log("Loan Data:", loanData); // Debugging log before saving
    const savedLoanData = await loanData.save();
    res.status(201).json({ message: "Loan details submitted successfully", data: savedLoanData });

  } catch (error) {
    console.error("Error saving loan details:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update Plot Purchase Construction Loans
exports.updatePlotPurchaseConstructionLoanById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch existing loan data
    const existingData = await PlotPurchaseConstruction.findById(id);
    if (!existingData) {
      return res.status(404).json({ success: false, message: "Loan not found" });
    }

    // Prepare updated data
    const updatedData = {
      fullName: req.body.fullName || existingData.fullName,
      dateOfBirth: req.body.dateOfBirth || existingData.dateOfBirth,
      address: req.body.address || existingData.address,
      contactNumber: req.body.contactNumber || existingData.contactNumber,
      alternateContact: req.body.alternateContact || existingData.alternateContact,
      propertyType: req.body.propertyType || existingData.propertyType,
      propertySize: req.body.propertySize || existingData.propertySize,
      constructionSize: req.body.constructionSize || existingData.constructionSize,
      marketValue: req.body.marketValue || existingData.marketValue,
      loanAmount: req.body.loanAmount || existingData.loanAmount,
      profession: req.body.profession || existingData.profession,
      incomeType: req.body.incomeType || existingData.incomeType,
      monthlyIncome: req.body.monthlyIncome || existingData.monthlyIncome,
      incomeTaxReturn: req.body.incomeTaxReturn || existingData.incomeTaxReturn,
      businessCertificate: req.body.businessCertificate || existingData.businessCertificate,
      cibilScore: req.body.cibilScore || existingData.cibilScore,
      otherIncomeSource: req.body.otherIncomeSource || existingData.otherIncomeSource,
      otherIncomeAmount: req.body.otherIncomeAmount || existingData.otherIncomeAmount,
      uploadedDocuments: {
        aadharFront: req.files?.aadharFront?.[0]?.location || existingData.uploadedDocuments?.aadharFront || null,
        aadharBack: req.files?.aadharBack?.[0]?.location || existingData.uploadedDocuments?.aadharBack || null,
        panCard: req.files?.panCard?.[0]?.location || existingData.uploadedDocuments?.panCard || null,
        electricityBill: req.files?.electricityBill?.[0]?.location || existingData.uploadedDocuments?.electricityBill || null,
        propertyFront: req.files?.propertyFront?.[0]?.location || existingData.uploadedDocuments?.propertyFront || null,
        propertyInside: req.files?.propertyInside?.[0]?.location || existingData.uploadedDocuments?.propertyInside || null,
        propertyTaxReceipt: req.files?.propertyTaxReceipt?.[0]?.location || existingData.uploadedDocuments?.propertyTaxReceipt || null,
        bankStatement: req.files?.bankStatement?.[0]?.location || existingData.uploadedDocuments?.bankStatement || null,
        incomeTaxReturnFile: req.files?.incomeTaxReturnFile?.[0]?.location || existingData.uploadedDocuments?.incomeTaxReturnFile || null,
        salarySlipOrOfferLetter: req.files?.salarySlipOrOfferLetter?.[0]?.location || existingData.uploadedDocuments?.salarySlipOrOfferLetter || null,
        forBusiness: req.files?.forBusiness?.[0]?.location || existingData.uploadedDocuments?.forBusiness || null,
        propertyPaper: req.files?.propertyPaper?.[0]?.location || existingData.uploadedDocuments?.propertyPaper || null,
      }
    };

    // Update the document
    const updatedLoan = await PlotPurchaseConstruction.findByIdAndUpdate(id, updatedData, { new: true });

    res.status(200).json({
      success: true,
      message: "Loan details updated successfully",
      data: updatedLoan,
    });
  } catch (error) {
    console.error("Error updating loan:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get Plot Purchase Construction Loans
exports.getPlotPurchaseConstructionLoanDetails = async (req, res) => {
  try {
    const loanDetails = await PlotPurchaseConstruction.find();

    if (!loanDetails || loanDetails.length === 0) {
      return res.status(404).json({ message: "No loan details found" });
    }

    res.status(200).json({ message: "Loan details retrieved successfully", data: loanDetails });
  } catch (error) {
    console.error("Error fetching loan details:", error);
    res.status(500).json({ error: error.message });
  }
};
// Get by Id Plot Purchase Construction Loans
exports.getPlotPurchaseConstructionLoanDetailById = async (req, res) => {
  try {
    const { id } = req.params;
    const loanDetail = await PlotPurchaseConstruction.findById(id);

    if (!loanDetail) {
      return res.status(404).json({ message: "Loan detail not found" });
    }

    res.status(200).json({ message: "Loan detail retrieved successfully", data: loanDetail });
  } catch (error) {
    console.error("Error fetching loan detail:", error);
    res.status(500).json({ error: error.message });
  }
};

// ************************************** Flate Purchase *********************************

// Add Flate Purchase Loans
exports.FlatePurchaseLoanDetail = async (req, res) => {
  try {
    console.log("Request files:", req.files); // Debugging log

    // Validate required fields
    const requiredFields = [
      "fullName", "dateOfBirth", "address", "contactNumber"
    ];

    let missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
    }

    // Validate uploaded documents


    // Create new LoanOffer object
    const loanData = new FlatePurchase({
      fullName: req.body.fullName,
      dateOfBirth: req.body.dateOfBirth,
      address: req.body.address,
      contactNumber: req.body.contactNumber,
      alternateContact: req.body.alternateContact || null,
      propertyType: req.body.propertyType,
      propertySize: req.body.propertySize,
      constructionSize: req.body.constructionSize,
      marketValue: req.body.marketValue,
      loanAmount: req.body.loanAmount,
      profession: req.body.profession,
      incomeType: req.body.incomeType,
      monthlyIncome: req.body.monthlyIncome,
      incomeTaxReturn: req.body.incomeTaxReturn || null,
      businessCertificate: req.body.businessCertificate || null,
      cibilScore: req.body.cibilScore,
      otherIncomeSource: req.body.otherIncomeSource || null,
      otherIncomeAmount: req.body.otherIncomeAmount || null,
      uploadedDocuments: {
        aadharFront: req.files?.aadharFront?.[0]?.location || null,
        aadharBack: req.files?.aadharBack?.[0]?.location || null,
        panCard: req.files?.panCard?.[0]?.location || null,
        electricityBill: req.files?.electricityBill?.[0]?.location || null,
        propertyFront: req.files?.propertyFront?.[0]?.location || null,
        propertyInside: req.files?.propertyInside?.[0]?.location || null,
        propertyTaxReceipt: req.files?.propertyTaxReceipt?.[0]?.location || null,
        bankStatement: req.files?.bankStatement?.[0]?.location || null,
        incomeTaxReturnFile: req.files?.incomeTaxReturnFile?.[0]?.location || null,
        salarySlipOrOfferLetter: req.files?.salarySlipOrOfferLetter?.[0]?.location || null,
        forBusiness: req.files?.forBusiness?.[0]?.location || null,
        propertyPaper: req.files?.propertyPaper?.[0]?.location || null,
      }
    });

    console.log("Loan Data:", loanData); // Debugging log before saving
    const savedLoanData = await loanData.save();
    res.status(201).json({ message: "Loan details submitted successfully", data: savedLoanData });

  } catch (error) {
    console.error("Error saving loan details:", error);
    res.status(500).json({ error: error.message });
  }
};
// Update Flate Purchase Loans
exports.updateFlatePurchaseLoanDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // Find existing loan by ID
    const existingLoan = await FlatePurchase.findById(id);
    if (!existingLoan) {
      return res.status(404).json({ error: "Loan not found" });
    }

    // Prepare updated fields
    const updatedFields = {
      fullName: req.body.fullName || existingLoan.fullName,
      dateOfBirth: req.body.dateOfBirth || existingLoan.dateOfBirth,
      address: req.body.address || existingLoan.address,
      contactNumber: req.body.contactNumber || existingLoan.contactNumber,
      alternateContact: req.body.alternateContact || existingLoan.alternateContact,
      propertyType: req.body.propertyType || existingLoan.propertyType,
      propertySize: req.body.propertySize || existingLoan.propertySize,
      constructionSize: req.body.constructionSize || existingLoan.constructionSize,
      marketValue: req.body.marketValue || existingLoan.marketValue,
      loanAmount: req.body.loanAmount || existingLoan.loanAmount,
      profession: req.body.profession || existingLoan.profession,
      incomeType: req.body.incomeType || existingLoan.incomeType,
      monthlyIncome: req.body.monthlyIncome || existingLoan.monthlyIncome,
      incomeTaxReturn: req.body.incomeTaxReturn || existingLoan.incomeTaxReturn,
      businessCertificate: req.body.businessCertificate || existingLoan.businessCertificate,
      cibilScore: req.body.cibilScore || existingLoan.cibilScore,
      otherIncomeSource: req.body.otherIncomeSource || existingLoan.otherIncomeSource,
      otherIncomeAmount: req.body.otherIncomeAmount || existingLoan.otherIncomeAmount,
      uploadedDocuments: {
        aadharFront: req.files?.aadharFront?.[0]?.location || existingLoan.uploadedDocuments?.aadharFront || null,
        aadharBack: req.files?.aadharBack?.[0]?.location || existingLoan.uploadedDocuments?.aadharBack || null,
        panCard: req.files?.panCard?.[0]?.location || existingLoan.uploadedDocuments?.panCard || null,
        electricityBill: req.files?.electricityBill?.[0]?.location || existingLoan.uploadedDocuments?.electricityBill || null,
        propertyFront: req.files?.propertyFront?.[0]?.location || existingLoan.uploadedDocuments?.propertyFront || null,
        propertyInside: req.files?.propertyInside?.[0]?.location || existingLoan.uploadedDocuments?.propertyInside || null,
        propertyTaxReceipt: req.files?.propertyTaxReceipt?.[0]?.location || existingLoan.uploadedDocuments?.propertyTaxReceipt || null,
        bankStatement: req.files?.bankStatement?.[0]?.location || existingLoan.uploadedDocuments?.bankStatement || null,
        incomeTaxReturnFile: req.files?.incomeTaxReturnFile?.[0]?.location || existingLoan.uploadedDocuments?.incomeTaxReturnFile || null,
        salarySlipOrOfferLetter: req.files?.salarySlipOrOfferLetter?.[0]?.location || existingLoan.uploadedDocuments?.salarySlipOrOfferLetter || null,
        forBusiness: req.files?.forBusiness?.[0]?.location || existingLoan.uploadedDocuments?.forBusiness || null,
        propertyPaper: req.files?.propertyPaper?.[0]?.location || existingLoan.uploadedDocuments?.propertyPaper || null,
      }
    };

    // Update in DB
    const updatedLoan = await FlatePurchase.findByIdAndUpdate(id, updatedFields, { new: true });

    res.status(200).json({ message: "Loan details updated successfully", data: updatedLoan });

  } catch (error) {
    console.error("Error updating loan details:", error);
    res.status(500).json({ error: error.message });
  }
};
// Get Flate Purchase Loans
exports.getFlatePurchaseLoanDetails = async (req, res) => {
  try {
    const loanDetails = await FlatePurchase.find();

    if (!loanDetails || loanDetails.length === 0) {
      return res.status(404).json({ message: "No loan details found" });
    }

    res.status(200).json({ message: "Loan details retrieved successfully", data: loanDetails });
  } catch (error) {
    console.error("Error fetching loan details:", error);
    res.status(500).json({ error: error.message });
  }
};
// Get by Id Flate Purchase Loans
exports.getFlatePurchaseLoanDetailById = async (req, res) => {
  try {
    const { id } = req.params;
    const loanDetail = await FlatePurchase.findById(id);

    if (!loanDetail) {
      return res.status(404).json({ message: "Loan detail not found" });
    }

    res.status(200).json({ message: "Loan detail retrieved successfully", data: loanDetail });
  } catch (error) {
    console.error("Error fetching loan detail:", error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================================

// Add Loan against Property Loans
exports.LoanagainstPropertyDetail = async (req, res) => {
  try {
    console.log("Request files:", req.files); // Debugging log

    // Validate required fields
    const requiredFields = [
      "fullName", "dateOfBirth", "address", "contactNumber"
    ];

    let missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
    }

    // Validate uploaded documents


    // Create new LoanOffer object
    const loanData = new LoanagainstProperty({
      fullName: req.body.fullName,
      dateOfBirth: req.body.dateOfBirth,
      address: req.body.address,
      contactNumber: req.body.contactNumber,
      alternateContact: req.body.alternateContact || null,
      propertyType: req.body.propertyType,
      propertySize: req.body.propertySize,
      constructionSize: req.body.constructionSize,
      marketValue: req.body.marketValue,
      loanAmount: req.body.loanAmount,
      profession: req.body.profession,
      incomeType: req.body.incomeType,
      monthlyIncome: req.body.monthlyIncome,
      incomeTaxReturn: req.body.incomeTaxReturn || null,
      businessCertificate: req.body.businessCertificate || null,
      cibilScore: req.body.cibilScore,
      otherIncomeSource: req.body.otherIncomeSource || null,
      otherIncomeAmount: req.body.otherIncomeAmount || null,
      uploadedDocuments: {
        aadharFront: req.files?.aadharFront?.[0]?.location || null,
        aadharBack: req.files?.aadharBack?.[0]?.location || null,
        panCard: req.files?.panCard?.[0]?.location || null,
        electricityBill: req.files?.electricityBill?.[0]?.location || null,
        propertyFront: req.files?.propertyFront?.[0]?.location || null,
        propertyInside: req.files?.propertyInside?.[0]?.location || null,
        propertyTaxReceipt: req.files?.propertyTaxReceipt?.[0]?.location || null,
        bankStatement: req.files?.bankStatement?.[0]?.location || null,
        incomeTaxReturnFile: req.files?.incomeTaxReturnFile?.[0]?.location || null,
        salarySlipOrOfferLetter: req.files?.salarySlipOrOfferLetter?.[0]?.location || null,
        forBusiness: req.files?.forBusiness?.[0]?.location || null,
        propertyPaper: req.files?.propertyPaper?.[0]?.location || null,
      }
    });

    console.log("Loan Data:", loanData); // Debugging log before saving
    const savedLoanData = await loanData.save();
    res.status(201).json({ message: "Loan details submitted successfully", data: savedLoanData });

  } catch (error) {
    console.error("Error saving loan details:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update Loan against Property Loans
exports.updateLoanAgainstPropertyDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const existingLoan = await LoanagainstProperty.findById(id);
    if (!existingLoan) {
      return res.status(404).json({ error: "Loan not found" });
    }

    // Prepare updated fields
    const updatedFields = {
      fullName: req.body.fullName || existingLoan.fullName,
      dateOfBirth: req.body.dateOfBirth || existingLoan.dateOfBirth,
      address: req.body.address || existingLoan.address,
      contactNumber: req.body.contactNumber || existingLoan.contactNumber,
      alternateContact: req.body.alternateContact || existingLoan.alternateContact,
      propertyType: req.body.propertyType || existingLoan.propertyType,
      propertySize: req.body.propertySize || existingLoan.propertySize,
      constructionSize: req.body.constructionSize || existingLoan.constructionSize,
      marketValue: req.body.marketValue || existingLoan.marketValue,
      loanAmount: req.body.loanAmount || existingLoan.loanAmount,
      profession: req.body.profession || existingLoan.profession,
      incomeType: req.body.incomeType || existingLoan.incomeType,
      monthlyIncome: req.body.monthlyIncome || existingLoan.monthlyIncome,
      incomeTaxReturn: req.body.incomeTaxReturn || existingLoan.incomeTaxReturn,
      businessCertificate: req.body.businessCertificate || existingLoan.businessCertificate,
      cibilScore: req.body.cibilScore || existingLoan.cibilScore,
      otherIncomeSource: req.body.otherIncomeSource || existingLoan.otherIncomeSource,
      otherIncomeAmount: req.body.otherIncomeAmount || existingLoan.otherIncomeAmount,
      uploadedDocuments: {
        aadharFront: req.files?.aadharFront?.[0]?.location || existingLoan.uploadedDocuments?.aadharFront || null,
        aadharBack: req.files?.aadharBack?.[0]?.location || existingLoan.uploadedDocuments?.aadharBack || null,
        panCard: req.files?.panCard?.[0]?.location || existingLoan.uploadedDocuments?.panCard || null,
        electricityBill: req.files?.electricityBill?.[0]?.location || existingLoan.uploadedDocuments?.electricityBill || null,
        propertyFront: req.files?.propertyFront?.[0]?.location || existingLoan.uploadedDocuments?.propertyFront || null,
        propertyInside: req.files?.propertyInside?.[0]?.location || existingLoan.uploadedDocuments?.propertyInside || null,
        propertyTaxReceipt: req.files?.propertyTaxReceipt?.[0]?.location || existingLoan.uploadedDocuments?.propertyTaxReceipt || null,
        bankStatement: req.files?.bankStatement?.[0]?.location || existingLoan.uploadedDocuments?.bankStatement || null,
        incomeTaxReturnFile: req.files?.incomeTaxReturnFile?.[0]?.location || existingLoan.uploadedDocuments?.incomeTaxReturnFile || null,
        salarySlipOrOfferLetter: req.files?.salarySlipOrOfferLetter?.[0]?.location || existingLoan.uploadedDocuments?.salarySlipOrOfferLetter || null,
        forBusiness: req.files?.forBusiness?.[0]?.location || existingLoan.uploadedDocuments?.forBusiness || null,
        propertyPaper: req.files?.propertyPaper?.[0]?.location || existingLoan.uploadedDocuments?.propertyPaper || null,
      }
    };

    const updatedLoan = await LoanagainstProperty.findByIdAndUpdate(id, updatedFields, { new: true });

    res.status(200).json({ message: "Loan details updated successfully", data: updatedLoan });
  } catch (error) {
    console.error("Error updating loan details:", error);
    res.status(500).json({ error: error.message });
  }
};
// Get Loan against Property Loans
exports.getLoanagainstPropertyDetails = async (req, res) => {
  try {
    const loanDetails = await LoanagainstProperty.find();

    if (!loanDetails || loanDetails.length === 0) {
      return res.status(404).json({ message: "No loan details found" });
    }

    res.status(200).json({ message: "Loan details retrieved successfully", data: loanDetails });
  } catch (error) {
    console.error("Error fetching loan details:", error);
    res.status(500).json({ error: error.message });
  }
};
// Get by Id Loan against Property Loans
exports.getLoanagainstPropertyDetailById = async (req, res) => {
  try {
    const { id } = req.params;
    const loanDetail = await LoanagainstProperty.findById(id);

    if (!loanDetail) {
      return res.status(404).json({ message: "Loan detail not found" });
    }

    res.status(200).json({ message: "Loan detail retrieved successfully", data: loanDetail });
  } catch (error) {
    console.error("Error fetching loan detail:", error);
    res.status(500).json({ error: error.message });
  }
};

// ===============================================================================================

// Add Commercial Property Purchase Loans
exports.CommercialPropertyPurchaseDetail = async (req, res) => {
  try {
    console.log("Request files:", req.files); // Debugging log

    // Validate required fields
    const requiredFields = [
      "fullName", "dateOfBirth", "address", "contactNumber"
    ];

    let missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
    }

    // Validate uploaded documents


    // Create new LoanOffer object
    const loanData = new CommercialPropertyPurchase({
      fullName: req.body.fullName,
      dateOfBirth: req.body.dateOfBirth,
      address: req.body.address,
      contactNumber: req.body.contactNumber,
      alternateContact: req.body.alternateContact || null,
      propertyType: req.body.propertyType,
      propertySize: req.body.propertySize,
      constructionSize: req.body.constructionSize,
      marketValue: req.body.marketValue,
      loanAmount: req.body.loanAmount,
      profession: req.body.profession,
      incomeType: req.body.incomeType,
      monthlyIncome: req.body.monthlyIncome,
      incomeTaxReturn: req.body.incomeTaxReturn || null,
      businessCertificate: req.body.businessCertificate || null,
      cibilScore: req.body.cibilScore,
      otherIncomeSource: req.body.otherIncomeSource || null,
      otherIncomeAmount: req.body.otherIncomeAmount || null,
      uploadedDocuments: {
        aadharFront: req.files?.aadharFront?.[0]?.location || null,
        aadharBack: req.files?.aadharBack?.[0]?.location || null,
        panCard: req.files?.panCard?.[0]?.location || null,
        electricityBill: req.files?.electricityBill?.[0]?.location || null,
        propertyFront: req.files?.propertyFront?.[0]?.location || null,
        propertyInside: req.files?.propertyInside?.[0]?.location || null,
        propertyTaxReceipt: req.files?.propertyTaxReceipt?.[0]?.location || null,
        bankStatement: req.files?.bankStatement?.[0]?.location || null,
        incomeTaxReturnFile: req.files?.incomeTaxReturnFile?.[0]?.location || null,
        salarySlipOrOfferLetter: req.files?.salarySlipOrOfferLetter?.[0]?.location || null,
        forBusiness: req.files?.forBusiness?.[0]?.location || null,
        propertyPaper: req.files?.propertyPaper?.[0]?.location || null,
      }
    });

    console.log("Loan Data:", loanData); // Debugging log before saving
    const savedLoanData = await loanData.save();
    res.status(201).json({ message: "Loan details submitted successfully", data: savedLoanData });

  } catch (error) {
    console.error("Error saving loan details:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update Commercial Property Purchase Loans
exports.updateCommercialPropertyPurchaseDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const existingLoan = await CommercialPropertyPurchase.findById(id);
    if (!existingLoan) {
      return res.status(404).json({ error: "Loan not found" });
    }

    const updatedFields = {
      fullName: req.body.fullName || existingLoan.fullName,
      dateOfBirth: req.body.dateOfBirth || existingLoan.dateOfBirth,
      address: req.body.address || existingLoan.address,
      contactNumber: req.body.contactNumber || existingLoan.contactNumber,
      alternateContact: req.body.alternateContact || existingLoan.alternateContact,
      propertyType: req.body.propertyType || existingLoan.propertyType,
      propertySize: req.body.propertySize || existingLoan.propertySize,
      constructionSize: req.body.constructionSize || existingLoan.constructionSize,
      marketValue: req.body.marketValue || existingLoan.marketValue,
      loanAmount: req.body.loanAmount || existingLoan.loanAmount,
      profession: req.body.profession || existingLoan.profession,
      incomeType: req.body.incomeType || existingLoan.incomeType,
      monthlyIncome: req.body.monthlyIncome || existingLoan.monthlyIncome,
      incomeTaxReturn: req.body.incomeTaxReturn || existingLoan.incomeTaxReturn,
      businessCertificate: req.body.businessCertificate || existingLoan.businessCertificate,
      cibilScore: req.body.cibilScore || existingLoan.cibilScore,
      otherIncomeSource: req.body.otherIncomeSource || existingLoan.otherIncomeSource,
      otherIncomeAmount: req.body.otherIncomeAmount || existingLoan.otherIncomeAmount,
      uploadedDocuments: {
        aadharFront: req.files?.aadharFront?.[0]?.location || existingLoan.uploadedDocuments?.aadharFront || null,
        aadharBack: req.files?.aadharBack?.[0]?.location || existingLoan.uploadedDocuments?.aadharBack || null,
        panCard: req.files?.panCard?.[0]?.location || existingLoan.uploadedDocuments?.panCard || null,
        electricityBill: req.files?.electricityBill?.[0]?.location || existingLoan.uploadedDocuments?.electricityBill || null,
        propertyFront: req.files?.propertyFront?.[0]?.location || existingLoan.uploadedDocuments?.propertyFront || null,
        propertyInside: req.files?.propertyInside?.[0]?.location || existingLoan.uploadedDocuments?.propertyInside || null,
        propertyTaxReceipt: req.files?.propertyTaxReceipt?.[0]?.location || existingLoan.uploadedDocuments?.propertyTaxReceipt || null,
        bankStatement: req.files?.bankStatement?.[0]?.location || existingLoan.uploadedDocuments?.bankStatement || null,
        incomeTaxReturnFile: req.files?.incomeTaxReturnFile?.[0]?.location || existingLoan.uploadedDocuments?.incomeTaxReturnFile || null,
        salarySlipOrOfferLetter: req.files?.salarySlipOrOfferLetter?.[0]?.location || existingLoan.uploadedDocuments?.salarySlipOrOfferLetter || null,
        forBusiness: req.files?.forBusiness?.[0]?.location || existingLoan.uploadedDocuments?.forBusiness || null,
        propertyPaper: req.files?.propertyPaper?.[0]?.location || existingLoan.uploadedDocuments?.propertyPaper || null,
      }
    };

    const updatedLoan = await CommercialPropertyPurchase.findByIdAndUpdate(id, updatedFields, { new: true });

    res.status(200).json({ message: "Commercial property purchase loan updated successfully", data: updatedLoan });
  } catch (error) {
    console.error("Error updating commercial loan:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get Commercial Property Purchase Loans
exports.getCommercialPropertyPurchaseDetails = async (req, res) => {
  try {
    const loanDetails = await CommercialPropertyPurchase.find();

    if (!loanDetails || loanDetails.length === 0) {
      return res.status(404).json({ message: "No loan details found" });
    }

    res.status(200).json({ message: "Loan details retrieved successfully", data: loanDetails });
  } catch (error) {
    console.error("Error fetching loan details:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get by Id Commercial Property Purchase Loans
exports.getCommercialPropertyPurchaseDetailById = async (req, res) => {
  try {
    const { id } = req.params;
    const loanDetail = await CommercialPropertyPurchase.findById(id);

    if (!loanDetail) {
      return res.status(404).json({ message: "Loan detail not found" });
    }

    res.status(200).json({ message: "Loan detail retrieved successfully", data: loanDetail });
  } catch (error) {
    console.error("Error fetching loan detail:", error);
    res.status(500).json({ error: error.message });
  }
};

// =======================================================================================================

// Add Commercial Property Mortgage Loans
exports.CommercialPropertyMortgageDetail = async (req, res) => {
  try {
    console.log("Request files:", req.files); // Debugging log

    // Validate required fields
    const requiredFields = [
      "fullName", "dateOfBirth", "address", "contactNumber"
    ];

    let missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
    }

    // Validate uploaded documents


    // Create new LoanOffer object
    const loanData = new CommercialPropertyMortagePurchase({
      fullName: req.body.fullName,
      dateOfBirth: req.body.dateOfBirth,
      address: req.body.address,
      contactNumber: req.body.contactNumber,
      alternateContact: req.body.alternateContact || null,
      propertyType: req.body.propertyType,
      propertySize: req.body.propertySize,
      constructionSize: req.body.constructionSize,
      marketValue: req.body.marketValue,
      loanAmount: req.body.loanAmount,
      profession: req.body.profession,
      incomeType: req.body.incomeType,
      monthlyIncome: req.body.monthlyIncome,
      incomeTaxReturn: req.body.incomeTaxReturn || null,
      businessCertificate: req.body.businessCertificate || null,
      cibilScore: req.body.cibilScore,
      otherIncomeSource: req.body.otherIncomeSource || null,
      otherIncomeAmount: req.body.otherIncomeAmount || null,
      uploadedDocuments: {
        aadharFront: req.files?.aadharFront?.[0]?.location || null,
        aadharBack: req.files?.aadharBack?.[0]?.location || null,
        panCard: req.files?.panCard?.[0]?.location || null,
        electricityBill: req.files?.electricityBill?.[0]?.location || null,
        propertyFront: req.files?.propertyFront?.[0]?.location || null,
        propertyInside: req.files?.propertyInside?.[0]?.location || null,
        propertyTaxReceipt: req.files?.propertyTaxReceipt?.[0]?.location || null,
        bankStatement: req.files?.bankStatement?.[0]?.location || null,
        incomeTaxReturnFile: req.files?.incomeTaxReturnFile?.[0]?.location || null,
        salarySlipOrOfferLetter: req.files?.salarySlipOrOfferLetter?.[0]?.location || null,
        forBusiness: req.files?.forBusiness?.[0]?.location || null,
        propertyPaper: req.files?.propertyPaper?.[0]?.location || null,
      }
    });

    console.log("Loan Data:", loanData); // Debugging log before saving
    const savedLoanData = await loanData.save();
    res.status(201).json({ message: "Loan details submitted successfully", data: savedLoanData });

  } catch (error) {
    console.error("Error saving loan details:", error);
    res.status(500).json({ error: error.message });
  }
};
// Update Commercial Property Mortgage Loans
exports.updateCommercialPropertyMortgageDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const existingLoan = await CommercialPropertyMortagePurchase.findById(id);
    if (!existingLoan) {
      return res.status(404).json({ error: "Loan not found" });
    }

    const updatedFields = {
      fullName: req.body.fullName || existingLoan.fullName,
      dateOfBirth: req.body.dateOfBirth || existingLoan.dateOfBirth,
      address: req.body.address || existingLoan.address,
      contactNumber: req.body.contactNumber || existingLoan.contactNumber,
      alternateContact: req.body.alternateContact || existingLoan.alternateContact,
      propertyType: req.body.propertyType || existingLoan.propertyType,
      propertySize: req.body.propertySize || existingLoan.propertySize,
      constructionSize: req.body.constructionSize || existingLoan.constructionSize,
      marketValue: req.body.marketValue || existingLoan.marketValue,
      loanAmount: req.body.loanAmount || existingLoan.loanAmount,
      profession: req.body.profession || existingLoan.profession,
      incomeType: req.body.incomeType || existingLoan.incomeType,
      monthlyIncome: req.body.monthlyIncome || existingLoan.monthlyIncome,
      incomeTaxReturn: req.body.incomeTaxReturn || existingLoan.incomeTaxReturn,
      businessCertificate: req.body.businessCertificate || existingLoan.businessCertificate,
      cibilScore: req.body.cibilScore || existingLoan.cibilScore,
      otherIncomeSource: req.body.otherIncomeSource || existingLoan.otherIncomeSource,
      otherIncomeAmount: req.body.otherIncomeAmount || existingLoan.otherIncomeAmount,
      uploadedDocuments: {
        aadharFront: req.files?.aadharFront?.[0]?.location || existingLoan.uploadedDocuments?.aadharFront || null,
        aadharBack: req.files?.aadharBack?.[0]?.location || existingLoan.uploadedDocuments?.aadharBack || null,
        panCard: req.files?.panCard?.[0]?.location || existingLoan.uploadedDocuments?.panCard || null,
        electricityBill: req.files?.electricityBill?.[0]?.location || existingLoan.uploadedDocuments?.electricityBill || null,
        propertyFront: req.files?.propertyFront?.[0]?.location || existingLoan.uploadedDocuments?.propertyFront || null,
        propertyInside: req.files?.propertyInside?.[0]?.location || existingLoan.uploadedDocuments?.propertyInside || null,
        propertyTaxReceipt: req.files?.propertyTaxReceipt?.[0]?.location || existingLoan.uploadedDocuments?.propertyTaxReceipt || null,
        bankStatement: req.files?.bankStatement?.[0]?.location || existingLoan.uploadedDocuments?.bankStatement || null,
        incomeTaxReturnFile: req.files?.incomeTaxReturnFile?.[0]?.location || existingLoan.uploadedDocuments?.incomeTaxReturnFile || null,
        salarySlipOrOfferLetter: req.files?.salarySlipOrOfferLetter?.[0]?.location || existingLoan.uploadedDocuments?.salarySlipOrOfferLetter || null,
        forBusiness: req.files?.forBusiness?.[0]?.location || existingLoan.uploadedDocuments?.forBusiness || null,
        propertyPaper: req.files?.propertyPaper?.[0]?.location || existingLoan.uploadedDocuments?.propertyPaper || null,
      }
    };

    const updatedLoan = await CommercialPropertyMortagePurchase.findByIdAndUpdate(id, updatedFields, { new: true });

    res.status(200).json({ message: "Commercial property mortgage loan updated successfully", data: updatedLoan });
  } catch (error) {
    console.error("Error updating mortgage loan:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get Commercial Property Mortgage Loans
exports.getCommercialPropertyMortgageDetails = async (req, res) => {
  try {
    const loanDetails = await CommercialPropertyMortagePurchase.find();

    if (!loanDetails || loanDetails.length === 0) {
      return res.status(404).json({ message: "No loan details found" });
    }

    res.status(200).json({ message: "Loan details retrieved successfully", data: loanDetails });
  } catch (error) {
    console.error("Error fetching loan details:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get by Id Commercial Property Mortgage Loans
exports.getCommercialPropertyMortgageDetailById = async (req, res) => {
  try {
    const { id } = req.params;
    const loanDetail = await CommercialPropertyMortagePurchase.findById(id);

    if (!loanDetail) {
      return res.status(404).json({ message: "Loan detail not found" });
    }

    res.status(200).json({ message: "Loan detail retrieved successfully", data: loanDetail });
  } catch (error) {
    console.error("Error fetching loan detail:", error);
    res.status(500).json({ error: error.message });
  }
};

// ===============================================================================================

// Insurance Loan
exports.addInsuranceLoan = async (req, res) => {
  try {
    const {
      loan_Type,
      first_Name,
      last_Name,
      email,
      mobile_no,
      dateOfBirth
    } = req.body;

    // ✅ Validation
    if (!loan_Type || !first_Name || !last_Name || !mobile_no || !dateOfBirth || !email) {
      return res.status(400).json({
        message: "Please fill all required fields",
        status: 400
      });
    }

    // ✅ Create and Save new loan data
    const newLoan = new HealthInsurance({
      loan_Type,
      first_Name,
      last_Name,
      email,
      mobile_no,
      dateOfBirth
    });

    await newLoan.save();

    return res.status(200).json({
      message: "Loan data added successfully",
      data: newLoan,
      status: 200
    });

  } catch (error) {
    console.error("Error adding loan data:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
      status: 500
    });
  }
};

// Update Insurance Loan
exports.updateInsuranceLoan = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      loan_Type,
      first_Name,
      last_Name,
      email,
      mobile_no,
      dateOfBirth
    } = req.body;

    const updatedLoan = await HealthInsurance.findByIdAndUpdate(
      id,
      {
        loan_Type,
        first_Name,
        last_Name,
        email,
        mobile_no,
        dateOfBirth
      },
      { new: true } // Return updated document
    );

    if (!updatedLoan) {
      return res.status(404).json({
        message: "Loan data not found",
        status: 404
      });
    }

    return res.status(200).json({
      message: "Loan data updated successfully",
      data: updatedLoan,
      status: 200
    });

  } catch (error) {
    console.error("Error updating loan data:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
      status: 500
    });
  }
};

// Get All Insurance Loans
exports.getAllInsuranceLoans = async (req, res) => {
  try {
    const loans = await HealthInsurance.find(); // Optional: sort by newest first
    return res.status(200).json({
      message: "All insurance loan records get successfully",
      data: loans,
      status: 200
    });
  } catch (error) {
    console.error("Error get loan records:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
      status: 500
    });
  }
};

// Get Insurance Loan by ID
exports.getInsuranceLoanById = async (req, res) => {
  try {
    const { id } = req.params;
    const loan = await HealthInsurance.findById(id);

    if (!loan) {
      return res.status(404).json({
        message: "Loan record not found",
        status: 404,
      });
    }

    return res.status(200).json({
      message: "Loan record get successfully",
      data: loan,
      status: 200,
    });
  } catch (error) {
    console.error("Error get loan by ID:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
      status: 500,
    });
  }
};

// ========================================================================================

// Automobile Loan
exports.addAutomobileLoan = async (req, res) => {
  try {
    const {

      loan_Type,
      first_Name,
      last_Name,
      email,
      mobile_no,
      dateOfBirth
    } = req.body;

   

    // ✅ Create and Save new loan data
    const newLoan = new Automobile({
      loan_Type,
      first_Name,
      last_Name,
      email,
      mobile_no,
      dateOfBirth
    });

    await newLoan.save();

    return res.status(200).json({
      message: "Insurance data added successfully",
      data: newLoan,
      status: 200
    });

  } catch (error) {
    console.error("Error adding loan data:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
      status: 500
    });
  }
};

// Update Automobile Loan 
exports.updateAutomobileLoan = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      loan_Type,
      first_Name,
      last_Name,
      email,
      mobile_no,
      dateOfBirth
    } = req.body;

    // Update the existing loan data
    const updatedLoan = await Automobile.findByIdAndUpdate(
      id,
      {
        loan_Type,
        first_Name,
        last_Name,
        email,
        mobile_no,
        dateOfBirth
      },
      { new: true } // To return updated document
    );

    if (!updatedLoan) {
      return res.status(404).json({
        message: "Automobile loan data not found",
        status: 404
      });
    }

    return res.status(200).json({
      message: "Automobile loan data updated successfully",
      data: updatedLoan,
      status: 200
    });

  } catch (error) {
    console.error("Error updating automobile loan data:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
      status: 500
    });
  }
};

// Get All Automobile Loans
exports.getAllAutomobileLoan = async (req, res) => {
  try {
    const loans = await Automobile.find(); // Optional: sort by newest first
    return res.status(200).json({
      message: "All Automobile loan records get successfully",
      data: loans,
      status: 200
    });
  } catch (error) {
    console.error("Error get loan records:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
      status: 500
    });
  }
};

// Get Automobile Loan by ID
exports.getAutomobileLoanById = async (req, res) => {
  try {
    const { id } = req.params;
    const loan = await Automobile.findById(id);

    if (!loan) {
      return res.status(404).json({
        message: "Loan record not found",
        status: 404,
      });
    }

    return res.status(200).json({
      message: "Loan record get successfully",
      data: loan,
      status: 200,
    });
  } catch (error) {
    console.error("Error get loan by ID:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
      status: 500,
    });
  }
};

// ==============================================  invest plan ==================================

// Investment Plan
exports.addInvestment = async (req, res) => {
  try {
    const {

      loan_Type,
      first_Name,
      last_Name,
      email,
      mobile_no,
      dateOfBirth
    } = req.body;

    // ✅ Validation
    if (!loan_Type || !first_Name || !last_Name || !mobile_no || !dateOfBirth) {
      return res.status(400).json({
        message: "Please fill all required fields",
        status: 400
      });
    }

    // ✅ Create and Save new loan data
    const newLoan = new Investment({
      loan_Type,
      first_Name,
      last_Name,
      email,
      mobile_no,
      dateOfBirth
    });

    await newLoan.save();

    return res.status(200).json({
      message: "Investment data added successfully",
      data: newLoan,
      status: 200
    });

  } catch (error) {
    console.error("Error adding Investment data:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
      status: 500
    });
  }
};

// Update Investment Plan
exports.updateInvestment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      loan_Type,
      first_Name,
      last_Name,
      email,
      mobile_no,
      dateOfBirth
    } = req.body;

    

    // ✅ Find and update Investment by ID
    const updatedInvestment = await Investment.findByIdAndUpdate(
      id,
      {
        loan_Type,
        first_Name,
        last_Name,
        email,
        mobile_no,
        dateOfBirth
      },
      { new: true } // Return updated document
    );

    if (!updatedInvestment) {
      return res.status(404).json({
        message: "Investment data not found",
        status: 404
      });
    }

    return res.status(200).json({
      message: "Investment data updated successfully",
      data: updatedInvestment,
      status: 200
    });

  } catch (error) {
    console.error("Error updating Investment data:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
      status: 500
    });
  }
};


// Get All Investment
exports.getAllInvestmentPlan = async (req, res) => {
  try {
    const loans = await Investment.find(); // Optional: sort by newest first
    return res.status(200).json({
      message: "All Investment data records get successfully",
      data: loans,
      status: 200
    });
  } catch (error) {
    console.error("Error get Investment records:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
      status: 500
    });
  }
};

// Get Investment by ID
exports.getInvestmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const loan = await Investment.findById(id);

    if (!loan) {
      return res.status(404).json({
        message: "Investment record not found",
        status: 404,
      });
    }

    return res.status(200).json({
      message: "Investment record get successfully",
      data: loan,
      status: 200,
    });
  } catch (error) {
    console.error("Error get loan by ID:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
      status: 500,
    });
  }
};


// ==================================== balance  transfer ================================================

exports.addBalanceTransferDetail = async (req, res) => {
  try {
    const {
      fullName,
      dateOfBirth,
      address,
      contactNumber,
      alternateContact,
      propertyType,
      loanAmount,
      noOfStallmentCurrentLoan,
      profession,
      incomeType,
      monthlyIncome,
      incomeTaxReturn,
      cibilScore
    } = req.body;

    const newBalanceTransfer = new BalanceTransfer({
      fullName,
      dateOfBirth,
      address,
      contactNumber,
      alternateContact,
      propertyType,
      loanAmount,
      noOfStallmentCurrentLoan,
      profession,
      incomeType,
      monthlyIncome,
      incomeTaxReturn,
      cibilScore,
    uploadedDocuments: {
    aadharFront: req.files?.aadharFront?.[0]?.location || null,
    aadharBack: req.files?.aadharBack?.[0]?.location || null,
    panCard: req.files?.panCard?.[0]?.location || null,
    electricityBillOrRentAgreement: req.files?.electricityBillOrRentAgreement?.[0]?.location || null,
    officeShopProof: req.files?.officeShopProof?.[0]?.location || null,
    propertyPhotoFront: req.files?.propertyPhotoFront?.[0]?.location || null,
    propertyPhotoInside: req.files?.propertyPhotoInside?.[0]?.location || null,
    bankStatement: req.files?.bankStatement?.[0]?.location || null,
    incomeTaxReturnFile: req.files?.incomeTaxReturnFile?.[0]?.location || null,
    businessProof: req.files?.businessProof?.[0]?.location || null,
    loanAccountStatement: req.files?.loanAccountStatement?.[0]?.location || null,
    listOfDocuments: req.files?.listOfDocuments?.[0]?.location || null,
    foreclosureLetter: req.files?.foreclosureLetter?.[0]?.location || null
  }
    });

    await newBalanceTransfer.save();

    res.status(201).json({ message: "Balance transfer details saved successfully." });
  } catch (error) {
    console.error("Error saving balance transfer data:", error);
    res.status(500).json({ error: "Internal server error" });    
  }
};

// PUT API to update balance transfer details
exports.updateBalanceTransferDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the existing document
    const existingLoan = await BalanceTransfer.findById(id);
    if (!existingLoan) {
      return res.status(404).json({ error: "Balance transfer record not found" });
    }

    const {
      fullName,
      dateOfBirth,
      address,
      contactNumber,
      alternateContact,
      propertyType,
      loanAmount,
      noOfStallmentCurrentLoan,
      profession,
      incomeType,
      monthlyIncome,
      incomeTaxReturn,
      cibilScore,
    } = req.body;

    const updateData = {
      fullName: fullName || existingLoan.fullName,
      dateOfBirth: dateOfBirth || existingLoan.dateOfBirth,
      address: address || existingLoan.address,
      contactNumber: contactNumber || existingLoan.contactNumber,
      alternateContact: alternateContact || existingLoan.alternateContact,
      propertyType: propertyType || existingLoan.propertyType,
      loanAmount: loanAmount || existingLoan.loanAmount,
      noOfStallmentCurrentLoan: noOfStallmentCurrentLoan || existingLoan.noOfStallmentCurrentLoan,
      profession: profession || existingLoan.profession,
      incomeType: incomeType || existingLoan.incomeType,
      monthlyIncome: monthlyIncome || existingLoan.monthlyIncome,
      incomeTaxReturn: incomeTaxReturn || existingLoan.incomeTaxReturn,
      cibilScore: cibilScore || existingLoan.cibilScore,
      uploadedDocuments: {
        aadharFront: req.files?.aadharFront?.[0]?.location || existingLoan.uploadedDocuments.aadharFront,
        aadharBack: req.files?.aadharBack?.[0]?.location || existingLoan.uploadedDocuments.aadharBack,
        panCard: req.files?.panCard?.[0]?.location || existingLoan.uploadedDocuments.panCard,
        electricityBillOrRentAgreement: req.files?.electricityBillOrRentAgreement?.[0]?.location || existingLoan.uploadedDocuments.electricityBillOrRentAgreement,
        officeShopProof: req.files?.officeShopProof?.[0]?.location || existingLoan.uploadedDocuments.officeShopProof,
        propertyPhotoFront: req.files?.propertyPhotoFront?.[0]?.location || existingLoan.uploadedDocuments.propertyPhotoFront,
        propertyPhotoInside: req.files?.propertyPhotoInside?.[0]?.location || existingLoan.uploadedDocuments.propertyPhotoInside,
        bankStatement: req.files?.bankStatement?.[0]?.location || existingLoan.uploadedDocuments.bankStatement,
        incomeTaxReturnFile: req.files?.incomeTaxReturnFile?.[0]?.location || existingLoan.uploadedDocuments.incomeTaxReturnFile,
        businessProof: req.files?.businessProof?.[0]?.location || existingLoan.uploadedDocuments.businessProof,
        loanAccountStatement: req.files?.loanAccountStatement?.[0]?.location || existingLoan.uploadedDocuments.loanAccountStatement,
        listOfDocuments: req.files?.listOfDocuments?.[0]?.location || existingLoan.uploadedDocuments.listOfDocuments,
        foreclosureLetter: req.files?.foreclosureLetter?.[0]?.location || existingLoan.uploadedDocuments.foreclosureLetter,
      }
    };

    const updatedLoan = await BalanceTransfer.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      message: "Balance transfer details updated successfully",
      data: updatedLoan,
    });

  } catch (error) {
    console.error("Error updating balance transfer data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


// Get all balance transfer entries
exports.getAllBalanceTransferDetails = async (req, res) => {
  try {
    const data = await BalanceTransfer.find(); // You can add filters or sorting if needed
    res.status(200).json({
      message: "Balance transfer details get successfully.",
      data,
    });
  } catch (error) {
    console.error("Error get balance transfer data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//  Get by id balance transfer entries

exports.getBalanceTransferById = async (req, res) => {
  try {
    const { id } = req.params;

    const balanceTransfer = await BalanceTransfer.findById(id);

    if (!balanceTransfer) {
      return res.status(404).json({ message: "Balance transfer entry not found" });
    }

    res.status(200).json({
      message: "Balance transfer detail get successfully",
      data: balanceTransfer,
    });
  } catch (error) {
    console.error("Error fetching balance transfer by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ========================================== Balance Tranfer TOP UP ========================
// Add
exports.addBalanceTransferTopUpDetail = async (req, res) => {
  try {
    const {
      fullName,
      dateOfBirth,
      address,
      contactNumber,
      alternateContact,
      residenceType,
      currentLoanAmount,
      currentLoanInstallmentsPaid,
      loanAmountRequired,
      profession,
      incomeType,
      totalMonthlyIncome,
      incomeTaxReturn,
      cibilScore
    } = req.body;

    const newApplication = new BalanceTransferTopUp({
      fullName,
      dateOfBirth,
      address,
      contactNumber,
      alternateContact,
      residenceType,
      currentLoanAmount,
      currentLoanInstallmentsPaid,
      loanAmountRequired,
      profession,
      incomeType,
      totalMonthlyIncome,
      incomeTaxReturn,
      cibilScore,
      uploadedDocuments : {
      aadharFront: req.files?.aadharFront?.[0]?.location || null,
      aadharBack: req.files?.aadharBack?.[0]?.location || null,
      panCard: req.files?.panCard?.[0]?.location || null,
      electricityOrRentAgreement: req.files?.electricityOrRentAgreement?.[0]?.location || null,
      officeShopElectricityOrRent: req.files?.officeShopElectricityOrRent?.[0]?.location || null,
      propertyPhotoFront: req.files?.propertyPhotoFront?.[0]?.location || null,
      propertyPhotoInside: req.files?.propertyPhotoInside?.[0]?.location || null,
      bankStatementLastYear: req.files?.bankStatementLastYear?.[0]?.location || null,
      incomeTaxReturnFile: req.files?.incomeTaxReturnFile?.[0]?.location || null,
      forBusinessDocuments: req.files?.forBusinessDocuments?.[0]?.location || null,
      loanAccountStatement: req.files?.loanAccountStatement?.[0]?.location || null,
      listOfDocumentsByBank: req.files?.listOfDocumentsByBank?.[0]?.location || null,
      foreclosureLetter: req.files?.foreclosureLetter?.[0]?.location || null
      }
    });

    await newApplication.save();

    res.status(201).json({
      success: true,
      message: "Application submitted successfully!",
      data: newApplication
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting application",
      error: error.message
    });
  }
};
// Update
exports.updateBalanceTransferTopUpDetail = async (req, res) => {
  try {
    const id = req.params.id; // Get ID from params

    const existingLoan = await BalanceTransferTopUp.findById(id);
    if (!existingLoan) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    // Extract body data
    const {
      fullName,
      dateOfBirth,
      address,
      contactNumber,
      alternateContact,
      residenceType,
      currentLoanAmount,
      currentLoanInstallmentsPaid,
      loanAmountRequired,
      profession,
      incomeType,
      totalMonthlyIncome,
      incomeTaxReturn,
      cibilScore
    } = req.body;

    // Build update object with fallback to existing values
    existingLoan.fullName = fullName || existingLoan.fullName;
    existingLoan.dateOfBirth = dateOfBirth || existingLoan.dateOfBirth;
    existingLoan.address = address || existingLoan.address;
    existingLoan.contactNumber = contactNumber || existingLoan.contactNumber;
    existingLoan.alternateContact = alternateContact || existingLoan.alternateContact;
    existingLoan.residenceType = residenceType || existingLoan.residenceType;
    existingLoan.currentLoanAmount = currentLoanAmount || existingLoan.currentLoanAmount;
    existingLoan.currentLoanInstallmentsPaid = currentLoanInstallmentsPaid || existingLoan.currentLoanInstallmentsPaid;
    existingLoan.loanAmountRequired = loanAmountRequired || existingLoan.loanAmountRequired;
    existingLoan.profession = profession || existingLoan.profession;
    existingLoan.incomeType = incomeType || existingLoan.incomeType;
    existingLoan.totalMonthlyIncome = totalMonthlyIncome || existingLoan.totalMonthlyIncome;
    existingLoan.incomeTaxReturn = incomeTaxReturn || existingLoan.incomeTaxReturn;
    existingLoan.cibilScore = cibilScore || existingLoan.cibilScore;

    // Update files only if new files uploaded
    if (req.files?.aadharFront) existingLoan.uploadedDocuments.aadharFront = req.files.aadharFront[0].location;
    if (req.files?.aadharBack) existingLoan.uploadedDocuments.aadharBack = req.files.aadharBack[0].location;
    if (req.files?.panCard) existingLoan.uploadedDocuments.panCard = req.files.panCard[0].location;
    if (req.files?.electricityOrRentAgreement) existingLoan.uploadedDocuments.electricityOrRentAgreement = req.files.electricityOrRentAgreement[0].location;
    if (req.files?.officeShopElectricityOrRent) existingLoan.uploadedDocuments.officeShopElectricityOrRent = req.files.officeShopElectricityOrRent[0].location;
    if (req.files?.propertyPhotoFront) existingLoan.uploadedDocuments.propertyPhotoFront = req.files.propertyPhotoFront[0].location;
    if (req.files?.propertyPhotoInside) existingLoan.uploadedDocuments.propertyPhotoInside = req.files.propertyPhotoInside[0].location;
    if (req.files?.bankStatementLastYear) existingLoan.uploadedDocuments.bankStatementLastYear = req.files.bankStatementLastYear[0].location;
    if (req.files?.incomeTaxReturnFile) existingLoan.uploadedDocuments.incomeTaxReturnFile = req.files.incomeTaxReturnFile[0].location;
    if (req.files?.forBusinessDocuments) existingLoan.uploadedDocuments.forBusinessDocuments = req.files.forBusinessDocuments[0].location;
    if (req.files?.loanAccountStatement) existingLoan.uploadedDocuments.loanAccountStatement = req.files.loanAccountStatement[0].location;
    if (req.files?.listOfDocumentsByBank) existingLoan.uploadedDocuments.listOfDocumentsByBank = req.files.listOfDocumentsByBank[0].location;
    if (req.files?.foreclosureLetter) existingLoan.uploadedDocuments.foreclosureLetter = req.files.foreclosureLetter[0].location;

    await existingLoan.save();

    res.status(200).json({
      success: true,
      message: "Application updated successfully!",
      data: existingLoan
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating application",
      error: error.message
    });
  }
};
// Get
exports.getAllBalanceTransferTopUp = async (req, res) => {
  try {
    const applications = await BalanceTransferTopUp.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error get applications",
      error: error.message
    });
  }
};
// Get By Id
exports.getBalanceTransferTopUpById = async (req, res) => {
  try {
    const id = req.params.id;
    const application = await BalanceTransferTopUp.findById(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }
    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error get application",
      error: error.message
    });
  }
};

// ===================================== Education Loan ====================================

exports.addEducationLoanApplication = async (req, res) => {
  try {
    const {
      fullName,
      fatherOrHusbandName,
      dateOfBirth,
      permanentAddress,
      contactNumber,
      email,

      courseName,
      institutionName,
      institutionAddress,
      admissionDate,
      courseDuration,

      totalFees,
      loanAmountRequired,

      occupationOrBusiness,
      monthlyOrAnnualIncome,

      coApplicantName,
      coApplicantFatherOrHusbandName,
      coApplicantDateOfBirth,
      coApplicantRelationship,
      coApplicantAddress,
      coApplicantContact,
      coApplicantIncome,

      collateralType,
      collateralLocation,
      collateralMarketValue
    } = req.body;

    const newApplication = new EducationLoanApplication({
      fullName,
      fatherOrHusbandName,
      dateOfBirth,
      permanentAddress,
      contactNumber,
      email,

      courseName,
      institutionName,
      institutionAddress,
      admissionDate,
      courseDuration,

      totalFees,
      loanAmountRequired,

      occupationOrBusiness,
      monthlyOrAnnualIncome,

      coApplicantName,
      coApplicantFatherOrHusbandName,
      coApplicantDateOfBirth,
      coApplicantRelationship,
      coApplicantAddress,
      coApplicantContact,
      coApplicantIncome,

      collateralType,
      collateralLocation,
      collateralMarketValue,

      uploadedDocuments: { 
        admissionLetter: req.files?.admissionLetter?.[0]?.location || null,
        previousMarkSheets: req.files?.previousMarkSheets?.[0]?.location || null,
        feeStructure: req.files?.feeStructure?.[0]?.location || null
      }
    });

    await newApplication.save();

    res.status(201).json({ message: "Education loan application submitted successfully." });
  } catch (error) {
    console.error("Error saving education loan application:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// UPDATE API to update Education Loan Application
exports.updateEducationLoanApplication = async (req, res) => {
  try {
    const { id } = req.params; // Expecting application ID in route param
    const existing = await EducationLoanApplication.findById(id);

    if (!existing) {
      return res.status(404).json({ message: "Application not found" });
    }

    const uploadedDocs = req.files || {};

    // Update fields with fallback to existing values
    existing.fullName = req.body.fullName || existing.fullName;
    existing.fatherOrHusbandName = req.body.fatherOrHusbandName || existing.fatherOrHusbandName;
    existing.dateOfBirth = req.body.dateOfBirth || existing.dateOfBirth;
    existing.permanentAddress = req.body.permanentAddress || existing.permanentAddress;
    existing.contactNumber = req.body.contactNumber || existing.contactNumber;
    existing.email = req.body.email || existing.email;

    existing.courseName = req.body.courseName || existing.courseName;
    existing.institutionName = req.body.institutionName || existing.institutionName;
    existing.institutionAddress = req.body.institutionAddress || existing.institutionAddress;
    existing.admissionDate = req.body.admissionDate || existing.admissionDate;
    existing.courseDuration = req.body.courseDuration || existing.courseDuration;

    existing.totalFees = req.body.totalFees || existing.totalFees;
    existing.loanAmountRequired = req.body.loanAmountRequired || existing.loanAmountRequired;

    existing.occupationOrBusiness = req.body.occupationOrBusiness || existing.occupationOrBusiness;
    existing.monthlyOrAnnualIncome = req.body.monthlyOrAnnualIncome || existing.monthlyOrAnnualIncome;

    existing.coApplicantName = req.body.coApplicantName || existing.coApplicantName;
    existing.coApplicantFatherOrHusbandName = req.body.coApplicantFatherOrHusbandName || existing.coApplicantFatherOrHusbandName;
    existing.coApplicantDateOfBirth = req.body.coApplicantDateOfBirth || existing.coApplicantDateOfBirth;
    existing.coApplicantRelationship = req.body.coApplicantRelationship || existing.coApplicantRelationship;
    existing.coApplicantAddress = req.body.coApplicantAddress || existing.coApplicantAddress;
    existing.coApplicantContact = req.body.coApplicantContact || existing.coApplicantContact;
    existing.coApplicantIncome = req.body.coApplicantIncome || existing.coApplicantIncome;

    existing.collateralType = req.body.collateralType || existing.collateralType;
    existing.collateralLocation = req.body.collateralLocation || existing.collateralLocation;
    existing.collateralMarketValue = req.body.collateralMarketValue || existing.collateralMarketValue;

    // Update uploaded documents if new ones are provided
    existing.uploadedDocuments = {
      admissionLetter: uploadedDocs?.admissionLetter?.[0]?.location || existing.uploadedDocuments?.admissionLetter || null,
      previousMarkSheets: uploadedDocs?.previousMarkSheets?.[0]?.location || existing.uploadedDocuments?.previousMarkSheets || null,
      feeStructure: uploadedDocs?.feeStructure?.[0]?.location || existing.uploadedDocuments?.feeStructure || null,
    };

    const updatedApplication = await existing.save();

    res.status(200).json({ message: "Application updated successfully", data: updatedApplication });
  } catch (error) {
    console.error("Error updating education loan application:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getEducationLoanApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await EducationLoanApplication.findById(id);

    if (!application) {
      return res.status(404).json({ message: "Education loan application not found" });
    }

    res.status(200).json({
      message: "Education loan application get successfully",
      data: application,
    });
  } catch (error) {
    console.error("Error fetching education loan application:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllEducationLoanApplications = async (req, res) => {
  try {
    const applications = await EducationLoanApplication.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "All education loan applications get successfully",
      data: applications,
    });
  } catch (error) {
    console.error("Error get applications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ================================================== Gold Loan ===============================

exports.addGoldLoanApplication = async (req, res) => {
    try {
        const {
            fullName,
            fatherOrHusbandName,
            motherName,
            dateOfBirth,
            permanentAddress,
            contactNumber,
            email,
            occupationOrBusiness,
            monthlyOrAnnualIncome,
            goldType,
            goldWeightInGrams,
            goldPurity,
            loanAmountRequired,
            loanPurpose,
            preferredRepaymentTenure
        } = req.body;

        const newApplication = new GoldLoan({
            fullName,
            fatherOrHusbandName,
            motherName,
            dateOfBirth,
            permanentAddress,
            contactNumber,
            email,
            occupationOrBusiness,
            monthlyOrAnnualIncome,
            goldType,
            goldWeightInGrams,
            goldPurity,
            loanAmountRequired,
            loanPurpose,
            preferredRepaymentTenure
        });

        await newApplication.save();

        res.status(201).json({
            message: "Gold loan application submitted successfully",
            data: newApplication
        });

    } catch (error) {
        res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
};

// PUT API to update Gold Loan Application
exports.updateGoldLoanApplication = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the existing application
    const existing = await GoldLoan.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Update fields
    existing.fullName = req.body.fullName || existing.fullName;
    existing.fatherOrHusbandName = req.body.fatherOrHusbandName || existing.fatherOrHusbandName;
    existing.motherName = req.body.motherName || existing.motherName;
    existing.dateOfBirth = req.body.dateOfBirth || existing.dateOfBirth;
    existing.permanentAddress = req.body.permanentAddress || existing.permanentAddress;
    existing.contactNumber = req.body.contactNumber || existing.contactNumber;
    existing.email = req.body.email || existing.email;
    existing.occupationOrBusiness = req.body.occupationOrBusiness || existing.occupationOrBusiness;
    existing.monthlyOrAnnualIncome = req.body.monthlyOrAnnualIncome || existing.monthlyOrAnnualIncome;
    existing.goldType = req.body.goldType || existing.goldType;
    existing.goldWeightInGrams = req.body.goldWeightInGrams || existing.goldWeightInGrams;
    existing.goldPurity = req.body.goldPurity || existing.goldPurity;
    existing.loanAmountRequired = req.body.loanAmountRequired || existing.loanAmountRequired;
    existing.loanPurpose = req.body.loanPurpose || existing.loanPurpose;
    existing.preferredRepaymentTenure = req.body.preferredRepaymentTenure || existing.preferredRepaymentTenure;

    // Save updated application
    const updatedApplication = await existing.save();

    res.status(200).json({
      message: "Gold loan application updated successfully",
      data: updatedApplication,
    });

  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};


exports.getAllGoldLoanApplications = async (req, res) => {
    try {
        const goldLoans = await GoldLoan.find().sort({ createdAt: -1 }); // latest first
        res.status(200).json({
            message: "Gold loan applications get successfully",
            data: goldLoans
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch applications",
            error: error.message
        });
    }
};

exports.getGoldLoanApplicationById = async (req, res) => {
    try {
        const { id } = req.params;
        const goldLoan = await GoldLoan.findById(id);

        if (!goldLoan) {
            return res.status(404).json({
                message: "Gold loan application not found"
            });
        }

        res.status(200).json({
            message: "Gold loan application fetched successfully",
            data: goldLoan
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch application",
            error: error.message
        });
    }
};

// ================================================ Home Renovation ====================================

// POST API to handle home renovation loan details
exports.homeRenovationLoanDetail = async (req, res) => {
  try {
    console.log("Request files:", req.files); // Debugging log

    // Validate required fields
    const requiredFields = [
      "fullName", "dateOfBirth", "address", "contactNumber"
    ];

    let missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
    }

    // Create new LoanOffer object
    const loanData = new HomeRenovation({
      fullName: req.body.fullName,
      dateOfBirth: req.body.dateOfBirth,
      address: req.body.address,
      contactNumber: req.body.contactNumber,
      alternateContact: req.body.alternateContact || null,
      propertyType: req.body.propertyType,
      propertySize: req.body.propertySize,
      constructionSize: req.body.constructionSize,
      marketValue: req.body.marketValue,
      loanAmount: req.body.loanAmount,
      profession: req.body.profession,
      incomeType: req.body.incomeType,
      monthlyIncome: req.body.monthlyIncome,
      incomeTaxReturn: req.body.incomeTaxReturn || null,
      businessCertificate: req.body.businessCertificate || null,
      cibilScore: req.body.cibilScore,
      otherIncomeSource: req.body.otherIncomeSource || null,
      otherIncomeAmount: req.body.otherIncomeAmount || null,
      uploadedDocuments: {
        aadharFront: req.files?.aadharFront?.[0]?.location || null,
        aadharBack: req.files?.aadharBack?.[0]?.location || null,
        panCard: req.files?.panCard?.[0]?.location || null,
        electricityBill: req.files?.electricityBill?.[0]?.location || null,
        propertyFront: req.files?.propertyFront?.[0]?.location || null,
        propertyInside: req.files?.propertyInside?.[0]?.location || null,
        propertyTaxReceipt: req.files?.propertyTaxReceipt?.[0]?.location || null,
        bankStatement: req.files?.bankStatement?.[0]?.location || null,
        incomeTaxReturnFile: req.files?.incomeTaxReturnFile?.[0]?.location || null,
        salarySlipOrOfferLetter: req.files?.salarySlipOrOfferLetter?.[0]?.location || null,
        forBusiness: req.files?.forBusiness?.[0]?.location || null,
        propertyPaper: req.files?.propertyPaper?.[0]?.location || null,
      }
    });

    const savedLoanData = await loanData.save();
    res.status(201).json({ message: "Home Renovation Loan details submitted successfully", data: savedLoanData });

  } catch (error) {
    console.error("Error saving loan details:", error);
    res.status(500).json({ error: error.message });
  }
};

// PUT API to handle home renovation loan details
exports.updateHomeRenovationLoanDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const existingLoan = await HomeRenovation.findById(id);
    if (!existingLoan) {
      return res.status(404).json({ error: "Loan not found" });
    }

    const updatedFields = {
      fullName: req.body.fullName || existingLoan.fullName,
      dateOfBirth: req.body.dateOfBirth || existingLoan.dateOfBirth,
      address: req.body.address || existingLoan.address,
      contactNumber: req.body.contactNumber || existingLoan.contactNumber,
      alternateContact: req.body.alternateContact || existingLoan.alternateContact,
      propertyType: req.body.propertyType || existingLoan.propertyType,
      propertySize: req.body.propertySize || existingLoan.propertySize,
      constructionSize: req.body.constructionSize || existingLoan.constructionSize,
      marketValue: req.body.marketValue || existingLoan.marketValue,
      loanAmount: req.body.loanAmount || existingLoan.loanAmount,
      profession: req.body.profession || existingLoan.profession,
      incomeType: req.body.incomeType || existingLoan.incomeType,
      monthlyIncome: req.body.monthlyIncome || existingLoan.monthlyIncome,
      incomeTaxReturn: req.body.incomeTaxReturn || existingLoan.incomeTaxReturn,
      businessCertificate: req.body.businessCertificate || existingLoan.businessCertificate,
      cibilScore: req.body.cibilScore || existingLoan.cibilScore,
      otherIncomeSource: req.body.otherIncomeSource || existingLoan.otherIncomeSource,
      otherIncomeAmount: req.body.otherIncomeAmount || existingLoan.otherIncomeAmount,
      uploadedDocuments: {
        aadharFront: req.files?.aadharFront?.[0]?.location || existingLoan.uploadedDocuments?.aadharFront || null,
        aadharBack: req.files?.aadharBack?.[0]?.location || existingLoan.uploadedDocuments?.aadharBack || null,
        panCard: req.files?.panCard?.[0]?.location || existingLoan.uploadedDocuments?.panCard || null,
        electricityBill: req.files?.electricityBill?.[0]?.location || existingLoan.uploadedDocuments?.electricityBill || null,
        propertyFront: req.files?.propertyFront?.[0]?.location || existingLoan.uploadedDocuments?.propertyFront || null,
        propertyInside: req.files?.propertyInside?.[0]?.location || existingLoan.uploadedDocuments?.propertyInside || null,
        propertyTaxReceipt: req.files?.propertyTaxReceipt?.[0]?.location || existingLoan.uploadedDocuments?.propertyTaxReceipt || null,
        bankStatement: req.files?.bankStatement?.[0]?.location || existingLoan.uploadedDocuments?.bankStatement || null,
        incomeTaxReturnFile: req.files?.incomeTaxReturnFile?.[0]?.location || existingLoan.uploadedDocuments?.incomeTaxReturnFile || null,
        salarySlipOrOfferLetter: req.files?.salarySlipOrOfferLetter?.[0]?.location || existingLoan.uploadedDocuments?.salarySlipOrOfferLetter || null,
        forBusiness: req.files?.forBusiness?.[0]?.location || existingLoan.uploadedDocuments?.forBusiness || null,
        propertyPaper: req.files?.propertyPaper?.[0]?.location || existingLoan.uploadedDocuments?.propertyPaper || null,
      }
    };

    const updatedLoan = await HomeRenovation.findByIdAndUpdate(id, updatedFields, { new: true });

    res.status(200).json({ message: "Home Renovation Loan updated successfully", data: updatedLoan });
  } catch (error) {
    console.error("Error updating home renovation loan:", error);
    res.status(500).json({ error: error.message });
  }
};


// Get Home Renovation Loan 
exports.getHomeRenovationLoanDetails = async (req, res) => {
  try {
    const loanDetails = await HomeRenovation.find();

    if (!loanDetails || loanDetails.length === 0) {
      return res.status(404).json({ message: "No loan details found" });
    }

    res.status(200).json({ message: "Loan details retrieved successfully", data: loanDetails });
  } catch (error) {
    console.error("Error fetching loan details:", error);
    res.status(500).json({ error: error.message });
  }
};
// Get by Id Home Renovation Loan
exports.getHomeRenovationLoanDetailById = async (req, res) => {
  try {
    const { id } = req.params;
    const loanDetail = await HomeRenovation.findById(id);

    if (!loanDetail) {
      return res.status(404).json({ message: "Loan detail not found" });
    }

    res.status(200).json({ message: "Loan detail retrieved successfully", data: loanDetail });
  } catch (error) {
    console.error("Error fetching loan detail:", error);
    res.status(500).json({ error: error.message });
  }
};


// =======================================  Our Service Apis ========================================
// CA Services
exports.addCaServices = async (req, res) => {

    try {

        const { name, email, mobile_no, message } = req.body;

        if (!name || !email || !mobile_no) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const newContact = new CAServices({
            name,
            email,
            mobile_no,
            message
        });

        // Save the art to the database
        const savedContact = await newContact.save();
        res.status(201).json({ message: 'CA Service added successfully', data: savedContact , status:true});

    } catch (error) {
        console.error('Error adding contact', error);
        res.status(500).json({ error: 'Failed to add contact' });
    }

};

exports.updateCaServices = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await CAServices.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "CA Service not found", status: false });
    }

    const {
      name,
      email,
      mobile_no,
      message
    } = req.body;

    existing.name = name || existing.name;
    existing.email = email || existing.email;
    existing.mobile_no = mobile_no || existing.mobile_no;
    existing.message = message || existing.message;

    const updated = await existing.save();

    res.status(200).json({ message: "CA Service updated successfully", data: updated, status: true });
  } catch (error) {
    console.error("Error updating CA Service:", error);
    res.status(500).json({ error: "Failed to update CA Service", status: false });
  }
};

exports.getAllCaServices = async (req, res) => {
  try {
    const allServices = await CAServices.find().sort({ createdAt: -1 }); // newest first

    res.status(200).json({
      message: "All CA Services get successfully",
      data: allServices,
      status: true
    });
  } catch (error) {
    console.error("Error get CA Services:", error);
    res.status(500).json({
      message: "Failed to get CA Services",
      error: error.message,
      status: false
    });
  }
};

// Real State Service
exports.addRealState = async (req, res) => {

    try {

        const { name, email, mobile_no, message } = req.body;

        if (!name || !email || !mobile_no) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const newData = new RealState({
            name,
            email,
            mobile_no,
            message
        });

        // Save the art to the database
        const savedData = await newData.save();
        res.status(201).json({ message: 'Real State Service added successfully', data: savedData , status:true});

    } catch (error) {
        console.error('Error adding Real State Service', error);
        res.status(500).json({ error: 'Failed to add Real State Service' });
    }

};

exports.updateRealState = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await RealState.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "Real State Service not found", status: false });
    }

    const {
      name,
      email,
      mobile_no,
      message
    } = req.body;

    existing.name = name || existing.name;
    existing.email = email || existing.email;
    existing.mobile_no = mobile_no || existing.mobile_no;
    existing.message = message || existing.message;

    const updated = await existing.save();

    res.status(200).json({ message: "Real State Service updated successfully", data: updated, status: true });
  } catch (error) {
    console.error("Error updating Real State Service:", error);
    res.status(500).json({ error: "Failed to update Real State Service", status: false });
  }
};

exports.getAllRealState = async (req, res) => {
  try {
    const allServices = await RealState.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "All Real State Services get successfully",
      data: allServices,
      status: true
    });
  } catch (error) {
    console.error("Error get Real State Services:", error);
    res.status(500).json({
      message: "Failed to get Real State Services",
      error: error.message,
      status: false
    });
  }
};

// DSA Service 
exports.addDsaService = async (req, res) => {

    try {

        const { name, email, mobile_no, message } = req.body;

        if (!name || !email || !mobile_no) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const newData = new DsaService({
            name,
            email,
            mobile_no,
            message
        });

        // Save the art to the database
        const savedData = await newData.save();
        res.status(201).json({ message: 'Dsa Service added successfully', data: savedData , status:true});

    } catch (error) {
        console.error('Error adding DsaService', error);
        res.status(500).json({ error: 'Failed to add DsaService' });
    }

};

exports.updateDsaService = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await DsaService.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "Dsa Service not found", status: false });
    }

    const {
      name,
      email,
      mobile_no,
      message
    } = req.body;

    existing.name = name || existing.name;
    existing.email = email || existing.email;
    existing.mobile_no = mobile_no || existing.mobile_no;
    existing.message = message || existing.message;

    const updated = await existing.save();

    res.status(200).json({ message: "Dsa Service updated successfully", data: updated, status: true });
  } catch (error) {
    console.error("Error updating Dsa Service:", error);
    res.status(500).json({ error: "Failed to update Dsa Service", status: false });
  }
};

exports.getAllDsaService = async (req, res) => {
  try {
    const allServices = await DsaService.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "All Dsa Service get successfully",
      data: allServices,
      status: true
    });
  } catch (error) {
    console.error("Error get Dsa Service:", error);
    res.status(500).json({
      message: "Failed to get Dsa Service",
      error: error.message,
      status: false
    });
  }
};

// Legal Documentation Service
exports.addLegalDocumentationService = async (req, res) => {

    try {

        const { name, email, mobile_no, message } = req.body;

        if (!name || !email || !mobile_no) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const newData = new legalDoc({
            name,
            email,
            mobile_no,
            message
        });

        // Save the art to the database
        const savedData = await newData.save();
        res.status(201).json({ message: 'Legal Documentation Service added successfully', data: savedData , status:true});

    } catch (error) {
        console.error('Error adding Legal Documentation Service', error);
        res.status(500).json({ error: 'Failed to add Legal Documentation Service' });
    }

};

exports.updateLegalDocumentationService = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await legalDoc.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "Legal Documentation Service not found", status: false });
    }

    const {
      name,
      email,
      mobile_no,
      message
    } = req.body;

    existing.name = name || existing.name;
    existing.email = email || existing.email;
    existing.mobile_no = mobile_no || existing.mobile_no;
    existing.message = message || existing.message;

    const updated = await existing.save();

    res.status(200).json({ message: "Legal Documentation Service updated successfully", data: updated, status: true });
  } catch (error) {
    console.error("Error updating Legal Documentation Service:", error);
    res.status(500).json({ error: "Failed to update Legal Documentation Service", status: false });
  }
};

exports.getAllLegalDocumentationService = async (req, res) => {
  try {
    const allServices = await legalDoc.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "All Legal Documentation Service get successfully",
      data: allServices,
      status: true
    });
  } catch (error) {
    console.error("Error get Legal Documentation Service:", error);
    res.status(500).json({
      message: "Failed to get Legal Documentation Service",
      error: error.message,
      status: false
    });
  }
};

// Government Business Service
exports.addGovernmentBusinessService = async (req, res) => {

    try {

        const { name, email, mobile_no, message } = req.body;

        if (!name || !email || !mobile_no) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const newData = new GovernmentBusiness({
            name,
            email,
            mobile_no,
            message
        });

        // Save the art to the database
        const savedData = await newData.save();
        res.status(201).json({ message: 'Government Business Service added successfully', data: savedData , status:true});

    } catch (error) {
        console.error('Error adding  Government Business Service', error);
        res.status(500).json({ error: 'Failed to add Government Business Service' });
    }

};

exports.updateGovernmentBusinessService = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await GovernmentBusiness.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "Government Business Service not found", status: false });
    }

    const {
      name,
      email,
      mobile_no,
      message
    } = req.body;

    existing.name = name || existing.name;
    existing.email = email || existing.email;
    existing.mobile_no = mobile_no || existing.mobile_no;
    existing.message = message || existing.message;

    const updated = await existing.save();

    res.status(200).json({ message: "Government Business Service updated successfully", data: updated, status: true });
  } catch (error) {
    console.error("Error updating Government Business Service:", error);
    res.status(500).json({ error: "Failed to update Government Business Service", status: false });
  }
};

exports.getAllGovernmentBusinessService = async (req, res) => {
  try {
    const allServices = await GovernmentBusiness.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "All Government Business Service get successfully",
      data: allServices,
      status: true
    });
  } catch (error) {
    console.error("Error get Government Business Service:", error);
    res.status(500).json({
      message: "Failed to get Government Business Service",
      error: error.message,
      status: false
    });
  }
};


// Digital Marketing
exports.addDigitalMarketingService = async (req, res) => {

    try {

        const { name, email, mobile_no, message } = req.body;

        if (!name || !email || !mobile_no) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const newData = new DigitalMarketing({
            name,
            email,
            mobile_no,
            message
        });

        // Save the art to the database
        const savedData = await newData.save();
        res.status(201).json({ message: 'Digital Marketing Service added successfully', data: savedData , status:true});

    } catch (error) {
        console.error('Error adding  Digital Marketing Service', error);
        res.status(500).json({ error: 'Failed to add Digital Marketing Service' });
    }

};

exports.updateDigitalMarketingService = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await DigitalMarketing.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "Digital Marketing Service not found", status: false });
    }

    const {
      name,
      email,
      mobile_no,
      message
    } = req.body;

    existing.name = name || existing.name;
    existing.email = email || existing.email;
    existing.mobile_no = mobile_no || existing.mobile_no;
    existing.message = message || existing.message;

    const updated = await existing.save();

    res.status(200).json({ message: "Digital Marketing Service updated successfully", data: updated, status: true });
  } catch (error) {
    console.error("Error updating Digital Marketing Service:", error);
    res.status(500).json({ error: "Failed to update Digital Marketing Service", status: false });
  }
};

exports.getAllDigitalMarketingService = async (req, res) => {
  try {
    const allServices = await DigitalMarketing.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "All Digital Marketing Service get successfully",
      data: allServices,
      status: true
    });
  } catch (error) {
    console.error("Error get Digital Marketing Service:", error);
    res.status(500).json({
      message: "Failed to get Digital Marketing Service",
      error: error.message,
      status: false
    });
  }
};

// Credit Score
exports.addCreditScoreService = async (req, res) => {

    try {

        const { name, email, mobile_no, message } = req.body;

        if (!name || !email || !mobile_no) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const newData = new CreditScore({
            name,
            email,
            mobile_no,
            message
        });

        // Save the art to the database
        const savedData = await newData.save();
        res.status(201).json({ message: 'Credit Score Service added successfully', data: savedData , status:true});

    } catch (error) {
        console.error('Error adding  Credit Score Service', error);
        res.status(500).json({ error: 'Failed to add Credit Score Service' });
    }

};

exports.updateCreditScoreService = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await CreditScore.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "Credit Score Service not found", status: false });
    }

    const {
      name,
      email,
      mobile_no,
      message
    } = req.body;

    existing.name = name || existing.name;
    existing.email = email || existing.email;
    existing.mobile_no = mobile_no || existing.mobile_no;
    existing.message = message || existing.message;

    const updated = await existing.save();

    res.status(200).json({ message: "Credit Score Service updated successfully", data: updated, status: true });
  } catch (error) {
    console.error("Error updating Credit Score Service:", error);
    res.status(500).json({ error: "Failed to update Credit Score Service", status: false });
  }
};

exports.getAllCreditScoreService = async (req, res) => {
  try {
    const allServices = await CreditScore.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "All Credit Score Service get successfully",
      data: allServices,
      status: true
    });
  } catch (error) {
    console.error("Error get Credit Score Service:", error);
    res.status(500).json({
      message: "Failed to get Credit Score Service",
      error: error.message,
      status: false
    });
  }
};

// E-Stamp
exports.addEStampService = async (req, res) => {

    try {

        const { name, email, mobile_no, message } = req.body;

        if (!name || !email || !mobile_no) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const newData = new EStamp({
            name,
            email,
            mobile_no,
            message
        });

        // Save the art to the database
        const savedData = await newData.save();
        res.status(201).json({ message: 'EStamp Service added successfully', data: savedData , status:true});

    } catch (error) {
        console.error('Error adding  EStamp Service', error);
        res.status(500).json({ error: 'Failed to add EStamp Service' });
    }

};

exports.updateEStampService = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await EStamp.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "EStamp Service not found", status: false });
    }

    const {
      name,
      email,
      mobile_no,
      message
    } = req.body;

    existing.name = name || existing.name;
    existing.email = email || existing.email;
    existing.mobile_no = mobile_no || existing.mobile_no;
    existing.message = message || existing.message;

    const updated = await existing.save();

    res.status(200).json({ message: "EStamp Service updated successfully", data: updated, status: true });
  } catch (error) {
    console.error("Error updating EStamp Service:", error);
    res.status(500).json({ error: "Failed to update EStamp Service", status: false });
  }
};

exports.getAllEStampService = async (req, res) => {
  try {
    const allServices = await CreditScore.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "All EStamp Service get successfully",
      data: allServices,
      status: true
    });
  } catch (error) {
    console.error("Error get EStamp Service:", error);
    res.status(500).json({
      message: "Failed to get EStamp Service",
      error: error.message,
      status: false
    });
  }
};

// Business Consultation
exports.addBusinessConsultationService = async (req, res) => {

    try {

        const { name, email, mobile_no, message } = req.body;

        if (!name || !email || !mobile_no) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const newData = new BusinessConsultation({
            name,
            email,
            mobile_no,
            message
        });

        // Save the art to the database
        const savedData = await newData.save();
        res.status(201).json({ message: 'Business Consultation Service added successfully', data: savedData , status:true});

    } catch (error) {
        console.error('Error adding  Business Consultation Service', error);
        res.status(500).json({ error: 'Failed to add Business Consultation Service' });
    }

};

exports.updateBusinessConsultationService = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await BusinessConsultation.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "Business Consultation Service not found", status: false });
    }

    const {
      name,
      email,
      mobile_no,
      message
    } = req.body;

    existing.name = name || existing.name;
    existing.email = email || existing.email;
    existing.mobile_no = mobile_no || existing.mobile_no;
    existing.message = message || existing.message;

    const updated = await existing.save();

    res.status(200).json({ message: "Business Consultation Service updated successfully", data: updated, status: true });
  } catch (error) {
    console.error("Error updating Business Consultation Service:", error);
    res.status(500).json({ error: "Failed to update Business Consultation Service", status: false });
  }
};

exports.getAllBusinessConsultationService = async (req, res) => {
  try {
    const allServices = await BusinessConsultation.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "All Business Consultation Service get successfully",
      data: allServices,
      status: true
    });
  } catch (error) {
    console.error("Error get Business Consultation Service:", error);
    res.status(500).json({
      message: "Failed to get Business Consultation Service",
      error: error.message,
      status: false
    });
  }
};

// ========================= ITR Information ================================

// Submit ITR Information Form
exports.submitITRInformation = async (req, res) => {
  try {
    const {
      formType,
      // Job ITR fields
      fullName,
      pan,
      dateOfBirth,
      mobile,
      email,
      annualGrossSalary,
      tdsAsPerForm16,
      savingsAccountInterest,
      otherIncome,
      otherIncomeDescription,
      eligibleDeductions,
      deductionsDescription,
      tdsAsPerForm26AS,
      advanceSelfAssessmentTax,
      // Business ITR fields
      nameOfIndividualOrFirm,
      totalTurnoverReceipts,
      totalExpenses,
      netProfit,
      tdsTotalForm26AS,
      advanceSelfAssessmentTaxBusiness,
      otherIncomeBusiness,
      otherIncomeBusinessDescription,
      eligibleDeductionsBusiness,
      deductionsBusinessDescription,
      // Common fields
      accountNumber,
      ifscCode,
      bankName,
      accountType,
      place,
      declarationDate,
      signature
    } = req.body;

    // Validate form type
    if (!formType || !['job', 'business'].includes(formType)) {
      return res.status(400).json({
        message: 'Form type is required and must be either "job" or "business"',
        error: 'Form type is required and must be either "job" or "business"'
      });
    }

    // Validate required fields based on form type
    if (formType === 'job' && !fullName) {
      return res.status(400).json({
        message: 'Full name is required for Job ITR',
        error: 'Full name is required for Job ITR'
      });
    }

    if (formType === 'business' && !nameOfIndividualOrFirm) {
      return res.status(400).json({
        message: 'Name of Individual/Firm is required for Business ITR',
        error: 'Name of Individual/Firm is required for Business ITR'
      });
    }

    // Validate common required fields
    if (!pan || !dateOfBirth || !mobile || !email || !accountNumber || !ifscCode || !bankName || !accountType || !place || !declarationDate || !signature) {
      return res.status(400).json({
        message: 'All required fields must be provided',
        error: 'All required fields must be provided'
      });
    }

    // Create ITR information object
    const itrData = new ITRInformation({
      formType,
      // Job ITR fields
      fullName: formType === 'job' ? fullName : undefined,
      pan: pan.toUpperCase(),
      dateOfBirth: new Date(dateOfBirth),
      mobile,
      email: email.toLowerCase(),
      annualGrossSalary: annualGrossSalary || 0,
      tdsAsPerForm16: tdsAsPerForm16 || 0,
      savingsAccountInterest: savingsAccountInterest || 0,
      otherIncome: otherIncome || 0,
      otherIncomeDescription: otherIncomeDescription || '',
      eligibleDeductions: eligibleDeductions || 0,
      deductionsDescription: deductionsDescription || '',
      tdsAsPerForm26AS: tdsAsPerForm26AS || 0,
      advanceSelfAssessmentTax: advanceSelfAssessmentTax || 0,
      // Business ITR fields
      nameOfIndividualOrFirm: formType === 'business' ? nameOfIndividualOrFirm : undefined,
      totalTurnoverReceipts: totalTurnoverReceipts || 0,
      totalExpenses: totalExpenses || 0,
      netProfit: netProfit || 0,
      tdsTotalForm26AS: tdsTotalForm26AS || 0,
      advanceSelfAssessmentTaxBusiness: advanceSelfAssessmentTaxBusiness || 0,
      otherIncomeBusiness: otherIncomeBusiness || 0,
      otherIncomeBusinessDescription: otherIncomeBusinessDescription || '',
      eligibleDeductionsBusiness: eligibleDeductionsBusiness || 0,
      deductionsBusinessDescription: deductionsBusinessDescription || '',
      // Common fields
      accountNumber,
      ifscCode: ifscCode.toUpperCase(),
      bankName,
      accountType,
      place,
      declarationDate: new Date(declarationDate),
      signature,
      status: 'pending'
    });

    const savedITRData = await itrData.save();

    res.status(200).json({
      status: 200,
      message: 'ITR information submitted successfully',
      data: savedITRData
    });

  } catch (error) {
    console.error('Error submitting ITR information:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation error occurred',
        error: 'Validation error',
        details: errors
      });
    }

    res.status(500).json({
      status: 500,
      message: 'Failed to submit ITR information',
      error: error.message
    });
  }
};

// Get all ITR Information
exports.getAllITRInformation = async (req, res) => {
  try {
    const { formType, status } = req.query;
    
    let query = {};
    if (formType) {
      query.formType = formType;
    }
    if (status) {
      query.status = status;
    }

    const allITRData = await ITRInformation.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      status: 200,
      message: 'All ITR information retrieved successfully',
      data: allITRData,
      count: allITRData.length
    });
  } catch (error) {
    console.error('Error getting ITR information:', error);
    res.status(500).json({
      status: 500,
      message: 'Failed to get ITR information',
      error: error.message
    });
  }
};

// Get ITR Information by ID
exports.getITRInformationById = async (req, res) => {
  try {
    const { id } = req.params;

    const itrData = await ITRInformation.findById(id);

    if (!itrData) {
      return res.status(404).json({
        message: 'ITR information not found',
        error: 'ITR information not found'
      });
    }

    res.status(200).json({
      status: 200,
      message: 'ITR information retrieved successfully',
      data: itrData
    });
  } catch (error) {
    console.error('Error getting ITR information:', error);
    res.status(500).json({
      status: 500,
      message: 'Failed to get ITR information',
      error: error.message
    });
  }
};

// Update ITR Information
exports.updateITRInformation = async (req, res) => {
  try {
    const { id } = req.params;

    const existingITR = await ITRInformation.findById(id);
    if (!existingITR) {
      return res.status(404).json({
        status: 404,
        message: 'ITR information not found',
        error: 'ITR information not found'
      });
    }

    const {
      formType,
      fullName,
      pan,
      dateOfBirth,
      mobile,
      email,
      annualGrossSalary,
      tdsAsPerForm16,
      savingsAccountInterest,
      otherIncome,
      otherIncomeDescription,
      eligibleDeductions,
      deductionsDescription,
      tdsAsPerForm26AS,
      advanceSelfAssessmentTax,
      nameOfIndividualOrFirm,
      totalTurnoverReceipts,
      totalExpenses,
      netProfit,
      tdsTotalForm26AS,
      advanceSelfAssessmentTaxBusiness,
      otherIncomeBusiness,
      otherIncomeBusinessDescription,
      eligibleDeductionsBusiness,
      deductionsBusinessDescription,
      accountNumber,
      ifscCode,
      bankName,
      accountType,
      place,
      declarationDate,
      signature,
      status,
      remarks
    } = req.body;

    // Update fields
    if (formType) existingITR.formType = formType;
    if (fullName) existingITR.fullName = fullName;
    if (pan) existingITR.pan = pan.toUpperCase();
    if (dateOfBirth) existingITR.dateOfBirth = new Date(dateOfBirth);
    if (mobile) existingITR.mobile = mobile;
    if (email) existingITR.email = email.toLowerCase();
    if (annualGrossSalary !== undefined) existingITR.annualGrossSalary = annualGrossSalary;
    if (tdsAsPerForm16 !== undefined) existingITR.tdsAsPerForm16 = tdsAsPerForm16;
    if (savingsAccountInterest !== undefined) existingITR.savingsAccountInterest = savingsAccountInterest;
    if (otherIncome !== undefined) existingITR.otherIncome = otherIncome;
    if (otherIncomeDescription !== undefined) existingITR.otherIncomeDescription = otherIncomeDescription;
    if (eligibleDeductions !== undefined) existingITR.eligibleDeductions = eligibleDeductions;
    if (deductionsDescription !== undefined) existingITR.deductionsDescription = deductionsDescription;
    if (tdsAsPerForm26AS !== undefined) existingITR.tdsAsPerForm26AS = tdsAsPerForm26AS;
    if (advanceSelfAssessmentTax !== undefined) existingITR.advanceSelfAssessmentTax = advanceSelfAssessmentTax;
    if (nameOfIndividualOrFirm) existingITR.nameOfIndividualOrFirm = nameOfIndividualOrFirm;
    if (totalTurnoverReceipts !== undefined) existingITR.totalTurnoverReceipts = totalTurnoverReceipts;
    if (totalExpenses !== undefined) existingITR.totalExpenses = totalExpenses;
    if (netProfit !== undefined) existingITR.netProfit = netProfit;
    if (tdsTotalForm26AS !== undefined) existingITR.tdsTotalForm26AS = tdsTotalForm26AS;
    if (advanceSelfAssessmentTaxBusiness !== undefined) existingITR.advanceSelfAssessmentTaxBusiness = advanceSelfAssessmentTaxBusiness;
    if (otherIncomeBusiness !== undefined) existingITR.otherIncomeBusiness = otherIncomeBusiness;
    if (otherIncomeBusinessDescription !== undefined) existingITR.otherIncomeBusinessDescription = otherIncomeBusinessDescription;
    if (eligibleDeductionsBusiness !== undefined) existingITR.eligibleDeductionsBusiness = eligibleDeductionsBusiness;
    if (deductionsBusinessDescription !== undefined) existingITR.deductionsBusinessDescription = deductionsBusinessDescription;
    if (accountNumber) existingITR.accountNumber = accountNumber;
    if (ifscCode) existingITR.ifscCode = ifscCode.toUpperCase();
    if (bankName) existingITR.bankName = bankName;
    if (accountType) existingITR.accountType = accountType;
    if (place) existingITR.place = place;
    if (declarationDate) existingITR.declarationDate = new Date(declarationDate);
    if (signature) existingITR.signature = signature;
    if (status) existingITR.status = status;
    if (remarks !== undefined) existingITR.remarks = remarks;

    const updatedITR = await existingITR.save();

    res.status(200).json({
      status: 200,
      message: 'ITR information updated successfully',
      data: updatedITR
    });
  } catch (error) {
    console.error('Error updating ITR information:', error);
    res.status(500).json({
      status: 500,
      message: 'Failed to update ITR information',
      error: error.message
    });
  }
};

// Delete ITR Information
exports.deleteITRInformation = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedITR = await ITRInformation.findByIdAndDelete(id);

    if (!deletedITR) {
      return res.status(404).json({
        status: 404,
        message: 'ITR information not found',
        error: 'ITR information not found'
      });
    }

    res.status(200).json({
      status: 200,
      message: 'ITR information deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting ITR information:', error);
    res.status(500).json({
      status: 500,
      message: 'Failed to delete ITR information',
      error: error.message
    });
  }
};

// ========================= MSME Registration ================================

// Submit MSME Registration Form (API 135 - Look here: postman-examples/MSME_API_Guide.md)
exports.submitMSMERegistration = async (req, res) => {
  try {
    const {
      userId,
      aadhaarNo,
      nameOnAadhaar,
      mobileLinkedToAadhaar,
      email,
      enterpriseName,
      organisationType,
      pan,
      gstin,
      doorShopNo,
      street,
      areaLocality,
      city,
      pinCode,
      date,
      majorActivity,
      nicCode,
      description,
      totalEmployeesMale,
      totalEmployeesFemale,
      totalEmployeesOthers,
      investmentInMachineryEquipment,
      annualTurnoverLastFY,
      accountNumber,
      ifscCode,
      bankName,
      accountType,
      place,
      declarationDate,
      signature
    } = req.body;

    const msmeData = new MSMERegistration({
      userId: userId || undefined,
      aadhaarNo,
      nameOnAadhaar,
      mobileLinkedToAadhaar,
      email: email ? email.toLowerCase() : undefined,
      enterpriseName,
      organisationType,
      pan: pan ? pan.toUpperCase() : undefined,
      gstin: gstin ? gstin.toUpperCase() : undefined,
      doorShopNo,
      street,
      areaLocality,
      city,
      pinCode,
      date: date ? new Date(date) : undefined,
      majorActivity,
      nicCode,
      description: description || '',
      totalEmployeesMale: totalEmployeesMale ?? 0,
      totalEmployeesFemale: totalEmployeesFemale ?? 0,
      totalEmployeesOthers: totalEmployeesOthers ?? 0,
      investmentInMachineryEquipment,
      annualTurnoverLastFY,
      accountNumber,
      ifscCode: ifscCode ? ifscCode.toUpperCase() : undefined,
      bankName,
      accountType,
      place,
      declarationDate: declarationDate ? new Date(declarationDate) : undefined,
      signature
    });

    const savedMSME = await msmeData.save();

    res.status(200).json({
      status: 200,
      message: 'MSME registration submitted successfully',
      data: savedMSME
    });
  } catch (error) {
    console.error('Error submitting MSME registration:', error);
    res.status(500).json({
      status: 500,
      message: 'Failed to submit MSME registration',
      error: error.message
    });
  }
};

// Get all MSME Registrations (API 136 - Look here: postman-examples/MSME_API_Guide.md)
exports.getAllMSMERegistrations = async (req, res) => {
  try {
    const { userId, organisationType, status } = req.query;
    const query = {};
    if (userId) query.userId = userId;
    if (organisationType) query.organisationType = organisationType;
    if (status) query.status = status;

    const data = await MSMERegistration.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      status: 200,
      message: 'All MSME registrations retrieved successfully',
      data,
      count: data.length
    });
  } catch (error) {
    console.error('Error getting MSME registrations:', error);
    res.status(500).json({
      status: 500,
      message: 'Failed to get MSME registrations',
      error: error.message
    });
  }
};

// Get MSME Registration by ID
exports.getMSMERegistrationById = async (req, res) => {
  try {
    const { id } = req.params;
    const msme = await MSMERegistration.findById(id);

    if (!msme) {
      return res.status(404).json({
        status: 404,
        message: 'MSME registration not found',
        error: 'MSME registration not found'
      });
    }

    res.status(200).json({
      status: 200,
      message: 'MSME registration retrieved successfully',
      data: msme
    });
  } catch (error) {
    console.error('Error getting MSME registration by ID:', error);
    res.status(500).json({
      status: 500,
      message: 'Failed to get MSME registration',
      error: error.message
    });
  }
};

// Update MSME Registration
exports.updateMSMERegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await MSMERegistration.findById(id);

    if (!existing) {
      return res.status(404).json({
        status: 404,
        message: 'MSME registration not found',
        error: 'MSME registration not found'
      });
    }

    const {
      userId,
      aadhaarNo,
      nameOnAadhaar,
      mobileLinkedToAadhaar,
      email,
      enterpriseName,
      organisationType,
      pan,
      gstin,
      doorShopNo,
      street,
      areaLocality,
      city,
      pinCode,
      date,
      majorActivity,
      nicCode,
      description,
      totalEmployeesMale,
      totalEmployeesFemale,
      totalEmployeesOthers,
      investmentInMachineryEquipment,
      annualTurnoverLastFY,
      accountNumber,
      ifscCode,
      bankName,
      accountType,
      place,
      declarationDate,
      signature,
      status,
      remarks
    } = req.body;

    if (aadhaarNo !== undefined) existing.aadhaarNo = aadhaarNo;
    if (nameOnAadhaar !== undefined) existing.nameOnAadhaar = nameOnAadhaar;
    if (mobileLinkedToAadhaar !== undefined) existing.mobileLinkedToAadhaar = mobileLinkedToAadhaar;
    if (email !== undefined) existing.email = email.toLowerCase();
    if (enterpriseName !== undefined) existing.enterpriseName = enterpriseName;
    if (organisationType !== undefined) existing.organisationType = organisationType;
    if (pan !== undefined) existing.pan = pan.toUpperCase();
    if (gstin !== undefined) existing.gstin = gstin ? gstin.toUpperCase() : gstin;
    if (doorShopNo !== undefined) existing.doorShopNo = doorShopNo;
    if (street !== undefined) existing.street = street;
    if (areaLocality !== undefined) existing.areaLocality = areaLocality;
    if (city !== undefined) existing.city = city;
    if (pinCode !== undefined) existing.pinCode = pinCode;
    if (date !== undefined) existing.date = new Date(date);
    if (majorActivity !== undefined) existing.majorActivity = majorActivity;
    if (nicCode !== undefined) existing.nicCode = nicCode;
    if (description !== undefined) existing.description = description;
    if (totalEmployeesMale !== undefined) existing.totalEmployeesMale = totalEmployeesMale;
    if (totalEmployeesFemale !== undefined) existing.totalEmployeesFemale = totalEmployeesFemale;
    if (totalEmployeesOthers !== undefined) existing.totalEmployeesOthers = totalEmployeesOthers;
    if (investmentInMachineryEquipment !== undefined) existing.investmentInMachineryEquipment = investmentInMachineryEquipment;
    if (annualTurnoverLastFY !== undefined) existing.annualTurnoverLastFY = annualTurnoverLastFY;
    if (accountNumber !== undefined) existing.accountNumber = accountNumber;
    if (ifscCode !== undefined) existing.ifscCode = ifscCode.toUpperCase();
    if (bankName !== undefined) existing.bankName = bankName;
    if (accountType !== undefined) existing.accountType = accountType;
    if (place !== undefined) existing.place = place;
    if (declarationDate !== undefined) existing.declarationDate = new Date(declarationDate);
    if (signature !== undefined) existing.signature = signature;
    if (status !== undefined) existing.status = status;
    if (remarks !== undefined) existing.remarks = remarks;
    if (userId !== undefined) existing.userId = userId;

    const updated = await existing.save();

    res.status(200).json({
      status: 200,
      message: 'MSME registration updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating MSME registration:', error);
    res.status(500).json({
      status: 500,
      message: 'Failed to update MSME registration',
      error: error.message
    });
  }
};

// Delete MSME Registration
exports.deleteMSMERegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await MSMERegistration.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        status: 404,
        message: 'MSME registration not found',
        error: 'MSME registration not found'
      });
    }

    res.status(200).json({
      status: 200,
      message: 'MSME registration deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting MSME registration:', error);
    res.status(500).json({
      status: 500,
      message: 'Failed to delete MSME registration',
      error: error.message
    });
  }
};

// ========================= Gumasta License ================================

// Submit Gumasta License Form (API 137 - Look here: Gumasta API doc)
exports.submitGumastaLicense = async (req, res) => {
  try {
    const {
      userId,
      applicantAuthorizedPersonName,
      fatherSpouseName,
      designation,
      mobileNo,
      emailId,
      aadhaarNo,
      panNo,
      firmName,
      buildingShopNo,
      streetRoad,
      areaLocality,
      city,
      district,
      pinCode,
      natureOfBusinessActivity,
      category,
      premisesStatus,
      dateOfEstablishment,
      totalEmployeesMale,
      totalEmployeesFemale,
      totalEmployeesDifferently,
      documentChecklist
    } = req.body;

    const gumastaData = new GumastaLicense({
      userId: userId || undefined,
      applicantAuthorizedPersonName,
      fatherSpouseName,
      designation,
      mobileNo,
      emailId,
      aadhaarNo,
      panNo,
      firmName,
      buildingShopNo,
      streetRoad,
      areaLocality,
      city,
      district,
      pinCode,
      natureOfBusinessActivity,
      category: category || { shop: false, commercialEstablishment: false },
      premisesStatus,
      dateOfEstablishment: dateOfEstablishment ? new Date(dateOfEstablishment) : undefined,
      totalEmployeesMale: totalEmployeesMale ?? 0,
      totalEmployeesFemale: totalEmployeesFemale ?? 0,
      totalEmployeesDifferently: totalEmployeesDifferently ?? 0,
      documentChecklist: documentChecklist || {}
    });

    const savedGumasta = await gumastaData.save();

    res.status(200).json({
      status: 200,
      message: 'Gumasta License form submitted successfully',
      data: savedGumasta
    });
  } catch (error) {
    console.error('Error submitting Gumasta License:', error);
    res.status(500).json({
      status: 500,
      message: 'Failed to submit Gumasta License form',
      error: error.message
    });
  }
};

// Get all Gumasta Licenses (API 136 - Look here: Gumasta API doc)
exports.getAllGumastaLicenses = async (req, res) => {
  try {
    const { userId, designation, status } = req.query;
    const query = {};
    if (userId) query.userId = userId;
    if (designation) query.designation = designation;
    if (status) query.status = status;

    const data = await GumastaLicense.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      status: 200,
      message: 'All Gumasta License forms retrieved successfully',
      data,
      count: data.length
    });
  } catch (error) {
    console.error('Error getting Gumasta Licenses:', error);
    res.status(500).json({
      status: 500,
      message: 'Failed to get Gumasta Licenses',
      error: error.message
    });
  }
};

// Get Gumasta License by ID
exports.getGumastaLicenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const gumasta = await GumastaLicense.findById(id);

    if (!gumasta) {
      return res.status(404).json({
        status: 404,
        message: 'Gumasta License not found',
        error: 'Gumasta License not found'
      });
    }

    res.status(200).json({
      status: 200,
      message: 'Gumasta License retrieved successfully',
      data: gumasta
    });
  } catch (error) {
    console.error('Error getting Gumasta License by ID:', error);
    res.status(500).json({
      status: 500,
      message: 'Failed to get Gumasta License',
      error: error.message
    });
  }
};

// Update Gumasta License
exports.updateGumastaLicense = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await GumastaLicense.findById(id);

    if (!existing) {
      return res.status(404).json({
        status: 404,
        message: 'Gumasta License not found',
        error: 'Gumasta License not found'
      });
    }

    const {
      userId,
      applicantAuthorizedPersonName,
      fatherSpouseName,
      designation,
      mobileNo,
      emailId,
      aadhaarNo,
      panNo,
      firmName,
      buildingShopNo,
      streetRoad,
      areaLocality,
      city,
      district,
      pinCode,
      natureOfBusinessActivity,
      category,
      premisesStatus,
      dateOfEstablishment,
      totalEmployeesMale,
      totalEmployeesFemale,
      totalEmployeesDifferently,
      documentChecklist,
      status,
      remarks
    } = req.body;

    if (applicantAuthorizedPersonName !== undefined) existing.applicantAuthorizedPersonName = applicantAuthorizedPersonName;
    if (fatherSpouseName !== undefined) existing.fatherSpouseName = fatherSpouseName;
    if (designation !== undefined) existing.designation = designation;
    if (mobileNo !== undefined) existing.mobileNo = mobileNo;
    if (emailId !== undefined) existing.emailId = emailId;
    if (aadhaarNo !== undefined) existing.aadhaarNo = aadhaarNo;
    if (panNo !== undefined) existing.panNo = panNo;
    if (firmName !== undefined) existing.firmName = firmName;
    if (buildingShopNo !== undefined) existing.buildingShopNo = buildingShopNo;
    if (streetRoad !== undefined) existing.streetRoad = streetRoad;
    if (areaLocality !== undefined) existing.areaLocality = areaLocality;
    if (city !== undefined) existing.city = city;
    if (district !== undefined) existing.district = district;
    if (pinCode !== undefined) existing.pinCode = pinCode;
    if (natureOfBusinessActivity !== undefined) existing.natureOfBusinessActivity = natureOfBusinessActivity;
    if (category !== undefined) existing.category = category;
    if (premisesStatus !== undefined) existing.premisesStatus = premisesStatus;
    if (dateOfEstablishment !== undefined) existing.dateOfEstablishment = new Date(dateOfEstablishment);
    if (totalEmployeesMale !== undefined) existing.totalEmployeesMale = totalEmployeesMale;
    if (totalEmployeesFemale !== undefined) existing.totalEmployeesFemale = totalEmployeesFemale;
    if (totalEmployeesDifferently !== undefined) existing.totalEmployeesDifferently = totalEmployeesDifferently;
    if (documentChecklist !== undefined) existing.documentChecklist = documentChecklist;
    if (status !== undefined) existing.status = status;
    if (remarks !== undefined) existing.remarks = remarks;
    if (userId !== undefined) existing.userId = userId;

    const updated = await existing.save();

    res.status(200).json({
      status: 200,
      message: 'Gumasta License updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating Gumasta License:', error);
    res.status(500).json({
      status: 500,
      message: 'Failed to update Gumasta License',
      error: error.message
    });
  }
};

// Delete Gumasta License
exports.deleteGumastaLicense = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await GumastaLicense.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        status: 404,
        message: 'Gumasta License not found',
        error: 'Gumasta License not found'
      });
    }

    res.status(200).json({
      status: 200,
      message: 'Gumasta License deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting Gumasta License:', error);
    res.status(500).json({
      status: 500,
      message: 'Failed to delete Gumasta License',
      error: error.message
    });
  }
};
