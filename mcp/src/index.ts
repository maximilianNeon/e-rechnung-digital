#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { GlobalWindow } from "happy-dom";
import { z } from "zod";
import { generateInvoiceFiles } from "../../src/lib/generate.ts";
import { formatMoney } from "../../src/lib/money.ts";
import { parseCiiXml, parseInvoiceFile } from "../../src/lib/parse.ts";
import { computeTotals } from "../../src/lib/totals.ts";
import { getRule, rulePath, rules } from "../../src/pages/rules/rules.ts";
import { absoluteUrl } from "../../src/seo/site.ts";
import { checkDraft, formatIssues } from "./checks.ts";
import {
  buildDraft,
  DEFAULT_OUTPUT_DIR,
  invoiceSchema,
  loadProfile,
  PROFILE_FILE,
  saveProfile,
  sellerSchema,
} from "./draft.ts";

// parse.ts reads CII with the browser DOMParser.
globalThis.DOMParser ??= new GlobalWindow().DOMParser as unknown as typeof DOMParser;

const VERSION = "0.1.1";
const SITE = absoluteUrl("/");

function text(value: string, isError = false) {
  return { content: [{ type: "text" as const, text: value }], isError };
}

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
      "Frag nach dem Steuerfall, wenn er unklar ist (19 %, 7 %, Kleinunternehmer § 19 UStG, Reverse Charge § 13b UStG, steuerfrei).",
      "Bei Behörden ist die Käuferreferenz die Leitweg-ID.",
    ].join(" "),
  },
);

server.registerTool(
  "get_seller_profile",
  {
    title: "Absenderprofil lesen",
    description:
      "Liest die gespeicherten Absenderdaten (eigene Firma, Anschrift, Steuer, IBAN) und die letzte Rechnungsnummer. Gibt einen Hinweis zurück, wenn noch nichts gespeichert ist.",
    annotations: { readOnlyHint: true, openWorldHint: false },
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
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
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

    const draft = buildDraft(input, seller);
    const issues = checkDraft(draft);
    const errors = issues.filter((issue) => issue.severity === "error");
    if (errors.length > 0) {
      return text(`Die Rechnung ist noch nicht vollständig:\n${formatIssues(issues)}`, true);
    }

    let files;
    try {
      files = await generateInvoiceFiles(draft);
    } catch (error) {
      return text(`Erzeugen fehlgeschlagen:\n${(error as Error).message}`, true);
    }

    const dir = resolve(input.outputDir ?? DEFAULT_OUTPUT_DIR);
    await mkdir(dir, { recursive: true });
    const xmlPath = join(dir, `${files.fileBase}.xml`);
    const pdfPath = join(dir, `${files.fileBase}.pdf`);
    await writeFile(xmlPath, files.xml);
    await writeFile(pdfPath, files.pdf);

    if (profile && !input.seller) {
      await saveProfile({ ...profile, lastInvoiceNumber: draft.invoiceNumber });
    }

    const totals = computeTotals(draft);
    const warnings = issues.length > 0 ? `\n\nHinweise:\n${formatIssues(issues)}` : "";
    return text(
      [
        `Rechnung ${draft.invoiceNumber} an ${draft.buyer.name} erstellt.`,
        `Netto ${formatMoney(totals.net)}, USt ${formatMoney(totals.vat)}, Brutto ${formatMoney(totals.gross)}. Fällig am ${draft.dueDate}.`,
        "",
        `ZUGFeRD-PDF (für Kunden mit PDF-Wunsch): ${pdfPath}`,
        `XRechnung-XML (für Behördenportale und Buchhaltungssoftware): ${xmlPath}`,
        "",
        `Ansehen oder anpassen: ${absoluteUrl("/oeffnen")} (Datei dort lokal öffnen)`,
      ].join("\n") + warnings,
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
    annotations: { readOnlyHint: true, openWorldHint: false },
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
    annotations: { readOnlyHint: true, openWorldHint: false },
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

server.registerTool(
  "explain_rule",
  {
    title: "Prüfregel erklären",
    description:
      "Erklärt eine Validierungsregel der E-Rechnung (z. B. BR-DE-15, BR-CO-10) in einfachem Deutsch: Bedeutung, Ursache, Lösung und Link.",
    inputSchema: { id: z.string().describe("Regel-ID, z. B. BR-DE-15") },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  async ({ id }) => {
    const rule = getRule(id);
    if (!rule) {
      const known = rules.map((item) => item.id).join(", ");
      return text(`Zu ${id} gibt es noch keine Erklärung. Bekannt sind: ${known}`, true);
    }
    return text(
      [
        `${rule.id}: ${rule.title} (${rule.source}, ${rule.severity}, ${rule.terms.join(", ")})`,
        `Bedeutung: ${rule.meaning}`,
        `Typische Ursache: ${rule.cause}`,
        `Lösung: ${rule.fix}`,
        `Mehr: ${absoluteUrl(rulePath(rule.id))}`,
      ].join("\n"),
    );
  },
);

await server.connect(new StdioServerTransport());
