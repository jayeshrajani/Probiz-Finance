// Form schemas for every public form. Field names match what server/controllers read.
// Field: { name, label, type, required, options, half, help, showIf(values), inputMode, maxLength }
// Option values can be strings or { value, label } when the backend needs a different value.

const YES_NO = ["Yes", "No"];
const YES_NO_BOOL = [
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
];
const INCOME_TYPE = ["Account", "Cash", "Both"];
const PROFESSION = ["Job", "Business"];
const PROPERTY_TYPE = ["Plot", "Under Construction", "Ready to Move"];
const RESIDENCE = ["Owned", "Rented"];
const BUSINESS_CERT = [
  "Gumasta",
  "MSME",
  "Nagar Nigam Certificate",
  "Certificate of Incorporation",
  "GST Number",
  "Others",
  "No",
];

const isBusiness = (v) => v.profession === "Business";
const isJob = (v) => v.profession !== "Business";

const applicant = ({ altName = "alternateContact", altRequired = false, address = "address" } = {}) => [
  { name: "fullName", label: "Full name (as on Aadhaar)", type: "text", required: true, autoComplete: "name" },
  { name: "dateOfBirth", label: "Date of birth", type: "date", required: true, half: true, autoComplete: "bday" },
  { name: "contactNumber", label: "Mobile number", type: "tel", required: true, half: true, autoComplete: "tel" },
  { name: altName, label: "Alternate number", type: "tel", required: altRequired, half: true },
  { name: address, label: "Address (as on Aadhaar)", type: "text", required: true, autoComplete: "street-address" },
];

const cibil = { name: "cibilScore", label: "CIBIL score, if known", type: "number", half: true, inputMode: "numeric" };
const itr = { name: "incomeTaxReturn", label: "Do you file income tax returns?", type: "select", options: YES_NO, half: true };

const propertyLoan = {
  steps: [
    { id: "applicant", title: "About you", fields: applicant() },
    {
      id: "property",
      title: "Property and loan",
      fields: [
        { name: "propertyType", label: "Property stage", type: "select", options: PROPERTY_TYPE, half: true },
        { name: "loanAmount", label: "Loan amount needed (₹)", type: "number", half: true, inputMode: "numeric" },
        { name: "propertySize", label: "Property size (sq ft)", type: "number", half: true, inputMode: "numeric" },
        { name: "constructionSize", label: "Built-up area (sq ft)", type: "number", half: true, inputMode: "numeric" },
        { name: "marketValue", label: "Market value (₹)", type: "number", inputMode: "numeric" },
      ],
    },
    {
      id: "income",
      title: "Income",
      fields: [
        { name: "profession", label: "You are", type: "select", options: [{ value: "Job", label: "Salaried" }, { value: "Business", label: "Self-employed" }], half: true },
        { name: "incomeType", label: "Income received in", type: "select", options: INCOME_TYPE, half: true },
        { name: "monthlyIncome", label: "Monthly income (₹)", type: "number", half: true, inputMode: "numeric" },
        itr,
        { name: "businessCertificate", label: "Business registration", type: "select", options: BUSINESS_CERT, half: true, showIf: isBusiness },
        {
          name: "gstNumber",
          label: "GST number",
          type: "text",
          half: true,
          required: true,
          pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
          patternMessage: "Enter a valid 15-character GSTIN, e.g. 27ABCDE1234F1Z5",
          uppercase: true,
          showIf: (v) => isBusiness(v) && /gst/i.test(v.businessCertificate || ""),
        },
        cibil,
        { name: "otherIncomeSource", label: "Any other income?", type: "select", options: YES_NO, half: true },
        { name: "otherIncomeAmount", label: "Other monthly income (₹)", type: "number", half: true, inputMode: "numeric", showIf: (v) => v.otherIncomeSource === "Yes" },
      ],
    },
  ],
  files: [
    { name: "aadharFront", label: "Aadhaar, front" },
    { name: "aadharBack", label: "Aadhaar, back" },
    { name: "panCard", label: "PAN card" },
    { name: "electricityBill", label: "Electricity bill" },
    { name: "bankStatement", label: "Bank statement" },
    { name: "salarySlipOrOfferLetter", label: "Salary slip or offer letter", showIf: isJob },
    { name: "forBusiness", label: "Business registration proof", showIf: isBusiness },
    { name: "incomeTaxReturnFile", label: "Income tax return" },
    { name: "propertyPaper", label: "Property papers" },
    { name: "propertyTaxReceipt", label: "Property tax receipt" },
    { name: "propertyFront", label: "Property photo, front" },
    { name: "propertyInside", label: "Property photo, inside" },
  ],
};

