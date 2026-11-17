// Rule-based replies. Deterministic on purpose: no third-party AI, no data leaves the browser until the user asks for a callback.
// Replies are English templates (with {vars}) translated when rendered, so switching language re-renders the whole chat.
import { products, services } from "@/lib/catalog";
import { emi } from "@/lib/format";
import { forms } from "@/lib/forms";

export const CALLBACK = "Get a callback";
export const CONTACT = "Contact details";
export const STARTERS = [CALLBACK, "Find a loan", "Work out an EMI", "Documents needed", "Insurance quote", CONTACT];

// English, Hindi and common Hinglish ways people name each product.
const SYNONYMS = {
  homeloan: ["home loan", "house", "housing", "home", "ghar", "makan", "घर", "मकान", "होम लोन", "गृह ऋण"],
  flatpurchase: ["flat", "apartment", "फ्लैट"],
  plotpurchaseloan: ["plot", "land", "zameen", "प्लॉट", "ज़मीन", "जमीन"],
  constructionloan: ["construction", "build a house", "building a house", "निर्माण"],
  homerennovation: ["renovation", "repair", "interior", "मरम्मत", "रेनोवेशन"],
  mortrageloan: ["mortgage", "lap", "against property", "loan against", "प्रॉपर्टी पर लोन", "संपत्ति पर", "गिरवी"],
  commercialproperty: ["commercial", "shop purchase", "office", "कमर्शियल"],
  balancetransfer: ["balance transfer", "transfer my loan", "lower rate", "switch", "बैलेंस ट्रांसफर"],
  balancetransfertopup: ["top up", "top-up", "topup", "टॉप अप"],
  personalloan: ["personal", "wedding", "marriage", "shaadi", "medical emergency", "travel", "पर्सनल", "व्यक्तिगत", "शादी"],
  buisnessloan: ["business", "msme", "working capital", "shop", "trader", "dukaan", "vyapar", "व्यापार", "बिज़नेस", "बिजनेस", "दुकान", "कारोबार"],
  pradhanmantriloan: ["mudra", "pradhan mantri", "pmmy", "मुद्रा", "प्रधानमंत्री"],
  projectfunding: ["project", "startup", "funding", "प्रोजेक्ट", "स्टार्टअप"],
  carloan: ["car loan", "new car", "car", "gaadi", "gadi", "कार", "गाड़ी", "गाडी"],
  usedcarpurchase: ["used car", "second hand", "pre-owned", "पुरानी कार", "सेकंड हैंड"],
  educationloan: ["education", "study", "abroad", "college", "student", "padhai", "पढ़ाई", "शिक्षा", "एजुकेशन"],
  goldloan: ["gold", "sona", "सोना", "गोल्ड"],
  kisancreditcard: ["kisan credit", "kisan", "farm", "farmer", "agri", "crop", "kheti", "किसान", "खेती", "फसल"],
  creditcard: ["credit card", "card", "क्रेडिट कार्ड", "कार्ड"],
  healthInsurance: ["health", "medical", "mediclaim", "hospital", "स्वास्थ्य", "हेल्थ", "अस्पताल", "इलाज"],
  familyinsurance: ["family floater", "family health", "परिवार"],
  "automobile-insurance": ["motor", "vehicle insurance", "वाहन बीमा"],
  carinsurance: ["car insurance", "कार बीमा", "कार इंश्योरेंस"],
  bikeinsurance: ["bike", "two wheeler", "scooter", "बाइक", "स्कूटर", "दोपहिया"],
  homeinsurance: ["home insurance", "घर का बीमा", "होम इंश्योरेंस"],
  sip: ["sip", "mutual fund", "एसआईपी", "म्यूचुअल फंड"],
  pensionplans: ["pension", "retire", "retirement", "पेंशन", "रिटायरमेंट"],
  childplans: ["child plan", "children", "बच्चों", "बच्चे"],
  taxsavinginvestment: ["tax saving", "80c", "save tax", "टैक्स बचत", "टैक्स बचा"],
  investmentplans: ["invest", "investment", "grow money", "savings", "निवेश", "बचत", "इन्वेस्ट"],
  "ca-services": ["gst", "itr", "income tax return", "accountant", "ca", "जीएसटी", "आईटीआर", "सीए"],
  "registration-services": ["registry", "notary", "agreement", "registration", "रजिस्ट्री", "नोटरी", "रजिस्ट्रेशन"],
  "e-stamp-services": ["e-stamp", "estamp", "stamp paper", "ई-स्टांप", "स्टांप"],
  "credit-score-check-service": ["cibil", "credit score", "score", "सिबिल", "क्रेडिट स्कोर"],
  "digital-marketing-sevice": ["marketing", "seo", "social media", "मार्केटिंग"],
  "dsa-franchise": ["franchise", "dsa", "partner with", "फ्रेंचाइज़ी", "फ्रैंचाइज़ी"],
  "government-business-services": ["government scheme", "subsidy", "udyam", "msme registration", "सरकारी योजना", "सब्सिडी"],
};

