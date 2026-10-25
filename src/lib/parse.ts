import { PDFDocument } from "pdf-lib";
import type { InvoiceDraft, TaxCase } from "./model";
import { createEmptyDraft } from "./model";
import { formatQuantity } from "./money";

export interface ParseResult {
  draft: InvoiceDraft;
  unknownFields: string[];
  source: "xml" | "pdf";
  warnings: string[];
}

function textContent(el: Element | null): string {
  return el?.textContent?.trim() ?? "";
}

/** Descendants with this local name, ignoring the XML prefix. */
function all(parent: Element | Document, localName: string): Element[] {
  const found: Element[] = [];
  const isDocument = parent.nodeType === 9;
  const start: Element | null = isDocument ? (parent as Document).documentElement : (parent as Element);
  if (!start) return found;
  const walk = (el: Element, includeSelf: boolean) => {
    if (includeSelf && el.localName === localName) found.push(el);
    for (const child of el.children) walk(child, true);
  };
  walk(start, isDocument);
  return found;
}

function first(parent: Element | Document, localName: string): Element | null {
  return all(parent, localName)[0] ?? null;
}

/** Electronic address (BT-34 / BT-49) when it is an e-mail (scheme EM). */
function electronicEmail(party: Element): string {
  for (const el of all(party, "URIUniversalCommunication")) {
    if (el.parentElement !== party) continue;
    const id = first(el, "URIID");
    if (id?.getAttribute("schemeID") === "EM") return textContent(id);
  }
  return "";
}

function ciiToIso(date: string): string {
  if (/^\d{8}$/.test(date)) {
    return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
  }
  return date;
}

function taxCaseFrom(category: string, rate: number, reason: string): TaxCase {
  const cat = category.toUpperCase();
  if (cat === "AE") return "reverseCharge";
  if (/§\s*19|kleinunternehmer/i.test(reason)) return "kleinunternehmer";
  if (cat === "E" || cat === "Z" || cat === "O" || cat === "K" || cat === "G") return "exempt";
  if (rate === 7) return "standard7";
  return "standard19";
}

/** Unit prices keep up to four decimals. EN 16931 allows that precision. */
function formatUnitPrice(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value);
}

