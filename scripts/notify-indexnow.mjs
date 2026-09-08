import { readFile } from 'node:fs/promises';

// Use the deployed sitemap so every submitted URL belongs to the live build.
const origin = 'https://killmyselfrin.github.io/raohane-site/';
const key = (await readFile(new URL('../public/8f4c2a7d91b6e3f0c5a8d2b7e1f4a963.txt', import.meta.url), 'utf8')).trim();
const response = await fetch(`${origin}sitemap.xml`, { signal: AbortSignal.timeout(30000) });
if (!response.ok) throw new Error(`Sitemap returned HTTP ${response.status}`);
const xml = await response.text();
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
if (!urlList.length || urlList.some(url => !url.startsWith(origin))) throw new Error('Invalid sitemap URL scope');
const result = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: new URL(origin).host, key, keyLocation: `${origin}${key}.txt`, urlList }),
  signal: AbortSignal.timeout(30000),
});
if (![200, 202].includes(result.status)) throw new Error(`IndexNow returned HTTP ${result.status}: ${await result.text()}`);
console.log(`IndexNow received ${urlList.length} URLs (HTTP ${result.status}). Indexing is decided by each search engine.`);