const salariedLoan = (profession = PROFESSION) => ({
  steps: [
    { id: "applicant", title: "About you", fields: applicant({ altName: "alternateContactNumber" }) },
    {
      id: "work",
      title: "Work and loan",
      fields: [
        { name: "loanAmountRequired", label: "Loan amount needed (₹)", type: "number", half: true, inputMode: "numeric" },
        { name: "residenceType", label: "Your home is", type: "select", options: RESIDENCE, half: true },
        { name: "profession", label: "You are", type: "select", options: profession.map((p) => ({ value: p, label: p === "Job" ? "Salaried" : "Self-employed" })), half: true },
        { name: "companyName", label: "Employer or business name", type: "text", half: true, autoComplete: "organization" },
        { name: "reportingManagerName", label: "Reporting manager", type: "text", half: true, showIf: isJob },
        { name: "reportingManagerContactNumber", label: "Manager's phone", type: "tel", half: true, showIf: isJob },
        { name: "incomeType", label: "Income received in", type: "select", options: INCOME_TYPE, half: true },
        { name: "monthlySalary", label: "Monthly income (₹)", type: "number", half: true, inputMode: "numeric" },
        itr,
        cibil,
      ],
    },
  ],
  files: [
    { name: "aadharFront", label: "Aadhaar, front" },
    { name: "aadharBack", label: "Aadhaar, back" },
    { name: "panCard", label: "PAN card" },
    { name: "electricityBillOrRentAgreement", label: "Electricity bill or rent agreement" },
    { name: "bankStatement", label: "Bank statement" },
    { name: "salarySlips", label: "Salary slips" },
    { name: "offerLetter", label: "Offer letter" },
    { name: "incomeTaxReturnFile", label: "Income tax return" },
  ],
});

const businessLoan = {
  steps: [
    { id: "applicant", title: "About you", fields: applicant({ altName: "alternateContactNumber" }) },
    {
      id: "business",
      title: "Business and loan",
      fields: [
        { name: "businessName", label: "Business name", type: "text", half: true, autoComplete: "organization" },
        { name: "loanAmountRequired", label: "Loan amount needed (₹)", type: "number", half: true, inputMode: "numeric" },
        { name: "businessCertificate", label: "Business registration", type: "select", options: BUSINESS_CERT, half: true },
        { name: "incomeType", label: "Income received in", type: "select", options: INCOME_TYPE, half: true },
        { name: "totalMonthlyIncome", label: "Monthly income (₹)", type: "number", half: true, inputMode: "numeric" },
        itr,
        cibil,
      ],
    },
  ],
  files: [
    { name: "aadharFront", label: "Aadhaar, front" },
    { name: "aadharBack", label: "Aadhaar, back" },
    { name: "panCard", label: "PAN card" },
    { name: "electricityBillOrRentAgreement", label: "Electricity bill or rent agreement" },
    { name: "bankStatement", label: "Bank statement" },
    { name: "businessDocuments", label: "Business documents" },
    { name: "incomeTaxReturnFile", label: "Income tax return" },
  ],
};

