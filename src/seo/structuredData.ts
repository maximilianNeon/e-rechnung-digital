import { absoluteUrl, SITE_NAME, SITE_ORIGIN } from "./site";

const ORGANIZATION_ID = `${SITE_ORIGIN}/#organization`;
const WEBSITE_ID = `${SITE_ORIGIN}/#website`;

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    alternateName: "E-Rechnung Digital",
    url: `${SITE_ORIGIN}/`,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/icon-512.png"),
      width: 512,
      height: 512,
    },
    image: absoluteUrl("/og-image.png"),
    email: "info@erechnungdigital.com",
    parentOrganization: {
      "@type": "Organization",
      name: "NEON Software Solutions GmbH",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Brunnenstraße 195",
        postalCode: "10119",
        addressLocality: "Berlin",
        addressCountry: "DE",
      },
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    alternateName: "E-Rechnung Digital",
    url: `${SITE_ORIGIN}/`,
    inLanguage: "de-DE",
    publisher: { "@id": ORGANIZATION_ID },
  };
}

export function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    url: `${SITE_ORIGIN}/`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript",
    inLanguage: "de-DE",
    image: absoluteUrl("/og-image.png"),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
    },
    featureList: [
      "XRechnung 3.0.2 als XML erstellen",
      "ZUGFeRD 2.5.2 als PDF mit eingebettetem XML",
      "E-Rechnungen öffnen und weiterbearbeiten",
      "Pflichtfelder, IBAN und USt-IdNr. direkt prüfen",
      "Lokale Verarbeitung im Browser, ohne Konto",
    ],
    publisher: { "@id": ORGANIZATION_ID },
    description:
      "E-Rechnungen als XRechnung oder ZUGFeRD im Browser erstellen, öffnen und prüfen. Privatsphäre by Design: lokal verarbeitet, ohne Konto.",
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function articleJsonLd(input: {
  headline: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.headline,
    description: input.description,
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    inLanguage: "de-DE",
    mainEntityOfPage: absoluteUrl(input.path),
    image: absoluteUrl("/og-image.png"),
    author: { "@type": "Organization", name: SITE_NAME, url: `${SITE_ORIGIN}/` },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: absoluteUrl("/icon-512.png") },
    },
  };
}

export function faqPageJsonLd(faq: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
