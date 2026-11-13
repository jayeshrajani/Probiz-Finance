// Every form submission the admin can work through, keyed by a short, URL-safe type.
const m = (file) => require(`../models/${file}`);

const LEAD_TYPES = [
  { type: 'homeloan', label: 'Home loan', group: 'loans', model: m('homeloan.model'), page: '/homeloan' },
  { type: 'plotpurchase', label: 'Plot purchase loan', group: 'loans', model: m('plotpurchase.model'), page: '/plotpurchaseloan' },
  { type: 'plotconstruction', label: 'Plot and construction loan', group: 'loans', model: m('plotPurchaseConstruction.model'), page: '/plotpurchaseconstruction' },
  { type: 'flatpurchase', label: 'Flat purchase loan', group: 'loans', model: m('flatepurchase.model'), page: '/flatpurchase' },
  { type: 'lap', label: 'Loan against property', group: 'loans', model: m('loanagainstProperty.model'), page: '/mortrageloan' },
  { type: 'construction', label: 'Construction loan', group: 'loans', model: m('constructionLoan.model'), page: '/constructionloan' },
  { type: 'renovation', label: 'Home renovation loan', group: 'loans', model: m('homerenovation.model'), page: '/homerennovation' },
  { type: 'commercialpurchase', label: 'Commercial property loan', group: 'loans', model: m('commercialPropertyPurchase'), page: '/commercialproperty' },
  { type: 'commercialmortgage', label: 'Commercial property mortgage', group: 'loans', model: m('commercialPropertyMortagePurchase'), page: '/commercialpropertymortgage' },
  { type: 'balancetransfer', label: 'Balance transfer', group: 'loans', model: m('balanceTransfer.model'), page: '/balancetransfer' },
  { type: 'bttopup', label: 'Balance transfer top-up', group: 'loans', model: m('balanceTransferTopUp.model'), page: '/balancetransfertopup' },
  { type: 'personal', label: 'Personal loan', group: 'loans', model: m('pLoan.module'), page: '/personalloan' },
  { type: 'business', label: 'Business loan', group: 'loans', model: m('bloan.model'), page: '/buisnessloan' },
  { type: 'mudra', label: 'Mudra loan', group: 'loans', model: m('pradhanmantri.model'), page: '/pradhanmantriloan' },
  { type: 'projectfunding', label: 'Project funding', group: 'loans', model: m('projectFunding.model'), page: '/projectfunding' },
  { type: 'car', label: 'Car loan', group: 'loans', model: m('carLoan.model'), page: '/carloan' },
  { type: 'education', label: 'Education loan', group: 'loans', model: m('education.model'), page: '/educationloan' },
  { type: 'gold', label: 'Gold loan', group: 'loans', model: m('gold.model'), page: '/goldloan' },
  { type: 'kisan', label: 'Kisan credit card', group: 'loans', model: m('kisanCreditCard.model'), page: '/kisancreditcard' },
  { type: 'creditcard', label: 'Credit card', group: 'loans', model: m('creditcard.model'), page: '/creditcard' },
  { type: 'health', label: 'Health and property insurance', group: 'cover', model: m('healthInsurance'), page: '/healthInsurance' },
  { type: 'motor', label: 'Motor insurance', group: 'cover', model: m('automobile.model'), page: '/automobile-insurance' },
  { type: 'investment', label: 'Investment plans', group: 'cover', model: m('investment.model'), page: '/investmentplans' },
  { type: 'ca', label: 'CA services', group: 'services', model: m('caService.model'), page: '/ca-services' },
  { type: 'legal', label: 'Registration and legal', group: 'services', model: m('legalDoc.model'), page: '/registration-services' },
  { type: 'estamp', label: 'E-stamp', group: 'services', model: m('eStamp.model'), page: '/e-stamp-services' },
  { type: 'government', label: 'Government schemes', group: 'services', model: m('governmentBusi.model'), page: '/government-business-services' },
  { type: 'consultation', label: 'Business consultation', group: 'services', model: m('businessConsultation.model'), page: '/business-consultation-service' },
  { type: 'creditscore', label: 'Credit score check', group: 'services', model: m('creditScore.model'), page: '/credit-score-check-service' },
  { type: 'marketing', label: 'Digital marketing', group: 'services', model: m('digitalMarketing.model'), page: '/digital-marketing-sevice' },
  { type: 'realestate', label: 'Real estate services', group: 'services', model: m('realState.model'), page: '/real-estate-services' },
  { type: 'dsa', label: 'DSA franchise', group: 'services', model: m('dsaService.model'), page: '/dsa-franchise' },
  { type: 'contact', label: 'Contact messages', group: 'inbox', model: m('contact.model'), page: '/contact' },
  { type: 'inhouse', label: 'Property requirements', group: 'inbox', model: m('inHouse.model') },
  { type: 'itr', label: 'ITR filing (old form)', group: 'archive', model: m('itrInformation.model') },
  { type: 'msme', label: 'MSME registration (old form)', group: 'archive', model: m('msmeRegistration.model') },
  { type: 'gumasta', label: 'Gumasta licence (old form)', group: 'archive', model: m('gumastaLicense.model') },
];

const GROUPS = [
  { id: 'loans', label: 'Loans' },
  { id: 'cover', label: 'Insurance and investments' },
  { id: 'services', label: 'Services' },
  { id: 'inbox', label: 'Inbox' },
  { id: 'archive', label: 'Older forms' },
];

const byType = Object.fromEntries(LEAD_TYPES.map((t) => [t.type, t]));

const first = (doc, keys) => {
  for (const k of keys) {
    const v = doc[k];
    if (v !== undefined && v !== null && String(v).trim() !== '') return v;
  }
  return null;
};

// One consistent row shape across ~35 differently named schemas.
function summarize(def, doc) {
  const joined = [doc.first_Name, doc.last_Name].filter(Boolean).join(' ');
  return {
    id: String(doc._id),
    type: def.type,
    typeLabel: def.label,
    name: first(doc, ['fullName', 'name', 'applicantAuthorizedPersonName', 'nameOnAadhaar', 'ownerName']) || joined || 'Unnamed',
    phone: first(doc, ['contactNumber', 'mobile_no', 'mobileNo', 'mobile', 'mobileLinkedToAadhaar', 'contactNo']),
    email: first(doc, ['email', 'emailId', 'user_Email']),
    amount: first(doc, ['loanAmountRequired', 'loanAmount', 'budget', 'currentLoanAmount']),
    detail: first(doc, ['loan_Type', 'propertyType', 'carType', 'goldType', 'courseName', 'businessName', 'companyName', 'enterpriseName', 'firmName', 'formType', 'location', 'message']),
    createdAt: doc.createdAt,
  };
}

module.exports = { LEAD_TYPES, GROUPS, byType, summarize };
