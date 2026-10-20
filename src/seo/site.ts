export const SITE_ORIGIN = "https://www.erechnungdigital.com";
export const SITE_NAME = "E-RechnungDigital";
export const OG_IMAGE_PATH = "/og-image.png";
export const DEFAULT_LASTMOD = "2026-10-20";

export function absoluteUrl(path: string): string {
  if (path === "/") return `${SITE_ORIGIN}/`;
  return `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageTitle(title: string): string {
  return title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
}
