import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import {
  generateXml,
  generateZugferd,
  type ZugferdInvoice,
} from "zugferd-ts";
import type { InvoiceDraft } from "./model";
import {
  exemptionReasonForCase,
  taxCategoryForCase,
  taxRateForCase,
  unitLabel,
} from "./model";
import { formatDateDe, formatMoney, formatQuantity, parseMoneyInput, roundMoney, toCiiDate } from "./money";
import { computeTotals } from "./totals";

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255,
  };
}

function countryCode(country: string): string {
  if (country === "Deutschland" || country === "DE") return "DE";
  return country.slice(0, 2).toUpperCase() || "DE";
}

/** Helvetica in PDFs only covers WinAnsi. Euro and dashes are rewritten. */
function pdfText(value: string): string {
  return value
    .replace(/\u20AC/g, "EUR")
    .replace(/\u2013|\u2014/g, "-")
    .replace(/\u00A0/g, " ")
    .replace(/[^\u0020-\u00FF]/g, "")
    .trim();
}

function documentTitle(draft: InvoiceDraft): string {
  return draft.invoiceType === "381" ? "GUTSCHRIFT" : "RECHNUNG";
}

export function toZugferdInvoice(draft: InvoiceDraft): ZugferdInvoice {
  const totals = computeTotals(draft);
  const sellerTax: { id: string; schemeId: string }[] = [];
  if (draft.seller.vatId.trim()) {
    sellerTax.push({ id: draft.seller.vatId.replace(/\s/g, "").toUpperCase(), schemeId: "VA" });
  }
  if (draft.seller.taxNumber.trim()) {
    sellerTax.push({ id: draft.seller.taxNumber.trim(), schemeId: "FC" });
  }

  const buyerTax = draft.buyer.vatId.trim()
    ? [{ id: draft.buyer.vatId.replace(/\s/g, "").toUpperCase(), schemeId: "VA" }]
    : undefined;

  const lines = draft.lines.map((line, index) => {
    const qty = Number(line.quantity.replace(",", ".")) || 0;
    const price = parseMoneyInput(line.unitPrice) ?? 0;
    const lineTotal = roundMoney(qty * price);
    const category = taxCategoryForCase(line.taxCase);
    const rate = taxRateForCase(line.taxCase);
    const reason = exemptionReasonForCase(line.taxCase);
    return {
      lineId: String(index + 1),
      product: {
        name: line.description.trim(),
        description: line.details.trim() || undefined,
        sellerAssignedId: line.articleNumber.trim() || undefined,
      },
      quantity: qty,
      unitCode: line.unit,
      netPrice: price,
      lineTotalAmount: lineTotal,
      taxCategoryCode: category,
      taxRate: rate,
      exemptionReason: reason,
    };
  });

  const invoice: ZugferdInvoice = {
    businessProcessId: "urn:fdc:peppol.eu:2017:poacc:billing:01:1.0",
    invoiceNumber: draft.invoiceNumber.trim(),
    typeCode: draft.invoiceType,
    issueDate: toCiiDate(draft.issueDate),
    currency: draft.currency,
    buyerReference: draft.buyerReference.trim(),
    deliveryDate: toCiiDate(draft.deliveryDate),
    seller: {
      name: draft.seller.name.trim(),
      // Without a VAT id the seller needs another identifier (BR-CO-26).
      id: draft.seller.vatId.trim() ? undefined : draft.seller.taxNumber.trim() || undefined,
      address: {
        lineOne: draft.seller.address.street.trim(),
        postalCode: draft.seller.address.postalCode.trim(),
        city: draft.seller.address.city.trim(),
        countryCode: countryCode(draft.seller.address.country),
      },
      taxRegistrations: sellerTax,
      contact: {
        name: draft.seller.contactName.trim() || undefined,
        phone: draft.seller.phone.trim() || undefined,
        email: draft.seller.email.trim() || undefined,
      },
      electronicAddress: draft.seller.email.trim()
        ? { id: draft.seller.email.trim(), schemeId: "EM" }
        : undefined,
    },
    buyer: {
      name: draft.buyer.name.trim(),
      id: draft.buyer.customerNumber.trim() || undefined,
      address: {
        lineOne: draft.buyer.address.street.trim(),
        postalCode: draft.buyer.address.postalCode.trim(),
        city: draft.buyer.address.city.trim(),
        countryCode: countryCode(draft.buyer.address.country || "DE"),
      },
      taxRegistrations: buyerTax,
      contact: {
        name: draft.buyer.contactName.trim() || undefined,
        email: draft.buyer.email.trim() || undefined,
      },
      // BT-49, mandatory since XRechnung 3.0 (PEPPOL-EN16931-R010)
      electronicAddress: draft.buyer.email.trim()
        ? { id: draft.buyer.email.trim(), schemeId: "EM" }
        : undefined,
    },
    paymentMeans: {
      typeCode: "58",
      information: "SEPA-Überweisung",
      payeeAccount: {
        iban: draft.iban.replace(/\s/g, "").toUpperCase(),
        bic: draft.bic.replace(/\s/g, "").toUpperCase() || undefined,
        accountName: (draft.accountHolder || draft.seller.name).trim() || undefined,
      },
    },
    paymentTerms: [
      {
        description: draft.paymentTerms.trim() || undefined,
        dueDate: draft.dueDate ? toCiiDate(draft.dueDate) : undefined,
      },
    ],
    paymentReference: draft.invoiceNumber.trim(),
    precedingInvoices: draft.precedingInvoiceNumber
      ? [
          {
            reference: draft.precedingInvoiceNumber,
            issueDate: draft.precedingInvoiceDate
              ? toCiiDate(draft.precedingInvoiceDate)
              : undefined,
          },
        ]
      : undefined,
    lines,
    totals: {
      lineTotalAmount: totals.net,
      taxBasisTotalAmount: totals.net,
      taxTotalAmount: totals.vat,
      grandTotalAmount: totals.gross,
      duePayableAmount: totals.gross,
    },
    taxBreakdown: totals.taxBreakdown.map((b) => ({
      basisAmount: b.basis,
      calculatedAmount: b.vat,
      categoryCode: b.category,
      ratePercent: b.rate,
      exemptionReason: b.reason,
    })),
  };

  return invoice;
}

