import type { InvoiceDraft } from "./model";
import { parseMoneyInput } from "./money";

export type FieldStatus = "empty" | "valid" | "invalid";

export interface FieldResult {
  status: FieldStatus;
  message?: string;
}

function digitsOnly(value: string): string {
  return value.replace(/\s+/g, "").toUpperCase();
}

/** ISO 7064 Mod 97-10 used by IBAN and Leitweg-ID. */
function mod97(value: string): number {
  let remainder = 0;
  for (const ch of value) {
    remainder = (remainder * 10 + Number(ch)) % 97;
  }
  return remainder;
}

function expandAlpha(raw: string): string {
  let out = "";
  for (const ch of raw) {
    if (ch >= "A" && ch <= "Z") {
      out += String(ch.charCodeAt(0) - 55);
    } else {
      out += ch;
    }
  }
  return out;
}

export function validateIban(raw: string): FieldResult {
  const iban = digitsOnly(raw);
  if (!iban) return { status: "empty" };
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(iban)) {
    return { status: "invalid", message: "IBAN beginnt mit Ländercode und Prüfziffer." };
  }
  if (iban.startsWith("DE") && iban.length !== 22) {
    return {
      status: "invalid",
      message: "Prüfziffer stimmt nicht. Eine deutsche IBAN hat 22 Zeichen.",
    };
  }
  if (iban.length < 15 || iban.length > 34) {
    return { status: "invalid", message: "IBAN hat die falsche Länge." };
  }
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const numeric = expandAlpha(rearranged);
  if (mod97(numeric) !== 1) {
    return {
      status: "invalid",
      message: "Prüfziffer stimmt nicht. Eine deutsche IBAN hat 22 Zeichen.",
    };
  }
  return { status: "valid" };
}

export function validateBic(raw: string): FieldResult {
  const bic = digitsOnly(raw);
  if (!bic) return { status: "empty" };
  if (!/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(bic)) {
    return { status: "invalid", message: "BIC hat 8 oder 11 Zeichen." };
  }
  return { status: "valid" };
}

export function validateVatId(raw: string): FieldResult {
  const vat = digitsOnly(raw);
  if (!vat) return { status: "empty" };
  if (!/^DE\d{9}$/.test(vat)) {
    return { status: "invalid", message: "Deutsche USt-IdNr.: DE und neun Ziffern." };
  }
  return { status: "valid" };
}

export function validateEmail(raw: string): FieldResult {
  const email = raw.trim();
  if (!email) return { status: "empty" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "invalid", message: "Das sieht nicht nach einer E-Mail aus." };
  }
  return { status: "valid" };
}

export function validatePostalCode(raw: string, country: string): FieldResult {
  const plz = raw.trim();
  if (!plz) return { status: "empty" };
  if ((country === "DE" || country === "Deutschland") && !/^\d{5}$/.test(plz)) {
    return { status: "invalid", message: "Deutsche PLZ hat fünf Ziffern." };
  }
  return { status: "valid" };
}

export function validateDate(raw: string): FieldResult {
  if (!raw) return { status: "empty" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return { status: "invalid", message: "Datum im Format TT.MM.JJJJ." };
  }
  const d = new Date(`${raw}T00:00:00`);
  if (Number.isNaN(d.getTime())) {
    return { status: "invalid", message: "Das ist kein gültiges Datum." };
  }
  return { status: "valid" };
}

export function validateDueDate(due: string, issue: string): FieldResult {
  const base = validateDate(due);
  if (base.status !== "valid") return base;
  if (issue && due < issue) {
    return { status: "invalid", message: "Fälligkeit liegt vor dem Rechnungsdatum." };
  }
  return { status: "valid" };
}

export function validateQuantity(raw: string): FieldResult {
  if (!raw.trim()) return { status: "empty" };
  const n = Number(raw.replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) {
    return { status: "invalid", message: "Menge muss größer als null sein." };
  }
  return { status: "valid" };
}

