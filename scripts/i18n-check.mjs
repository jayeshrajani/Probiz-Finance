// Finds English text with no Hindi translation in locales/hi. Run: npm run check:i18n
//   --write <dir>   also write the missing keys per area to <dir>/<area>.json ({ "English": "" }) for translating
//   --unused        list dictionary keys that no longer appear in the source
import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { registerHooks } from "node:module";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// Resolve the "@/..." alias and let JSON load without import attributes, like the Next.js bundler does.
registerHooks({
  resolve(spec, ctx, next) {
    const ours = ctx.parentURL && !ctx.parentURL.includes("/node_modules/");
    const local = spec.startsWith("@/") ? join(root, spec.slice(2)) : spec.startsWith(".") && ours ? join(dirname(fileURLToPath(ctx.parentURL)), spec) : null;
    if (local) {
      let p = local;
      if (!extname(p)) p += statSafe(p + ".js") ? ".js" : statSafe(p + ".jsx") ? ".jsx" : statSafe(join(p, "index.js")) ? "/index.js" : ".js";
      return next(pathToFileURL(p).href, ctx);
    }
    return next(spec, ctx);
  },
  load(url, ctx, next) {
    if (url.endsWith(".json")) return { format: "module", source: `export default ${readFileSync(fileURLToPath(url), "utf8")};`, shortCircuit: true };
    return next(url, ctx);
  },
});

function statSafe(p) {
  try {
    return statSync(p);
  } catch {
    return null;
  }
}

const AREAS = ["ui", "catalog", "forms", "services", "legal", "company", "assistant"];
const keys = Object.fromEntries(AREAS.map((a) => [a, new Set()]));
const add = (area, s) => {
  if (typeof s !== "string") return;
  const v = s.trim();
  if (v && /\p{L}{2,}/u.test(v) && !/^(https?:|mailto:|tel:|\/)/.test(v)) keys[area].add(s);
};

// ---------- Source files: t("...") calls plus text-like literals in constants ----------
const SKIP_DIRS = new Set(["admin", "ui", "admin-panel", "api"]);
function walkFiles(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name)) walkFiles(join(dir, e.name), out);
    } else if (/\.(js|jsx)$/.test(e.name)) out.push(join(dir, e.name));
  }
  return out;
}

