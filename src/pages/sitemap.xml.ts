import type { APIRoute } from 'astro';
import { screenshots } from '../data/screenshots';

export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL;
  const pages = Object.keys(import.meta.glob('./**/*.astro'))
    .map(path => path.replace(/^\.\//, '').replace(/index\.astro$/, '').replace(/\.astro$/, '/'))
    .filter(path => path !== '404/')
    .sort();
  const absolute = (path: string) => new URL(`${base}${path}`, site).href;
  const urls = pages.map(path => {
    const route = path.replace(/^ru\//, '');
    const en = absolute(route);
    const ru = absolute(`ru/${route}`);
    const images = route === '' || route === 'showcase/'
      ? screenshots.map(shot => `<image:image><image:loc>${absolute(`screenshots/${shot.id}.webp`)}</image:loc></image:image>`).join('')
      : '';
    return `<url><loc>${absolute(path)}</loc><xhtml:link rel="alternate" hreflang="en" href="${en}"/><xhtml:link rel="alternate" hreflang="ru" href="${ru}"/><xhtml:link rel="alternate" hreflang="x-default" href="${en}"/>${images}</url>`;
  });
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join('\n')}\n</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
