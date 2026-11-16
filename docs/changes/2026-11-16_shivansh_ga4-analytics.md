# Google Analytics 4 and conversion events

Author: Shivansh. Date: 2026-11-16. Branch: `shivansh_dev`. Roadmap 01 (GA4) and Roadmap 02 (conversion tracking).

## Behaviour

- Off until `NEXT_PUBLIC_GA_MEASUREMENT_ID` (`G-...`) is set in the hosting environment. It is read at build time: redeploy after setting it.
- With an ID, a short notice asks first ("Allow" / "No thanks"). GA loads only after "Allow"; the choice is kept in the browser
  (`localStorage` key `probiz:analytics-consent`). "Cookie preferences" in the footer asks again; declining after allowing stops sending.
- Never loaded in `/admin-panel`, and no event is sent from there.
- No personal data in events: no names, phone numbers, emails or form contents. Links are reported by type only.
- Page views are sent manually on load and on every client-side navigation (`send_page_view: false`).
  **In GA4, turn off Enhanced measurement > "Page changes based on browser history events"** to avoid double page views.

## Events

| Event | When | Parameters |
|---|---|---|
| `page_view` | Each public page | `page_location`, `page_title` |
| `generate_lead` | Product or contact form submitted successfully | `form`, `product`, `repeat` |
| `generate_lead` | Callback requested in the chat assistant | `form: assistant_callback` |
| `whatsapp_click` | Any `wa.me` link | none |
| `phone_click` | Any `tel:` link | none |
| `email_click` | Any `mailto:` link | none |
| `map_click` | Google Maps link | none |
| `chat_open` | Assistant opened | none |
| `sign_up` | Newsletter subscription | `method: newsletter` |

Suggested key events (conversions) in GA4: `generate_lead`, `whatsapp_click`, `phone_click`.

## Files

| File | Change |
|---|---|
| `lib/analytics.js` | New: measurement ID, consent storage, `track()` (no-op without consent or in the admin panel) |
| `components/site/Analytics.jsx` | New: loads `gtag.js` after consent, page views, contact-link click events, consent notice |
| `pages/_app.js` | Mounts `Analytics` on the public site only |
| `components/forms/ApplicationForm.jsx`, `components/assistant/Assistant.jsx`, `components/site/NewsletterForm.jsx` | `generate_lead`, `chat_open`, `sign_up` |
| `components/site/SiteFooter.jsx` | "Cookie preferences" (only when GA is configured) |
| `.env.example` | `NEXT_PUBLIC_GA_MEASUREMENT_ID` |

## Verification (local production build, test ID `G-TEST000000`, isolated test database)

- Build: exit 0, 117 pages.
- `/homeloan`: notice shown, no `gtag` before consent; after "Allow": `gtag.js?id=G-TEST000000` loaded, `config` and `page_view` queued, choice stored, notice gone.
- WhatsApp button click recorded as `whatsapp_click`.
- `/admin-panel`: no `gtag`, no GA script, no notice.
- Not verified: data arriving in a real GA4 property (needs the client's ID).

## Open items

- GA4 property created by the client (2026-11-16): web stream "Probiz Finance Website" (`https://probizfinance.com`), **Measurement ID `G-JFRQMSBFQ9`**
  (public by design, not a secret). Enhanced measurement on, with "Page changes based on browser history events" turned off.
  The Google tag screen also showed a Tag Manager container `GTM-5M29V599`; it is not used and its snippet must not be added to the site.
- Set `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-JFRQMSBFQ9` for the **Production** environment only in the hosting settings, then redeploy.
  Not in Preview/Development and not in local `.env.local`, so test visits stay out of the real numbers.
- Client: confirm key events.
- Privacy policy (`content/legal.json`, sections "Cookies and Tracking Technologies" and "6. Cookies") should name Google Analytics and the opt-in. Draft for approval:
  "We use Google Analytics, only if you allow it, to understand how visitors use this website. It sets cookies and receives your IP address and device details; we do not send your name, phone number, email or form answers. You can change your choice at any time with 'Cookie preferences' at the bottom of every page."
- The existing Facebook Pixel (`pages/_app.js`, ID `5323417621055552`) loads without asking. Consider putting it behind the same consent.
