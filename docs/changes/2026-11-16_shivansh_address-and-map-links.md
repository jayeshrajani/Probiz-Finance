# Office address and Google Maps links

Author: Shivansh. Date: 2026-11-16. Branch: `shivansh_dev`.

## Change

New office address everywhere: **1003 Skye Corporate Park, AB Rd, Sector C, Slice 5, Part 2, Scheme 78, Vijay Nagar, Indore, Madhya Pradesh, 452010**
(replaces "709, Clifton Corporate, Indore"). Every place that shows it has a location pin linking to Google Maps (new tab).

| File | Change |
|---|---|
| `lib/site.js` | `address`; `mapEmbed` (Contact page map, previously pointing at a third address, "267, A, Shri Laxmi Nagar"); new `mapLink` (`google.com/maps/search/?api=1&query=...`) |
| `components/site/AddressLink.jsx` | New: pin icon + address + Maps link |
| `components/site/SiteFooter.jsx`, `pages/about.js` | Address shown with `AddressLink` |
| `pages/contact.js` | "Visit" row (pin icon) now opens Google Maps |
| `components/assistant/brain.js`, `Assistant.jsx` | Address answer adds "Open the office in Google Maps" (pin, new tab); assistant links support `external` |
| `components/site/Seo.jsx` | Structured address with `postalCode` 452010 and `hasMap` |
| `content/company.json` | Same address and map (not read by any page) |

## Verification

- Build: exit 0, 117 pages. No old address left in the code.

## Merged with Jayesh's parallel change (rebase onto `main` `5c727d4`, 2026-11-16)

Jayesh changed the address and added `site.mapLink` in the same period (with the Hindi/English site). Resolution:
- Kept Jayesh's address text ("..., Vijay Nagar, Indore, 452010", without "Madhya Pradesh") and his map links, because the Hindi dictionary (`locales/hi`) is keyed on that exact text.
  Structured data (`Seo.jsx`) still names Madhya Pradesh as the region, with postal code 452010 and `hasMap`.
- Kept Jayesh's Contact page and assistant contact card (both already link the address to Google Maps with a pin).
- `AddressLink` (pin + translated address + Maps link) used in the footer and About page; my extra assistant link was dropped in favour of Jayesh's contact card.
- The Maps link opens the Google listing "Skye Corporate Park" (4.0, 444 reviews, corporate office, AB Rd). The client's share link `share.google/2ymFK5AydWhwBuPJw` resolves to the same listing.
- Google lists the building as "105, AB Rd, ... Shalimar Township"; 1003 is taken to be the office number inside the building. The website shows the client's wording.
