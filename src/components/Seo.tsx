import { useEffect } from "react";
import { getSeoRoute } from "../seo/routes";
import { absoluteUrl, OG_IMAGE_PATH, pageTitle, SITE_NAME, SITE_ORIGIN } from "../seo/site";

interface SeoProps {
  path: string;
  title?: string;
  description?: string;
  type?: "website" | "article";
  indexable?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

function setMeta(property: string, content: string, isProperty = false) {
  const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`;
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(isProperty ? "property" : "name", property);
    document.head.appendChild(element);
  }
  element.content = content;
}

export function Seo({ path, title, description, type, indexable, jsonLd }: SeoProps) {
  useEffect(() => {
    const route = getSeoRoute(path);
    const resolvedTitle = title ?? route?.title ?? SITE_NAME;
    const resolvedDescription = description ?? route?.description ?? "";
    const resolvedType = type ?? route?.type ?? "website";
    const resolvedIndexable = indexable ?? route?.indexable ?? true;
    const resolvedJsonLd = jsonLd ?? route?.jsonLd;
    const fullTitle = pageTitle(resolvedTitle);
    const canonical = absoluteUrl(path);
    const image = absoluteUrl(OG_IMAGE_PATH);

    document.title = fullTitle;
    setMeta("description", resolvedDescription);
    setMeta("robots", resolvedIndexable ? "index, follow" : "noindex, follow");
    setMeta("og:title", fullTitle, true);
    setMeta("og:description", resolvedDescription, true);
    setMeta("og:type", resolvedType, true);
    setMeta("og:url", canonical, true);
    setMeta("og:image", image, true);
    setMeta("og:locale", "de_DE", true);
    setMeta("og:site_name", SITE_NAME, true);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", resolvedDescription);
    setMeta("twitter:image", image);

    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = path === "/404" ? SITE_ORIGIN : canonical;

    const scriptId = "page-json-ld";
    document.getElementById(scriptId)?.remove();
    if (resolvedJsonLd) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      script.text = JSON.stringify(resolvedJsonLd);
      document.head.appendChild(script);
    }

    return () => {
      document.getElementById(scriptId)?.remove();
    };
  }, [path, title, description, type, indexable, jsonLd]);

  return null;
}
