import raw from "@/content/services.json";

const docs = (items) => ({ heading: "Documents we need", intro: "Upload what you have with the form. Our team will ask for anything else on a call.", items: items.map((title) => ({ title })) });

// Headlines are new; the offering lists, fees and reasons come from the original service pages.
const overrides = {
  "gst-registration": {
    title: "GST Registration",
    headline: "Get your GSTIN without the back and forth.",
    summary: "Share a few basics online. Our CA team prepares the application, handles the OTPs with you and tracks it until the GSTIN is issued.",
    sections: [
      {
        heading: "What we handle",
        items: [
          { title: "Proprietors, partnerships, LLPs and companies" },
          { title: "HSN and SAC codes for your goods and services" },
          { title: "Principal and additional places of business" },
          { title: "Replies to queries from the GST officer" },
        ],
      },
      docs(["PAN and Aadhaar of the applicant", "Passport-size photo", "Business address proof", "Rent agreement or owner's NOC, if rented", "Cancelled cheque or bank statement"]),
    ],
    why: ["Filed by chartered accountants", "Only the basics needed online", "Updates on WhatsApp"],
  },
  "itr-filing": {
    title: "ITR Filing",
    headline: "Income tax returns, filed right the first time.",
    summary: "For salaried people, freelancers and businesses. Tell us your income and deductions; we pick the right form, file it and follow up on your refund.",
    sections: [
      {
        heading: "What we handle",
        items: [
          { title: "Salary returns with Form 16" },
          { title: "Business and freelance returns, including presumptive income" },
          { title: "Capital gains, interest and other income" },
          { title: "Refund tracking and notices" },
        ],
      },
      docs(["PAN and Aadhaar", "Form 16, if salaried", "Form 26AS or AIS", "Bank statement for the year", "Investment and deduction proofs", "Profit and loss statement, for businesses"]),
    ],
    why: ["Right ITR form for your income", "Every deduction checked", "Refund follow-up included"],
  },
  "udyam-registration": {
    title: "Udyam (MSME) Registration",
    headline: "Register your business as an MSME.",
    summary: "A Udyam certificate opens up collateral-free loans, government tenders and subsidies. We file it for you using your Aadhaar and PAN.",
    sections: [
      {
        heading: "What we handle",
        items: [
          { title: "New Udyam registration" },
          { title: "NIC code selection for your activity" },
          { title: "Updating an existing Udyam certificate" },
          { title: "Linking GST and bank details" },
        ],
      },
      docs(["Aadhaar of the owner or partner", "PAN of the business or proprietor", "GST certificate, if registered", "Cancelled cheque or bank statement"]),
    ],
    why: ["Done in a day in most cases", "Helps with Mudra and CGTMSE loans", "No hidden charges"],
  },
  "gumasta-license": {
    title: "Gumasta Licence",
    headline: "Shop and establishment registration, sorted.",
    summary: "Every shop and office needs a Gumasta licence. Fill in the basics; we prepare the application and collect the rest of the paperwork on a call.",
    sections: [
      {
        heading: "What we handle",
        items: [
          { title: "New shop and establishment registration" },
          { title: "Renewals and changes of address or ownership" },
          { title: "Shops, offices and commercial establishments" },
        ],
      },
      docs(["PAN and Aadhaar", "Shop address proof (electricity bill or property tax receipt)", "Photo of the signboard or banner", "Rent or lease agreement, if not owned"]),
    ],
    why: ["Needed for bank accounts and loans", "Doorstep document pickup", "Fast processing"],
  },
  "rent-agreement": {
    title: "Rent Agreement",
    headline: "Rent agreements, drafted and registered for you.",
    summary: "Landlord, tenant or agent, share the details once. We draft the agreement, arrange e-stamp and registration, and send you the final copy.",
    sections: [
      {
        heading: "What we handle",
        items: [
          { title: "Residential and commercial agreements" },
          { title: "E-stamp paper and registration" },
          { title: "Witnesses and biometric appointments" },
          { title: "Renewals and changes to rent or tenure" },
        ],
      },
      docs(["ID proof of landlord and tenant", "Ownership proof (sale deed or electricity bill)", "Society NOC, if needed", "Electricity and water meter photos"]),
    ],
    why: ["Legally valid, registered agreements", "Home visits available", "Copy delivered on WhatsApp"],
  },
  "ca-services": {
    headline: "Audit, tax and compliance, handled by chartered accountants.",
    summary: "From GST returns to statutory audits and company setup, one team for the paperwork that keeps a business legal.",
  },
  "real-estate-services": {
    headline: "Buy, sell or lease property with the legal work done right.",
    summary: "Residential, commercial and agricultural property, with verification, documentation and loans under one roof.",
    skip: /audit|accounting/i,
  },
  "dsa-franchise": {
    headline: "Run a loan franchise in your city.",
    summary: "Leads, lender tie-ups, CRM and training from Probiz. You build the local business.",
    skip: /ready to start|why partner/i,
  },
  "registration-services": {
    headline: "Registry, notary and e-stamp, without the running around.",
    summary: "Property registration, notarised affidavits and stamp papers, processed fast with transparent charges.",
  },
  "government-business-services": {
    headline: "Government loan schemes, explained and applied for.",
    summary: "Mudra, Stand-Up India, CGTMSE, SMILE, NSIC and PMEGP. We check which you qualify for and prepare the file.",
  },
  "digital-marketing-sevice": {
    headline: "Get your business found online.",
    summary: "Social media, search, websites, WhatsApp campaigns and apps for small and growing businesses.",
  },
  "e-stamp-services": {
    headline: "E-stamp papers and notary, done quickly.",
    summary: "Non-judicial e-stamp papers in every denomination, with notary and registry support from the same desk.",
    sectionsFrom: "registration-services",
    pick: /e-stamp|notary/i,
    why: ["₹200 off your first notary service", "Registry, e-stamp and notary combo at ₹999*"],
    whyTitle: "Current offers",
  },
  "business-consultation-service": {
    headline: "Start, register and grow a small business.",
    summary: "A 30-day programme (15 days on fast track) covering planning, registration, funding, branding and your first customers.",
  },
  "credit-score-check-service": {
    headline: "Know your credit score before you apply.",
    summary: "Share your details and an advisor will check your bureau score and explain what it means for your loan.",
    sections: [
      {
        heading: "What we check",
        items: [
          { title: "Your score from CIBIL, Experian or Equifax" },
          { title: "Active loans and credit cards" },
          { title: "Missed or late payments affecting your score" },
          { title: "Which loans you're likely to qualify for" },
        ],
      },
      {
        heading: "Full credit report",
        intro: "Want the complete report as a PDF? It costs ₹99, and that amount is adjusted against processing if you apply for a loan with us.",
        items: [],
      },
    ],
    why: ["Your data is encrypted", "We never share your information with third parties", "No impact on your credit score"],
  },
};

const cleanHeading = (h) => h.replace(/\s*\([^)]*[\u0900-\u097F][^)]*\)/g, "").replace(/\?$/, "");

export function getService(slug) {
  const base = raw[slug] || {};
  const o = overrides[slug] || {};
  let sections = o.sections || (o.sectionsFrom ? raw[o.sectionsFrom].sections : base.sections) || [];
  if (o.pick) sections = sections.filter((s) => o.pick.test(s.heading));
  if (o.skip) sections = sections.filter((s) => !o.skip.test(s.heading));
  sections = sections.map((s) => ({ ...s, heading: cleanHeading(s.heading) }));

  const fees = (base["pricing/fees/offers"] || []).filter(Boolean);
  return {
    slug,
    title: o.title || base.heroTitle,
    headline: o.headline || base.heroTitle,
    summary: o.summary || base.heroSubtitle,
    sections,
    why: o.why || base.whyChooseUs || [],
    whyTitle: o.whyTitle || "Why Probiz",
    fees: slug === "dsa-franchise" ? fees : [],
  };
}