/** Leitweg-ID: letters/digits with optional hyphens, Mod-97 check digit. */
export function validateLeitwegId(raw: string): FieldResult {
  const value = raw.trim().toUpperCase();
  if (!value) return { status: "empty" };
  if (!/^[0-9A-Z]+(-[0-9A-Z]+)*-\d{2}$/.test(value) && !/^[0-9A-Z]{2,}$/.test(value)) {
    return { status: "invalid", message: "Leitweg-ID hat ein ungültiges Muster." };
  }
  const compact = value.replace(/-/g, "");
  if (compact.length < 3) {
    return { status: "invalid", message: "Leitweg-ID ist zu kurz." };
  }
  const numeric = expandAlpha(compact);
  if (!/^\d+$/.test(numeric) || mod97(numeric) !== 1) {
    return { status: "invalid", message: "Prüfziffer der Leitweg-ID stimmt nicht." };
  }
  return { status: "valid" };
}

export function validateRequired(raw: string): FieldResult {
  return raw.trim() ? { status: "valid" } : { status: "empty" };
}

export function validateMoney(raw: string): FieldResult {
  if (!raw.trim()) return { status: "empty" };
  const n = parseMoneyInput(raw);
  if (n === null || n < 0) {
    return { status: "invalid", message: "Betrag ist ungültig." };
  }
  return { status: "valid" };
}

export interface ExportBlocker {
  field: string;
  label: string;
}

