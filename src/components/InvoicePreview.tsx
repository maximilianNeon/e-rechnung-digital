import type { InvoiceDraft } from "../lib/model";
import { unitLabel } from "../lib/model";
import { formatDateDe, formatMoney, formatQuantity, parseMoneyInput } from "../lib/money";
import { computeTotals } from "../lib/totals";
import styles from "./InvoicePreview.module.css";

interface InvoicePreviewProps {
  draft: InvoiceDraft;
  badge?: "Entwurf" | "Gültig";
}

export function InvoicePreview({ draft, badge = "Entwurf" }: InvoicePreviewProps) {
  const totals = computeTotals(draft);
  const color = draft.appearance.brandColor;

  return (
    <article className={styles.sheet}>
      <div className={styles.brandBar} style={{ background: color }} />
      <div className={styles.top}>
        <div className={styles.sellerMark}>
          {draft.appearance.logoDataUrl ? (
            <img src={draft.appearance.logoDataUrl} alt="" className={styles.logo} />
          ) : (
            <div className={styles.logoFallback} style={{ background: color }}>
              {(draft.seller.name || "N").slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <div className={styles.sellerName}>{draft.seller.name || "Absender"}</div>
            <div className={styles.muted}>
              {[draft.seller.address.street, draft.seller.address.city].filter(Boolean).join(", ") ||
                "Adresse"}
            </div>
          </div>
        </div>
        <div className={styles.rightTop}>
          <div className={styles.badge} data-kind={badge === "Gültig" ? "ok" : "draft"}>
            <span className={styles.badgeDot} />
            {badge}
          </div>
          <div className={styles.docLabel} style={{ color }}>
            RECHNUNG
          </div>
          <div className={styles.docNumber}>{draft.invoiceNumber || "—"}</div>
        </div>
      </div>

      <div className={styles.parties}>
        <div>
          <div className={styles.partyLabel} style={{ color }}>
            VON
          </div>
          <div className={styles.partyName}>{draft.seller.name || "—"}</div>
          <div className={styles.muted}>
            {draft.seller.address.street}
            {draft.seller.address.city ? `, ${draft.seller.address.city}` : ""}
          </div>
        </div>
        <div>
          <div className={styles.partyLabel} style={{ color }}>
            AN
          </div>
          <div className={styles.partyName}>{draft.buyer.name || "—"}</div>
          <div className={styles.muted}>
            {draft.buyer.address.street}
            {draft.buyer.address.city ? `, ${draft.buyer.address.city}` : ""}
          </div>
        </div>
      </div>

      <div className={styles.meta}>
        <div>
          <div className={styles.metaLabel}>Datum</div>
          <div>{formatDateDe(draft.issueDate) || "—"}</div>
        </div>
        <div>
          <div className={styles.metaLabel}>Fällig</div>
          <div>{formatDateDe(draft.dueDate) || "—"}</div>
        </div>
        <div>
          <div className={styles.metaLabel}>Referenz</div>
          <div>{draft.buyerReference || "—"}</div>
        </div>
      </div>

      <div className={styles.lines}>
        <div className={styles.lineHead}>
          <span>LEISTUNG</span>
          <span>BETRAG</span>
        </div>
        {draft.lines.map((line, i) => (
          <div key={line.id} className={styles.lineRow}>
            <div className={styles.lineCopy}>
              <div className={styles.lineTitle}>{line.description || `Position ${i + 1}`}</div>
              {line.details.trim() ? <div className={styles.lineDetail}>{line.details}</div> : null}
              <div className={styles.muted}>
                {formatQuantity(line.quantity || "0")} {unitLabel(line.unit)} ×{" "}
                {formatMoney(parseMoneyInput(line.unitPrice) ?? 0)}
              </div>
            </div>
            <div className={styles.amount}>{formatMoney(totals.lines[i]?.net ?? 0)}</div>
          </div>
        ))}
      </div>

      <div className={styles.totals}>
        <div className={styles.totalRow}>
          <span>Netto</span>
          <span>{formatMoney(totals.net)}</span>
        </div>
        <div className={styles.totalRow}>
          <span>USt</span>
          <span>{formatMoney(totals.vat)}</span>
        </div>
        <div className={`${styles.totalRow} ${styles.grand}`}>
          <span>Brutto</span>
          <span>{formatMoney(totals.gross)}</span>
        </div>
      </div>
    </article>
  );
}
