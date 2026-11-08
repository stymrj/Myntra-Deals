// Myntra bot platform: same gateway search API the browser tool uses,
// rewritten for Node. No session cookie is required for the gateway;
// if it starts refusing, the listing-page fallback below still works.
// Node 18+, no dependencies.
'use strict';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const price = v => { if (v == null) return 0; if (typeof v === 'number') return v; const m = String(v).replace(/,/g, '').match(/\d+(\.\d+)?/); return m ? +m[0] : 0; };
const brandOf = t => (String(t).trim().split(/\s+/)[0] || '').replace(/[^\w&'-]/g, '');
function normalise(x, cat) {
  if (!x || typeof x !== 'object') return null;
  const title = x.productName || x.product || x.name;
  const sell = price(x.price), mrp0 = price(x.mrp);
  if (!title || !sell) return null;
  const mrp = mrp0 < sell ? sell : mrp0;
  const id = x.productId || x.styleId || x.id;
  if (!id) return null;
  const imgRaw = x.searchImage || (x.images && x.images[0] && (x.images[0].src || x.images[0].url)) || '';
  const route = x.landingPageUrl || x.url || '';
  const inv = x.inventoryInfo || [];
  return { id: String(id), title: String(title), brand: String(x.brand || brandOf(title)), price: sell, mrp,
    disc: mrp > sell ? Math.round((mrp - sell) / mrp * 100) : 0,
    img: String(imgRaw).replace(/^http:/, 'https:'),
    url: route ? 'https://www.myntra.com/' + String(route).replace(/^\//, '').split('?')[0] : '',
    inStock: !inv.length || inv.some(s => s && s.available !== false), cat };
}
function extractJsonObject(str, startIdx) {
  let depth = 0, inStr = false, esc = false;
  for (let i = startIdx; i < str.length; i++) {
    const c = str[i];
    if (esc) { esc = false; continue; }
    if (c === '\\') { esc = true; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === '{') depth++; else if (c === '}') { depth--; if (depth === 0) return str.slice(startIdx, i + 1); }
  }
  return null;
}
function extractPageProducts(html) {
  const pick = (prefix, fn) => { const i = html.indexOf(prefix); if (i < 0) return null;
    try { const raw = extractJsonObject(html, i + prefix.length); return raw ? fn(JSON.parse(raw)) : null; } catch (e) { return null; } };
  let out = pick('window.__myx = ', j => (j.searchData && j.searchData.results && j.searchData.results.products) || null);
  if (out && out.length) return out;
  out = pick('window.__REDUX_STATE__ = ', redux => {
    const pages = (redux && redux.layoutEnginev2 && redux.layoutEnginev2.pages) || {};
    for (const id of Object.keys(pages)) {
      const comps = (((pages[id].response || {}).page || {}).layout || {}).components || [];
      const prods = [];
      for (const comp of comps) { const d = comp && comp.itemData && comp.itemData.data;
        if (!d || !(d.styleId || d.productInfo)) continue;
        const info = d.productInfo || {}, pr = info.priceInfo || {};
        const media = d.productImage && d.productImage.productMedia;
        prods.push({ productId: d.styleId, brand: info.brand || '',
          product: info.additionalInfo ? (String(info.brand || '') + ' ' + info.additionalInfo).trim() : (info.brand || 'Product'),
          price: pr.price, mrp: pr.mrp, searchImage: media && media.length ? media[0].src : '',
          landingPageUrl: String((d.onPress && d.onPress.route) || ('/' + d.styleId)).replace(/^\//, '').split('?')[0] }); }
      if (prods.length) return prods; }
    return null; });
  if (out && out.length) return out;
  return pick('var pageStateData = { data: ', j => j.products || null) || [];
}
module.exports = {
  label: 'Myntra',
  required: [],
  workers: 3,
  pageSize: 50,
  sortedByDiscount: true,
  async fetchPage(job, page, ctx) {
    const { env, fetch, sleep } = ctx;
    const [code] = job.sub;
    const url = 'https://www.myntra.com/gateway/v2/search/' + code + '?rows=50&o=' + (page - 1) * 50 + '&sort=discount';
    await sleep(400 + Math.random() * 600);
    for (let a = 0; a < 4; a++) {
      const r = await fetch(url, { headers: { accept: 'application/json', 'user-agent': UA, referer: 'https://www.myntra.com/' } });
      if (r.status === 429 || r.status === 503) { await sleep(4000 * (a + 1)); continue; }
      if (r.status === 401 || r.status === 403) throw Object.assign(new Error('Myntra refused the request (HTTP ' + r.status + ').'), { blocked: true });
      if (!r.ok) return [];
      const ct = r.headers.get('content-type') || '';
      if (ct.indexOf('json') < 0) return extractPageProducts(await r.text()).map(x => normalise(x, job.g.name + ' › ' + job.sub[1])).filter(Boolean);
      const j = await r.json();
      const raw = j.products || (j.searchData && j.searchData.results && j.searchData.results.products) || [];
      const items = raw.map(x => normalise(x, job.g.name + ' › ' + job.sub[1])).filter(Boolean);
      items.more = j.hasNextPage === true || raw.length === 50;
      return items;
    }
    throw new Error('rate limited');
  }
};
