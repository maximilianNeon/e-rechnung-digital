import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { GlobalWindow } from "happy-dom";
import { validateInvoice } from "zugferd-ts";
import { generateInvoiceFiles, toZugferdInvoice, XRECHNUNG_ID } from "../src/lib/generate.ts";
import type { InvoiceDraft, TaxCase } from "../src/lib/model.ts";
import { parseCiiXml, parseInvoiceFile } from "../src/lib/parse.ts";
import { createSampleDraft } from "../src/lib/sample.ts";
import { getExportBlockers } from "../src/lib/validation.ts";

const dom = new GlobalWindow();
globalThis.DOMParser = dom.DOMParser as unknown as typeof DOMParser;

const fixtures = join(dirname(fileURLToPath(import.meta.url)), "fixtures/invoices");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function readFixture(name: string): string {
  return readFileSync(join(fixtures, name), "utf8");
}

function fileFromFixture(name: string): File {
  const bytes = readFileSync(join(fixtures, name));
  const type = name.endsWith(".pdf") ? "application/pdf" : "application/xml";
  return new File([bytes], name, { type });
}

interface LineExpect {
  description: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  taxCase: TaxCase;
}

interface InvoiceExpect {
  invoiceNumber: string;
  seller: string;
  buyer: string;
  lines: LineExpect[];
  buyerReference?: string;
  issueDate?: string;
  iban?: string;
  emptyLines?: boolean;
}

function expectInvoice(draft: InvoiceDraft, expected: InvoiceExpect, label: string) {
  assert(draft.invoiceNumber === expected.invoiceNumber, `${label}: number ${draft.invoiceNumber}`);
  assert(draft.seller.name === expected.seller, `${label}: seller ${draft.seller.name}`);
  assert(draft.buyer.name === expected.buyer, `${label}: buyer ${draft.buyer.name}`);
  if (expected.buyerReference) {
    assert(
      draft.buyerReference === expected.buyerReference,
      `${label}: reference ${draft.buyerReference}`,
    );
  }
  if (expected.issueDate) {
    assert(draft.issueDate === expected.issueDate, `${label}: date ${draft.issueDate}`);
  }
  if (expected.iban) {
    assert(draft.iban.replace(/\s/g, "") === expected.iban, `${label}: iban ${draft.iban}`);
  }
  if (expected.emptyLines) {
    assert(
      draft.lines.every((line) => line.description === ""),
      `${label}: minimum profile should not invent line items`,
    );
    return;
  }
  assert(draft.lines.length === expected.lines.length, `${label}: ${draft.lines.length} lines`);
  expected.lines.forEach((line, index) => {
    const got = draft.lines[index];
    assert(got.description.includes(line.description), `${label}: line ${index} ${got.description}`);
    assert(got.quantity === line.quantity, `${label}: qty ${got.quantity}`);
    assert(got.unit === line.unit, `${label}: unit ${got.unit}`);
    assert(got.unitPrice === line.unitPrice, `${label}: price ${got.unitPrice}`);
    assert(got.taxCase === line.taxCase, `${label}: tax ${got.taxCase}`);
  });
}

