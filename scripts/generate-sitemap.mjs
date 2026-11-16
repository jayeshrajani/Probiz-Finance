// Writes public/sitemap.xml from the page files. Runs before every build (npm run build) and via npm run sitemap.
import { readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const base = (process.env.SITE_URL || "https://probizfinance.com").replace(/\/+$/, "");

// Private, sign-in or duplicate pages (/home renders the homepage).
const EXCLUDE = new Set(["_app", "_document", "404", "500", "home", "sign-in", "sign-up", "forgot-password", "account", "add-product", "property-detail"]);

const routes = readdirSync(join(root, "pages"), { withFileTypes: true })
  .filter((f) => f.isFile() && /\.(js|jsx)$/.test(f.name))
  .map((f) => f.name.replace(/\.(js|jsx)$/, ""))
  .filter((name) => !EXCLUDE.has(name))
  .map((name) => (name === "index" ? "/" : `/${name}`))
  .sort((a, b) => (a === "/" ? -1 : b === "/" ? 1 : a.localeCompare(b)));

// Every page exists in English (no prefix) and Hindi (/hi); each URL lists both versions.
const loc = (r, hi) => `${base}${hi ? "/hi" : ""}${r === "/" ? (hi ? "" : "/") : encodeURI(r)}`;
const entry = (r, hi) =>
  `  <url><loc>${loc(r, hi)}</loc>` +
  `<xhtml:link rel="alternate" hreflang="en-IN" href="${loc(r, false)}"/>` +
  `<xhtml:link rel="alternate" hreflang="hi-IN" href="${loc(r, true)}"/>` +
  `<xhtml:link rel="alternate" hreflang="x-default" href="${loc(r, false)}"/></url>`;

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${routes.flatMap((r) => [entry(r, false), entry(r, true)]).join("\n")}
</urlset>
`;

writeFileSync(join(root, "public", "sitemap.xml"), xml);
console.log(`sitemap.xml: ${routes.length * 2} URLs (English and Hindi) for ${base}`);
