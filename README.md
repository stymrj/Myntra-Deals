# PriceDrop Hunter for Myntra — v2

Scans the Myntra categories you pick, sorted by discount, and shows the biggest price cuts. It runs in your own browser as a bookmarklet or userscript. Nothing is uploaded and there is no account.

**Live page:** https://stymrj.github.io/Myntra-Deals/

## What's new in v2

- **Fetch + parse rewritten (v2):** the gateway search API (`/gateway/v2/search/<category>?rows=50&o=<offset>&sort=discount`) is still the primary source, but it now also reads the listing page's embedded data when the gateway answers with a page instead of JSON, or after retries fail (page 1 only).
- **Mobile-web support:** products embedded in mobile-web pages (`__REDUX_STATE__` layoutEngine pages, with `styleId` ids and string prices) now parse — previously that shape was dropped entirely.
- **Desktop + category pages:** embedded data under `__myx` (`searchData.results.products`) and `pageStateData` is now read as well.
- **Parser accepts every product shape:** `productName` or `product` titles, numeric or string prices/MRP (`"₹1,299"`), `searchImage` or `images[0]`, `landingPageUrl` cleaned of query strings. Discount is always recomputed from price vs MRP.
- **Your discount selection is preserved:** items are no longer dropped in the parser for being below the minimum discount — that filter only applies when rendering, so changing the slider can never silently empty a scan.
- **More categories:** Personal Care, Bath & Body, Gadgets, Watches, Sunglasses, Handbags & Bags, Bedding, Home Decor, Lamps & Lighting and Kitchen & Dining added (45 sub-categories in total).
- **Blank-results fix:** the parser no longer drops string-priced, `product`-field or page-data items, and an empty scan now says why (reload the store / lower Min discount) instead of showing a bare "0 products".
- **Telegram bot (new, `bot/`):** Node bot using the same gateway API, with the same listing-page fallback. See Bot setup below.
- **Regression test:** `node test-results-tab.js` checks 10 gateway items + 3 mobile-web page items all parse and render as cards (see Testing).
- **Bookmark name fixed:** the install button now reads **Myntra Deals** instead of the generic “PriceDrop Hunter”, so the bookmark you drag to your bookmarks bar is named after this store.

## Why v2 is stronger

- **Reliability:** gateway API + listing-page fallback (desktop, mobile-web Redux, category pages), retries with exponential backoff, and empty-state diagnostics that say *why* a scan returned nothing (signed out, rate-limited, failed categories, empty categories). A built-in self-test (sidebar → Self-test) runs the parser on inline samples in your browser, no network needed.
- **Depth:** 3 pages per category by default (was 1), 45 sub-categories, 3 parallel category workers with progress, and de-dupe across pages and categories by product id.
- **Power features the baseline lacks:** lowest-ever + price-drop labels and Telegram alerts, saved-item price tracking with a sparkline, a cross-category "Biggest discounts" row, unit-price / value sort, multi-word search, and CSV + JSON export.
- **Bot:** scheduled Telegram bot with a price-history state file (dedupe + price-drop + restock alerts, 30-day pruning), not just a latest-deals list.

## Features

- Asks which categories to scan, then shows the biggest discounts first
- Best deals of each category in one swipeable row, with See all
- Ranks by percent off and rupees saved together
- Labels products that are new, cheaper than last time, or at their lowest price ever
- Price history sparkline on every product you have seen before
- Saved items strip showing how much each one dropped since you saved it
- Unit price (per kg, litre or piece) with a value sort
- One-tap presets: under ₹99, 50% off, save ₹100+, price drops, lowest ever, best value
- A setup checklist on first open
- Filters: search, category, brand, maximum price, minimum discount, stock, saved items
- Shopping list with quantities, total and total savings
- CSV export and copy-to-share text
- Grid and list views, light and dark themes, keyboard shortcuts
- Settings, saved items and price history stay in your browser

## Install