async function buildVisualPdf(draft: InvoiceDraft): Promise<Uint8Array> {
  const totals = computeTotals(draft);
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const brand = hexToRgb(draft.appearance.brandColor);
  const brandColor = rgb(brand.r, brand.g, brand.b);
  const ink = rgb(0.08, 0.14, 0.11);
  const muted = rgb(0.29, 0.36, 0.33);
  const hairline = rgb(0.89, 0.91, 0.89);

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const left = 42;
  const right = pageWidth - 42;
  const bottom = 46;
  const title = documentTitle(draft);

  const pages = [pdf.addPage([pageWidth, pageHeight])];
  let page = pages[0];
  let y = pageHeight - 36;
  let repeatingTable = false;

  const safe = (value: string) => pdfText(value || "") || "—";

  const draw = (
    value: string,
    x: number,
    yPos: number,
    size: number,
    usedFont = font,
    color = ink,
  ) => {
    const text = pdfText(value);
    if (!text) return;
    page.drawText(text, { x, y: yPos, size, font: usedFont, color });
  };

  const drawRight = (
    value: string,
    xRight: number,
    yPos: number,
    size: number,
    usedFont = font,
    color = ink,
  ) => {
    const text = pdfText(value);
    if (!text) return;
    const width = usedFont.widthOfTextAtSize(text, size);
    page.drawText(text, { x: xRight - width, y: yPos, size, font: usedFont, color });
  };

  const wrap = (value: string, size: number, maxWidth: number, usedFont = font): string[] => {
    const words = pdfText(value).split(/\s+/).filter(Boolean);
    if (words.length === 0) return ["—"];
    const lines: string[] = [];
    let current = "";
    const pushLong = (word: string) => {
      let rest = word;
      while (usedFont.widthOfTextAtSize(rest, size) > maxWidth && rest.length > 1) {
        let cut = rest.length - 1;
        while (cut > 1 && usedFont.widthOfTextAtSize(rest.slice(0, cut), size) > maxWidth) cut -= 1;
        lines.push(rest.slice(0, cut));
        rest = rest.slice(cut);
      }
      current = rest;
    };
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (usedFont.widthOfTextAtSize(next, size) <= maxWidth) current = next;
      else {
        if (current) lines.push(current);
        if (usedFont.widthOfTextAtSize(word, size) > maxWidth) pushLong(word);
        else current = word;
      }
    }
    if (current) lines.push(current);
    return lines;
  };

  const lineDetailLines = (line: InvoiceDraft["lines"][number], maxWidth: number) => {
    const lines: string[] = [];
    if (line.articleNumber.trim()) lines.push(...wrap(line.articleNumber.trim(), 8, maxWidth));
    for (const part of line.details.replace(/\r\n/g, "\n").split("\n")) {
      const trimmed = part.trim();
      if (!trimmed) {
        if (lines.length > 0) lines.push("");
        continue;
      }
      lines.push(...wrap(trimmed, 8, maxWidth));
    }
    return lines;
  };

  const paintBar = () => {
    page.drawRectangle({
      x: 0,
      y: pageHeight - 8,
      width: pageWidth,
      height: 8,
      color: brandColor,
    });
  };

  const qtyTexts = draft.lines.map((line) =>
    pdfText(`${formatQuantity(line.quantity || "0")} ${unitLabel(line.unit)}`),
  );
  const priceTexts = draft.lines.map((line) => pdfText(formatMoney(parseMoneyInput(line.unitPrice) ?? 0)));
  const vatTexts = totals.lines.map((line) => pdfText(line.rate ? `${line.rate} %` : "0 %"));
  const amountTexts = totals.lines.map((line) => pdfText(formatMoney(line.net)));
  const textWidth = (value: string, size: number, used = font) =>
    used.widthOfTextAtSize(value || " ", size);
  const columnWidth = (values: string[], header: string, size: number) =>
    Math.max(textWidth(header, 7, fontBold), ...values.map((value) => textWidth(value, size))) + 16;

  const amountCol = columnWidth([...amountTexts, pdfText(formatMoney(totals.gross))], "BETRAG", 9);
  const vatCol = columnWidth(vatTexts, "UST", 8);
  const priceCol = columnWidth(priceTexts, "PREIS", 8);
  const qtyCol = columnWidth(qtyTexts, "MENGE", 8);
  const amountRight = right;
  const vatRight = amountRight - amountCol;
  const priceRight = vatRight - vatCol;
  const qtyRight = priceRight - priceCol;
  const descLeft = left + 28;
  const descWidth = Math.max(120, qtyRight - qtyCol - descLeft);

  const drawTableHeader = () => {
    page.drawLine({
      start: { x: left, y },
      end: { x: right, y },
      thickness: 1,
      color: ink,
    });
    y -= 14;
    draw("POS", left, y, 7, fontBold, muted);
    draw("LEISTUNG", descLeft, y, 7, fontBold, muted);
    drawRight("MENGE", qtyRight, y, 7, fontBold, muted);
    drawRight("PREIS", priceRight, y, 7, fontBold, muted);
    drawRight("UST", vatRight, y, 7, fontBold, muted);
    drawRight("BETRAG", amountRight, y, 7, fontBold, muted);
    y -= 10;
    page.drawLine({
      start: { x: left, y },
      end: { x: right, y },
      thickness: 0.4,
      color: hairline,
    });
    y -= 16;
  };

  const newPage = () => {
    page = pdf.addPage([pageWidth, pageHeight]);
    pages.push(page);
    paintBar();
    y = pageHeight - 40;
    draw(title, left, y, 8, fontBold, brandColor);
    drawRight(draft.invoiceNumber || "Entwurf", right, y, 8, font, muted);
    y -= 22;
    if (repeatingTable) drawTableHeader();
  };

  const ensure = (needed: number) => {
    if (y - needed < bottom) newPage();
  };

  paintBar();

  if (draft.appearance.logoDataUrl?.startsWith("data:image")) {
    try {
      const base64 = draft.appearance.logoDataUrl.split(",")[1] ?? "";
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const isPng = draft.appearance.logoDataUrl.includes("image/png");
      const image = isPng ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
      const dims = image.scale(Math.min(36 / image.height, 120 / image.width));
      page.drawImage(image, {
        x: left,
        y: y - dims.height + 10,
        width: dims.width,
        height: dims.height,
      });
    } catch {
      /* logo optional */
    }
  }

  drawRight(title, right, y + 8, 9, fontBold, brandColor);
  drawRight(draft.invoiceNumber || "Entwurf", right, y - 14, 16, fontBold, ink);

  y -= 46;
  draw(draft.seller.name || "Absender", left, y, 12, fontBold, ink);
  y -= 14;
  draw(
    [draft.seller.address.street, `${draft.seller.address.postalCode} ${draft.seller.address.city}`]
      .filter((part) => pdfText(part))
      .join(" · "),
    left,
    y,
    9,
    font,
    muted,
  );

  y -= 32;
  draw("AUSSTELLER", left, y, 8, fontBold, brandColor);
  draw("EMPFÄNGER", left + 250, y, 8, fontBold, brandColor);

  const sellerLines = [
    draft.seller.name,
    draft.seller.contactName,
    draft.seller.address.street,
    `${draft.seller.address.postalCode} ${draft.seller.address.city}`.trim(),
    draft.seller.vatId ? `USt-IdNr. ${draft.seller.vatId}` : "",
    draft.seller.taxNumber ? `Steuernummer ${draft.seller.taxNumber}` : "",
    draft.seller.email,
    draft.seller.phone,
  ].filter((line) => pdfText(line));

  const buyerLines = [
    draft.buyer.name,
    draft.buyer.contactName,
    draft.buyer.address.street,
    `${draft.buyer.address.postalCode} ${draft.buyer.address.city}`.trim(),
    draft.buyer.vatId ? `USt-IdNr. ${draft.buyer.vatId}` : "",
    draft.buyer.customerNumber ? `Kundennummer ${draft.buyer.customerNumber}` : "",
    draft.buyer.email,
  ].filter((line) => pdfText(line));

  y -= 16;
  const partyRows = Math.max(sellerLines.length, buyerLines.length, 1);
  for (let i = 0; i < partyRows; i++) {
    if (sellerLines[i]) draw(sellerLines[i], left, y - i * 12, 9);
    if (buyerLines[i]) draw(buyerLines[i], left + 250, y - i * 12, 9);
  }
  y -= partyRows * 12 + 28;

  ensure(36);
  page.drawLine({
    start: { x: left, y },
    end: { x: right, y },
    thickness: 0.4,
    color: hairline,
  });
  y -= 18;
  const meta = [
    ["RECHNUNGSDATUM", formatDateDe(draft.issueDate)],
    ["LEISTUNG", formatDateDe(draft.deliveryDate)],
    ["FÄLLIG", formatDateDe(draft.dueDate)],
    ["KÄUFERREFERENZ", draft.buyerReference],
  ];
  const metaW = (right - left) / meta.length;
  meta.forEach(([label, value], i) => {
    const x = left + i * metaW;
    draw(label, x, y, 7, fontBold, muted);
    const metaLines = wrap(value || "—", 9, metaW - 8);
    metaLines.slice(0, 2).forEach((line, lineIndex) => {
      draw(line, x, y - 12 - lineIndex * 11, 9);
    });
  });
  y -= 52;

  repeatingTable = true;
  ensure(28);
  drawTableHeader();

  draft.lines.forEach((line, index) => {
    const lt = totals.lines[index];
    const descLines = wrap(line.description || "—", 9, descWidth);
    const detailLines = lineDetailLines(line, descWidth);
    const rowHeight = 8 + descLines.length * 12 + detailLines.length * 11 + 10;
    ensure(rowHeight);
    const rowTop = y - 4;
    draw(String(index + 1), left, rowTop, 9);
    descLines.forEach((desc, lineIndex) => {
      draw(desc, descLeft, rowTop - lineIndex * 12, 9);
    });
    detailLines.forEach((detail, lineIndex) => {
      draw(detail, descLeft, rowTop - descLines.length * 12 - 2 - lineIndex * 11, 8, font, muted);
    });
    drawRight(formatQuantity(line.quantity || "0") + " " + unitLabel(line.unit), qtyRight, rowTop, 8);
    drawRight(formatMoney(parseMoneyInput(line.unitPrice) ?? 0), priceRight, rowTop, 8);
    drawRight(lt.rate ? `${lt.rate} %` : "0 %", vatRight, rowTop, 8, font, muted);
    drawRight(formatMoney(lt.net), amountRight, rowTop, 9);
    y -= rowHeight;
    page.drawLine({
      start: { x: left, y: y + 4 },
      end: { x: right, y: y + 4 },
      thickness: 0.4,
      color: hairline,
    });
  });

  repeatingTable = false;
  y -= 22;
  const sumBlock = 36 + totals.taxBreakdown.length * 14;
  ensure(sumBlock);

  const drawSum = (label: string, value: string, bold = false) => {
    draw(label, right - 190, y, bold ? 11 : 9, bold ? fontBold : font, bold ? ink : muted);
    drawRight(value, amountRight, y, bold ? 11 : 9, bold ? fontBold : font, ink);
    y -= bold ? 16 : 14;
  };
  drawSum("Netto", formatMoney(totals.net));
  for (const bucket of totals.taxBreakdown) {
    const label = bucket.rate ? `USt ${bucket.rate} %` : `USt ${bucket.category}`;
    drawSum(label, formatMoney(bucket.vat));
  }
  y += 6;
  page.drawLine({
    start: { x: right - 190, y },
    end: { x: right, y },
    thickness: 1,
    color: ink,
  });
  y -= 16;
  drawSum("Brutto", formatMoney(totals.gross), true);

  const reasons = [
    ...new Set(
      totals.taxBreakdown.map((bucket) => bucket.reason).filter((reason): reason is string => !!reason),
    ),
  ];
  if (reasons.length > 0) {
    ensure(12 + reasons.length * 12);
    for (const reason of reasons) {
      const lines = wrap(reason, 8, right - left, font);
      for (const line of lines) {
        ensure(12);
        draw(line, left, y, 8, font, muted);
        y -= 11;
      }
    }
    y -= 6;
  }

  if (draft.precedingInvoiceNumber) {
    ensure(16);
    draw(
      `Berichtigt ${draft.precedingInvoiceNumber}${
        draft.precedingInvoiceDate ? ` vom ${formatDateDe(draft.precedingInvoiceDate)}` : ""
      }`,
      left,
      y,
      8,
      font,
      muted,
    );
    y -= 16;
  }

  ensure(92);
  y -= 18;
  draw("ZAHLUNG", left, y, 8, fontBold, brandColor);
  y -= 14;
  draw(`SEPA-Überweisung · ${safe(draft.paymentTerms)}`, left, y, 9);
  y -= 12;
  draw(`Kontoinhaber ${safe(draft.accountHolder || draft.seller.name)}`, left, y, 9);
  y -= 12;
  draw(`IBAN ${safe(draft.iban)}`, left, y, 9);
  y -= 12;
  draw(
    `BIC ${safe(draft.bic)} · Verwendungszweck ${safe(draft.invoiceNumber)}`,
    left,
    y,
    9,
    font,
    muted,
  );

  pages.forEach((printed, index) => {
    printed.drawText(pdfText(`Seite ${index + 1} von ${pages.length}`), {
      x: left,
      y: 28,
      size: 8,
      font,
      color: muted,
    });
    const footer = pdfText(draft.seller.name);
    if (footer) {
      const width = font.widthOfTextAtSize(footer, 8);
      printed.drawText(footer, {
        x: right - width,
        y: 28,
        size: 8,
        font,
        color: muted,
      });
    }
  });

  pdf.setTitle(`${title} ${pdfText(draft.invoiceNumber)}`.trim());
  pdf.setAuthor(pdfText(draft.seller.name));
  pdf.setCreator("E-RechnungDigital");
  pdf.setProducer("E-RechnungDigital");

  return pdf.save();
}