export function getExportBlockers(draft: InvoiceDraft): ExportBlocker[] {
  const blockers: ExportBlocker[] = [];
  const push = (field: string, label: string, ok: boolean) => {
    if (!ok) blockers.push({ field, label });
  };

  push("invoiceNumber", "die Rechnungsnummer", !!draft.invoiceNumber.trim());
  push("issueDate", "das Rechnungsdatum", validateDate(draft.issueDate).status === "valid");
  push("deliveryDate", "das Leistungsdatum", validateDate(draft.deliveryDate).status === "valid");
  push("buyerReference", "die Käuferreferenz", !!draft.buyerReference.trim());

  const seller = draft.seller;
  push("seller.name", "den Absendernamen", !!seller.name.trim());
  push("seller.street", "die Absenderstraße", !!seller.address.street.trim());
  push(
    "seller.postalCode",
    "die Absender-PLZ",
    validatePostalCode(seller.address.postalCode, seller.address.country).status === "valid",
  );
  push("seller.city", "den Absenderort", !!seller.address.city.trim());
  push("seller.country", "das Absenderland", !!seller.address.country.trim());
  push("seller.email", "die Absender-E-Mail", validateEmail(seller.email).status === "valid");
  const sellerTaxOk =
    validateVatId(seller.vatId).status === "valid" || !!seller.taxNumber.trim();
  push("seller.vatId", "USt-IdNr. oder Steuernummer", sellerTaxOk);
  push("seller.taxNumber", "USt-IdNr. oder Steuernummer", sellerTaxOk);

  const buyer = draft.buyer;
  push("buyer.name", "den Empfängernamen", !!buyer.name.trim());
  push("buyer.street", "die Empfängerstraße", !!buyer.address.street.trim());
  push(
    "buyer.postalCode",
    "die Empfänger-PLZ",
    validatePostalCode(buyer.address.postalCode, buyer.address.country).status === "valid",
  );
  push("buyer.city", "den Empfängerort", !!buyer.address.city.trim());

  if (draft.lines.length === 0) {
    push("lines", "mindestens eine Position", false);
  } else {
    draft.lines.forEach((line, index) => {
      const n = index + 1;
      push(
        `line.${line.id}.description`,
        `Bezeichnung Position ${n}`,
        validateRequired(line.description).status === "valid",
      );
      push(
        `line.${line.id}.quantity`,
        `Menge Position ${n}`,
        validateQuantity(line.quantity).status === "valid",
      );
      push(
        `line.${line.id}.unit`,
        `Einheit Position ${n}`,
        validateRequired(line.unit).status === "valid",
      );
      push(
        `line.${line.id}.unitPrice`,
        `Einzelpreis Position ${n}`,
        validateMoney(line.unitPrice).status === "valid",
      );
    });
  }

  const iban = validateIban(draft.iban);
  push("iban", "die IBAN", iban.status === "valid");

  const hasDue = validateDueDate(draft.dueDate, draft.issueDate).status === "valid";
  const hasTerms = !!draft.paymentTerms.trim();
  const paymentOk = hasDue || hasTerms;
  push("dueDate", "Fälligkeit oder Zahlungsbedingungen", paymentOk);
  push("paymentTerms", "Fälligkeit oder Zahlungsbedingungen", paymentOk);

  if (draft.bic.trim() && validateBic(draft.bic).status === "invalid") {
    blockers.push({ field: "bic", label: "den BIC" });
  }

  if (draft.buyerReference.includes("-") && /^\d/.test(draft.buyerReference.trim())) {
    const lw = validateLeitwegId(draft.buyerReference);
    if (lw.status === "invalid") {
      blockers.push({ field: "buyerReference", label: "die Leitweg-ID" });
    }
  }

  // Deduplicate paired tax/payment blockers for the status count.
  const seen = new Set<string>();
  return blockers.filter((b) => {
    const key =
      b.field === "seller.taxNumber"
        ? "seller.vatId"
        : b.field === "paymentTerms"
          ? "dueDate"
          : b.field;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** All field ids that should light up red when export is blocked. */
export function getMissingFieldIds(draft: InvoiceDraft): Set<string> {
  const ids = new Set<string>();
  const push = (field: string, ok: boolean) => {
    if (!ok) ids.add(field);
  };

  push("invoiceNumber", !!draft.invoiceNumber.trim());
  push("issueDate", validateDate(draft.issueDate).status === "valid");
  push("deliveryDate", validateDate(draft.deliveryDate).status === "valid");
  push("buyerReference", !!draft.buyerReference.trim());
  push("seller.name", !!draft.seller.name.trim());
  push("seller.street", !!draft.seller.address.street.trim());
  push(
    "seller.postalCode",
    validatePostalCode(draft.seller.address.postalCode, draft.seller.address.country).status ===
      "valid",
  );
  push("seller.city", !!draft.seller.address.city.trim());
  push("seller.country", !!draft.seller.address.country.trim());
  push("seller.email", validateEmail(draft.seller.email).status === "valid");
  const sellerTaxOk =
    validateVatId(draft.seller.vatId).status === "valid" || !!draft.seller.taxNumber.trim();
  if (!sellerTaxOk) {
    ids.add("seller.vatId");
    ids.add("seller.taxNumber");
  }
  push("buyer.name", !!draft.buyer.name.trim());
  push("buyer.street", !!draft.buyer.address.street.trim());
  push(
    "buyer.postalCode",
    validatePostalCode(draft.buyer.address.postalCode, draft.buyer.address.country || "DE")
      .status === "valid",
  );
  push("buyer.city", !!draft.buyer.address.city.trim());

  for (const line of draft.lines) {
    push(`line.${line.id}.description`, validateRequired(line.description).status === "valid");
    push(`line.${line.id}.quantity`, validateQuantity(line.quantity).status === "valid");
    push(`line.${line.id}.unit`, validateRequired(line.unit).status === "valid");
    push(`line.${line.id}.unitPrice`, validateMoney(line.unitPrice).status === "valid");
  }

  push("iban", validateIban(draft.iban).status === "valid");
  const paymentOk =
    validateDueDate(draft.dueDate, draft.issueDate).status === "valid" ||
    !!draft.paymentTerms.trim();
  if (!paymentOk) {
    ids.add("dueDate");
    ids.add("paymentTerms");
  }
  if (draft.bic.trim() && validateBic(draft.bic).status === "invalid") ids.add("bic");

  return ids;
}

export function sectionForField(field: string): string {
  if (field.startsWith("seller.")) return "seller";
  if (field.startsWith("buyer.")) return "buyer";
  if (field.startsWith("line.") || field === "lines") return "lines";
  if (
    field === "iban" ||
    field === "bic" ||
    field === "paymentTerms" ||
    field === "dueDate" ||
    field === "payment"
  ) {
    return "payment";
  }
  return "invoice";
}

export function canExport(draft: InvoiceDraft): boolean {
  return getExportBlockers(draft).length === 0;
}
