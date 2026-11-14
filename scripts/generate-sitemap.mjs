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

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((r) => `  <url><loc>${base}${r === "/" ? "/" : encodeURI(r)}</loc></url>`).join("\n")}
</urlset>
`;

writeFileSync(join(root, "public", "sitemap.xml"), xml);
console.log(`sitemap.xml: ${routes.length} URLs for ${base}`);
