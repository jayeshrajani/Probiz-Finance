# Service cards: headings first, details on hover

Author: Shivansh. Date: 2026-11-17. Branch: `shivansh_dev`. Client request: reduce clutter in the "What we handle." section of service pages (for example `/ca-services`).

## Behaviour

- Collapsed (default): heading, a small arrow (top right) and "Explore services ⌄". Cards are about 146px tall instead of 400-550px.
- Desktop (mouse): hovering a card opens it. The card grows to fit, lifts 3px with a soft shadow and a light brand-coloured border;
  the items fade in and rise about 10px, one after another (35ms apart, about 380ms per item, ease-out). Leaving the card closes it.
- Touch screens and keyboard: tap, click, Enter or Space toggles the card (`aria-expanded` on the heading button).
  On desktop, a click keeps the card open after the mouse leaves.
- "Reduce motion" in the operating system: no animation (existing global rule in `styles/globals.css`).
- The service text is unchanged and stays in the page HTML, so search engines still read it.
- Layout: CSS grid (1 / 2 / 3 columns) instead of CSS columns, so an opening card does not reshuffle the others between columns.
  Cards in the same row keep their size; rows below move down.
- Applies to every service page that has sections (all pages using `components/templates/ServicePage.jsx`).

## Files

| File | Change |
|---|---|
| `components/blocks/ServiceCard.jsx` | New: one card (heading button, hidden list, open state) |
| `components/templates/ServicePage.jsx` | Uses `ServiceCard` in a grid; previous inline card markup removed |
| `styles/globals.css` | `.svc-*` rules: open/close transitions, stagger (`--i` per item), hover only on devices with a mouse |
| `locales/hi/ui.json` | "Explore services" = "सेवाएँ देखें" |

Icons: Phosphor `ArrowUpRight` and `CaretDown` (the site's existing icon set; no new dependency).

## Verification (local dev server, synthetic test database, `/ca-services`, 1400px wide)

- Collapsed: 9 cards in a 3 x 3 grid, all 146px; list hidden (`visibility: hidden`).
- Hover on a card: it opens to 426px, items appear in sequence; other cards in the row stay 146px; columns unchanged.
- Click: `aria-expanded="true"`, stays open after the mouse leaves; click again closes.
- Narrow window (about 475px): single column, cards 146px.
- `npm run check:i18n`: the new string is translated (total missing unchanged).