const xmlCases: { file: string; expected: InvoiceExpect }[] = [
  {
    file: "facturx-minimum.xml",
    expected: {
      invoiceNumber: "FA-2017-0010",
      seller: "Au bon moulin",
      buyer: "Ma jolie boutique",
      issueDate: "2017-11-13",
      emptyLines: true,
      lines: [],
    },
  },
  {
    file: "facturx-basic.xml",
    expected: {
      invoiceNumber: "471102",
      seller: "Lieferant GmbH",
      buyer: "Kunden AG Mitte",
      issueDate: "2024-11-15",
      lines: [
        {
          description: "Trennblätter A4",
          quantity: "20",
          unit: "H87",
          unitPrice: "9,90",
          taxCase: "standard19",
        },
      ],
    },
  },
  {
    file: "facturx-en16931.xml",
    expected: {
      invoiceNumber: "RE-20201121/508",
      seller: "Bei Spiel GmbH",
      buyer: "Theodor Est",
      buyerReference: "AB321",
      issueDate: "2020-11-21",
      iban: "DE88200800000970375700",
      lines: [
        { description: "Design (hours)", quantity: "1", unit: "HUR", unitPrice: "160,00", taxCase: "standard7" },
        { description: "Ballons", quantity: "400", unit: "H87", unitPrice: "0,79", taxCase: "standard19" },
        { description: "heiße Luft", quantity: "800", unit: "LTR", unitPrice: "0,025", taxCase: "standard19" },
      ],
    },
  },
  {
    file: "facturx-extended.xml",
    expected: {
      invoiceNumber: "KR87654321012",
      seller: "MUSTERLIEFERANT GMBH",
      buyer: "MUSTER-KUNDE GMBH",
      issueDate: "2024-11-15",
      lines: [
        { description: "Wirkarbeit HT", quantity: "1.000", unit: "KWH", unitPrice: "0,052", taxCase: "standard19" },
        { description: "Ökosteuer Lieferant", quantity: "1.000", unit: "KWH", unitPrice: "0,0205", taxCase: "standard19" },
        { description: "Kommissionierer", quantity: "27,5", unit: "HUR", unitPrice: "10,50", taxCase: "standard19" },
        { description: "FALTENBEUTEL", quantity: "3.500", unit: "H87", unitPrice: "0,0105", taxCase: "standard19" },
        { description: "Kopierpapier A4", quantity: "1.210", unit: "H87", unitPrice: "0,01", taxCase: "standard19" },
      ],
    },
  },
  {
    file: "xrechnung-standard.cii.xml",
    expected: {
      invoiceNumber: "123456XX",
      seller: "[Seller name]",
      buyer: "[Buyer name]",
      buyerReference: "04011000-12345-03",
      issueDate: "2016-04-04",
      iban: "DE79000000001234567890",
      lines: [
        { description: "Zeitschrift", quantity: "1", unit: "XPP", unitPrice: "288,79", taxCase: "standard7" },
        { description: "Porto + Versandkosten", quantity: "1", unit: "XPP", unitPrice: "26,07", taxCase: "standard7" },
      ],
    },
  },
  {
    file: "xrechnung-steuerbefreit.cii.xml",
    expected: {
      invoiceNumber: "1234/78/901",
      seller: "[Seller name]",
      buyer: "[Buyer name]",
      buyerReference: "04011000-12348-91",
      lines: [
        { description: "Teilnahmegebühr", quantity: "1", unit: "XPP", unitPrice: "120,00", taxCase: "exempt" },
      ],
    },
  },
  {
    file: "xrechnung-reverse-charge.cii.xml",
    expected: {
      invoiceNumber: "18383",
      seller: "Mustermann GmbH",
      buyer: "DB Station&Service AG RB Mitte",
      buyerReference: "04011000-12349-88",
      issueDate: "2020-11-27",
      lines: [
        { description: "Tür Instandsetzung", quantity: "4", unit: "HUR", unitPrice: "52,00", taxCase: "reverseCharge" },
      ],
    },
  },
];

for (const testCase of xmlCases) {
  const result = parseCiiXml(readFixture(testCase.file));
  expectInvoice(result.draft, testCase.expected, testCase.file);
  assert(!result.warnings.includes("Keine Rechnungsnummer gefunden."), `${testCase.file}: missing number`);
}

const pdfCases: { file: string; invoiceNumber: string; seller: string; line: string }[] = [
  { file: "facturx-en16931.pdf", invoiceNumber: "471102", seller: "Lieferant GmbH", line: "Trennblätter A4" },
  { file: "facturx-teilrechnung.pdf", invoiceNumber: "471102", seller: "Lieferant GmbH", line: "Kunstrasen" },
  { file: "facturx-warenrechnung.pdf", invoiceNumber: "R87654321012345", seller: "MUSTERLIEFERANT GMBH", line: "Zitronensäure" },
];

