import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { seoRoutes, sitemapRoutes } from "../src/seo/routes.ts";
import { absoluteUrl, OG_IMAGE_PATH, pageTitle, SITE_NAME, SITE_ORIGIN } from "../src/seo/site.ts";

const root = new URL("..", import.meta.url);
const distDir = join(root.pathname, "dist");
const ssrPath = join(root.pathname, "dist-ssr", "entry-server.js");

const { render } = await import(pathToFileURL(ssrPath).href);
const template = await readFile(join(distDir, "index.html"), "utf8");

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function injectHead(
  html: string,
  input: {
    title: string;
    description: string;
    canonical: string;
    type: string;
    indexable: boolean;
    jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  },
): string {
  const fullTitle = pageTitle(input.title);
  const image = absoluteUrl(OG_IMAGE_PATH);
  const robots = input.indexable ? "index, follow" : "noindex, follow";
  const jsonLdTag = input.jsonLd
    ? `<script type="application/ld+json">${JSON.stringify(input.jsonLd)}</script>`
    : "";

  return html
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(fullTitle)}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
      `<meta name="description" content="${escapeHtml(input.description)}" />`,
    )
    .replace(
      "</head>",
      [
        `<link rel="canonical" href="${input.canonical}" />`,
        `<meta name="robots" content="${robots}" />`,
        `<meta property="og:title" content="${escapeHtml(fullTitle)}" />`,
        `<meta property="og:description" content="${escapeHtml(input.description)}" />`,
        `<meta property="og:type" content="${input.type}" />`,
        `<meta property="og:url" content="${input.canonical}" />`,
        `<meta property="og:image" content="${image}" />`,
        `<meta property="og:locale" content="de_DE" />`,
        `<meta property="og:site_name" content="${SITE_NAME}" />`,
        `<meta name="twitter:card" content="summary_large_image" />`,
        `<meta name="twitter:title" content="${escapeHtml(fullTitle)}" />`,
        `<meta name="twitter:description" content="${escapeHtml(input.description)}" />`,
        `<meta name="twitter:image" content="${image}" />`,
        jsonLdTag,
        "</head>",
      ].join(""),
    );
}

function outFileForPath(path: string): string {
  if (path === "/") return join(distDir, "index.html");
  return join(distDir, path.replace(/^\//, ""), "index.html");
}

for (const route of seoRoutes) {
  const body = route.prerender
    ? (render as (url: string) => string)(route.path)
    : (route.staticBody ?? "");
  const html = injectHead(template, {
    title: route.title,
    description: route.description,
    canonical: absoluteUrl(route.path),
    type: route.type,
    indexable: route.indexable,
    jsonLd: route.jsonLd,
  }).replace('<div id="root"></div>', `<div id="root">${body}</div>`);

  const file = outFileForPath(route.path);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html);
}

const notFoundBody = (render as (url: string) => string)("/seite-gibt-es-nicht");
const notFoundHtml = injectHead(template, {
  title: "Seite nicht gefunden",
  description: "Diese Seite gibt es bei E-RechnungDigital nicht.",
  canonical: SITE_ORIGIN,
  type: "website",
  indexable: false,
}).replace('<div id="root"></div>', `<div id="root">${notFoundBody}</div>`);
await writeFile(join(distDir, "404.html"), notFoundHtml);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapRoutes
  .map(
    (route) =>
      `  <url><loc>${absoluteUrl(route.path)}</loc><lastmod>${route.lastmod}</lastmod></url>`,
  )
  .join("\n")}
</urlset>
`;
await writeFile(join(distDir, "sitemap.xml"), sitemap);

console.log(`Prerendered ${seoRoutes.length} pages + 404.html and sitemap.xml.`);
