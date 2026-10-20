import type { InvoiceDraft } from "./model";

export function applyEditMode(
  draft: InvoiceDraft,
  mode: "keep" | "correct",
): InvoiceDraft {
  if (mode === "keep") {
    return { ...draft, precedingInvoiceNumber: "", precedingInvoiceDate: "" };
  }
  const year = new Date().getFullYear();
  return {
    ...draft,
    precedingInvoiceNumber: draft.invoiceNumber,
    precedingInvoiceDate: draft.issueDate,
    invoiceNumber: `KOR-${year}-${String(Date.now()).slice(-4)}`,
    issueDate: new Date().toISOString().slice(0, 10),
  };
}
