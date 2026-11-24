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

// Loan applications require only who to call; the rest helps the advisor but can come later on the phone.
const applicant = ({ altName = "alternateContact", address = "address" } = {}) => [
  { name: "fullName", label: "Full name (as on Aadhaar)", type: "text", required: true, autoComplete: "name" },
  { name: "dateOfBirth", label: "Date of birth", type: "date", half: true, autoComplete: "bday" },
  { name: "contactNumber", label: "Mobile number", type: "tel", required: true, half: true, autoComplete: "tel" },
  { name: altName, label: "Alternate number", type: "tel", half: true },
  { name: address, label: "Address (as on Aadhaar)", type: "text", autoComplete: "street-address" },
];

const cibil = { name: "cibilScore", label: "CIBIL score", type: "number", half: true, inputMode: "numeric", help: "Leave blank if you don't know it" };
const propertyLocation = { name: "propertyLocation", label: "Property location", type: "text", maxLength: 200, help: "Area, city and PIN code" };
const itr = { name: "incomeTaxReturn", label: "Do you file income tax returns?", type: "select", options: YES_NO, half: true };
const gstNumber = (when) => ({
  name: "gstNumber",
  label: "GST number",
  type: "text",
  half: true,
  required: true,
  pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
  patternMessage: "Enter a valid 15-character GSTIN, e.g. 27ABCDE1234F1Z5",
  uppercase: true,
  showIf: (v) => when(v) && /gst/i.test(v.businessCertificate || ""),
});

