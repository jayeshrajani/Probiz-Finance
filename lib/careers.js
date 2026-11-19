import areas from "@/content/careers-areas.json";

// Approved copy from the Careers Programs Information Sheet (18 Nov 2026).
export const careersOffice = "709 Clifton Corporate, Indore, Madhya Pradesh";
export const DISCLAIMER = "ProBiz Finance is a DSA and does not lend its own money.";
export const CONSENT = "By sending this, you agree that ProBiz Finance may contact you about job and connector opportunities.";

export const hiringAreas = areas;
export const areaCount = areas.reduce((n, d) => n + d.areas.length, 0);

export const whyProbiz = [
  { title: "Many products, one desk", body: "Home, business, personal and car loans, plus insurance, investments, registry and CA services. More ways to serve each customer." },
  { title: "Multiple lenders", body: "We work with banks and NBFCs, so you can match a customer to the lender most likely to approve." },
  { title: "End-to-end support", body: "Our team checks documents before they reach the lender and follows up through sanction and disbursal, so you can focus on customers." },
  { title: "Trusted since 2013", body: "Years of working with banks and NBFCs, and a focus on fast disbursement for your customers." },
];

export const joiningSteps = [
  { title: "Send your details", body: "Use the form or message on WhatsApp." },
  { title: "Talk to our team", body: "Short call on experience, city and goals." },
  { title: "Onboarding and training", body: "Freshers complete the 7-day training programme; others get a briefing on products and lender policies." },
  { title: "Start with real files", body: "Begin logging leads with support from the team." },
];

// Order matches the sheet: loan connector, experienced professional, fresher.
export const programmes = [
  {
    slug: "loan-connectors",
    role: "Loan connector",
    title: "Loan Connectors",
    tag: "कनेक्टर्स के लिए",
    who: "People with a network: agents, CAs, property and insurance advisors, shop owners and anyone who knows people who need loans.",
    pay: "Competitive commission",
    payNote: "On every disbursed file, plus regular incentives. Commission details are explained by the relevant ProBiz team.",
    get: ["Competitive commission on every disbursed file", "Regular incentives", "Fast disbursement", "End-to-end support on every file", "Trusted partner since 2013"],
    doList: ["Share your customer files with us", "We handle lender matching, document checks and follow-up", "Earn on every file that is disbursed"],
    lookFor: ["A network of people who need finance", "Basic loan knowledge helps but is not required", "A mobile phone and WhatsApp"],
    steps: [
      { title: "Get in touch", body: "Form or call." },
      { title: "Know the commission", body: "The relevant team explains the details." },
      { title: "Share your first file", body: "The team takes it forward with the lender." },
      { title: "Track and earn", body: "Fast disbursement, end-to-end support." },
    ],
    field: { label: "Your work or network", key: "Work or network", placeholder: "e.g. Property advisor with local contacts" },
  },
  {
    slug: "experienced",
    role: "Experienced professional",
    title: "Experienced Professionals",
    tag: "अनुभवी प्रोफेशनल्स के लिए",
    who: "People with experience in banking, NBFC, DSA, insurance or real estate sales.",
    pay: "₹2.40 to ₹7.20 LPA",
    payNote: "Excluding incentives and allowances. Final package and hike depend on current salary and experience. Incentives and allowances are over and above the package.",
    get: [
      "A salary hike on the current package",
      "Career growth from advisor to team lead and beyond",
      "Attractive incentives",
      "Multiple loan products on a single platform",
      "Salaried role in a company working with banks and NBFCs since 2013",
    ],
    doList: ["Source and manage loan files from first call to disbursal", "Offer customers multiple loan products on one platform", "Grow your team or connector network in your city"],
    lookFor: ["Experience in loans, banking, insurance or sales", "Good knowledge of documents and lender policies", "Strong local contacts in your city"],
    steps: [
      { title: "Send your details", body: "Form or WhatsApp." },
      { title: "Talk to our team", body: "Call about experience, city and goals." },
      { title: "Discuss your package", body: "Hike is based on current salary." },
      { title: "Join and start", body: "Begin with support from the team." },
    ],
    field: { label: "Current role and experience", key: "Experience", placeholder: "e.g. Sales officer at an NBFC, 3 years" },
    formNote: "Keep your current salary details ready.",
  },
  {
    slug: "freshers",
    role: "Fresher",
    title: "Fresher Training Programme",
    tag: "फ्रेशर्स के लिए",
    who: "Graduates and final-year students who want to start a career in loans and finance.",
    pay: "₹1.44 to ₹1.80 LPA",
    payNote: "Plus incentives and allowances.",
    fee: "Programme fee: ₹2,000 for the 7-day training, fully refundable if the candidate is not shortlisted. Fee details and refund terms are shared in writing before payment; a receipt is given on payment.",
    get: ["Salaried start at a company working with banks and NBFCs since 2013", "Joining letter given before the training begins", "7-day industry-oriented training", "Career growth as results grow"],
    doList: ["Learn how the banking industry works", "Understand loan products, documents and lender policies", "Start bringing in business from the beginning"],
    lookFor: ["Graduate or final-year student", "Good communication in Hindi; English is a plus", "Willingness to learn and meet customers"],
    syllabus: [
      "How banks and NBFCs work",
      "Loan products: home, business, personal and more",
      "Documents, KYC and eligibility",
      "CIBIL and credit basics",
      "Finding and talking to customers",
      "Live file practice with the team",
      "Review and joining",
    ],
    steps: [
      { title: "Apply", body: "Send details through the form." },
      { title: "Get your joining letter", body: "Received before the training begins." },
      { title: "Pay the fee and confirm your batch", body: "Receipt given; team confirms dates." },
      { title: "7-day training", body: "Industry-oriented training with the team." },
    ],
    field: { label: "Your education", key: "Education", placeholder: "e.g. B.Com, final year" },
  },
];

export const programmeBySlug = Object.fromEntries(programmes.map((p) => [p.slug, p]));

// The team reads these in English whatever the page language.
export function applicationMessage({ programme, onMainPage, name, mobile, city, detail }) {
  const intro = onMainPage ? `I would like to join as ${programme.role}.` : `I would like to apply: ${programme.role}.`;
  return [`Hello ProBiz Finance, ${intro}`, `Name: ${name}`, `Phone: ${mobile}`, `City: ${city}`, `${programme.field.key}: ${detail}`].join("\n");
}
