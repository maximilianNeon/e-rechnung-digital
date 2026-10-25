import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { z } from "zod";
import type { InvoiceDraft, TaxCase } from "../../src/lib/model.ts";
import { createEmptyDraft, emptyParty } from "../../src/lib/model.ts";

export const DATA_DIR = process.env.ERECHNUNG_HOME ?? join(homedir(), ".erechnung-digital");
export const PROFILE_FILE = join(DATA_DIR, "profile.json");
export const DEFAULT_OUTPUT_DIR =
  process.env.ERECHNUNG_OUTPUT_DIR ?? join(homedir(), "E-Rechnungen");

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Datum als JJJJ-MM-TT")
  .describe("Datum als JJJJ-MM-TT");

export const taxCaseSchema = z
  .enum(["19", "7", "steuerfrei", "kleinunternehmer", "reverse-charge"])
  .describe(
    "Steuerfall: 19 oder 7 (% USt), steuerfrei (z. B. § 4 UStG), kleinunternehmer (§ 19 UStG, keine USt), reverse-charge (§ 13b UStG)",
  );

export const sellerSchema = z.object({
  name: z.string().describe("Firmenname oder Name der Einzelunternehmerin / des Einzelunternehmers"),
  street: z.string().describe("Straße und Hausnummer"),
  postalCode: z.string().describe("PLZ"),
  city: z.string(),
  country: z.string().default("DE").describe("ISO-Ländercode, Standard DE"),
  vatId: z.string().optional().describe("USt-IdNr., z. B. DE123456789"),
  taxNumber: z.string().optional().describe("Steuernummer vom Finanzamt, falls keine USt-IdNr."),
  email: z.string().describe("E-Mail für Rückfragen zur Rechnung"),
  phone: z.string().optional().describe("Telefon, Pflicht für XRechnung (BR-DE-6)"),
  contactName: z.string().optional().describe("Ansprechpartner (Person oder Abteilung), Pflicht für XRechnung (BR-DE-5)"),
  iban: z.string(),
  bic: z.string().optional(),
  accountHolder: z.string().optional(),
  defaultTaxCase: taxCaseSchema.optional().describe("Steuerfall, der für neue Positionen gilt"),
  defaultPaymentDays: z.number().int().positive().optional().describe("Zahlungsziel in Tagen"),
  lastInvoiceNumber: z.string().optional().describe("Zuletzt vergebene Rechnungsnummer"),
});

export type SellerProfileInput = z.infer<typeof sellerSchema>;

export const buyerSchema = z.object({
  name: z.string(),
  street: z.string(),
  postalCode: z.string(),
  city: z.string(),
  country: z.string().default("DE"),
  vatId: z.string().optional().describe("USt-IdNr. des Kunden, bei Reverse Charge Pflicht"),
  email: z
    .string()
    .describe("Rechnungs-E-Mail des Kunden. Pflicht als elektronische Adresse seit XRechnung 3.0 (BT-49)"),
  contactName: z.string().optional(),
  customerNumber: z.string().optional(),
});

export const lineSchema = z.object({
  description: z.string().describe("Bezeichnung der Leistung oder des Artikels"),
  details: z.string().optional().describe("Optionale längere Beschreibung"),
  quantity: z.number().positive(),
  unit: z
    .string()
    .default("HUR")
    .describe("UN/ECE-Einheit: HUR Stunde, C62 Stück, DAY Tag, MON Monat, LS Pauschale"),
  unitPrice: z.number().nonnegative().describe("Nettopreis pro Einheit in EUR"),
  taxCase: taxCaseSchema.optional(),
});

export const invoiceSchema = {
  invoiceNumber: z
    .string()
    .optional()
    .describe("Rechnungsnummer. Leer lassen, um die nächste Nummer aus dem gespeicherten Profil zu nehmen."),
  type: z.enum(["rechnung", "gutschrift"]).default("rechnung"),
  issueDate: isoDate.optional().describe("Rechnungsdatum, Standard heute"),
  deliveryDate: isoDate.optional().describe("Leistungsdatum, Standard Rechnungsdatum"),
  dueDate: isoDate.optional().describe("Fälligkeit, Standard Rechnungsdatum plus Zahlungsziel"),
  paymentTerms: z.string().optional().describe("z. B. 14 Tage netto"),
  buyerReference: z
    .string()
    .describe("Käuferreferenz: Leitweg-ID bei Behörden, sonst Bestell- oder Projektnummer (BR-DE-15)"),
  seller: sellerSchema
    .optional()
    .describe("Absender. Weglassen, um das gespeicherte Profil zu nutzen."),
  buyer: buyerSchema,
  lines: z.array(lineSchema).min(1),
  precedingInvoiceNumber: z.string().optional().describe("Nur bei Korrekturen: Nummer der Ursprungsrechnung"),
  precedingInvoiceDate: isoDate.optional(),
  outputDir: z.string().optional().describe(`Zielordner, Standard ${DEFAULT_OUTPUT_DIR}`),
};

