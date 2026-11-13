import raw from "@/content/services.json";

// Headlines are new; the offering lists, fees and reasons come from the original service pages.
const overrides = {
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
  const base = raw[slug];
  const o = overrides[slug] || {};
  let sections = o.sections || (o.sectionsFrom ? raw[o.sectionsFrom].sections : base.sections) || [];
  if (o.pick) sections = sections.filter((s) => o.pick.test(s.heading));
  if (o.skip) sections = sections.filter((s) => !o.skip.test(s.heading));
  sections = sections.map((s) => ({ ...s, heading: cleanHeading(s.heading) }));

  const fees = (base["pricing/fees/offers"] || []).filter(Boolean);
  return {
    slug,
    title: base.heroTitle,
    headline: o.headline || base.heroTitle,
    summary: o.summary || base.heroSubtitle,
    sections,
    why: o.why || base.whyChooseUs || [],
    whyTitle: o.whyTitle || "Why Probiz",
    fees: slug === "dsa-franchise" ? fees : [],
  };
}