for (const testCase of pdfCases) {
  const result = await parseInvoiceFile(fileFromFixture(testCase.file));
  assert(result.source === "pdf", `${testCase.file}: source`);
  assert(result.draft.invoiceNumber === testCase.invoiceNumber, `${testCase.file}: ${result.draft.invoiceNumber}`);
  assert(result.draft.seller.name === testCase.seller, `${testCase.file}: ${result.draft.seller.name}`);
  assert(
    result.draft.lines.some((line) => line.description.includes(testCase.line)),
    `${testCase.file}: missing ${testCase.line}`,
  );
}

let ublRejected = false;
try {
  parseCiiXml(readFixture("xrechnung-standard.ubl.xml"));
} catch (error) {
  ublRejected = error instanceof Error && error.message.includes("Kein CII-XML");
}
assert(ublRejected, "UBL XRechnung should be rejected");

const sample = createSampleDraft();
const validation = validateInvoice(toZugferdInvoice(sample)) as {
  valid?: boolean;
  errors?: unknown[];
};
assert(
  validation.valid !== false && (validation.errors?.length ?? 0) === 0,
  `sample invoice invalid: ${JSON.stringify(validation)}`,
);

const generated = await generateInvoiceFiles(sample);
assert(generated.xml.includes(XRECHNUNG_ID), "xml must carry the XRechnung id (BR-DE-21)");
assert(
  generated.xml.includes(`schemeID="EM">${sample.buyer.email}`),
  "xml must carry the buyer electronic address (BT-49)",
);
const fromXml = parseCiiXml(generated.xml);
const fromPdf = await parseInvoiceFile(
  new File([generated.pdf], `${generated.fileBase}.pdf`, { type: "application/pdf" }),
);

for (const [label, draft] of [
  ["generated xml", fromXml.draft],
  ["generated pdf", fromPdf.draft],
] as const) {
  assert(draft.invoiceNumber === sample.invoiceNumber, `${label}: number`);
  assert(draft.seller.name === sample.seller.name, `${label}: seller`);
  assert(draft.buyer.name === sample.buyer.name, `${label}: buyer`);
  assert(draft.buyerReference === sample.buyerReference, `${label}: reference`);
  assert(draft.buyer.email === sample.buyer.email, `${label}: buyer email ${draft.buyer.email}`);
  assert(draft.issueDate === sample.issueDate, `${label}: issue`);
  assert(draft.deliveryDate === sample.deliveryDate, `${label}: delivery`);
  assert(draft.dueDate === sample.dueDate, `${label}: due`);
  assert(draft.paymentTerms === sample.paymentTerms, `${label}: terms ${draft.paymentTerms}`);
  assert(draft.iban.replace(/\s/g, "") === sample.iban.replace(/\s/g, ""), `${label}: iban`);
  assert(draft.lines.length === sample.lines.length, `${label}: lines`);
  sample.lines.forEach((line, index) => {
    const got = draft.lines[index];
    assert(got.description === line.description, `${label}: line ${got.description}`);
    assert(got.details === line.details, `${label}: details ${got.details}`);
    assert(got.quantity === line.quantity, `${label}: qty ${got.quantity}`);
    assert(got.unit === line.unit, `${label}: unit`);
    assert(got.unitPrice === line.unitPrice, `${label}: price ${got.unitPrice}`);
    assert(got.taxCase === line.taxCase, `${label}: tax`);
    assert(got.articleNumber === line.articleNumber, `${label}: article ${got.articleNumber}`);
  });
}

const noContact = createSampleDraft();
noContact.seller.contactName = "";
noContact.seller.phone = "-";
const blocked = getExportBlockers(noContact).map((b) => b.field);
assert(blocked.includes("seller.contactName"), "contact name required (BR-DE-5)");
assert(blocked.includes("seller.phone"), "phone with digits required (BR-DE-6, BR-DE-27)");

const noBuyerMail = createSampleDraft();
noBuyerMail.buyer.email = "";
assert(
  getExportBlockers(noBuyerMail).some((b) => b.field === "buyer.email"),
  "buyer e-mail required (BT-49)",
);

console.log("invoices.test.ts ok");