const quickLead = (endpoint, typeOptions, { emailRequired = true } = {}) => ({
  endpoint,
  json: true,
  steps: [
    {
      id: "details",
      title: "Your details",
      fields: [
        { name: "loan_Type", label: "What are you looking for?", type: "select", options: typeOptions, required: true },
        { name: "first_Name", label: "First name", type: "text", required: true, half: true, autoComplete: "given-name" },
        { name: "last_Name", label: "Last name", type: "text", required: true, half: true, autoComplete: "family-name" },
        { name: "mobile_no", label: "Mobile number", type: "tel", required: true, half: true, autoComplete: "tel" },
        { name: "dateOfBirth", label: "Date of birth", type: "date", required: true, half: true, autoComplete: "bday" },
        { name: "email", label: "Email", type: "email", required: emailRequired, autoComplete: "email" },
      ],
    },
  ],
  submitLabel: "Request a quote",
});

export const HEALTH_TYPES = [
  "Individual Health Insurance",
  "Family Health Insurance",
  "Super Top-Up Health Insurance",
  "Critical Illness Health Insurance",
  "Personal Accident Insurance Policy",
  "Hospital Daily Cash Insurance",
  "Mediclaim Insurance",
  "Group Health Insurance",
  "Disease-Specific (M-Care, Corona Kavach, etc.)",
  "ULIPs Insurance",
  "Home Insurance",
  "Building Insurance",
  "Fire Insurance",
  "Commercial Insurance",
  "Home Loan Insurance",
];

export const MOTOR_TYPES = [
  "Car Insurance",
  "Bike Insurance",
  "Commercial Vehicle Insurance",
  "Zero Dep Car Insurance",
  "Comprehensive Insurance",
  "Third Party Insurance",
  "Third Party Bike Insurance",
  "Electric Car Insurance",
  "E-Bike Insurance",
  "Pay As You Drive Insurance",
  "Best Car Insurance Companies",
  "Car Insurance Calculator",
  "Bike Insurance Calculator",
  "IDV Calculator",
  "Car Valuation",
];

export const INVESTMENT_TYPES = [
  "Investment Plans with High Returns",
  "Market Linked Investment Plans (ULIP)",
  "Investment Plans for NRIs",
  "SIP (Systematic Investment Plan)",
  "SIP Calculator",
  "Capital Guarantee Plans",
  "Child Plans",
  "Pension Plans",
  "Guaranteed Return Plans",
  "Tax Saving Investments",
  "Endowment Policy",
  "Money Back Policy",
  "Annuity Plans",
  "Income Tax Calculator",
];

const enquiry = (endpoint, { messageRequired = false, messageLabel = "How can we help?" } = {}) => ({
  endpoint,
  json: true,
  steps: [
    {
      id: "details",
      title: "Your details",
      fields: [
        { name: "name", label: "Full name", type: "text", required: true, autoComplete: "name" },
        { name: "mobile_no", label: "Mobile number", type: "tel", required: true, half: true, autoComplete: "tel" },
        { name: "email", label: "Email", type: "email", required: true, half: true, autoComplete: "email" },
        { name: "message", label: messageLabel, type: "textarea", required: messageRequired },
      ],
    },
  ],
  submitLabel: "Send enquiry",
});