/** zugferd-ts always writes the Factur-X EXTENDED id. The standalone XML is a XRechnung (BR-DE-21). */
const FACTURX_EXTENDED_ID = "urn:cen.eu:en16931:2017#conformant#urn:factur-x.eu:1p0:extended";
export const XRECHNUNG_ID = "urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0";

export function toXRechnungXml(xml: string): string {
  return xml.replace(`<ram:ID>${FACTURX_EXTENDED_ID}</ram:ID>`, `<ram:ID>${XRECHNUNG_ID}</ram:ID>`);
}

export interface GenerateResult {
  xml: string;
  pdf: Uint8Array;
  fileBase: string;
}

export async function generateInvoiceFiles(draft: InvoiceDraft): Promise<GenerateResult> {
  const zugferd = toZugferdInvoice(draft);
  const visualPdf = await buildVisualPdf(draft);
  const result = await generateZugferd(zugferd, visualPdf);

  if (result.validationErrors.length > 0 || !result.pdfBuffer?.length) {
    let xmlFallback = "";
    try {
      xmlFallback = generateXml(zugferd);
    } catch {
      /* ignore – surface EN 16931 errors instead */
    }
    if (xmlFallback && !result.validationErrors.length) {
      return {
        xml: toXRechnungXml(xmlFallback),
        pdf: visualPdf,
        fileBase: draft.invoiceNumber.replace(/[^\w.-]+/g, "_") || "rechnung",
      };
    }
    throw new Error(
      result.validationErrors.map((e) => `${e.ruleId}: ${e.message}`).join("\n") ||
        "Validierung fehlgeschlagen",
    );
  }

  const fileBase = draft.invoiceNumber.replace(/[^\w.-]+/g, "_") || "rechnung";
  return {
    xml: toXRechnungXml(result.xml || generateXml(zugferd)),
    pdf: result.pdfBuffer,
    fileBase,
  };
}

export { downloadBytes, downloadText } from "./download";
