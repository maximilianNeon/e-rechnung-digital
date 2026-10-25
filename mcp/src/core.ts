import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { generateInvoiceFiles, type GenerateResult } from "../../src/lib/generate.ts";
import type { InvoiceDraft } from "../../src/lib/model.ts";
import { formatMoney } from "../../src/lib/money.ts";
import { computeTotals } from "../../src/lib/totals.ts";
import { getRule, rulePath, rules } from "../../src/pages/rules/rules.ts";
import { absoluteUrl } from "../../src/seo/site.ts";
import { checkDraft, formatIssues, type Issue } from "./checks.ts";
import { buildDraft, type InvoiceInput, type SellerProfileInput } from "./draft.ts";

export const VERSION = "0.2.0";
export const SITE = absoluteUrl("/");

export const TAX_HINT =
  "Frag nach dem Steuerfall, wenn er unklar ist (19 %, 7 %, Kleinunternehmer § 19 UStG, Reverse Charge § 13b UStG, steuerfrei). Bei Behörden ist die Käuferreferenz die Leitweg-ID.";

export function text(value: string, isError = false) {
  return { content: [{ type: "text" as const, text: value }], isError };
}

export type Prepared =
  | { ok: false; draft: InvoiceDraft; issues: Issue[]; message: string }
  | { ok: true; draft: InvoiceDraft; issues: Issue[]; files: GenerateResult };

/** Builds, checks and generates an invoice. Nothing is written anywhere. */
export async function prepareInvoice(
  input: InvoiceInput,
  seller: SellerProfileInput,
): Promise<Prepared> {
  const draft = buildDraft(input, seller);
  const issues = checkDraft(draft);
  if (issues.some((issue) => issue.severity === "error")) {
    return {
      ok: false,
      draft,
      issues,
      message: `Die Rechnung ist noch nicht vollständig:\n${formatIssues(issues)}`,
    };
  }
  try {
    return { ok: true, draft, issues, files: await generateInvoiceFiles(draft) };
  } catch (error) {
    return { ok: false, draft, issues, message: `Erzeugen fehlgeschlagen:\n${(error as Error).message}` };
  }
}

export function invoiceSummary(draft: InvoiceDraft, issues: Issue[]): string {
  const totals = computeTotals(draft);
  const warnings = issues.length > 0 ? `\n\nHinweise:\n${formatIssues(issues)}` : "";
  return (
    [
      `Rechnung ${draft.invoiceNumber} an ${draft.buyer.name} erstellt.`,
      `Netto ${formatMoney(totals.net)}, USt ${formatMoney(totals.vat)}, Brutto ${formatMoney(totals.gross)}. Fällig am ${draft.dueDate}.`,
    ].join("\n") + warnings
  );
}

export function registerExplainRule(server: McpServer): void {
  server.registerTool(
    "explain_rule",
    {
      title: "Prüfregel erklären",
      description:
        "Erklärt eine Validierungsregel der E-Rechnung (z. B. BR-DE-15, BR-CO-10) in einfachem Deutsch: Bedeutung, Ursache, Lösung und Link.",
      inputSchema: { id: z.string().describe("Regel-ID, z. B. BR-DE-15") },
      annotations: { title: "Prüfregel erklären", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
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
}