const propertyLoan = {
  coApplicant: true,
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
        propertyLocation,
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
        gstNumber(isBusiness),
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
  coApplicant: true,
  steps: [
    { id: "applicant", title: "About you", fields: applicant({ altName: "alternateContactNumber" }) },
    {
      id: "work",
      title: "Work and loan",
      fields: [
        { name: "loanAmountRequired", label: "Loan amount needed (₹)", type: "number", half: true, inputMode: "numeric" },
        { name: "residenceType", label: "Your home is", type: "select", options: RESIDENCE, half: true },
        { name: "profession", label: "You are", type: "select", options: profession.map((p) => ({ value: p, label: p === "Job" ? "Salaried" : "Self-employed" })), half: true },
        { name: "companyName", label: profession.length === 1 ? "Employer name" : "Employer or business name", type: "text", half: true, autoComplete: "organization" },
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
  coApplicant: true,
  steps: [
    { id: "applicant", title: "About you", fields: applicant({ altName: "alternateContactNumber" }) },
    {
      id: "business",
      title: "Business and loan",
      fields: [
        { name: "businessName", label: "Business name", type: "text", half: true, autoComplete: "organization" },
        { name: "loanAmountRequired", label: "Loan amount needed (₹)", type: "number", half: true, inputMode: "numeric" },
        { name: "businessCertificate", label: "Business registration", type: "select", options: BUSINESS_CERT, half: true },
        gstNumber(() => true),
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

const enquiry = (endpoint, { messageRequired = false, messageLabel = "How can we help?", extra = [] } = {}) => ({
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
        ...extra,
        { name: "message", label: messageLabel, type: "textarea", required: messageRequired },
      ],
    },
  ],
  submitLabel: "Send enquiry",
});

// Registration and filing services: only who to call is required; our team collects the rest on the phone.
const pan = { name: "pan", label: "PAN", type: "text", half: true, uppercase: true, maxLength: 10, pattern: /^[A-Z]{5}[0-9]{4}[A-Z]$/, patternMessage: "Enter a valid 10-character PAN, e.g. ABCDE1234F" };
const aadhaar = { name: "aadhaarNo", label: "Aadhaar number", type: "text", half: true, inputMode: "numeric", maxLength: 12, pattern: /^\d{12}$/, patternMessage: "Enter the 12-digit Aadhaar number" };
const pinCode = { name: "pinCode", label: "PIN code", type: "text", half: true, inputMode: "numeric", maxLength: 6, pattern: /^\d{6}$/, patternMessage: "Enter a 6-digit PIN code" };
const bank = [
  { name: "bankName", label: "Bank name and branch", type: "text", half: true },
  { name: "ifscCode", label: "IFSC code", type: "text", half: true, uppercase: true, maxLength: 11, pattern: /^[A-Z]{4}0[A-Z0-9]{6}$/, patternMessage: "Enter a valid 11-character IFSC, e.g. SBIN0001234" },
  { name: "accountNumber", label: "Account number", type: "text", half: true, inputMode: "numeric" },
];
const contact = (nameLabel = "Full name") => [
  { name: "name", label: nameLabel, type: "text", required: true, autoComplete: "name" },
  { name: "mobile_no", label: "Mobile number", type: "tel", required: true, half: true, autoComplete: "tel" },
  { name: "email", label: "Email", type: "email", half: true, autoComplete: "email" },
];
const ORG_TYPES = ["Proprietor", "Partnership", "LLP", "Private Limited", "Others"];
const notOwned = (key) => (v) => v[key] && !/^own/i.test(v[key]);
const isSalaryItr = (v) => v.formType !== "Business";
const isBusinessItr = (v) => v.formType === "Business";

const serviceForm = (endpoint, steps, files) => ({ endpoint, steps, files, submitLabel: "Send request" });

const gstRegistration = serviceForm(
  "addGstRegistration",
  [
    { id: "contact", title: "Contact", fields: contact("Applicant's name (as per PAN)") },
    {
      id: "business",
      title: "Business",
      fields: [
        { name: "businessName", label: "Legal name of business", type: "text", half: true, autoComplete: "organization" },
        { name: "tradeName", label: "Trade name, if different", type: "text", half: true },
        { name: "constitution", label: "Constitution of business", type: "select", options: ORG_TYPES, half: true },
        pan,
        { name: "businessAddress", label: "Principal place of business", type: "text", help: "Shop or flat number, street, city and PIN" },
        { name: "state", label: "State", type: "text", half: true, autoComplete: "address-level1" },
        { name: "district", label: "District", type: "text", half: true },
        { name: "premises", label: "Premises are", type: "select", options: ["Own", "Rented", "Leased", "Shared"], half: true },
        { name: "commencementDate", label: "Date of commencement", type: "date", half: true },
        { name: "activity", label: "Nature of business", type: "select", options: ["Wholesale", "Retail", "Service", "Works contract", "Warehouse", "Others"], half: true },
        { name: "turnoverEstimate", label: "Expected annual turnover (₹)", type: "number", half: true, inputMode: "numeric" },
        { name: "hsnCodes", label: "Main goods (HSN codes)", type: "text", half: true, help: "Up to 5 four-digit codes" },
        { name: "sacCodes", label: "Main services (SAC codes)", type: "text", half: true },
        { name: "partners", label: "Partners or directors", type: "textarea", help: "Name and role of each, if any" },
      ],
    },
    { id: "bank", title: "Bank account", fields: bank },
  ],
  [
    { name: "panCard", label: "PAN card" },
    { name: "aadharCard", label: "Aadhaar card" },
    { name: "photo", label: "Passport-size photo" },
    { name: "addressProof", label: "Business address proof (electricity bill or property tax receipt)" },
    { name: "rentAgreement", label: "Rent agreement or owner's NOC", showIf: notOwned("premises") },
    { name: "bankProof", label: "Cancelled cheque or bank statement" },
  ]
);

const gumastaLicense = serviceForm(
  "addGumastaLicense",
  [
    {
      id: "applicant",
      title: "Applicant",
      fields: [
        ...contact("Applicant or authorised person"),
        { name: "applicantType", label: "Applicant type", type: "select", options: ["Proprietor", "Partnership", "LLP", "Private Limited or company"], half: true },
        { name: "designation", label: "Designation", type: "select", options: ["Owner", "Partner", "Director"], half: true },
        { name: "fatherSpouseName", label: "Father's or spouse's name", type: "text", half: true },
        aadhaar,
        pan,
      ],
    },
    {
      id: "establishment",
      title: "Shop or office",
      fields: [
        { name: "firmName", label: "Firm name (as on signboard)", type: "text", half: true, autoComplete: "organization" },
        { name: "category", label: "Category", type: "select", options: ["Shop", "Commercial establishment"], half: true },
        { name: "firmAddress", label: "Full address", type: "text", help: "Building or shop number, street, area" },
        { name: "city", label: "City", type: "text", half: true, autoComplete: "address-level2" },
        { name: "district", label: "District", type: "text", half: true },
        pinCode,
        { name: "natureOfBusiness", label: "Nature of business", type: "text", half: true, help: "For example, retail, service, manufacturing" },
        { name: "commencementDate", label: "Date of commencement", type: "date", half: true },
        { name: "premises", label: "Premises are", type: "select", options: ["Owned", "Rented", "Leased"], half: true },
        { name: "employeesMale", label: "Male employees", type: "number", half: true, inputMode: "numeric" },
        { name: "employeesFemale", label: "Female employees", type: "number", half: true, inputMode: "numeric" },
        { name: "employeesDisabled", label: "Differently-abled employees", type: "number", half: true, inputMode: "numeric" },
      ],
    },
  ],
  [
    { name: "panCard", label: "PAN card" },
    { name: "aadharCard", label: "Aadhaar card" },
    { name: "addressProof", label: "Shop address proof (electricity bill or property tax receipt)" },
    { name: "signboardPhoto", label: "Photo of signboard or banner" },
    { name: "rentAgreement", label: "Rent or lease agreement", showIf: notOwned("premises") },
  ]
);

const itrFiling = serviceForm(
  "addItrFiling",
  [
    {
      id: "basic",
      title: "About you",
      fields: [
        { name: "formType", label: "Your income is from", type: "select", required: true, options: [{ value: "Salary", label: "A job (salary)" }, { value: "Business", label: "Business or freelance work" }] },
        ...contact("Full name (as per PAN)"),
        pan,
        { name: "dateOfBirth", label: "Date of birth", type: "date", half: true, autoComplete: "bday" },
      ],
    },
    {
      id: "income",
      title: "Income and tax",
      fields: [
        { name: "grossSalary", label: "Annual gross salary (₹)", type: "number", half: true, inputMode: "numeric", showIf: isSalaryItr },
        { name: "tdsForm16", label: "TDS as per Form 16 (₹)", type: "number", half: true, inputMode: "numeric", showIf: isSalaryItr },
        { name: "turnover", label: "Total turnover or receipts (₹)", type: "number", half: true, inputMode: "numeric", showIf: isBusinessItr },
        { name: "expenses", label: "Total expenses (₹)", type: "number", half: true, inputMode: "numeric", showIf: isBusinessItr },
        { name: "netProfit", label: "Net profit (₹)", type: "number", half: true, inputMode: "numeric", showIf: isBusinessItr },
        { name: "otherIncome", label: "Other income (₹)", type: "number", half: true, inputMode: "numeric", help: "Savings or FD interest, dividends, capital gains" },
        { name: "deductions", label: "Deductions claimed (₹)", type: "number", half: true, inputMode: "numeric", help: "80C, 80D and similar" },
        { name: "tds26as", label: "TDS as per Form 26AS (₹)", type: "number", half: true, inputMode: "numeric" },
        { name: "advanceTax", label: "Advance or self-assessment tax paid (₹)", type: "number", half: true, inputMode: "numeric" },
      ],
    },
    {
      id: "bank",
      title: "Bank for refund",
      fields: [...bank, { name: "accountType", label: "Account type", type: "select", options: ["Savings", "Current"], half: true }],
    },
  ],
  [
    { name: "panCard", label: "PAN card" },
    { name: "aadharCard", label: "Aadhaar card" },
    { name: "form16", label: "Form 16", showIf: isSalaryItr },
    { name: "form26as", label: "Form 26AS or AIS" },
    { name: "bankStatement", label: "Bank statement for the year" },
    { name: "investmentProofs", label: "Investment and deduction proofs" },
    { name: "businessAccounts", label: "Profit and loss statement or books of account", showIf: isBusinessItr },
  ]
);

const rentAgreement = serviceForm(
  "addRentAgreement",
  [
    {
      id: "you",
      title: "About you",
      fields: [...contact("Your name"), { name: "role", label: "You are the", type: "select", options: ["Landlord", "Tenant", "Agent"], half: true }],
    },
    {
      id: "parties",
      title: "Landlord and tenant",
      fields: [
        { name: "landlordName", label: "Landlord's name", type: "text", half: true },
        { name: "landlordMobile", label: "Landlord's mobile", type: "tel", half: true },
        { name: "landlordAddress", label: "Landlord's permanent address", type: "text" },
        { name: "tenantName", label: "Tenant's name", type: "text", half: true },
        { name: "tenantMobile", label: "Tenant's mobile", type: "tel", half: true },
        { name: "tenantAddress", label: "Tenant's current address", type: "text" },
      ],
    },
    {
      id: "property",
      title: "Property and rent",
      fields: [
        { name: "propertyAddress", label: "Property address", type: "text", help: "Flat or house number, building, street, city and PIN" },
        { name: "propertyType", label: "Property type", type: "select", options: ["Flat", "Independent house", "Shop or office", "Other"], half: true },
        { name: "usage", label: "Use", type: "select", options: ["Residential", "Commercial", "Mixed"], half: true },
        { name: "furnishing", label: "Furnishing", type: "select", options: ["Unfurnished", "Semi-furnished", "Fully furnished"], half: true },
        { name: "startDate", label: "Agreement starts on", type: "date", half: true },
        { name: "durationMonths", label: "Duration (months)", type: "number", half: true, inputMode: "numeric", help: "Usually 11" },
        { name: "monthlyRent", label: "Monthly rent (₹)", type: "number", half: true, inputMode: "numeric" },
        { name: "deposit", label: "Security deposit (₹)", type: "number", half: true, inputMode: "numeric" },
        { name: "noticeMonths", label: "Notice period (months)", type: "number", half: true, inputMode: "numeric" },
      ],
    },
  ],
  [
    { name: "landlordId", label: "Landlord's ID proof" },
    { name: "tenantId", label: "Tenant's ID proof" },
    { name: "ownershipProof", label: "Ownership proof (sale deed or electricity bill)" },
    { name: "societyNoc", label: "Society NOC, if needed" },
    { name: "meterPhotos", label: "Electricity and water meter photos" },
  ]
);

const udyamRegistration = serviceForm(
  "addUdyamRegistration",
  [
    {
      id: "applicant",
      title: "Applicant",
      fields: [...contact("Name (as on Aadhaar)"), aadhaar, pan],
    },
    {
      id: "business",
      title: "Business",
      fields: [
        { name: "enterpriseName", label: "Enterprise name", type: "text", half: true, autoComplete: "organization" },
        { name: "organisationType", label: "Organisation type", type: "select", options: ORG_TYPES, half: true },
        { ...gstNumber(() => true), name: "gstin", label: "GSTIN, if registered", required: false, showIf: undefined },
        { name: "address", label: "Business address", type: "text", help: "Door or shop number, street, area" },
        { name: "city", label: "City", type: "text", half: true, autoComplete: "address-level2" },
        pinCode,
        { name: "startDate", label: "Date business started", type: "date", half: true },
        { name: "majorActivity", label: "Major activity", type: "select", options: ["Manufacturing", "Services"], half: true },
        { name: "nicCode", label: "NIC code and description", type: "text", half: true, help: "We can find this for you" },
        { name: "employees", label: "Total employees", type: "number", half: true, inputMode: "numeric" },
        { name: "investment", label: "Investment in plant and machinery (₹)", type: "number", half: true, inputMode: "numeric" },
        { name: "turnover", label: "Turnover last financial year (₹)", type: "number", half: true, inputMode: "numeric" },
      ],
    },
    { id: "bank", title: "Bank account", fields: bank },
  ],
  [
    { name: "aadharCard", label: "Aadhaar card" },
    { name: "panCard", label: "PAN card" },
    { name: "gstCertificate", label: "GST certificate, if registered" },
    { name: "bankProof", label: "Cancelled cheque or bank statement" },
  ]
);

// Staff can attach these for a co-applicant on forms with `coApplicant: true`; they are stored on the lead itself.
export const CO_APPLICANT_FILES = [
  { name: "coAadharFront", label: "Aadhaar, front" },
  { name: "coAadharBack", label: "Aadhaar, back" },
  { name: "coPanCard", label: "PAN card" },
  { name: "coElectricityBill", label: "Electricity bill or rent agreement" },
  { name: "coBankStatement", label: "Bank statement" },
  { name: "coSalarySlip", label: "Salary slip or offer letter" },
  { name: "coBusinessDocuments", label: "Business documents" },
  { name: "coIncomeTaxReturn", label: "Income tax return" },
];

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
    coApplicant: true,
    steps: [
      { id: "applicant", title: "About you", fields: applicant() },
      {
        id: "loan",
        title: "Current loan",
        fields: [
          { name: "propertyType", label: "Property stage", type: "select", options: PROPERTY_TYPE, half: true },
          { name: "loanAmount", label: "Loan amount needed (₹)", type: "number", half: true, inputMode: "numeric" },
          { name: "noOfStallmentCurrentLoan", label: "EMIs paid on current loan", type: "number", half: true, inputMode: "numeric" },
          propertyLocation,
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
    coApplicant: true,
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
          { ...propertyLocation, label: "Location of the mortgaged property" },
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
    coApplicant: true,
    steps: [
      { id: "applicant", title: "About you", fields: applicant({ altName: "alternateContactNumber" }) },
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
      { id: "applicant", title: "About you", fields: applicant() },
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
    coApplicant: true,
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
          { name: "studyCountry", label: "Country of study", type: "text", half: true, help: "For example, India or Canada" },
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
          { name: "monthlyOrAnnualIncome", label: "Total family income (₹ per month)", type: "number", half: true, inputMode: "numeric", help: "All earning members together" },
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
          { name: "dateOfBirth", label: "Date of birth", type: "date", half: true },
          { name: "contactNumber", label: "Mobile number", type: "tel", required: true, half: true, autoComplete: "tel" },
          { name: "fatherOrHusbandName", label: "Father's or husband's name", type: "text", half: true },
          { name: "motherName", label: "Mother's name", type: "text", half: true },
          { name: "email", label: "Email", type: "email", half: true, autoComplete: "email" },
          { name: "occupationOrBusiness", label: "Occupation", type: "text", half: true },
          { name: "permanentAddress", label: "Permanent address", type: "text", autoComplete: "street-address" },
        ],
      },
      {
        id: "gold",
        title: "Gold and loan",
        fields: [
          { name: "goldType", label: "Gold type", type: "select", options: ["Jewellery", "Coins", "Bars"], half: true },
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
    coApplicant: true,
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
  "real-estate-services": enquiry("addRealStateServices", { extra: [{ ...propertyLocation, help: "Area and city, or where you are looking" }] }),
  "dsa-franchise": enquiry("addDsaServices", { messageLabel: "Your city and current business, if any" }),
  "registration-services": enquiry("addLegalDocumentationService", { extra: [{ ...propertyLocation, label: "Property location, if it is about a property" }] }),
  "government-business-services": enquiry("addGovernmentBusinessService", { messageLabel: "Which scheme, and what is the business?" }),
  "digital-marketing-sevice": enquiry("addDigitalMarketingService"),
  "e-stamp-services": enquiry("addEStampService"),
  "business-consultation-service": enquiry("addBusinessConsultation"),
  "credit-score-check-service": enquiry("addCreditScoreService", { messageLabel: "Anything we should know?" }),
  "gst-registration": gstRegistration,
  "gumasta-license": gumastaLicense,
  "itr-filing": itrFiling,
  "rent-agreement": rentAgreement,
  "udyam-registration": udyamRegistration,
  contact: enquiry("addContactUs", { messageRequired: true, messageLabel: "Message" }),
  // Quick callback card, header dialog and the assistant: two required fields, nothing else.
  callback: {
    endpoint: "addCallbackRequest",
    json: true,
    steps: [
      {
        id: "details",
        title: "Your details",
        fields: [
          { name: "name", label: "Your name", type: "text", required: true, autoComplete: "name", maxLength: 120 },
          { name: "mobile_no", label: "Mobile number", type: "tel", required: true, autoComplete: "tel" },
          { name: "interest", label: "What do you need help with?", type: "text", maxLength: 120 },
          { name: "city", label: "City", type: "text", maxLength: 80 },
          { name: "message", label: "Message", type: "textarea", maxLength: 1000 },
        ],
      },
    ],
    submitLabel: "Call me back",
  },
};
