#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { GlobalWindow } from "happy-dom";
import { z } from "zod";
import { parseCiiXml, parseInvoiceFile } from "../../src/lib/parse.ts";
import { computeTotals } from "../../src/lib/totals.ts";
import { absoluteUrl } from "../../src/seo/site.ts";
import { checkDraft, formatIssues } from "./checks.ts";
import { invoiceSummary, prepareInvoice, registerExplainRule, SITE, TAX_HINT, text, VERSION } from "./core.ts";
import {
  DEFAULT_OUTPUT_DIR,
  invoiceSchema,
  loadProfile,
  PROFILE_FILE,
  saveProfile,
  sellerSchema,
} from "./draft.ts";

// parse.ts reads CII with the browser DOMParser.
globalThis.DOMParser ??= new GlobalWindow().DOMParser as unknown as typeof DOMParser;

async function readInvoice(path: string) {
  const full = resolve(path);
  const bytes = await readFile(full);
  if (full.toLowerCase().endsWith(".xml")) {
    return parseCiiXml(new TextDecoder("utf-8").decode(bytes));
  }
  const type = full.toLowerCase().endsWith(".pdf") ? "application/pdf" : "application/xml";
  return parseInvoiceFile(new File([bytes], basename(full), { type }));
}

const server = new McpServer(
  { name: "erechnung-digital", title: "E-RechnungDigital", version: VERSION, websiteUrl: SITE },
  {
    instructions: [
      "Werkzeuge für deutsche E-Rechnungen: XRechnung (CII-XML) und ZUGFeRD-PDF nach EN 16931.",
      "Alles läuft lokal, Rechnungsdaten verlassen den Rechner nicht.",
      "Vor der ersten Rechnung get_seller_profile aufrufen. Fehlt ein Profil, die Absenderdaten erfragen und mit save_seller_profile speichern.",
      "Danach reicht für create_invoice: Kunde, Positionen und Käuferreferenz.",
      TAX_HINT,
    ].join(" "),
  },
);

server.registerTool(
  "get_seller_profile",
  {
    title: "Absenderprofil lesen",
    description:
      "Liest die gespeicherten Absenderdaten (eigene Firma, Anschrift, Steuer, IBAN) und die letzte Rechnungsnummer. Gibt einen Hinweis zurück, wenn noch nichts gespeichert ist.",
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  async () => {
    const profile = await loadProfile();
    if (!profile) {
      return text(
        "Noch kein Absenderprofil gespeichert. Erfrage Name, Anschrift, E-Mail, IBAN und USt-IdNr. oder Steuernummer und rufe save_seller_profile auf.",
      );
    }
    return text(JSON.stringify(profile, null, 2));
  },
);

server.registerTool(
  "save_seller_profile",
  {
    title: "Absenderprofil speichern",
    description: `Speichert die eigenen Firmendaten lokal (${PROFILE_FILE}), damit künftige Rechnungen nur noch Kunde und Positionen brauchen.`,
    inputSchema: sellerSchema.shape,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  async (input) => {
    const previous = await loadProfile();
    const profile = sellerSchema.parse({
      ...input,
      lastInvoiceNumber: input.lastInvoiceNumber ?? previous?.lastInvoiceNumber,
    });
    await saveProfile(profile);
    return text(`Profil für ${profile.name} gespeichert.`);
  },
);

server.registerTool(
  "create_invoice",
  {
    title: "E-Rechnung erstellen",
    description:
      "Erstellt eine E-Rechnung: XRechnung 3.0 (CII-XML) und ZUGFeRD-PDF mit eingebettetem XML. Prüft vorher alle Pflichtangaben und liefert bei Lücken eine Liste mit Erklärlinks. Ohne seller wird das gespeicherte Absenderprofil genutzt, ohne invoiceNumber die nächste Nummer.",
    inputSchema: invoiceSchema,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  },
  async (input) => {
    const profile = await loadProfile();
    const seller = input.seller ?? profile;
    if (!seller) {
      return text(
        "Kein Absender angegeben und kein Profil gespeichert. Bitte Absenderdaten mitgeben oder vorher save_seller_profile aufrufen.",
        true,
      );
    }

    const prepared = await prepareInvoice(input, seller);
    if (!prepared.ok) return text(prepared.message, true);
    const { draft, issues, files } = prepared;

    const dir = resolve(input.outputDir ?? DEFAULT_OUTPUT_DIR);
    await mkdir(dir, { recursive: true });
    const xmlPath = join(dir, `${files.fileBase}.xml`);
    const pdfPath = join(dir, `${files.fileBase}.pdf`);
    await writeFile(xmlPath, files.xml);
    await writeFile(pdfPath, files.pdf);

    if (profile && !input.seller) {
      await saveProfile({ ...profile, lastInvoiceNumber: draft.invoiceNumber });
    }

    const [headline, ...rest] = invoiceSummary(draft, issues).split("\n\nHinweise:");
    return text(
      [
        headline,
        "",
        `ZUGFeRD-PDF (für Kunden mit PDF-Wunsch): ${pdfPath}`,
        `XRechnung-XML (für Behördenportale und Buchhaltungssoftware): ${xmlPath}`,
        "",
        `Ansehen oder anpassen: ${absoluteUrl("/oeffnen")} (Datei dort lokal öffnen)`,
      ].join("\n") + (rest.length ? `\n\nHinweise:${rest.join("")}` : ""),
    );
  },
);

server.registerTool(
  "read_invoice",
  {
    title: "E-Rechnung lesen",
    description:
      "Liest eine XRechnung (CII-XML) oder ZUGFeRD-/Factur-X-PDF von der Festplatte und gibt Absender, Empfänger, Positionen und Summen als JSON zurück.",
    inputSchema: { path: z.string().describe("Pfad zur .xml- oder .pdf-Datei") },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  async ({ path }) => {
    try {
      const result = await readInvoice(path);
      const totals = computeTotals(result.draft);
      const { appearance: _appearance, ...draft } = result.draft;
      return text(
        JSON.stringify(
          {
            source: result.source,
            invoice: draft,
            totals: { net: totals.net, vat: totals.vat, gross: totals.gross, taxBreakdown: totals.taxBreakdown },
            warnings: result.warnings,
          },
          null,
          2,
        ),
      );
    } catch (error) {
      return text(`Datei konnte nicht gelesen werden: ${(error as Error).message}`, true);
    }
  },
);

server.registerTool(
  "check_invoice",
  {
    title: "E-Rechnung prüfen",
    description:
      "Prüft eine vorhandene E-Rechnung (XML oder ZUGFeRD-PDF) auf Pflichtangaben, Rechenfehler und EN-16931-Regeln. Ersetzt nicht den offiziellen KoSIT-Validator, findet aber die häufigsten Ablehnungsgründe.",
    inputSchema: { path: z.string().describe("Pfad zur .xml- oder .pdf-Datei") },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  async ({ path }) => {
    try {
      const result = await readInvoice(path);
      const issues = checkDraft(result.draft);
      const parseNotes = result.warnings.map((warning) => `- Hinweis: ${warning}`).join("\n");
      if (issues.length === 0) {
        return text(`Keine Probleme gefunden in Rechnung ${result.draft.invoiceNumber}.\n${parseNotes}`);
      }
      return text(
        `Rechnung ${result.draft.invoiceNumber || basename(path)}:\n${formatIssues(issues)}\n${parseNotes}`,
      );
    } catch (error) {
      return text(`Datei konnte nicht geprüft werden: ${(error as Error).message}`, true);
    }
  },
);

registerExplainRule(server);

await server.connect(new StdioServerTransport());