const unescape = (s) => s.replace(/\\(["'`\\])/g, "$1").replace(/\\n/g, "\n");
const T_CALL = /\bt\(\s*(["'`])((?:\\.|(?!\1)[^\\])*?)\1\s*[,)]/g;
const LITERAL = /(["'])((?:\\.|(?!\1)[^\\\n])*)\1/g;
const PROP_BEFORE = /\b(label|title|name|heading|text|body|q|a|blurb|intro|headline|summary|help|placeholder|submitLabel|patternMessage|whyTitle)\s*:\s*$/;
const looksLikeText = (s) => /^[A-Z₹0-9"'(]/.test(s) && /[a-z]{2,}/.test(s) && /\s/.test(s.trim()) && !/[<>=;]/.test(s);

function areaFor(file) {
  const rel = relative(root, file);
  if (rel.startsWith("components/assistant/")) return "assistant";
  if (rel === "lib/catalog.js" || rel === "lib/faqs.js") return "catalog";
  if (rel === "lib/forms.js" || rel === "lib/lead-schema.js" || rel === "lib/api.js" || rel.startsWith("server/")) return "forms";
  if (rel === "lib/services-content.js") return "services";
  if (rel === "lib/careers.js" || rel.startsWith("pages/Careers/") || rel.startsWith("components/careers/") || rel === "components/templates/CareerProgrammePage.jsx") return "company";
  return "ui";
}

const sourceFiles = [
  ...walkFiles(join(root, "components")),
  ...walkFiles(join(root, "pages")),
  ...["lib/catalog.js", "lib/faqs.js", "lib/forms.js", "lib/lead-schema.js", "lib/services-content.js", "lib/callback.js", "lib/api.js", "lib/property.js", "lib/careers.js", "server/leads/intake.js"].map((f) => join(root, f)),
];

for (const file of sourceFiles) {
  const src = readFileSync(file, "utf8");
  const area = areaFor(file);
  for (const m of src.matchAll(T_CALL)) if (m[1] !== "`" || !m[2].includes("${")) add(area, unescape(m[2]));
  // Background effects hold font strings and demo text; only their t() calls count.
  if (file.includes("/kokonutui/")) continue;
  for (const m of src.matchAll(LITERAL)) {
    const s = unescape(m[2]);
    if (/^[a-z]+([A-Z][a-z0-9]*)+$|^(true|false)$/.test(s)) continue;
    const before = src.slice(Math.max(0, m.index - 40), m.index);
    if (/\b(className|class|href|src|id|key|type|autoComplete|inputMode)\s*=\s*\{?$|\b(import|from|require)\s*\(?\s*$/.test(before)) continue;
    const line = src.slice(src.lastIndexOf("\n", m.index) + 1, src.indexOf("\n", m.index) === -1 ? undefined : src.indexOf("\n", m.index));
    if (/^\s*import\b|^\s*export\s.*\sfrom\s/.test(line)) continue;
    if (PROP_BEFORE.test(before) || looksLikeText(s)) add(area, s);
  }
}

// ---------- Data modules ----------
const imp = (p) => import(pathToFileURL(join(root, p)).href);
const { products, services, nav, tools } = await imp("lib/catalog.js");
const { forms } = await imp("lib/forms.js");
const { faqsFor } = await imp("lib/faqs.js");
const { getService } = await imp("lib/services-content.js");
const { site } = await imp("lib/site.js");
const { CONSENT_TEXT } = await imp("lib/lead-schema.js");
const legal = JSON.parse(readFileSync(join(root, "content/legal.json"), "utf8"));
const company = JSON.parse(readFileSync(join(root, "content/company.json"), "utf8"));

const TEXT_KEYS = new Set(["name", "title", "description", "headline", "summary", "label", "body", "blurb", "heading", "intro", "q", "a"]);
function walk(area, value, key) {
  if (typeof value === "string") {
    if (key === undefined || TEXT_KEYS.has(key)) add(area, value);
  } else if (Array.isArray(value)) value.forEach((v) => walk(area, v, typeof v === "string" ? key : undefined));
  else if (value && typeof value === "object" && !value.$$typeof && typeof value !== "function") {
    for (const [k, v] of Object.entries(value)) if (k !== "slug" && k !== "href" && k !== "icon" && k !== "scene") walk(area, v, k);
  }
}

walk("catalog", products);
walk("catalog", services);
walk("catalog", nav);
walk("catalog", tools);
for (const p of [{ kind: "card" }, { kind: "investment" }, { kind: "insurance", group: "motor" }, { kind: "insurance" }, { kind: "loan" }]) walk("catalog", faqsFor(p));

for (const config of Object.values(forms)) {
  add("forms", config.submitLabel);
  for (const step of config.steps || []) {
    add("forms", step.title);
    for (const f of step.fields || []) {
      add("forms", f.label);
      add("forms", f.help);
      add("forms", f.patternMessage);
      for (const o of f.options || []) add("forms", typeof o === "string" ? o : o.label);
    }
  }
  for (const f of config.files || []) add("forms", f.label);
}
add("forms", CONSENT_TEXT.replace("privacy policy.", "").trim());
// validateField's one-word error and the assistant's one-word chip, which the literal scan can't tell from code.
add("forms", "Required");
add("assistant", "Cancel");

for (const s of services) {
  const c = getService(s.slug);
  [c.title, c.headline, c.summary, c.whyTitle, ...c.why].forEach((v) => add("services", v));
  for (const sec of c.sections) {
    add("services", sec.heading);
    add("services", sec.intro);
    for (const item of sec.items || []) {
      add("services", item.title);
      add("services", item.description);
      (item.bullets || []).forEach((b) => add("services", b));
    }
  }
  for (const f of c.fees) {
    const [label, value] = f.split(/:\s(.+)/);
    add("services", label);
    add("services", value || label);
  }
}

for (const sections of Object.values(legal)) {
  for (const s of sections) {
    add("legal", s.heading);
    (s.paragraphs || []).forEach((p) => add("legal", p));
    (s.bullets || []).forEach((b) => add("legal", b));
  }
}

company.about.paragraphs.forEach((p) => add("company", p));
add("ui", site.address);
add("ui", site.description);

// ---------- Compare with the dictionaries ----------
const dict = {};
for (const f of readdirSync(join(root, "locales/hi")).filter((f) => f.endsWith(".json"))) Object.assign(dict, JSON.parse(readFileSync(join(root, "locales/hi", f), "utf8")));

const seen = new Set();
const missing = {};
let total = 0;
for (const area of AREAS) {
  missing[area] = {};
  for (const k of keys[area]) {
    if (seen.has(k)) continue;
    seen.add(k);
    if (!dict[k]) {
      missing[area][k] = "";
      total++;
    }
  }
}

const args = process.argv.slice(2);
const writeDir = args.includes("--write") ? args[args.indexOf("--write") + 1] : null;
for (const area of AREAS) console.log(`${area.padEnd(10)} ${String(Object.keys(missing[area]).length).padStart(5)} missing`);
console.log(`${"total".padEnd(10)} ${String(total).padStart(5)} missing of ${seen.size} strings`);
if (writeDir) {
  mkdirSync(writeDir, { recursive: true });
  for (const area of AREAS) writeFileSync(join(writeDir, `${area}.json`), JSON.stringify(missing[area], null, 2) + "\n");
  console.log(`Missing keys written to ${writeDir}`);
}
if (args.includes("--unused")) {
  const unused = Object.keys(dict).filter((k) => !seen.has(k));
  console.log(`\n${unused.length} dictionary keys not found in the source:`);
  unused.forEach((k) => console.log(`  ${JSON.stringify(k)}`));
}
process.exitCode = total ? 1 : 0;