export const forms = {
  homeloan: { endpoint: "loanOfferDetail", ...propertyLoan },
  plotpurchaseloan: { endpoint: "addPlotPurchaseLoanOfferDetail", ...propertyLoan },
  plotpurchaseconstruction: { endpoint: "addPlotPurchaseConstructionLoanOfferDetail", ...propertyLoan },
  flatpurchase: { endpoint: "addFlatPurchaseLoanOfferDetail", ...propertyLoan },
  mortrageloan: { endpoint: "addLoanagainstPropertyOfferDetail", ...propertyLoan },
  constructionloan: { endpoint: "addconstructionLoanDetail", ...propertyLoan },
  commercialproperty: { endpoint: "addCommercialPropertyPurchaseOfferDetail", ...propertyLoan },
  commercialpropertymortgage: { endpoint: "addCommercialPropertyMortgageOfferDetail", ...propertyLoan },
  homerennovation: { endpoint: "addHomeRenovationDetail", ...propertyLoan },

  personalloan: { endpoint: "personalLoanApplication", ...salariedLoan(["Job"]) },
  pradhanmantriloan: { endpoint: "pradhanmantrimodrayojnaLoanApplication", ...salariedLoan() },
  buisnessloan: { endpoint: "businessLoanDetail", ...businessLoan },
  projectfunding: { endpoint: "projectfundingLoanDetail", ...businessLoan },

  balancetransfer: {
    endpoint: "addBalanceTransferDetail",
    steps: [
      { id: "applicant", title: "About you", fields: applicant() },
      {
        id: "loan",
        title: "Current loan",
        fields: [
          { name: "propertyType", label: "Property stage", type: "select", options: PROPERTY_TYPE, half: true },
          { name: "loanAmount", label: "Loan amount needed (₹)", type: "number", half: true, inputMode: "numeric" },
          { name: "noOfStallmentCurrentLoan", label: "EMIs paid on current loan", type: "number", half: true, inputMode: "numeric" },
          { name: "profession", label: "You are", type: "select", options: [{ value: "Job", label: "Salaried" }, { value: "Business", label: "Self-employed" }], half: true },
          { name: "incomeType", label: "Income received in", type: "select", options: INCOME_TYPE, half: true },
          { name: "monthlyIncome", label: "Monthly income (₹)", type: "number", half: true, inputMode: "numeric" },
          itr,
          cibil,
        ],
      },
    ],
    files: [
      { name: "aadharFront", label: "Aadhaar, front" },
      { name: "aadharBack", label: "Aadhaar, back" },
      { name: "panCard", label: "PAN card" },
      { name: "electricityBillOrRentAgreement", label: "Electricity bill or rent agreement" },
      { name: "bankStatement", label: "Bank statement" },
      { name: "loanAccountStatement", label: "Current loan account statement" },
      { name: "listOfDocuments", label: "List of documents held by lender" },
      { name: "foreclosureLetter", label: "Foreclosure letter" },
      { name: "incomeTaxReturnFile", label: "Income tax return" },
      { name: "businessProof", label: "Business registration proof", showIf: isBusiness },
      { name: "officeShopProof", label: "Office or shop proof", showIf: isBusiness },
      { name: "propertyPhotoFront", label: "Property photo, front" },
      { name: "propertyPhotoInside", label: "Property photo, inside" },
    ],
  },

  balancetransfertopup: {
    endpoint: "addBalanceTransferTopUpDetail",
    steps: [
      { id: "applicant", title: "About you", fields: applicant() },
      {
        id: "loan",
        title: "Current loan",
        fields: [
          { name: "currentLoanAmount", label: "Current loan outstanding (₹)", type: "number", half: true, inputMode: "numeric" },
          { name: "currentLoanInstallmentsPaid", label: "EMIs paid so far", type: "number", half: true, inputMode: "numeric" },
          { name: "loanAmountRequired", label: "Top-up needed (₹)", type: "number", half: true, inputMode: "numeric" },
          { name: "residenceType", label: "Your home is", type: "select", options: RESIDENCE, half: true },
          { name: "profession", label: "You are", type: "select", options: [{ value: "Job", label: "Salaried" }, { value: "Business", label: "Self-employed" }], half: true },
          { name: "incomeType", label: "Income received in", type: "select", options: INCOME_TYPE, half: true },
          { name: "totalMonthlyIncome", label: "Monthly income (₹)", type: "number", half: true, inputMode: "numeric" },
          itr,
          cibil,
        ],
      },
    ],
    files: [
      { name: "aadharFront", label: "Aadhaar, front" },
      { name: "aadharBack", label: "Aadhaar, back" },
      { name: "panCard", label: "PAN card" },
      { name: "electricityOrRentAgreement", label: "Electricity bill or rent agreement" },
      { name: "bankStatementLastYear", label: "Bank statement, last 12 months" },
      { name: "loanAccountStatement", label: "Current loan account statement" },
      { name: "listOfDocumentsByBank", label: "List of documents held by lender" },
      { name: "foreclosureLetter", label: "Foreclosure letter" },
      { name: "incomeTaxReturnFile", label: "Income tax return" },
      { name: "forBusinessDocuments", label: "Business registration proof", showIf: isBusiness },
      { name: "officeShopElectricityOrRent", label: "Office or shop bill or rent agreement", showIf: isBusiness },
      { name: "propertyPhotoFront", label: "Property photo, front" },
      { name: "propertyPhotoInside", label: "Property photo, inside" },
    ],
  },

  carloan: {
    endpoint: "carLoanDetail",
    steps: [
      { id: "applicant", title: "About you", fields: applicant({ altName: "alternateContactNumber", altRequired: true }) },
      {
        id: "car",
        title: "Car and loan",
        fields: [
          { name: "carType", label: "Car", type: "select", options: [{ value: "New Car", label: "New car" }, { value: "Old Car", label: "Used car" }], half: true },
          { name: "carBrand", label: "Make", type: "text", half: true, help: "For example, Maruti Suzuki" },
          { name: "brand", label: "Model", type: "text", half: true, help: "For example, Baleno Zeta" },
          { name: "yearOfMake", label: "Year of manufacture", type: "number", half: true, inputMode: "numeric", maxLength: 4 },
          { name: "onRoadPrice", label: "On-road price or valuation (₹)", type: "number", half: true, inputMode: "numeric" },
          { name: "loanAmountRequired", label: "Loan amount needed (₹)", type: "number", half: true, inputMode: "numeric" },
        ],
      },
      {
        id: "income",
        title: "Income",
        fields: [
          { name: "profession", label: "You are", type: "select", options: [{ value: "Job", label: "Salaried" }, { value: "Business", label: "Self-employed" }], half: true },
          { name: "incomeType", label: "Income received in", type: "select", options: INCOME_TYPE, half: true },
          { name: "totalMonthlyIncome", label: "Monthly income (₹)", type: "number", half: true, inputMode: "numeric" },
          { ...cibil, type: "text" },
          { name: "otherIncomeSource", label: "Any other income?", type: "select", options: YES_NO_BOOL, half: true },
          { name: "otherIncomeAmount", label: "Other monthly income (₹)", type: "number", half: true, inputMode: "numeric", showIf: (v) => v.otherIncomeSource === "true" },
        ],
      },
    ],
    files: [
      { name: "aadharFront", label: "Aadhaar, front" },
      { name: "aadharBack", label: "Aadhaar, back" },
      { name: "panCard", label: "PAN card" },
      { name: "electricityBillOrRentAgreement", label: "Electricity bill or rent agreement" },
      { name: "bankStatement", label: "Bank statement" },
      { name: "salarySlipOrOfferLetter", label: "Salary slip or offer letter", showIf: isJob },
      { name: "businessDocuments", label: "Business documents", showIf: isBusiness },
      { name: "carQuotation", label: "Dealer quotation", showIf: (v) => v.carType !== "Old Car" },
      { name: "carRC", label: "Car RC", showIf: (v) => v.carType === "Old Car" },
      { name: "insurance", label: "Car insurance", showIf: (v) => v.carType === "Old Car" },
      { name: "carPhoto", label: "Car photo", showIf: (v) => v.carType === "Old Car" },
    ],
  },

  creditcard: {
    endpoint: "creditCardDetail",
    steps: [
      { id: "applicant", title: "About you", fields: applicant({ altRequired: true }) },
      {
        id: "income",
        title: "Income",
        fields: [
          { name: "profession", label: "You are", type: "select", options: [{ value: "Job", label: "Salaried" }, { value: "Business", label: "Self-employed" }], half: true },
          { name: "incomeType", label: "Income received in", type: "select", options: INCOME_TYPE, half: true },
          { name: "monthlyIncome", label: "Monthly income (₹)", type: "number", half: true, inputMode: "numeric" },
          cibil,
        ],
      },
    ],
    files: [
      { name: "aadharFront", label: "Aadhaar, front" },
      { name: "aadharBack", label: "Aadhaar, back" },
      { name: "panCard", label: "PAN card" },
      { name: "electricityBill", label: "Electricity bill or rent agreement" },
      { name: "bankStatement", label: "Bank statement" },
      { name: "salarySlipOrOfferLetter", label: "Last 3 salary slips or offer letter" },
    ],
  },

  educationloan: {
    endpoint: "addEducationLoan",
    steps: [
      {
        id: "student",
        title: "Student",
        fields: [
          { name: "fullName", label: "Student's full name", type: "text", required: true, autoComplete: "name" },
          { name: "fatherOrHusbandName", label: "Father's or husband's name", type: "text", half: true },
          { name: "dateOfBirth", label: "Date of birth", type: "date", half: true },
          { name: "contactNumber", label: "Mobile number", type: "tel", required: true, half: true, autoComplete: "tel" },
          { name: "email", label: "Email", type: "email", half: true, autoComplete: "email" },
          { name: "permanentAddress", label: "Permanent address", type: "text", autoComplete: "street-address" },
        ],
      },
      {
        id: "course",
        title: "Course",
        fields: [
          { name: "courseName", label: "Course", type: "text", half: true },
          { name: "institutionName", label: "College or university", type: "text", half: true },
          { name: "institutionAddress", label: "Institution address", type: "text" },
          { name: "admissionDate", label: "Admission date", type: "date", half: true },
          { name: "courseDuration", label: "Course duration", type: "text", half: true, help: "For example, 4 years" },
          { name: "totalFees", label: "Total fees (₹)", type: "number", half: true, inputMode: "numeric" },
          { name: "loanAmountRequired", label: "Loan amount needed (₹)", type: "number", half: true, inputMode: "numeric" },
        ],
      },
      {
        id: "family",
        title: "Co-applicant",
        fields: [
          { name: "occupationOrBusiness", label: "Family occupation or business", type: "text", half: true },
          { name: "monthlyOrAnnualIncome", label: "Family income (₹ per month)", type: "number", half: true, inputMode: "numeric" },
          { name: "coApplicantName", label: "Co-applicant's name", type: "text", half: true },
          { name: "coApplicantRelationship", label: "Relationship to student", type: "text", half: true },
          { name: "coApplicantFatherOrHusbandName", label: "Co-applicant's father or husband", type: "text", half: true },
          { name: "coApplicantDateOfBirth", label: "Co-applicant's date of birth", type: "date", half: true },
          { name: "coApplicantContact", label: "Co-applicant's mobile", type: "tel", half: true },
          { name: "coApplicantIncome", label: "Co-applicant's monthly income (₹)", type: "number", half: true, inputMode: "numeric" },
          { name: "coApplicantAddress", label: "Co-applicant's address", type: "text" },
          { name: "collateralType", label: "Collateral, if any", type: "text", half: true, help: "For example, house, FD, LIC policy" },
          { name: "collateralMarketValue", label: "Collateral value (₹)", type: "number", half: true, inputMode: "numeric" },
          { name: "collateralLocation", label: "Collateral location", type: "text" },
        ],
      },
    ],
    files: [
      { name: "admissionLetter", label: "Admission letter" },
      { name: "feeStructure", label: "Fee structure" },
      { name: "previousMarkSheets", label: "Previous mark sheets" },
    ],
  },

  goldloan: {
    endpoint: "addGoldLoan",
    json: true,
    steps: [
      {
        id: "applicant",
        title: "About you",
        fields: [
          { name: "fullName", label: "Full name", type: "text", required: true, autoComplete: "name" },
          { name: "dateOfBirth", label: "Date of birth", type: "date", required: true, half: true },
          { name: "contactNumber", label: "Mobile number", type: "tel", required: true, half: true, autoComplete: "tel" },
          { name: "fatherOrHusbandName", label: "Father's or husband's name", type: "text", half: true },
          { name: "motherName", label: "Mother's name", type: "text", half: true },
          { name: "email", label: "Email", type: "email", half: true, autoComplete: "email" },
          { name: "occupationOrBusiness", label: "Occupation", type: "text", half: true },
          { name: "permanentAddress", label: "Permanent address", type: "text", required: true, autoComplete: "street-address" },
        ],
      },
      {
        id: "gold",
        title: "Gold and loan",
        fields: [
          { name: "goldType", label: "Gold type", type: "select", options: ["24k", "22k", "18k"], half: true },
          { name: "goldPurity", label: "Purity", type: "select", options: ["24k", "22k", "18k"], half: true },
          { name: "goldWeightInGrams", label: "Weight (grams)", type: "number", half: true, inputMode: "decimal" },
          { name: "loanAmountRequired", label: "Loan amount needed (₹)", type: "number", half: true, inputMode: "numeric" },
          { name: "monthlyOrAnnualIncome", label: "Monthly income (₹)", type: "number", half: true, inputMode: "numeric" },
          { name: "preferredRepaymentTenure", label: "Repayment tenure", type: "text", half: true, help: "For example, 12 months" },
          { name: "loanPurpose", label: "What is the loan for?", type: "text" },
        ],
      },
    ],
    files: [],
  },

  kisancreditcard: {
    endpoint: "kisanCreditLoanApplication",
    steps: [
      { id: "applicant", title: "About you", fields: applicant({ altName: "alternateContactNumber" }) },
      {
        id: "farm",
        title: "Land and income",
        fields: [
          { name: "totalLand", label: "Total land (acres)", type: "number", half: true, inputMode: "decimal" },
          { name: "pawti", label: "Do you have a pawti?", type: "select", options: YES_NO_BOOL, half: true },
          { name: "residenceType", label: "Your home is", type: "select", options: RESIDENCE, half: true },
          { name: "incomeType", label: "Income received in", type: "select", options: INCOME_TYPE, half: true },
          { name: "monthlySalary", label: "Monthly income (₹)", type: "number", half: true, inputMode: "numeric" },
          { name: "incomeTaxReturn", label: "Do you file income tax returns?", type: "select", options: YES_NO_BOOL, half: true },
          cibil,
        ],
      },
    ],
    files: [
      { name: "aadharFront", label: "Aadhaar, front" },
      { name: "aadharBack", label: "Aadhaar, back" },
      { name: "panCard", label: "PAN card" },
      { name: "khasraCopy", label: "Khasra copy" },
      { name: "pawti", label: "Pawti" },
      { name: "electricityBill", label: "Electricity bill" },
      { name: "bankStatement", label: "Bank statement" },
      { name: "incomeTaxReturnFile", label: "Income tax return" },
    ],
  },

  health: quickLead("addInsuranceLoan", HEALTH_TYPES),
  motor: quickLead("addAutomobileLoan", MOTOR_TYPES),
  investment: quickLead("addInvestment", INVESTMENT_TYPES),

  "ca-services": enquiry("addCaServices"),
  "real-estate-services": enquiry("addRealStateServices"),
  "dsa-franchise": enquiry("addDsaServices", { messageLabel: "Your city and current business, if any" }),
  "registration-services": enquiry("addLegalDocumentationService"),
  "government-business-services": enquiry("addGovernmentBusinessService", { messageLabel: "Which scheme, and what is the business?" }),
  "digital-marketing-sevice": enquiry("addDigitalMarketingService"),
  "e-stamp-services": enquiry("addEStampService"),
  "business-consultation-service": enquiry("addBusinessConsultation"),
  "credit-score-check-service": enquiry("addCreditScoreService", { messageLabel: "Anything we should know? (optional)" }),
  contact: enquiry("addContactUs", { messageRequired: true, messageLabel: "Message" }),
};
