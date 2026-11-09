# Changelog

## v2.0.0 — 2026-11-08
- Fixed (2026-11-09): install button now reads “Myntra Deals” instead of the generic “PriceDrop Hunter”, so the dragged bookmark is named after this store instead of colliding with every other tool.

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
