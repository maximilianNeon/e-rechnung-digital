import type { InvoiceDraft, TaxCase } from "./model";
import { exemptionReasonForCase, taxCategoryForCase, taxRateForCase } from "./model";
import { parseMoneyInput, roundMoney } from "./money";

export interface LineTotal {
  id: string;
  net: number;
  vat: number;
  gross: number;
  rate: number;
  category: string;
  taxCase: TaxCase;
}

export interface TaxBucket {
  category: string;
  rate: number;
  basis: number;
  vat: number;
  reason?: string;
}

export interface InvoiceTotals {
  lines: LineTotal[];
  net: number;
  vat: number;
  gross: number;
  taxBreakdown: TaxBucket[];
}

export function computeTotals(draft: InvoiceDraft): InvoiceTotals {
  const lines: LineTotal[] = draft.lines.map((line) => {
    const qty = Number(line.quantity.replace(",", ".")) || 0;
    const price = parseMoneyInput(line.unitPrice) ?? 0;
    const net = roundMoney(qty * price);
    const rate = taxRateForCase(line.taxCase);
    const vat = roundMoney(net * (rate / 100));
    return {
      id: line.id,
      net,
      vat,
      gross: roundMoney(net + vat),
      rate,
      category: taxCategoryForCase(line.taxCase),
      taxCase: line.taxCase,
    };
  });

  const net = roundMoney(lines.reduce((s, l) => s + l.net, 0));
  const vat = roundMoney(lines.reduce((s, l) => s + l.vat, 0));
  const gross = roundMoney(net + vat);

  const buckets = new Map<string, TaxBucket>();
  for (const line of lines) {
    const key = `${line.category}:${line.rate}`;
    const existing = buckets.get(key) ?? {
      category: line.category,
      rate: line.rate,
      basis: 0,
      vat: 0,
      reason: exemptionReasonForCase(line.taxCase),
    };
    existing.basis = roundMoney(existing.basis + line.net);
    existing.vat = roundMoney(existing.vat + line.vat);
    buckets.set(key, existing);
  }

  return {
    lines,
    net,
    vat,
    gross,
    taxBreakdown: [...buckets.values()],
  };
}
