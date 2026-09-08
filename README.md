# Raohane Site

Official website for **Raohane**, a native Hyprland + Quickshell desktop shell.

This repository contains the public product site, documentation entry points, installation guide, and interactive shell showcase. The shell itself lives in [`killmyselfrin/raohane-dots`](https://github.com/killmyselfrin/raohane-dots).

## Development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Design direction

The site follows the Raohane Nocturne visual language: graphite and blue-black surfaces, restrained lavender accents, subtle glass, Japanese minimalism, and motion that stays responsive and quiet.

## Screenshots

The full-size WebP files in `public/screenshots/` are lossless encodings of the
original session captures at **1920 × 1080**. The desktop capture was 1917 × 1079;
three dark pixels were added on the right and one row on the bottom, with no
scaling or cropping. The `-800.webp` files are lightweight previews.

The homepage and showcase share a keyboard-accessible viewer: Escape closes it,
arrow keys switch captures, and Download saves the full-size image. Image links
also work without JavaScript.

## Search indexing

The build generates `sitemap.xml` from the actual English and Russian page
routes, with language alternates and screenshot URLs. Run `npm run check:site`
after `npm run build` to check internal links, metadata, sitemap coverage and
full decoding of the Full HD images. CI runs these checks before deployment.

After each deployment, IndexNow receives the URLs from the live sitemap.
Receipt of a submission does not guarantee indexing or ranking.

To finish search-console setup:

1. Add the **URL-prefix** property `https://killmyselfrin.github.io/raohane-site/`
   in [Google Search Console](https://search.google.com/search-console/).
   Use HTML-tag verification; a DNS property for `github.io` is not appropriate.
2. Put only the verification token (the meta tag's `content` value) into the
   repository Actions variable `GOOGLE_SITE_VERIFICATION`. Optional equivalents
   for Bing and Yandex are `BING_SITE_VERIFICATION` and `YANDEX_SITE_VERIFICATION`.
3. Run Website build and deploy, then verify ownership in the search console.
   Submit `https://killmyselfrin.github.io/raohane-site/sitemap.xml`. In Google,
   also use URL Inspection to request indexing of the homepage.

Do not add placeholder tokens. For HTML-file verification, place the exact file
supplied by the search engine in `public/` and redeploy.

**GitHub project Pages:** crawlers read robots rules only from
`https://killmyselfrin.github.io/robots.txt`. The file deployed under
`/raohane-site/robots.txt` does not control crawling. The host-root file currently
returns 404 and does not disallow this site. This repository cannot publish at
that host root; direct sitemap submission works for the project URL prefix.

References: [Google sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap),
[robots.txt location](https://developers.google.com/crawling/docs/robots-txt/create-robots-txt),
[IndexNow protocol](https://www.indexnow.org/documentation).