const items = [...products.filter((p) => !p.hidden), ...services.map((s) => ({ ...s, kind: "service" }))];
const bySlug = Object.fromEntries(items.map((i) => [i.slug, i]));
const link = (slug) => bySlug[slug] && { label: bySlug[slug].name, href: `/${slug}` };
const topicOf = (slug) => bySlug[slug] && { name: bySlug[slug].name, slug, form: bySlug[slug].kind === "service" ? "#enquire" : "#apply" };

// Latin words match on word boundaries (so "ok" doesn't match "book"); Devanagari has no \b, so it matches as a substring.
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const cache = new Map();
function matcher(word) {
  if (!cache.has(word)) {
    cache.set(word, /^[\x20-\x7e]+$/.test(word) ? new RegExp(`(^|[^a-z0-9])${escape(word)}(?=$|[^a-z0-9])`) : { test: (s) => s.includes(word) });
  }
  return cache.get(word);
}
const has = (text, words) => words.some((w) => matcher(w).test(text));

function matchSlugs(text) {
  const scored = [];
  for (const [slug, words] of Object.entries(SYNONYMS)) {
    if (!bySlug[slug]) continue;
    const score = words.reduce((s, w) => (matcher(w).test(text) ? s + w.length : s), 0);
    if (score) scored.push([score, slug]);
  }
  return scored.sort((a, b) => b[0] - a[0]).slice(0, 3).map(([, slug]) => slug);
}

const UNITS = {
  cr: 1e7, crore: 1e7, crores: 1e7, "करोड़": 1e7, "करोड": 1e7,
  l: 1e5, lac: 1e5, lacs: 1e5, lakh: 1e5, lakhs: 1e5, "लाख": 1e5,
  k: 1e3, thousand: 1e3, "हज़ार": 1e3, "हजार": 1e3,
};
const END = "(?=$|[^\\p{L}\\p{M}\\d])";
const RATE = /(\d+(?:\.\d+)?)\s*(?:%|percent|प्रतिशत)/u;
const YEARS = new RegExp(`(\\d+)\\s*(?:y|yr|yrs|year|years|साल|वर्ष)${END}`, "u");
const AMOUNT = new RegExp(`(\\d[\\d,]*(?:\\.\\d+)?)\\s*(crores?|cr|lakhs?|lacs?|lac|l|k|thousand|करोड़|करोड|लाख|हज़ार|हजार)?${END}`, "u");

