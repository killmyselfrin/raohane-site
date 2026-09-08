import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const sharp = require('sharp'); // Astro's image service dependency.
const base = '/raohane-site/';
const origin = 'https://killmyselfrin.github.io';
const root = new URL('../dist/', import.meta.url).pathname;
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? walk(join(dir, entry.name)) : join(dir, entry.name)))).flat();
}
const files = await walk(root);
const pages = files.filter(path => path.endsWith('.html'));
const canonicals = [];
for (const file of pages) {
  const html = await readFile(file, 'utf8');
  assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1, `One h1: ${file}`);
  assert(html.includes('id="main-content"'), `Skip target: ${file}`);
  assert(/<meta name="description" content="[^"]+"/.test(html), `Description: ${file}`);
  if (!file.endsWith('/404.html')) {
    const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
    const expected = origin + base + file.slice(root.length).replace(/index\.html$/, '');
    assert.equal(canonical, expected, `Canonical: ${file}`);
    canonicals.push(canonical);
    assert(!html.includes('noindex'), `Indexable: ${file}`);
    for (const lang of ['en', 'ru', 'x-default']) assert(html.includes(`hreflang="${lang}"`), `Language alternate: ${file}`);
  } else assert(html.includes('noindex'), '404 must not be indexed');
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const pageUrl = origin + base + file.slice(root.length).replace(/index\.html$/, '');
    const url = new URL(match[1].replaceAll('&amp;', '&'), pageUrl);
    if (url.origin !== origin || !url.pathname.startsWith(base)) continue;
    let target = join(root, decodeURIComponent(url.pathname.slice(base.length)));
    const info = await stat(target).catch(() => null);
    assert(info, `Missing asset/link ${match[1]} in ${file}`);
    if (info.isDirectory()) target = join(target, 'index.html');
    assert(await stat(target).catch(() => null), `Missing page ${target}`);
    if (url.hash && target.endsWith('.html')) {
      const targetHtml = await readFile(target, 'utf8');
      assert(targetHtml.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `Missing anchor ${match[1]} in ${file}`);
    }
  }
  const data = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)?.[1];
  assert(data && JSON.parse(data)['@context'] === 'https://schema.org', `Structured data: ${file}`);
}
const sitemap = await readFile(join(root, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
assert.deepEqual(urls.sort(), canonicals.sort(), 'Sitemap must match all public pages');
assert.equal(new Set(urls).size, urls.length, 'Unique sitemap URLs');
for (const name of ['desktop', 'control-center', 'launcher', 'settings']) {
  const image = sharp(join(root, `screenshots/${name}.webp`));
  const meta = await image.metadata();
  assert.equal(meta.width, 1920); assert.equal(meta.height, 1080);
  await image.raw().toBuffer(); // Fully decode: catches truncated/corrupt image data.
  const small = await sharp(join(root, `screenshots/${name}-800.webp`)).metadata();
  assert.equal(small.width, 800); assert.equal(small.height, 450);
}
console.log(`Validated ${pages.length} HTML pages, ${urls.length} sitemap URLs, internal links, metadata and 4 Full HD captures.`);
