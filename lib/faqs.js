// General answers that hold for every lender or insurer we work with. Product-specific terms come from the advisor.
const loan = [
  {
    q: "Does checking eligibility affect my credit score?",
    a: "No. Our eligibility and EMI calculators run on the numbers you enter and make no credit enquiry. A lender checks your report only when you formally apply.",
  },
  {
    q: "Can I apply with a low CIBIL score?",
    a: "Yes. Some lenders consider lower scores, often with a co-applicant, collateral or a higher rate. We tell you honestly which lenders are realistic for your profile.",
  },
  {
    q: "Do I need to upload documents now?",
    a: "No. The basic details are enough to start. Your advisor confirms exactly which documents your lender needs before anything is submitted.",
  },
  {
    q: "How long does approval take?",
    a: "It depends on the lender, the loan and how complete the file is. Your advisor shares the expected timeline for your case before you apply.",
  },
  {
    q: "Can I prepay the loan?",
    a: "Usually, yes. RBI rules bar lenders from charging prepayment penalties to individuals on floating-rate loans. Fixed-rate and business loans may carry charges, which we explain upfront.",
  },
];

const card = [
  {
    q: "Will applying affect my credit score?",
    a: "The bank's check is a hard enquiry, which can lower your score slightly for a while. That's why we suggest the card most likely to suit you before you apply.",
  },
  {
    q: "What do I need to apply?",
    a: "Usually PAN, Aadhaar and proof of income. Your advisor confirms the exact list for the bank you choose.",
  },
  {
    q: "Can you help if I've been rejected before?",
    a: "Yes. Tell us what happened and we'll suggest what to fix, or a card with criteria that suit you better.",
  },
];

const insurance = [
  {
    q: "Will you compare more than one insurer?",
    a: "Yes. We send quotes from several insurers so you can compare premium, cover and claim terms side by side.",
  },
  {
    q: "What is a waiting period?",
    a: "Time after the policy starts during which some claims, such as pre-existing conditions, are not paid. It varies by insurer and plan, so check it before you buy.",
  },
  {
    q: "Do you help when I need to claim?",
    a: "Yes. We help with the paperwork and follow up with the insurer until the claim is settled.",
  },
];

const motor = [
  {
    q: "What is IDV?",
    a: "Insured Declared Value: roughly your vehicle's current market value, and the most the insurer pays if it is stolen or written off.",
  },
  {
    q: "Comprehensive or third-party?",
    a: "Third-party cover is the legal minimum and pays for damage you cause to others. Comprehensive adds cover for your own vehicle.",
  },
  insurance[2],
];

const investment = [
  {
    q: "Are returns guaranteed?",
    a: "Only on plans that state guaranteed benefits. Market-linked options such as SIPs and ULIPs can go up or down. We explain which is which before you invest.",
  },
  {
    q: "What is a lock-in period?",
    a: "The minimum time your money stays invested. ELSS tax-saving funds lock in for three years and ULIPs for five.",
  },
  {
    q: "How much do I need to start?",
    a: "Many SIPs start at a few hundred rupees a month. The right amount depends on your goal and budget, and we help you size it.",
  },
];

export function faqsFor(product) {
  if (product.kind === "card") return card;
  if (product.kind === "investment") return investment;
  if (product.kind === "insurance") return product.group === "motor" ? motor : insurance;
  return loan;
}
