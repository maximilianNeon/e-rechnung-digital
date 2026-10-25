// Tells Bing, Yandex & Co. via IndexNow about every URL in the live sitemap.
// Run after a production deploy: node scripts/indexnow.mjs
const ORIGIN = "https://www.erechnungdigital.com";
const KEY = "95b5b83dd32363bd4cd1a3ee2a5926b9";

const sitemap = await fetch(`${ORIGIN}/sitemap.xml`).then((res) => {
  if (!res.ok) throw new Error(`sitemap.xml: HTTP ${res.status}`);
  return res.text();
});
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (urlList.length === 0) throw new Error("sitemap.xml enthält keine URLs");

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: new URL(ORIGIN).host,
    key: KEY,
    keyLocation: `${ORIGIN}/${KEY}.txt`,
    urlList,
  }),
});

// 200 = angenommen, 202 = angenommen, Schlüssel wird noch geprüft
if (res.status !== 200 && res.status !== 202) {
  throw new Error(`IndexNow: HTTP ${res.status} ${await res.text()}`);
}
console.log(`IndexNow: ${urlList.length} URLs gemeldet (HTTP ${res.status}).`);