const invoiceObject = z.object(invoiceSchema);
export type InvoiceInput = z.infer<typeof invoiceObject>;

const TAX_CASES: Record<z.infer<typeof taxCaseSchema>, TaxCase> = {
  "19": "standard19",
  "7": "standard7",
  steuerfrei: "exempt",
  kleinunternehmer: "kleinunternehmer",
  "reverse-charge": "reverseCharge",
};

/** Draft strings use German decimal commas, like the web form. */
function de(value: number): string {
  return String(value).replace(".", ",");
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** RE-2026-009 → RE-2026-010. Keeps zero padding. */
export function nextInvoiceNumber(last: string | undefined): string {
  const year = new Date().getFullYear();
  if (!last) return `${year}-001`;
  const match = last.match(/^(.*?)(\d+)$/);
  if (!match) return `${last}-2`;
  const [, prefix, digits] = match;
  const next = String(Number(digits) + 1).padStart(digits.length, "0");
  return `${prefix}${next}`;
}

export async function loadProfile(): Promise<SellerProfileInput | null> {
  try {
    return sellerSchema.parse(JSON.parse(await readFile(PROFILE_FILE, "utf8")));
  } catch {
    return null;
  }
}

export async function saveProfile(profile: SellerProfileInput): Promise<void> {
  await mkdir(dirname(PROFILE_FILE), { recursive: true });
  await writeFile(PROFILE_FILE, `${JSON.stringify(profile, null, 2)}\n`, { mode: 0o600 });
}

export function buildDraft(input: InvoiceInput, seller: SellerProfileInput): InvoiceDraft {
  const draft = createEmptyDraft();
  const issueDate = input.issueDate ?? draft.issueDate;
  const paymentDays = seller.defaultPaymentDays ?? 14;
  const defaultTax = seller.defaultTaxCase ?? "19";

  draft.invoiceNumber = input.invoiceNumber ?? nextInvoiceNumber(seller.lastInvoiceNumber);
  draft.invoiceType = input.type === "gutschrift" ? "381" : "380";
  draft.issueDate = issueDate;
  draft.deliveryDate = input.deliveryDate ?? issueDate;
  draft.dueDate = input.dueDate ?? addDays(issueDate, paymentDays);
  draft.paymentTerms = input.paymentTerms ?? `${paymentDays} Tage netto`;
  draft.buyerReference = input.buyerReference;
  draft.precedingInvoiceNumber = input.precedingInvoiceNumber ?? "";
  draft.precedingInvoiceDate = input.precedingInvoiceDate ?? "";

  draft.seller = {
    ...emptyParty(),
    name: seller.name,
    address: {
      street: seller.street,
      postalCode: seller.postalCode,
      city: seller.city,
      country: seller.country,
    },
    vatId: seller.vatId ?? "",
    taxNumber: seller.taxNumber ?? "",
    email: seller.email,
    phone: seller.phone ?? "",
    contactName: seller.contactName ?? "",
  };
  draft.iban = seller.iban;
  draft.bic = seller.bic ?? "";
  draft.accountHolder = seller.accountHolder ?? seller.name;

  const buyer = input.buyer;
  draft.buyer = {
    ...emptyParty(),
    name: buyer.name,
    address: {
      street: buyer.street,
      postalCode: buyer.postalCode,
      city: buyer.city,
      country: buyer.country,
    },
    vatId: buyer.vatId ?? "",
    email: buyer.email ?? "",
    contactName: buyer.contactName ?? "",
    customerNumber: buyer.customerNumber ?? "",
  };

  draft.lines = input.lines.map((line) => ({
    id: crypto.randomUUID(),
    description: line.description,
    details: line.details ?? "",
    quantity: de(line.quantity),
    unit: line.unit,
    unitPrice: de(line.unitPrice),
    taxCase: TAX_CASES[line.taxCase ?? defaultTax],
    articleNumber: "",
  }));

  return draft;
}
