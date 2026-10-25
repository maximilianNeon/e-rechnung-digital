// Hosted MCP endpoint for ChatGPT and Claude.ai (https://www.erechnungdigital.com/mcp).
// Stateless: every request gets a fresh server, nothing is stored.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { GlobalWindow } from "happy-dom";
import { z } from "zod";
import { parseCiiXml } from "../../src/lib/parse.ts";
import { encodeDraft } from "../../src/lib/share.ts";
import { absoluteUrl } from "../../src/seo/site.ts";
import { checkDraft, formatIssues } from "./checks.ts";
import { invoiceSummary, prepareInvoice, registerExplainRule, SITE, TAX_HINT, text, VERSION } from "./core.ts";
import { invoiceSchema, sellerSchema } from "./draft.ts";

globalThis.DOMParser ??= new GlobalWindow().DOMParser as unknown as typeof DOMParser;

const { outputDir: _outputDir, seller: _seller, ...remoteInvoiceFields } = invoiceSchema;

function createServer(): McpServer {
  const server = new McpServer(
    { name: "erechnung-digital", title: "E-RechnungDigital", version: VERSION, websiteUrl: SITE },
    {
      instructions: [
        "Werkzeuge für deutsche E-Rechnungen: XRechnung (CII-XML) und ZUGFeRD-PDF nach EN 16931.",
        "Der Server speichert nichts. Absenderdaten bei jeder Rechnung mitgeben; erfrage sie einmal und merke sie dir im Gespräch.",
        TAX_HINT,
      ].join(" "),
    },
  );

  server.registerTool(
    "create_invoice",
    {
      title: "E-Rechnung erstellen",
      description:
        "Erstellt eine deutsche E-Rechnung als XRechnung 3.0 (CII-XML) und ZUGFeRD-PDF mit eingebettetem XML. Prüft vorher alle Pflichtangaben und liefert bei Lücken eine Liste mit Erklärlinks. Bei Erfolg kommt ein Link, über den der Nutzer beide Dateien herunterlädt. Nichts wird gespeichert.",
      inputSchema: {
        ...remoteInvoiceFields,
        invoiceNumber: z.string().describe("Rechnungsnummer, fortlaufend und einmalig"),
        seller: sellerSchema.describe("Eigene Firmendaten (Absender)"),
      },
      annotations: { title: "E-Rechnung erstellen", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async (input) => {
      const prepared = await prepareInvoice(input, input.seller);
      if (!prepared.ok) return text(prepared.message, true);
      const { draft, issues } = prepared;
      // Invoice data travels only in the URL fragment, which browsers never send to a server.
      const link = `${absoluteUrl("/rechnung")}#${await encodeDraft(draft)}`;
      return {
        content: [
          {
            type: "text" as const,
            text: [
              invoiceSummary(draft, issues),
              "",
              `Herunterladen als ZUGFeRD-PDF und XRechnung-XML: ${link}`,
              "",
              "Gib dem Nutzer diesen Link unverändert als anklickbaren Link weiter. Die Dateien entstehen beim Öffnen im Browser des Nutzers.",
            ].join("\n"),
          },
          {
            type: "resource_link" as const,
            uri: link,
            name: `Rechnung ${draft.invoiceNumber}`,
            mimeType: "text/html",
            description: "ZUGFeRD-PDF und XRechnung-XML herunterladen",
          },
        ],
      };
    },
  );

  server.registerTool(
    "check_invoice",
    {
      title: "E-Rechnung prüfen",
      description:
        "Prüft den XML-Inhalt einer XRechnung oder ZUGFeRD-Rechnung (CII) auf Pflichtangaben, Rechenfehler und EN-16931-Regeln. Ersetzt nicht den offiziellen KoSIT-Validator. Der Inhalt wird nicht gespeichert.",
      inputSchema: { xml: z.string().describe("Vollständiger XML-Inhalt der Rechnung") },
      annotations: { title: "E-Rechnung prüfen", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ xml }) => {
      try {
        const result = parseCiiXml(xml);
        const issues = checkDraft(result.draft);
        const notes = result.warnings.map((warning) => `- Hinweis: ${warning}`).join("\n");
        const head = `Rechnung ${result.draft.invoiceNumber || "ohne Nummer"}`;
        if (issues.length === 0) return text(`${head}: keine Probleme gefunden.\n${notes}`);
        return text(`${head}:\n${formatIssues(issues)}\n${notes}`);
      } catch (error) {
        return text(`Das XML konnte nicht gelesen werden: ${(error as Error).message}`, true);
      }
    },
  );

  registerExplainRule(server);
  return server;
}

async function handle(request: Request): Promise<Response> {
  const server = createServer();
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  await server.connect(transport);
  try {
    return await transport.handleRequest(request);
  } finally {
    await server.close();
  }
}

export async function POST(request: Request): Promise<Response> {
  return handle(request);
}

export function GET(request: Request): Response {
  // Stateless server: no server-sent event stream to resume.
  if (request.headers.get("accept")?.includes("text/event-stream")) {
    return new Response(null, { status: 405, headers: { allow: "POST" } });
  }
  return new Response(
    JSON.stringify({ name: "E-RechnungDigital MCP", version: VERSION, docs: absoluteUrl("/ki-assistenten") }),
    { status: 200, headers: { "content-type": "application/json" } },
  );
}
