import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const home = mkdtempSync(join(tmpdir(), "erechnung-mcp-"));
const transport = new StdioClientTransport({
  command: "node",
  args: ["dist/index.js"],
  env: { ...process.env, ERECHNUNG_HOME: home, ERECHNUNG_OUTPUT_DIR: join(home, "out") },
});
const client = new Client({ name: "smoke", version: "0" });
await client.connect(transport);

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}
async function call(name, args = {}) {
  const res = await client.callTool({ name, arguments: args });
  const out = res.content.map((c) => c.text).join("\n");
  console.log(`--- ${name}${res.isError ? " (error)" : ""}\n${out}\n`);
  return { out, isError: !!res.isError };
}

const { tools } = await client.listTools();
assert(tools.length === 6, `expected 6 tools, got ${tools.length}`);

let r = await call("get_seller_profile");
assert(r.out.includes("Noch kein"), "profile should be empty");

r = await call("save_seller_profile", {
  name: "Gründerin Studio UG",
  street: "Torstraße 1",
  postalCode: "10119",
  city: "Berlin",
  vatId: "DE123456789",
  email: "rechnung@studio.example",
  phone: "030 1234567",
  contactName: "Buchhaltung",
  iban: "DE89370400440532013000",
  lastInvoiceNumber: "2026-009",
});
assert(!r.isError, "save failed");

r = await call("create_invoice", {
  buyerReference: "PO-4711",
  buyer: { name: "Kunde GmbH", street: "Hauptstraße 5", postalCode: "80331", city: "München", email: "ap@kunde.example" },
  lines: [
    { description: "Webdesign", quantity: 5, unitPrice: 90 },
    { description: "Hosting", quantity: 1, unit: "MON", unitPrice: 12.5, taxCase: "7" },
  ],
});
assert(!r.isError, "create failed");
assert(r.out.includes("2026-010"), "next invoice number");
assert(r.out.includes("548,88"), "gross total");
const pdf = r.out.match(/PDF.*?: (\S+\.pdf)/)[1];
const xml = r.out.match(/XML.*?: (\S+\.xml)/)[1];
const { readFileSync } = await import("node:fs");
assert(readFileSync(xml, "utf8").includes("urn:xeinkauf.de:kosit:xrechnung_3.0"), "XRechnung id (BR-DE-21)");
assert(readFileSync(xml, "utf8").includes('schemeID="EM">ap@kunde.example'), "buyer e-address (BT-49)");

r = await call("create_invoice", {
  buyerReference: "",
  buyer: { name: "Kunde GmbH", street: "", postalCode: "80331", city: "München", email: "" },
  lines: [{ description: "Beratung", quantity: 1, unitPrice: 100 }],
});
assert(r.isError && r.out.includes("BR-DE-15"), "missing reference must be reported");
assert(r.out.includes("PEPPOL-EN16931-R010"), "missing buyer e-address must be reported");

r = await call("create_invoice", {
  seller: { name: "Ohne Kontakt", street: "Weg 1", postalCode: "10115", city: "Berlin", email: "a@b.de", iban: "DE89370400440532013000", vatId: "DE123456789" },
  buyerReference: "X",
  buyer: { name: "Kunde GmbH", street: "Hauptstraße 5", postalCode: "80331", city: "München", email: "ap@kunde.example" },
  lines: [{ description: "Beratung", quantity: 1, unitPrice: 100 }],
});
assert(r.isError && r.out.includes("BR-DE-5") && r.out.includes("BR-DE-6"), "contact and phone required");

r = await call("check_invoice", { path: pdf });
assert(!r.isError && r.out.includes("Keine Probleme"), "generated PDF should pass");
r = await call("read_invoice", { path: xml });
assert(JSON.parse(r.out).totals.gross === 548.88, "read totals");
r = await call("explain_rule", { id: "br-de-15" });
assert(r.out.includes("Käuferreferenz"), "explain");
r = await call("get_seller_profile");
assert(r.out.includes('"lastInvoiceNumber": "2026-010"'), "number persisted");

await client.close();
console.log("smoke ok");
