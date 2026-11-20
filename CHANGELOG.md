# Changelog

## v2.0.0 — 2026-11-08
- Fixed (2026-11-09): install button now reads “Myntra Deals” instead of the generic “PriceDrop Hunter”, so the dragged bookmark is named after this store instead of colliding with every other tool.
- Fixed (2026-11-09): highest-discount items no longer vanish — a missing or stale MRP falls back to the payload's own discount % (MRP back-computed from it), object/range prices parse instead of ₹0, and mobile-web Redux `discountedPrice` is read. Previously these items computed 0% off and the Min-discount filter hid them. The Telegram bot no longer ends a scan early on a short page (only on the last item's discount).
- Fixed (2026-11-09): scheduled Telegram bot workflow added (`.github/workflows/telegram-bot.yml`, every 30 minutes 08:31–00:01 IST, dry run via workflow_dispatch, dedupe/price-history state cached at `data/state.json`); `.env` and `data/` are now git-ignored so a local token or run state can't be committed. Docs corrected: install steps now name the **Myntra Deals** button, the full bookmarklet is about 62 KB (was "45 KB"), the install-page mock products are fashion items (was groceries), the bot scans `bot/config.json`'s 7 groups / 25 sub-categories (not the browser tool's 45), and `MYNTRA_PINCODE` was removed from `.env.example` (the bot never read it).

- Fetch + parse rewritten: gateway search API kept as primary source; listing-page fallback added (desktop `__myx`, mobile-web `__REDUX_STATE__` layoutEngine pages, `pageStateData`).
- Parser accepts `productName`/`product` titles, numeric or string prices/MRP, and `searchImage`/`images[0]`; discount always recomputed from price vs MRP.
- User's discount selection preserved: the parser no longer drops below-minimum-discount items; filtering happens at render time.
- 10 new sub-categories added (Personal Care, Bath & Body, Gadgets, Watches, Sunglasses, Handbags & Bags, Bedding, Home Decor, Lamps & Lighting, Kitchen & Dining); 45 sub-categories in total.
- Blank-results fix: string-priced, `product`-field and page-data items no longer dropped; empty scans now explain why.
- New Telegram bot in `bot/` (Node, no dependencies) using the same gateway API and listing-page fallback.
- Regression test `test-results-tab.js` added (10 gateway + 3 mobile-web items must parse and render as cards).
- UI shell (filters, saved items, price history, themes, CSV export) unchanged.
- Depth raised: 3 pages per category by default (was 1); parallel scan with progress; de-dupe across pages/categories by product id.
- Empty-state diagnostics: scans now report why 0 results (signed out, rate-limited, failed categories, empty categories).
- Built-in self-test button (sidebar) runs the parser checks in-browser; the same checks run offline via `node test-results-tab.js`.
- JSON export added alongside CSV; optional pincode for the listing-page fallback (sidebar input).
