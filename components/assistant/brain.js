// Rule-based replies. Deterministic on purpose: no third-party AI, no data leaves the browser until the user asks for a callback.
import { products, services } from "@/lib/catalog";
import { emi, formatINR, formatINRShort } from "@/lib/format";
import { site } from "@/lib/site";

export const STARTERS = ["Find a loan", "Work out an EMI", "Documents needed", "Insurance quote", "Talk to a person"];

const SYNONYMS = {
  homeloan: ["home loan", "house", "housing", "home"],
  flatpurchase: ["flat", "apartment"],
  plotpurchaseloan: ["plot", "land"],
  constructionloan: ["construction", "build a house", "building a house"],
  homerennovation: ["renovation", "repair", "interior"],
  mortrageloan: ["mortgage", "lap", "against property", "loan against"],
  commercialproperty: ["commercial", "shop purchase", "office"],
  balancetransfer: ["balance transfer", "transfer my loan", "lower rate", "switch"],
  balancetransfertopup: ["top up", "top-up", "topup"],
  personalloan: ["personal", "wedding", "marriage", "medical emergency", "travel"],
  buisnessloan: ["business", "msme", "working capital", "shop", "trader"],
  pradhanmantriloan: ["mudra", "pradhan mantri", "pmmy"],
  projectfunding: ["project", "startup", "funding"],
  carloan: ["car loan", "new car", "car"],
  usedcarpurchase: ["used car", "second hand", "pre-owned"],
  educationloan: ["education", "study", "abroad", "college", "student"],
  goldloan: ["gold"],
  kisancreditcard: ["kisan credit", "kisan", "farm", "farmer", "agri", "crop"],
  creditcard: ["credit card", "card"],
  healthInsurance: ["health", "medical", "mediclaim", "hospital"],
  familyinsurance: ["family floater", "family health"],
  "automobile-insurance": ["motor", "vehicle insurance"],
  carinsurance: ["car insurance"],
  bikeinsurance: ["bike", "two wheeler", "scooter"],
  homeinsurance: ["home insurance"],
  sip: ["sip", "mutual fund"],
  pensionplans: ["pension", "retire", "retirement"],
  childplans: ["child plan", "children"],
  taxsavinginvestment: ["tax saving", "80c", "save tax"],
  investmentplans: ["invest", "investment", "grow money", "savings"],
  "ca-services": ["gst", "itr", "income tax return", "accountant", "ca "],
  "registration-services": ["registry", "notary", "agreement", "registration"],
  "e-stamp-services": ["e-stamp", "estamp", "stamp paper"],
  "credit-score-check-service": ["cibil", "credit score", "score"],
  "digital-marketing-sevice": ["marketing", "seo", "social media"],
  "dsa-franchise": ["franchise", "dsa", "partner with"],
  "government-business-services": ["government scheme", "subsidy", "udyam", "msme registration"],
};

const items = [...products.filter((p) => !p.hidden), ...services.map((s) => ({ ...s, kind: "service" }))];
const bySlug = Object.fromEntries(items.map((i) => [i.slug, i]));
const link = (slug) => bySlug[slug] && { label: bySlug[slug].name, href: `/${slug}` };

function matchProducts(text) {
  const scored = [];
  for (const [slug, words] of Object.entries(SYNONYMS)) {
    if (!bySlug[slug]) continue;
    const score = words.reduce((s, w) => (text.includes(w) ? s + w.length : s), 0);
    if (score) scored.push([score, slug]);
  }
  return scored
    .sort((a, b) => b[0] - a[0])
    .slice(0, 3)
    .map(([, slug]) => link(slug));
}

const UNITS = { cr: 1e7, crore: 1e7, crores: 1e7, l: 1e5, lac: 1e5, lacs: 1e5, lakh: 1e5, lakhs: 1e5, k: 1e3, thousand: 1e3 };

export function parseLoan(text) {
  let rest = text.replace(/₹|\b(?:rs|inr)\b\.?/g, " ");
  const rateMatch = rest.match(/(\d+(?:\.\d+)?)\s*(?:%|percent)/);
  if (rateMatch) rest = rest.replace(rateMatch[0], " ");
  const yearMatch = rest.match(/(\d+)\s*(?:y|yr|yrs|year|years)\b/);
  if (yearMatch) rest = rest.replace(yearMatch[0], " ");
  const amountMatch = rest.match(/(\d[\d,]*(?:\.\d+)?)\s*(crores?|cr|lakhs?|lacs?|lac|l|k|thousand)?\b/);
  let amount = null;
  if (amountMatch) {
    amount = parseFloat(amountMatch[1].replace(/,/g, "")) * (UNITS[amountMatch[2]] || 1);
    if (amount < 10000) amount = null;
  }
  return {
    amount,
    rate: rateMatch ? Math.min(Math.max(parseFloat(rateMatch[1]), 1), 36) : null,
    years: yearMatch ? Math.min(Math.max(parseInt(yearMatch[1], 10), 1), 30) : null,
  };
}

