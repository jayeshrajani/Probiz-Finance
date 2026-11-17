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

## Deploy instructions (after `shivansh_dev` is merged into `main`)

The code is safe to merge on its own: without the variable below, nothing loads and no banner is shown.

1. **Vercel > Project > Settings > Environment Variables > Add**
   - Key: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
   - Value: `G-JFRQMSBFQ9`
   - Environments: tick **Production only** (untick Preview and Development).
   - Not a secret (it is visible in every page's HTML), but keep it out of `.env.local` so local and preview visits do not count.
2. **Redeploy production.** `NEXT_PUBLIC_*` values are baked in at build time, so the variable has no effect until a new build:
   Vercel > Deployments > latest Production deployment > "..." > Redeploy (or push a new commit to `main`).
3. **Check the live site** in a private/incognito window:
   - The "Analytics cookies" notice appears at the bottom. Click "Allow".
   - Browser DevTools > Network: a request to `googletagmanager.com/gtag/js?id=G-JFRQMSBFQ9` and then `collect` requests to `google-analytics.com`.
   - GA4 (analytics.google.com, property for probizfinance.com) > Reports > **Realtime**: your visit appears within about a minute.
   - Click the WhatsApp button and a phone number: `whatsapp_click` and `phone_click` appear in Realtime > "Event count by Event name".
   - Open `/admin-panel`: no notice, no `gtag` request.
4. **Mark key events** in GA4 > Admin > Data display > Events (events appear there after they have happened once, up to 24 hours):
   switch on "Mark as key event" for `generate_lead`, `whatsapp_click`, `phone_click`. Or create them in advance under Admin > Key events > "New key event" with the exact names.
5. **Do not** add the Tag Manager (`GTM-5M29V599`) snippet or a second hard-coded `gtag` snippet: page views would be counted twice.

Rollback: delete the variable in Vercel and redeploy; the notice and all tracking disappear. Code changes are not needed.
Nothing else is required: the site has no Content-Security-Policy that would block Google's scripts (`next.config.js` only sets `upgrade-insecure-requests`).