export function parseCiiXml(xml: string): ParseResult {
  const parser = new DOMParser();
  // Some Factur-X files quote the XML declaration with single quotes.
  const normalized = xml.replace(/<\?xml[^?]*\?>/, (declaration) => declaration.replaceAll("'", '"'));
  const doc = parser.parseFromString(normalized, "application/xml");
  if (doc.querySelector("parsererror")) {
    throw new Error("Die XML-Datei ist ungültig.");
  }
  if (!first(doc, "CrossIndustryInvoice")) {
    throw new Error(
      "Kein CII-XML. Unterstützt werden XRechnung als CII, ZUGFeRD und Factur-X.",
    );
  }

  const draft = createEmptyDraft();
  const unknownFields: string[] = [];
  const warnings: string[] = [];

  const exchanged = first(doc, "ExchangedDocument");
  draft.invoiceNumber = textContent(first(exchanged ?? doc, "ID"));

  const typeCode = first(exchanged ?? doc, "TypeCode");
  if (textContent(typeCode) === "381") draft.invoiceType = "381";

  const issueDate = first(exchanged ?? doc, "IssueDateTime");
  const issueRaw = textContent(first(issueDate ?? doc, "DateTimeString")).replace(/\D/g, "").slice(0, 8);
  if (issueRaw) draft.issueDate = ciiToIso(issueRaw);

  const buyerRef = first(doc, "BuyerReference");
  draft.buyerReference = textContent(buyerRef);

  const occurrence = first(doc, "OccurrenceDateTime");
  const deliveryRaw = textContent(first(occurrence ?? doc, "DateTimeString"));
  if (deliveryRaw) draft.deliveryDate = ciiToIso(deliveryRaw.replace(/\D/g, "").slice(0, 8));

  const due = first(doc, "DueDateDateTime");
  const dueRaw = textContent(first(due ?? doc, "DateTimeString"));
  if (dueRaw) draft.dueDate = ciiToIso(dueRaw.replace(/\D/g, "").slice(0, 8));

  const paymentTerms = first(doc, "SpecifiedTradePaymentTerms");
  if (paymentTerms) {
    draft.paymentTerms = textContent(first(paymentTerms, "Description"));
  }

  const sellerTrade = first(doc, "SellerTradeParty");
  if (sellerTrade) {
    draft.seller.name = textContent(first(sellerTrade, "Name"));
    const addr = first(sellerTrade, "PostalTradeAddress");
    if (addr) {
      draft.seller.address.street = textContent(first(addr, "LineOne"));
      draft.seller.address.postalCode = textContent(first(addr, "PostcodeCode"));
      draft.seller.address.city = textContent(first(addr, "CityName"));
      draft.seller.address.country = textContent(first(addr, "CountryID")) || "DE";
    }
    for (const tax of all(sellerTrade, "SpecifiedTaxRegistration")) {
      const id = textContent(first(tax, "ID"));
      const scheme = first(tax, "ID")?.getAttribute("schemeID") ?? "";
      if (scheme === "VA") draft.seller.vatId = id;
      else if (scheme === "FC") draft.seller.taxNumber = id;
      else if (id.startsWith("DE")) draft.seller.vatId = id;
      else draft.seller.taxNumber = id;
    }
    const contact = first(sellerTrade, "DefinedTradeContact");
    if (contact) {
      draft.seller.contactName = textContent(first(contact, "PersonName"));
      draft.seller.email = textContent(first(contact, "URIID")) || textContent(first(contact, "EmailURI"));
      draft.seller.phone = textContent(first(contact, "CompleteNumber"));
    }
    draft.seller.email ||= electronicEmail(sellerTrade);
  }

  const buyerTrade = first(doc, "BuyerTradeParty");
  if (buyerTrade) {
    draft.buyer.name = textContent(first(buyerTrade, "Name"));
    draft.buyer.customerNumber = textContent(first(buyerTrade, "ID"));
    const addr = first(buyerTrade, "PostalTradeAddress");
    if (addr) {
      draft.buyer.address.street = textContent(first(addr, "LineOne"));
      draft.buyer.address.postalCode = textContent(first(addr, "PostcodeCode"));
      draft.buyer.address.city = textContent(first(addr, "CityName"));
      draft.buyer.address.country = textContent(first(addr, "CountryID")) || "DE";
    }
    for (const tax of all(buyerTrade, "SpecifiedTaxRegistration")) {
      const id = textContent(first(tax, "ID"));
      if (id) draft.buyer.vatId = id;
    }
    const buyerContact = first(buyerTrade, "DefinedTradeContact");
    if (buyerContact) {
      draft.buyer.contactName = textContent(first(buyerContact, "PersonName"));
      draft.buyer.email = textContent(first(buyerContact, "URIID"));
    }
    draft.buyer.email ||= electronicEmail(buyerTrade);
  }

  const iban = first(doc, "IBANID");
  draft.iban = textContent(iban);
  const bic = first(doc, "BICID");
  draft.bic = textContent(bic);
  const accountName = first(doc, "AccountName");
  draft.accountHolder = textContent(accountName);

  const lineNodes = all(doc, "IncludedSupplyChainTradeLineItem");
  if (lineNodes.length > 0) {
    draft.lines = lineNodes.map((node) => {
      const name = textContent(first(node, "Name")) || textContent(first(node, "SellerAssignedID"));
      const qty = textContent(first(node, "BilledQuantity")) || "1";
      const unit = first(node, "BilledQuantity")?.getAttribute("unitCode") || "C62";
      const netPrice = first(node, "NetPriceProductTradePrice");
      const price = netPrice
        ? textContent(first(netPrice, "ChargeAmount"))
        : textContent(first(node, "ChargeAmount"));
      const category = textContent(first(node, "CategoryCode")) || "S";
      const rate = Number(textContent(first(node, "RateApplicablePercent")) || "19");
      const reason = textContent(first(node, "ExemptionReason"));
      const priceNum = Number(price.replace(",", ".")) || 0;
      return {
        id: crypto.randomUUID(),
        description: name,
        details: textContent(first(first(node, "SpecifiedTradeProduct") ?? node, "Description")),
        quantity: formatQuantity(qty),
        unit,
        unitPrice: formatUnitPrice(priceNum),
        taxCase: taxCaseFrom(category, rate, reason),
        articleNumber: textContent(first(node, "SellerAssignedID")),
      };
    });
  }

  const preceding = first(doc, "InvoiceReferencedDocument");
  if (preceding) {
    draft.precedingInvoiceNumber = textContent(first(preceding, "IssuerAssignedID"));
    const pDate = textContent(first(preceding, "DateTimeString"));
    if (pDate) draft.precedingInvoiceDate = ciiToIso(pDate.replace(/\D/g, "").slice(0, 8));
  }

  if (all(doc, "AdditionalReferencedDocument").length) {
    unknownFields.push("Zusätzliche Referenzen / Anhänge");
  }
  if (all(doc, "SpecifiedTradeAllowanceCharge").length) {
    unknownFields.push("Nachlässe oder Zuschläge auf Belegebene");
  }

  if (!draft.invoiceNumber) warnings.push("Keine Rechnungsnummer gefunden.");
  if (!draft.seller.name) warnings.push("Absender unvollständig.");

  return { draft, unknownFields, source: "xml", warnings };
}