const has = (text, words) => words.some((w) => text.includes(w));

export function reply(input) {
  const text = ` ${input.toLowerCase().trim()} `;

  if (has(text, ["talk to a person", "call me", "callback", "call back", "human", "advisor", "agent", "speak", "talk to"])) {
    return {
      text: "Happy to arrange that. Leave your details and an advisor from our Indore office will call you back.",
      form: "callback",
    };
  }

  if (text.trim() === "find a loan") {
    return {
      text: "What's the loan for? Pick one, or just tell me in your own words.",
      links: ["homeloan", "buisnessloan", "personalloan", "mortrageloan", "carloan", "goldloan"].map(link),
      more: { label: "See all loans", href: "/securedloans" },
    };
  }

  if (text.trim() === "insurance quote") {
    return {
      text: "We compare quotes from several insurers. Which kind of cover?",
      links: ["healthInsurance", "familyinsurance", "carinsurance", "bikeinsurance", "homeinsurance"].map(link),
    };
  }

  if (has(text, [" emi", "emi ", "instalment", "installment", "monthly payment"])) {
    const { amount, rate, years } = parseLoan(text);
    if (!amount) {
      return {
        text: "Tell me the amount, and if you like the rate and tenure. For example: 30 lakh at 8.5% for 20 years.",
      };
    }
    const r = rate ?? 9;
    const y = years ?? 20;
    const monthly = emi(amount, r, y * 12);
    const total = monthly * y * 12;
    return {
      text: `For ${formatINRShort(amount)} at ${r}% over ${y} years${rate && years ? "" : " (I assumed what you didn't mention)"}:`,
      emi: { monthly, principal: amount, interest: total - amount },
      links: [{ label: "Open the full EMI calculator", href: "/homeloan#emi" }],
    };
  }

  if (has(text, ["eligib", "how much can i", "afford", "qualify", "how much loan"])) {
    return {
      text: "Most lenders keep all your EMIs within roughly 40 to 50% of monthly income. Our calculator uses 40% to give you a safe estimate.",
      links: [{ label: "Check your eligibility", href: "/eligibility" }],
    };
  }

  if (has(text, ["document", "papers", "kyc", "what do i need"])) {
    const found = matchProducts(text);
    return {
      text: "Most loans start with PAN, Aadhaar, six months of bank statements and proof of income: salary slips if you're salaried, ITRs if you're self-employed. Secured loans also need the property papers. Your advisor confirms the exact list for your lender.",
      links: found.length ? found : [link("homeloan"), link("buisnessloan")],
    };
  }

  if (has(text, ["cibil", "credit score", "score"])) {
    return {
      text: "Checking your own score doesn't lower it. If it's low, we can still look for lenders who consider your profile, and tell you what will help.",
      links: [link("credit-score-check-service"), { label: "Check eligibility", href: "/eligibility" }],
    };
  }

  if (has(text, ["interest", " rate", "cheapest", "lowest"])) {
    return {
      text: "Rates depend on the lender, the loan and your credit profile, so the honest answer is a quote for your file. An advisor can get you current offers.",
      chips: ["Talk to a person", "Work out an EMI"],
    };
  }

  if (has(text, ["address", "office", "where are", "location", "visit", "phone", "number", "email", "contact"])) {
    return {
      text: `We're at ${site.address}. Call ${site.phoneDisplay} or email ${site.email}.`,
      links: [{ label: "Directions and contact form", href: "/contact" }],
    };
  }

  if (has(text, [" hi ", " hello", " hey", "namaste", "good morning", "good evening"])) {
    return { text: "Hi! Ask me about loans, insurance, EMIs or documents.", chips: STARTERS };
  }

  if (has(text, ["thank", "thanks", "great", "ok ", "okay"])) {
    return { text: "Anytime. Anything else I can help with?", chips: ["Talk to a person", "Find a loan"] };
  }

  const found = matchProducts(text);
  if (found.length) {
    return { text: found.length === 1 ? "This looks like the one:" : "These look relevant:", links: found, chips: ["Documents needed", "Talk to a person"] };
  }

  return {
    text: "I'm not sure I followed. I can find a product, work out an EMI or list documents. Or I'll get a person to call you.",
    chips: STARTERS,
  };
}

export { formatINR };
