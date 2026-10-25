import { validateInvoice } from "zugferd-ts";
import { toZugferdInvoice } from "../../src/lib/generate.ts";
import type { InvoiceDraft } from "../../src/lib/model.ts";
import { getExportBlockers } from "../../src/lib/validation.ts";
import { getRule, rulePath } from "../../src/pages/rules/rules.ts";
import { absoluteUrl } from "../../src/seo/site.ts";

export interface Issue {
  severity: "error" | "warning";
  message: string;
  rule?: string;
  url?: string;
}

/** Field ids from getExportBlockers → the rule a validator would report. */
const FIELD_RULES: Record<string, string> = {
  invoiceNumber: "BR-02",
  issueDate: "BR-03",
  buyerReference: "BR-DE-15",
  "seller.name": "BR-06",
  "seller.street": "BR-08",
  "seller.postalCode": "BR-DE-4",
  "seller.city": "BR-DE-3",
  "seller.country": "BR-09",
  "seller.email": "BR-DE-7",
  "seller.contactName": "BR-DE-5",
  "seller.phone": "BR-DE-6",
  "seller.vatId": "BR-DE-16",
  "buyer.name": "BR-07",
  "buyer.email": "PEPPOL-EN16931-R010",
  "buyer.street": "BR-10",
  "buyer.postalCode": "BR-DE-9",
  "buyer.city": "BR-DE-8",
  lines: "BR-16",
  iban: "BR-DE-1",
  dueDate: "BR-CO-25",
};

function withRule(issue: Issue): Issue {
  const rule = issue.rule ? getRule(issue.rule) : undefined;
  return rule ? { ...issue, rule: rule.id, url: absoluteUrl(rulePath(rule.id)) } : issue;
}

export function checkDraft(draft: InvoiceDraft): Issue[] {
  const issues: Issue[] = getExportBlockers(draft).map((blocker) => ({
    severity: "error",
    message: `Es fehlt oder ist ungültig: ${blocker.label}.`,
    rule: FIELD_RULES[blocker.field],
  }));

  const result = validateInvoice(toZugferdInvoice(draft));
  for (const error of [...result.errors, ...result.warnings]) {
    if (issues.some((issue) => issue.rule === error.ruleId)) continue;
    // zugferd-ts only knows a subset of UN/ECE unit codes; valid ones like XPP would fail.
    const severity = error.ruleId === "INPUT-CODE-02" ? "warning" : error.severity;
    issues.push({ severity, message: error.message, rule: error.ruleId });
  }

  if (draft.lines.some((line) => line.taxCase === "reverseCharge") && !draft.buyer.vatId.trim()) {
    issues.push({
      severity: "error",
      message: "Reverse Charge braucht die USt-IdNr. des Kunden.",
    });
  }

  return issues.map(withRule);
}

export function formatIssues(issues: Issue[]): string {
  return issues
    .map((issue) => {
      const tag = issue.severity === "error" ? "Fehler" : "Hinweis";
      const rule = issue.rule ? ` [${issue.rule}]` : "";
      const link = issue.url ? ` – ${issue.url}` : "";
      return `- ${tag}${rule}: ${issue.message}${link}`;
    })
    .join("\n");
}
