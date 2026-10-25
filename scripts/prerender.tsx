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

const linkLine = (route: { path: string; title: string; description: string }) =>
  `- [${route.title}](${absoluteUrl(route.path)}): ${route.description}`;
const routesUnder = (prefix: string) =>
  sitemapRoutes.filter((route) => route.path.startsWith(`${prefix}/`));

const llms = `# ${SITE_NAME}

> Kostenloses Browser-Werkzeug, um E-Rechnungen als XRechnung 3.0 (CII-XML) und ZUGFeRD-PDF nach EN 16931 zu erstellen, zu öffnen und zu prüfen. Rechnungsdaten bleiben im Browser, es gibt kein Konto und keinen Upload.

Gedacht für Selbstständige, Gründer und kleine Unternehmen in Deutschland, die schnell eine gültige E-Rechnung brauchen. Seit 2025 müssen Unternehmen E-Rechnungen empfangen können, ab 2027 bzw. 2028 auch ausstellen.

## Werkzeug

${linkLine(sitemapRoutes.find((r) => r.path === "/erstellen")!)}
${linkLine(sitemapRoutes.find((r) => r.path === "/oeffnen")!)}
${linkLine(sitemapRoutes.find((r) => r.path === "/ki-assistenten")!)}

## Ratgeber

${routesUnder("/ratgeber").map(linkLine).join("\n")}

## Prüfregeln (Validierungsfehler erklärt)

${routesUnder("/pruefregeln").map(linkLine).join("\n")}

## Optional

- [Datenschutz](${absoluteUrl("/datenschutz")}): Was bei der Nutzung anfällt und was nicht.
- [Impressum](${absoluteUrl("/impressum")})
`;
await writeFile(join(distDir, "llms.txt"), llms);

console.log(`Prerendered ${seoRoutes.length} pages + 404.html, sitemap.xml and llms.txt.`);
