// Talks to the bundled Vercel function (api/mcp.js) over HTTP like ChatGPT and Claude.ai do.
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { GlobalWindow } from "happy-dom";
import { decodeDraft } from "../src/lib/share.ts";
import { createSampleDraft } from "../src/lib/sample.ts";

const { POST, GET } = (await import("../api/mcp.js")) as {
  POST: (request: Request) => Promise<Response>;
  GET: (request: Request) => Response;
};
globalThis.DOMParser ??= new GlobalWindow().DOMParser as unknown as typeof DOMParser;

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const http = createServer(async (req, res) => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const request = new Request(`http://localhost${req.url}`, {
    method: req.method,
    headers: req.headers as Record<string, string>,
    body: req.method === "POST" ? Buffer.concat(chunks) : undefined,
  });
  const response = req.method === "POST" ? await POST(request) : GET(request);
  res.writeHead(response.status, Object.fromEntries(response.headers));
  res.end(Buffer.from(await response.arrayBuffer()));
});
await new Promise<void>((done) => http.listen(0, done));
const port = (http.address() as { port: number }).port;

const client = new Client({ name: "remote-test", version: "0" });
await client.connect(new StreamableHTTPClientTransport(new URL(`http://localhost:${port}/mcp`)));

const { tools } = await client.listTools();
assert(
  tools.map((t) => t.name).sort().join() === "check_invoice,create_invoice,explain_rule",
  `tools: ${tools.map((t) => t.name)}`,
);
for (const tool of tools) {
  const a = tool.annotations ?? {};
  assert(tool.title && a.readOnlyHint !== undefined && a.destructiveHint !== undefined && a.openWorldHint !== undefined, `${tool.name}: annotations`);
}

const sample = createSampleDraft();
const created = await client.callTool({
  name: "create_invoice",
  arguments: {
    invoiceNumber: "RE-2026-100",
    buyerReference: "Website-Relaunch",
    seller: {
      name: "Test Studio Nord UG", street: "Teststraße 1", postalCode: "10115", city: "Berlin",
      vatId: "DE123456789", email: "rechnung@teststudio.example", phone: "030 1234567",
      contactName: "Buchhaltung", iban: "DE89370400440532013000",
    },
    buyer: { name: "Bäckerei Krume GmbH", street: "Oderberger Str. 3", postalCode: "10435", city: "Berlin", email: "buchhaltung@krume.example" },
    lines: [{ description: "Webdesign", quantity: 12, unitPrice: 75 }],
  },
});
const createdText = (created.content as { type: string; text?: string }[]).map((c) => c.text ?? "").join("\n");
assert(!created.isError, createdText);
const link = createdText.match(/https:\/\/www\.erechnungdigital\.com\/rechnung#(\S+)/);
assert(link, "create_invoice returns a /rechnung link");
const draft = await decodeDraft(link[1]);
assert(draft.invoiceNumber === "RE-2026-100" && draft.buyer.name === "Bäckerei Krume GmbH", "link carries the draft");
assert(createdText.includes("1.071,00"), "gross total");

const missing = await client.callTool({
  name: "create_invoice",
  arguments: { invoiceNumber: "X", buyerReference: "", seller: { name: "A", street: "B", postalCode: "10115", city: "C", email: "a@b.de", iban: "DE89370400440532013000" }, buyer: { name: "D", street: "E", postalCode: "10115", city: "F", email: "" }, lines: [{ description: "G", quantity: 1, unitPrice: 1 }] },
});
const missingText = (missing.content as { text?: string }[]).map((c) => c.text).join();
assert(missing.isError && missingText.includes("BR-DE-15") && missingText.includes("BR-DE-6"), "missing fields reported");

const { generateInvoiceFiles } = await import("../src/lib/generate.ts");
const checked = await client.callTool({ name: "check_invoice", arguments: { xml: (await generateInvoiceFiles(sample)).xml } });
assert((checked.content as { text?: string }[])[0].text?.includes("keine Probleme"), "check_invoice on a valid XML");

const official = await client.callTool({
  name: "check_invoice",
  arguments: { xml: readFileSync("tests/fixtures/invoices/xrechnung-standard.cii.xml", "utf8") },
});
assert(!(official.content as { text?: string }[])[0].text?.includes("- Fehler"), "official KoSIT sample has no errors");

const explained = await client.callTool({ name: "explain_rule", arguments: { id: "br-de-15" } });
assert((explained.content as { text?: string }[])[0].text?.includes("Käuferreferenz"), "explain_rule");

await client.close();
http.close();
console.log("remote.test.ts ok");