export function parseLoan(text) {
  let rest = text.replace(/₹|\b(?:rs|inr)\b\.?|रुपये|रु\./g, " ");
  const rateMatch = rest.match(RATE);
  if (rateMatch) rest = rest.replace(rateMatch[0], " ");
  const yearMatch = rest.match(YEARS);
  if (yearMatch) rest = rest.replace(yearMatch[0], " ");
  const amountMatch = rest.match(AMOUNT);
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

const LOAN_MENU = ["homeloan", "buisnessloan", "personalloan", "mortrageloan", "carloan", "goldloan"];
const COVER_MENU = ["healthInsurance", "familyinsurance", "carinsurance", "bikeinsurance", "homeinsurance"];
const INSURANCE_SLUGS = new Set(["healthInsurance", "familyinsurance", "automobile-insurance", "carinsurance", "bikeinsurance", "homeinsurance"]);

const WANTS_CALL = ["talk to a person", "get a callback", "call me", "callback", "call back", "human", "advisor", "agent", "speak", "talk to", "baat karni", "call karo", "कॉल करें", "कॉल कीजिए", "कॉल बैक", "बात करनी", "बात करना", "सलाहकार", "फ़ोन करें", "फोन करें"];
const WANTS_CONTACT = ["contact details", "contact", "address", "office", "where are", "location", "visit", "phone number", "your number", "email", "whatsapp", "पता", "ऑफिस", "दफ्तर", "कार्यालय", "नंबर", "ईमेल", "संपर्क", "व्हाट्सएप", "कहाँ"];
const WANTS_APPLY = ["apply", "want", "need", "book", "looking for", "interested", "chahiye", "lena hai", "चाहिए", "आवेदन", "अप्लाई", "लेना"];
const GREETINGS = ["hi", "hello", "hey", "namaste", "namaskar", "good morning", "good evening", "नमस्ते", "नमस्कार", "हेलो", "हाय"];
const THANKS = ["thank", "thanks", "thank you", "great", "ok", "okay", "cool", "धन्यवाद", "शुक्रिया", "ठीक है", "बढ़िया"];

const words = (text) => text.trim().split(/\s+/).filter(Boolean).length;

// Returns { text, vars, links, chips, emi, list, contact, action, topic, expect }. `action: "lead"` starts the in-chat callback flow.
// `expect` is what the reply asked for; pass it back as `context.expect` with the next message.
export function reply(input, context = {}) {
  const text = ` ${input.toLowerCase().trim()} `;
  const slugs = matchSlugs(text);
  const topic = slugs.length ? topicOf(slugs[0]) : null;

  if (has(text, WANTS_CALL)) return { action: "lead", topic };

  if (has(text, WANTS_CONTACT) && !has(text, ["emi", "ईएमआई"])) {
    return { text: "Here's how to reach us. Tap any of these.", contact: true, chips: [CALLBACK] };
  }

  const loan = parseLoan(text);
  const asksEmi = has(text, ["emi", "instalment", "installment", "monthly payment", "ईएमआई", "किस्त", "kist"]);
  // "30 lakh at 7% for 10 years" is an EMI question even without the word EMI.
  const looksLikeEmi = loan.amount && (context.expect === "emi" || loan.rate || loan.years);
  if (asksEmi || looksLikeEmi) {
    const { amount, rate, years } = loan;
    if (!amount) {
      return { text: "Tell me the amount, and if you like the rate and tenure. For example: 30 lakh at 8.5% for 20 years.", expect: "emi" };
    }
    const r = rate ?? 9;
    const y = years ?? 20;
    const monthly = emi(amount, r, y * 12);
    const total = monthly * y * 12;
    return {
      text: rate && years ? "For {amount} at {rate}% over {years} years:" : "For {amount} at {rate}% over {years} years (I assumed what you didn't mention):",
      vars: { amount, rate: r, years: y },
      emi: { monthly, principal: amount, interest: total - amount },
      links: [{ label: "Open the full EMI calculator", href: "/homeloan#emi" }],
      chips: [CALLBACK, "Check eligibility"],
      topic,
    };
  }

  if (has(text, ["eligib", "check eligibility", "how much can i", "afford", "qualify", "how much loan", "पात्रता", "कितना लोन", "kitna loan"])) {
    return {
      text: "Most lenders keep all your EMIs within roughly 40 to 50% of monthly income. Our calculator uses 40% to give you a safe estimate.",
      links: [{ label: "Check your eligibility", href: "/eligibility" }],
      chips: [CALLBACK],
    };
  }

  if (has(text, ["document", "documents", "papers", "kyc", "what do i need", "दस्तावेज़", "दस्तावेज", "कागज़", "कागज", "kagaz"])) {
    const product = slugs.map((s) => bySlug[s]).find((p) => p?.form && forms[p.form]?.files?.length);
    if (product) {
      return {
        text: "For a {product}, keep these handy. Uploading is optional; your advisor confirms the exact list for your lender.",
        vars: { product: product.name },
        list: forms[product.form].files.filter((f) => !f.showIf).map((f) => f.label),
        links: [{ label: "Apply for {product}", vars: { product: product.name }, href: `/${product.slug}#apply` }],
        chips: [CALLBACK],
        topic: topicOf(product.slug),
      };
    }
    return {
      text: "Most loans start with PAN, Aadhaar, six months of bank statements and proof of income: salary slips if you're salaried, ITRs if you're self-employed. Secured loans also need the property papers. Your advisor confirms the exact list for your lender.",
      chips: ["Home loan documents", "Business loan documents", CALLBACK],
      topic,
    };
  }

  if (has(text, ["cibil", "credit score", "score", "सिबिल", "क्रेडिट स्कोर"])) {
    return {
      text: "Checking your own score doesn't lower it. If it's low, we can still look for lenders who consider your profile, and tell you what will help.",
      links: [link("credit-score-check-service"), { label: "Check loan eligibility", href: "/eligibility" }],
      chips: [CALLBACK],
    };
  }

  if (has(text, ["interest", "rate", "rates", "cheapest", "lowest", "byaj", "ब्याज", "दर"])) {
    return {
      text: "Rates depend on the lender, the loan and your credit profile, so the honest answer is a quote for your file. An advisor can get you current offers.",
      chips: [CALLBACK, "Work out an EMI"],
      topic,
    };
  }

  if (text.trim() === "insurance quote" || (has(text, ["insurance", "cover", "policy", "bima", "बीमा", "इंश्योरेंस", "पॉलिसी"]) && !slugs.some((s) => INSURANCE_SLUGS.has(s)))) {
    return {
      text: "We compare quotes from several insurers. Which kind of cover?",
      links: COVER_MENU.map(link),
      chips: [CALLBACK],
    };
  }

  if (text.trim() === "find a loan" || (has(text, ["loan", "loans", "लोन", "ऋण", "कर्ज़", "कर्ज"]) && !slugs.length)) {
    return {
      text: "What's the loan for? Pick one, or just tell me in your own words.",
      links: LOAN_MENU.map(link),
      more: { label: "See all loans", href: "/securedloans" },
    };
  }

  if (topic && has(text, WANTS_APPLY)) {
    return {
      text: "You can apply for a {product} online in a few minutes, or give me your name and number and an advisor will call you.",
      vars: { product: topic.name },
      links: [{ label: "Apply for {product}", vars: { product: topic.name }, href: `/${topic.slug}${topic.form}` }],
      chips: [CALLBACK],
      topic,
    };
  }

  if (slugs.length) {
    return {
      text: slugs.length === 1 ? "This looks like the one:" : "These look relevant:",
      links: slugs.map(link),
      chips: [CALLBACK, "Documents needed"],
      topic,
    };
  }

  if (has(text, GREETINGS) && words(text) <= 4) {
    return { text: "Hi! Ask me about loans, insurance, EMIs or documents. I can also get an advisor to call you.", chips: STARTERS };
  }

  if (has(text, THANKS) && words(text) <= 5) {
    return { text: "Anytime. Anything else I can help with?", chips: [CALLBACK, "Find a loan"] };
  }

  return {
    text: "I'm not sure I followed. I can find a product, work out an EMI, list documents or share our contact details. Or I'll get a person to call you.",
    chips: STARTERS,
  };
}