function ciiBounds(raw: string): [number, number] | null {
  const start = raw.indexOf("CrossIndustryInvoice");
  if (start === -1) return null;
  const xmlStart = raw.lastIndexOf("<?xml", start);
  let begin = xmlStart;
  if (begin === -1) {
    begin = start;
    while (begin > 0 && raw[begin] !== "<") begin--;
  }
  const endTag = "</rsm:CrossIndustryInvoice>";
  const end = raw.indexOf(endTag, begin);
  if (end !== -1) return [begin, end + endTag.length];
  const alt = "</CrossIndustryInvoice>";
  const altAt = raw.indexOf(alt, begin);
  if (altAt === -1) return null;
  return [begin, altAt + alt.length];
}

function sliceCiiText(raw: string): string | null {
  const bounds = ciiBounds(raw);
  return bounds ? raw.slice(bounds[0], bounds[1]) : null;
}

/** PDF FlateDecode streams. Offsets match the latin1 view of the file. */
function pdfStreams(bytes: Uint8Array): Uint8Array[] {
  const raw = new TextDecoder("latin1").decode(bytes);
  const chunks: Uint8Array[] = [];
  let idx = 0;
  while (idx < raw.length) {
    const at = raw.indexOf("stream", idx);
    if (at === -1) break;
    const boundary = at === 0 || /[\s>]/.test(raw[at - 1] ?? "");
    let p = at + "stream".length;
    if (!boundary) {
      idx = p;
      continue;
    }
    if (raw.startsWith("\r\n", p)) p += 2;
    else if (raw[p] === "\n" || raw[p] === "\r") p += 1;
    else {
      idx = p;
      continue;
    }
    const end = raw.indexOf("endstream", p);
    if (end === -1) break;
    const header = raw.slice(Math.max(0, at - 600), at);
    const matches = [...header.matchAll(/\/Length\s+(\d+)(?:\s+(\d+)\s+R)?/g)];
    const last = matches.at(-1);
    const indirect = Boolean(last?.[2]);
    const length = last && !indirect ? Number(last[1]) : end - p;
    chunks.push(bytes.slice(p, Math.min(bytes.length, p + length)));
    idx = end + "endstream".length;
  }
  return chunks;
}

async function inflateStream(chunk: Uint8Array): Promise<string | null> {
  try {
    const stream = new Blob([chunk as BlobPart]).stream().pipeThrough(new DecompressionStream("deflate"));
    const inflated = new Uint8Array(await new Response(stream).arrayBuffer());
    return new TextDecoder("utf-8").decode(inflated);
  } catch {
    return null;
  }
}

async function extractXmlFromPdf(bytes: Uint8Array): Promise<string | null> {
  await PDFDocument.load(bytes, { ignoreEncryption: true });

  for (const chunk of pdfStreams(bytes)) {
    const inflated = await inflateStream(chunk);
    const xml = inflated ? sliceCiiText(inflated) : null;
    if (xml) return xml;
  }

  const raw = new TextDecoder("latin1").decode(bytes);
  const bounds = ciiBounds(raw);
  if (!bounds) return null;
  return new TextDecoder("utf-8").decode(bytes.slice(bounds[0], bounds[1]));
}

export async function parseInvoiceFile(file: File): Promise<ParseResult> {
  const buffer = new Uint8Array(await file.arrayBuffer());
  const name = file.name.toLowerCase();

  if (name.endsWith(".xml") || file.type.includes("xml")) {
    const text = new TextDecoder("utf-8").decode(buffer);
    return parseCiiXml(text);
  }

  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    const xml = await extractXmlFromPdf(buffer);
    if (!xml) {
      throw new Error("In der PDF steckt kein erkennbares ZUGFeRD- oder Factur-X-XML.");
    }
    const result = parseCiiXml(xml);
    return { ...result, source: "pdf" };
  }

  throw new Error("Bitte eine XML- oder PDF-Datei wählen.");
}

export { applyEditMode } from "./editMode";