![Install walkthrough](https://stymrj.github.io/PriceDrop-Hunter/media/install-demo.gif)

[Watch the walkthrough video (MP4)](https://stymrj.github.io/PriceDrop-Hunter/media/install-demo.mp4)

**Bookmarklet (desktop).** Run `node build.js`, open `index.html`, and drag the **Myntra Deals** button to your bookmarks bar. Open myntra.com and click the bookmark.

**Bookmarklet (mobile).** On the install page, tap **Copy mobile loader**. It is a bookmark of about 380 characters that loads the latest version from GitHub Pages, so it fits on any phone. Create a bookmark named **Myntra Deals**, paste it as the address, and run it from the address bar on myntra.com. The full bookmarklet (about 45 KB, no network needed) is in `dist/bookmarklet.txt`.

**Userscript.** Install `dist/myntra-deals.user.js` in Tampermonkey or Violentmonkey. A small Deals button appears on every myntra.com page.

## Use

Pick categories in the scan picker, press Scan, and browse Best deals / All deals / Saved. Heart a deal to save it, Add to list to build a shopping list, and use the presets (under ₹99, 50% off, save ₹100+) for one-tap filtering.


## Keyboard shortcuts

`/` search, `S` scan or stop, `Esc` close.

## Telegram alerts

Hunter can send new deals, price drops and cheaper saved items to your Telegram.

1. In Telegram, open `@BotFather`, send `/newbot`, and copy the bot token.
2. Open your new bot and press **Start**.
3. Get your chat ID from `@userinfobot`, or open `https://api.telegram.org/bot<token>/getUpdates` and copy `chat.id`.
4. On the store, open Hunter, press **Telegram** in the top bar, paste the token and chat ID, press **Send test**, then switch alerts on.

Each deal is sent once, and again only if its price drops further. Use the userscript for alerts: some shops block bookmarklets from calling Telegram, while the userscript sends through `GM_xmlhttpRequest`. The token is stored only in your browser.

## Bot setup (Telegram alerts, v2)

A scheduled Node bot lives in `bot/` (no dependencies, Node 18+). It scans the same categories with the same gateway API and listing-page fallback, and sends new deals, price drops and restocks to Telegram.

```bash
cp .env.example .env   # fill in TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID
node bot/run.js --dry-run   # prints what would be sent, sends nothing
node bot/run.js             # live run
```

Get the token from `@BotFather` (`/newbot`) and the chat ID from `@userinfobot`. The bot needs your own token — nothing is pre-configured. State is kept in `data/state.json` (created on first run).

## How it gets data

Uses the search API Myntra's own listing pages use, sorted by discount, 50 products per page. If that API answers with a page instead of JSON, the tool reads the product data embedded in the page (desktop, mobile-web and category-page shapes). No sign-in or address is needed.

## Troubleshooting

- **Blank results / "No deals found":** reload myntra.com and scan again, or lower Min discount in the menu. If the gateway is down, v2 falls back to the listing page once — if that also fails, wait and retry.
- **Mobile web shows nothing:** v2 reads the mobile-web page data, but Myntra changes its page format often. If a scan returns nothing on mobile web only, try desktop mode or the desktop site.
- **Login / location:** no sign-in is needed. Size availability is summarised; check your size on the product page.

## Testing

```bash
node --check src/deals.js
node --check bot/platform.js bot/core.js bot/run.js
node test-results-tab.js   # regression test: sample payload -> parser -> cards
node build.js              # rebuild dist/ and index.html
```

The regression test uses only the sample payload in `fixtures/sample-api.json` — it proves fetched items render as cards, it does not prove the live Myntra API still returns that shape. Live API behaviour still needs a manual browser test on myntra.com (see Limitations).

## Limitations

- Myntra can change its internal APIs or page markup at any time; the parser reads responses loosely to survive small changes, but a big change can still break scans until the parser is updated.
- Myntra lists millions of products, so Hunter reads the first page(s) of each category; raise Pages per category in the menu for more.
- Size availability is summarised; check your size on the product page.
- Live platform APIs could not be fully verified from the machine that built v2 — run a scan in your own browser before relying on it.

## Project layout

```
src/deals.js         the app (one file, no dependencies)
src/index.tpl.html   install page template
build.js             builds dist/ and index.html
bot/                 Telegram bot (Node, no dependencies)
test-results-tab.js  regression test: sample payload -> parser -> cards
fixtures/sample-api.json
favicon.svg
```

Run `node build.js` after any change.

## License

MIT — see `LICENSE`.

---

Made with ♥ by [Satyam Raj](https://www.linkedin.com/in/satyamraj1)
