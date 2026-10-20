import { PDFDocument } from "pdf-lib";
import type { InvoiceDraft, TaxCase } from "./model";
import { createEmptyDraft } from "./model";
import { formatMoney, formatQuantity } from "./money";

export interface ParseResult {
  draft: InvoiceDraft;
  unknownFields: string[];
  source: "xml" | "pdf";
  warnings: string[];
}

function textContent(el: Element | null): string {
  return el?.textContent?.trim() ?? "";
}

function first(parent: Element | Document, localName: string): Element | null {
  const nodes = parent.getElementsByTagNameNS("*", localName);
  return nodes.item(0);
}

function all(parent: Element | Document, localName: string): Element[] {
  return [...parent.getElementsByTagNameNS("*", localName)];
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
  if (cat === "O" || /§\s*19|kleinunternehmer/i.test(reason)) return "kleinunternehmer";
  if (cat === "E" || cat === "Z") return "exempt";
  if (rate === 7) return "standard7";
  return "standard19";
}

export function parseCiiXml(xml: string): ParseResult {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "application/xml");
  if (doc.querySelector("parsererror")) {
    throw new Error("Die XML-Datei ist ungültig.");
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

  const paymentTerms = first(doc, "Description");
  if (paymentTerms && paymentTerms.closest("SpecifiedTradePaymentTerms")) {
    draft.paymentTerms = textContent(paymentTerms);
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
      const price = textContent(first(node, "ChargeAmount")) || textContent(first(node, "NetPriceProductTradePrice"));
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
        unitPrice: formatMoney(priceNum, false),
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

async function extractXmlFromPdf(bytes: Uint8Array): Promise<string | null> {
  // Ensure the file is a readable PDF before scanning attachment streams.
  await PDFDocument.load(bytes, { ignoreEncryption: true });
  const raw = new TextDecoder("latin1").decode(bytes);
  const markers = [
    "factur-x.xml",
    "zugferd-invoice.xml",
    "xrechnung.xml",
    "ZUGFeRD-invoice.xml",
  ];
  for (const marker of markers) {
    const idx = raw.toLowerCase().indexOf(marker.toLowerCase());
    if (idx === -1) continue;
  }

  // Search for CrossIndustryInvoice root in stream
  const start = raw.indexOf("CrossIndustryInvoice");
  if (start === -1) return null;
  // Walk backwards to <?xml or <rsm:
  let from = start;
  while (from > 0 && raw[from] !== "<") from--;
  const xmlStart = raw.lastIndexOf("<?xml", start);
  const begin = xmlStart !== -1 ? xmlStart : from;
  const endTag = "</rsm:CrossIndustryInvoice>";
  const end = raw.indexOf(endTag, begin);
  if (end === -1) {
    const alt = raw.indexOf("</CrossIndustryInvoice>", begin);
    if (alt === -1) return null;
    return raw.slice(begin, alt + "</CrossIndustryInvoice>".length);
  }
  return raw.slice(begin, end + endTag.length);
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
