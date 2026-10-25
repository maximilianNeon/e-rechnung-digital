import type { InvoiceDraft } from "./model";

/**
 * Packs a draft into the URL fragment of /rechnung. Browsers never send the
 * fragment to a server, so the hosted MCP endpoint can hand out a link
 * without storing the invoice anywhere.
 */
const PREFIX = "v1.";

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
  return Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const out = new Blob([bytes as BlobPart]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(out).arrayBuffer());
}

export async function encodeDraft(draft: InvoiceDraft): Promise<string> {
  // The logo would blow up the link; the hosted tool never sets one anyway.
  const slim = { ...draft, appearance: { ...draft.appearance, logoDataUrl: null } };
  const json = new TextEncoder().encode(JSON.stringify(slim));
  return PREFIX + toBase64Url(await pipe(json, new CompressionStream("deflate-raw")));
}

export async function decodeDraft(fragment: string): Promise<InvoiceDraft> {
  const value = fragment.replace(/^#/, "");
  if (!value.startsWith(PREFIX)) throw new Error("Unbekanntes Linkformat.");
  const json = await pipe(fromBase64Url(value.slice(PREFIX.length)), new DecompressionStream("deflate-raw"));
  return JSON.parse(new TextDecoder().decode(json)) as InvoiceDraft;
}
