export type InvoiceTypeCode = "380" | "381";

export type TaxCase = "standard19" | "standard7" | "exempt" | "kleinunternehmer" | "reverseCharge";

export type BrandColor = "#1B6B45" | "#1E3A5F" | "#6E4B3A" | "#14241C";

export interface Address {
  street: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface Party {
  name: string;
  address: Address;
  vatId: string;
  taxNumber: string;
  email: string;
  phone: string;
  contactName: string;
  customerNumber: string;
}

export interface LineItem {
  id: string;
  description: string;
  /** Optional text shown under the line title. */
  details: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  taxCase: TaxCase;
  articleNumber: string;
}

export interface Appearance {
  logoDataUrl: string | null;
  brandColor: BrandColor;
}

export interface InvoiceDraft {
  invoiceNumber: string;
  invoiceType: InvoiceTypeCode;
  issueDate: string;
  deliveryDate: string;
  dueDate: string;
  buyerReference: string;
  currency: "EUR";
  paymentTerms: string;
  seller: Party;
  buyer: Party;
  lines: LineItem[];
  iban: string;
  bic: string;
  accountHolder: string;
  appearance: Appearance;
  /** Set when correcting an already-sent invoice */
  precedingInvoiceNumber: string;
  precedingInvoiceDate: string;
}

export interface SellerProfile {
  name: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
  vatId: string;
  taxNumber: string;
  email: string;
  phone: string;
  contactName: string;
  iban: string;
  bic: string;
  accountHolder: string;
  brandColor: BrandColor;
  logoDataUrl: string | null;
}

export const BRAND_COLORS: BrandColor[] = ["#1B6B45", "#1E3A5F", "#6E4B3A", "#14241C"];

export const UNIT_OPTIONS = [
  { value: "HUR", label: "Stunde" },
  { value: "C62", label: "Stück" },
  { value: "DAY", label: "Tag" },
  { value: "MON", label: "Monat" },
  { value: "LS", label: "Pauschale" },
] as const;

export function emptyParty(): Party {
  return {
    name: "",
    address: { street: "", postalCode: "", city: "", country: "DE" },
    vatId: "",
    taxNumber: "",
    email: "",
    phone: "",
    contactName: "",
    customerNumber: "",
  };
}

export function emptyLine(): LineItem {
  return {
    id: crypto.randomUUID(),
    description: "",
    details: "",
    quantity: "1",
    unit: "HUR",
    unitPrice: "",
    taxCase: "standard19",
    articleNumber: "",
  };
}

export function createEmptyDraft(): InvoiceDraft {
  const today = new Date();
  const iso = today.toISOString().slice(0, 10);
  const due = new Date(today);
  due.setDate(due.getDate() + 14);

  return {
    invoiceNumber: "",
    invoiceType: "380",
    issueDate: iso,
    deliveryDate: iso,
    dueDate: due.toISOString().slice(0, 10),
    buyerReference: "",
    currency: "EUR",
    paymentTerms: "14 Tage netto",
    seller: emptyParty(),
    buyer: emptyParty(),
    lines: [emptyLine()],
    iban: "",
    bic: "",
    accountHolder: "",
    appearance: {
      logoDataUrl: null,
      brandColor: "#1B6B45",
    },
    precedingInvoiceNumber: "",
    precedingInvoiceDate: "",
  };
}

export function taxRateForCase(taxCase: TaxCase): number {
  switch (taxCase) {
    case "standard19":
      return 19;
    case "standard7":
      return 7;
    default:
      return 0;
  }
}

export function taxCategoryForCase(taxCase: TaxCase): string {
  switch (taxCase) {
    case "standard19":
    case "standard7":
      return "S";
    // XRechnung needs a rate (BR-DE-14) and category O forbids the tax number (BR-O-02),
    // so small businesses under § 19 UStG use E with 0 %.
    case "exempt":
    case "kleinunternehmer":
      return "E";
    case "reverseCharge":
      return "AE";
  }
}

export function exemptionReasonForCase(taxCase: TaxCase): string | undefined {
  switch (taxCase) {
    case "exempt":
      return "Steuerbefreit";
    case "kleinunternehmer":
      return "Kein Umsatzsteuerausweis gemäß § 19 UStG";
    case "reverseCharge":
      return "Steuerschuldnerschaft des Leistungsempfängers (§ 13b UStG)";
    default:
      return undefined;
  }
}

export function unitLabel(code: string): string {
  return UNIT_OPTIONS.find((u) => u.value === code)?.label ?? code;
}
