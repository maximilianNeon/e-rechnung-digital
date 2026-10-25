import { guidePath, guides } from "../pages/guides/guides";
import { pflicht2027Faq } from "../pages/guides/pflicht2027Data";
import {
  ruleDescription,
  ruleHeadline,
  rulePath,
  rules,
  RULES_UPDATED,
} from "../pages/rules/rules";
import { DEFAULT_LASTMOD } from "./site";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  faqPageJsonLd,
  organizationJsonLd,
  softwareApplicationJsonLd,
  websiteJsonLd,
} from "./structuredData";

export interface SeoRoute {
  path: string;
  title: string;
  description: string;
  type: "website" | "article";
  lastmod: string;
  /** Included in sitemap when true */
  inSitemap: boolean;
  indexable: boolean;
  /** Full React page is SSR-rendered when true */
  prerender: boolean;
  /** Static HTML body used when prerender is false (tool pages) */
  staticBody?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const guideRoutes: SeoRoute[] = guides
  .filter((guide) => !guide.canonicalPath)
  .map((guide) => {
    const path = guidePath(guide);
    const jsonLd: Record<string, unknown>[] = [
      articleJsonLd({
        headline: guide.title,
        description: guide.description,
        path,
        datePublished: guide.updated,
        dateModified: guide.updated,
      }),
      breadcrumbJsonLd([
        { name: "Start", path: "/" },
        { name: "Ratgeber", path: "/ratgeber" },
        { name: guide.title, path },
      ]),
    ];
    if (guide.faq.length > 0) jsonLd.push(faqPageJsonLd(guide.faq));
    return {
      path,
      title: guide.title,
      description: guide.description,
      type: "article" as const,
      lastmod: guide.updated,
      inSitemap: true,
      indexable: true,
      prerender: true,
      jsonLd,
    };
  });

const ruleRoutes: SeoRoute[] = rules.map((rule) => {
  const path = rulePath(rule.id);
  const headline = ruleHeadline(rule);
  return {
    path,
    title: `${headline} – Prüfregel erklärt`,
    description: ruleDescription(rule),
    type: "article" as const,
    lastmod: RULES_UPDATED,
    inSitemap: true,
    indexable: true,
    prerender: true,
    jsonLd: [
      articleJsonLd({
        headline,
        description: ruleDescription(rule),
        path,
        datePublished: RULES_UPDATED,
        dateModified: RULES_UPDATED,
      }),
      breadcrumbJsonLd([
        { name: "Start", path: "/" },
        { name: "Prüfregeln", path: "/pruefregeln" },
        { name: rule.id, path },
      ]),
      faqPageJsonLd([
        { question: `Was bedeutet ${rule.id}?`, answer: rule.meaning },
        { question: `Wie behebe ich ${rule.id}?`, answer: rule.fix },
      ]),
    ],
  };
});

export const seoRoutes: SeoRoute[] = [
  {
    path: "/",
    title: "E-RechnungDigital: XRechnung & ZUGFeRD kostenlos im Browser",
    description:
      "E-Rechnung kostenlos erstellen, öffnen und prüfen – als XRechnung oder ZUGFeRD. Lokal im Browser verarbeitet, Privatsphäre by Design, ohne Konto.",
    type: "website",
    lastmod: DEFAULT_LASTMOD,
    inSitemap: true,
    indexable: true,
    prerender: true,
    jsonLd: [websiteJsonLd(), organizationJsonLd(), softwareApplicationJsonLd()],
  },
  {
    path: "/erstellen",
    title: "E-Rechnung kostenlos erstellen: XRechnung und ZUGFeRD im Browser",
    description:
      "E-Rechnung kostenlos erstellen: Pflichtfelder prüfen und als XRechnung-XML oder ZUGFeRD-PDF herunterladen. Privat im Browser, ohne Konto.",
    type: "website",
    lastmod: DEFAULT_LASTMOD,
    inSitemap: true,
    indexable: true,
    prerender: false,
    staticBody: `
      <main>
        <h1>E-Rechnung kostenlos erstellen</h1>
        <p>XRechnung und ZUGFeRD entstehen in deinem Browser. Pflichtfelder werden geprüft, bevor du die Datei mitnimmst.</p>
        <p><a href="/erstellen">Editor öffnen</a> · <a href="/ratgeber/e-rechnung-erstellen">So funktioniert es</a></p>
      </main>`,
  },
  {
    path: "/oeffnen",
    title: "E-Rechnung öffnen: XRechnung und ZUGFeRD im Browser lesen",
    description:
      "XML- oder ZUGFeRD-Rechnung lokal im Browser öffnen, Felder prüfen und weiterbearbeiten. Privatsphäre by Design, ohne Konto.",
    type: "website",
    lastmod: DEFAULT_LASTMOD,
    inSitemap: true,
    indexable: true,
    prerender: false,
    staticBody: `
      <main>
        <h1>E-Rechnung öffnen</h1>
        <p>XML oder ZUGFeRD-PDF nur in diesem Browser lesen und ins Formular übernehmen.</p>
        <p><a href="/oeffnen">Datei öffnen</a> · <a href="/ratgeber/e-rechnung-oeffnen">Anleitung</a></p>
      </main>`,
  },
  {
    path: "/rechnung",
    title: "Rechnung aus dem Chat",
    description: "E-Rechnung aus dem KI-Assistenten als ZUGFeRD-PDF oder XRechnung-XML laden.",
    type: "website",
    lastmod: DEFAULT_LASTMOD,
    inSitemap: false,
    indexable: false,
    prerender: false,
    staticBody: `
      <main>
        <h1>Rechnung aus dem Chat</h1>
        <p>Die Rechnung wird geladen …</p>
      </main>`,
  },
  {
    path: "/ratgeber",
    title: "Ratgeber zur E-Rechnung",
    description:
      "Verständliche Antworten zu XRechnung, ZUGFeRD, Pflichtangaben, Leitweg-ID und der E-Rechnungspflicht.",
    type: "website",
    lastmod: DEFAULT_LASTMOD,
    inSitemap: true,
    indexable: true,
    prerender: true,
    jsonLd: breadcrumbJsonLd([
      { name: "Start", path: "/" },
      { name: "Ratgeber", path: "/ratgeber" },
    ]),
  },
  {
    path: "/ratgeber/pflicht-2027",
    title: "E-Rechnungspflicht 2027: Fristen und Gesetzeslage",
    description:
      "E-Rechnungspflicht 2027 verständlich erklärt: 800.000-Euro-Umsatzgrenze, Pflicht ab 2028, Empfang seit 2025, Ausnahmen, XRechnung und ZUGFeRD.",
    type: "article",
    lastmod: DEFAULT_LASTMOD,
    inSitemap: true,
    indexable: true,
    prerender: true,
    jsonLd: [
      articleJsonLd({
        headline: "E-Rechnungspflicht 2027: Fristen, Umsatzgrenze und Ausnahmen",
        description:
          "Die deutsche E-Rechnungspflicht 2027 und 2028 verständlich erklärt: 800.000-Euro-Grenze, Empfangspflicht, Ausnahmen, Formate und Aufbewahrung.",
        path: "/ratgeber/pflicht-2027",
        datePublished: DEFAULT_LASTMOD,
        dateModified: DEFAULT_LASTMOD,
      }),
      breadcrumbJsonLd([
        { name: "Start", path: "/" },
        { name: "Ratgeber", path: "/ratgeber" },
        { name: "Pflicht 2027", path: "/ratgeber/pflicht-2027" },
      ]),
      faqPageJsonLd([...pflicht2027Faq]),
    ],
  },
  ...guideRoutes,
  {
    path: "/ki-assistenten",
    title: "E-Rechnung mit KI erstellen: MCP-Server für Claude, ChatGPT und Cursor",
    description:
      "E-Rechnung direkt im KI-Chat erstellen, lesen und prüfen. MCP-Server für Claude, ChatGPT, Cursor und VS Code – lokal, ohne Upload.",
    type: "article",
    lastmod: RULES_UPDATED,
    inSitemap: true,
    indexable: true,
    prerender: true,
    jsonLd: [
      articleJsonLd({
        headline: "E-Rechnung im KI-Chat erstellen",
        description:
          "MCP-Server von E-RechnungDigital für Claude, ChatGPT, Cursor und VS Code einrichten.",
        path: "/ki-assistenten",
        datePublished: RULES_UPDATED,
        dateModified: RULES_UPDATED,
      }),
      breadcrumbJsonLd([
        { name: "Start", path: "/" },
        { name: "KI-Assistenten", path: "/ki-assistenten" },
      ]),
    ],
  },
  {
    path: "/pruefregeln",
    title: "Prüfregeln der E-Rechnung: BR-DE und BR-CO erklärt",
    description:
      "Validierungsfehler der XRechnung und EN 16931 verständlich erklärt: BR-DE-15, BR-CO-10 und weitere Prüfregeln mit Ursache und Lösung.",
    type: "website",
    lastmod: RULES_UPDATED,
    inSitemap: true,
    indexable: true,
    prerender: true,
    jsonLd: breadcrumbJsonLd([
      { name: "Start", path: "/" },
      { name: "Prüfregeln", path: "/pruefregeln" },
    ]),
  },
  ...ruleRoutes,
  {
    path: "/impressum",
    title: "Impressum",
    description: "Impressum und Anbieterkennzeichnung von E-RechnungDigital.",
    type: "website",
    lastmod: DEFAULT_LASTMOD,
    inSitemap: false,
    indexable: true,
    prerender: true,
  },
  {
    path: "/datenschutz",
    title: "Datenschutz",
    description:
      "Datenschutz bei E-RechnungDigital: Rechnungsdaten bleiben im Browser. Was trotzdem anfällt, steht hier.",
    type: "website",
    lastmod: DEFAULT_LASTMOD,
    inSitemap: false,
    indexable: true,
    prerender: true,
  },
  {
    path: "/nutzung",
    title: "Nutzungsbedingungen",
    description: "Kurze Regeln für die Nutzung von E-RechnungDigital.",
    type: "website",
    lastmod: DEFAULT_LASTMOD,
    inSitemap: false,
    indexable: false,
    prerender: true,
  },
];

export function getSeoRoute(path: string): SeoRoute | undefined {
  const normalized = path === "" ? "/" : path;
  return seoRoutes.find((route) => route.path === normalized);
}

export const sitemapRoutes = seoRoutes.filter((route) => route.inSitemap && route.indexable);
