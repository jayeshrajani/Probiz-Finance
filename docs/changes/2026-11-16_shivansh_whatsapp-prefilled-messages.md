# WhatsApp pre-filled enquiry messages

Author: Shivansh. Date: 2026-11-16. Branch: `shivansh_dev`. Roadmap 01 (WhatsApp redirection with pre-filled messages).

## Behaviour

WhatsApp links open the chat with a message already typed:

| Where | Message |
|---|---|
| Floating WhatsApp button on a product or service page (for example `/homeloan`) | "Hi Probiz Finance, I'm interested in Home Loan. Please share the details." (product name from the catalogue) |
| Floating button on other pages, Contact page | "Hi Probiz Finance, I'd like to know more about your services." |

The number is the WhatsApp number in the admin website settings (currently 9981303887). Taps are tracked as `whatsapp_click` when analytics is allowed.

## Files

| File | Change |
|---|---|
| `lib/site-settings.js` | `WHATSAPP_GREETING`, `whatsappProductMessage(name)`, `whatsappUrl(number, text)`; `whatsappHref` now includes the greeting |
| `components/site/WhatsAppButton.jsx` | Picks the product or service from the page address and uses its message |

## Verification

- `/homeloan` button: `https://wa.me/919981303887?text=Hi Probiz Finance, I'm interested in Home Loan. Please share the details.`
- `/contact` links: general greeting.

## WhatsApp automation status (from Jayesh's `84d8943`)

- Built, not switched on: new-lead alert to the team (template message via the Meta WhatsApp Cloud API; result logged on the lead).
  Needs `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, an approved `WHATSAPP_TEMPLATE` and `WHATSAPP_ALERT_TO` (see README "WhatsApp new-lead alerts").
- Not built: link to the client's existing automation tool (tool unknown); customer acknowledgement message; incoming WhatsApp chats as leads.
- Needed from the client: current WhatsApp tool and number (a number is usually connected to one API provider only), Meta Business Manager access, alert recipients, approval of the message wording.
