import type { InvoiceDraft } from "../lib/model";
import { unitLabel } from "../lib/model";
import { formatDateDe, formatMoney, formatQuantity, parseMoneyInput } from "../lib/money";
import { computeTotals } from "../lib/totals";
import styles from "./InvoiceDocument.module.css";

interface InvoiceDocumentProps {
  draft: InvoiceDraft;
}

export function InvoiceDocument({ draft }: InvoiceDocumentProps) {
  const totals = computeTotals(draft);
  const color = draft.appearance.brandColor;
  const title = draft.invoiceType === "381" ? "Gutschrift" : "Rechnung";
  const reasons = [
    ...new Set(
      totals.taxBreakdown
        .map((bucket) => bucket.reason)
        .filter((reason): reason is string => !!reason),
    ),
  ];

  return (
    <article className={styles.doc}>
      <div className={styles.bar} style={{ background: color }} />
      <header className={styles.head}>
        <div>
          {draft.appearance.logoDataUrl ? (
            <img src={draft.appearance.logoDataUrl} alt="" className={styles.logo} />
          ) : null}
          <div className={styles.sellerName}>{draft.seller.name || "Absender"}</div>
          <div className={styles.muted}>
            {[draft.seller.address.street, draft.seller.address.postalCode, draft.seller.address.city]
              .filter(Boolean)
              .join(" ")}
          </div>
        </div>
        <div className={styles.headRight}>
          <div className={styles.kicker} style={{ color }}>
            {title}
          </div>
          <div className={styles.number}>{draft.invoiceNumber || "Entwurf"}</div>
        </div>
      </header>

      <section className={styles.parties}>
        <div>
          <div className={styles.label} style={{ color }}>
            Aussteller
          </div>
          <PartyLines
            lines={[
              draft.seller.name,
              draft.seller.contactName,
              draft.seller.address.street,
              `${draft.seller.address.postalCode} ${draft.seller.address.city}`.trim(),
              draft.seller.vatId ? `USt-IdNr. ${draft.seller.vatId}` : "",
              draft.seller.taxNumber ? `Steuernummer ${draft.seller.taxNumber}` : "",
              draft.seller.email,
              draft.seller.phone,
            ]}
          />
        </div>
        <div>
          <div className={styles.label} style={{ color }}>
            Empfänger
          </div>
          <PartyLines
            lines={[
              draft.buyer.name,
              draft.buyer.contactName,
              draft.buyer.address.street,
              `${draft.buyer.address.postalCode} ${draft.buyer.address.city}`.trim(),
              draft.buyer.vatId ? `USt-IdNr. ${draft.buyer.vatId}` : "",
              draft.buyer.customerNumber ? `Kundennummer ${draft.buyer.customerNumber}` : "",
              draft.buyer.email,
            ]}
          />
        </div>
      </section>

      <section className={styles.meta}>
        <Meta label="Rechnungsdatum" value={formatDateDe(draft.issueDate)} />
        <Meta label="Leistung" value={formatDateDe(draft.deliveryDate)} />
        <Meta label="Fällig" value={formatDateDe(draft.dueDate)} />
        <Meta label="Käuferreferenz" value={draft.buyerReference} />
      </section>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Pos</th>
            <th>Leistung</th>
            <th className={styles.num}>Menge</th>
            <th className={styles.num}>Preis</th>
            <th className={styles.num}>USt</th>
            <th className={styles.num}>Betrag</th>
          </tr>
        </thead>
        <tbody>
          {draft.lines.map((line, index) => (
            <tr key={line.id}>
              <td>{index + 1}</td>
              <td>
                {line.description || "—"}
                {line.articleNumber ? <span className={styles.article}> {line.articleNumber}</span> : null}
                {line.details.trim() ? <div className={styles.detail}>{line.details}</div> : null}
              </td>
              <td className={styles.num}>
                {formatQuantity(line.quantity || "0")} {unitLabel(line.unit)}
              </td>
              <td className={styles.num}>{formatMoney(parseMoneyInput(line.unitPrice) ?? 0)}</td>
              <td className={styles.num}>{totals.lines[index]?.rate ?? 0} %</td>
              <td className={styles.num}>{formatMoney(totals.lines[index]?.net ?? 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.totals}>
        <div>
          <span>Netto</span>
          <span>{formatMoney(totals.net)}</span>
        </div>
        {totals.taxBreakdown.map((bucket) => (
          <div key={`${bucket.category}-${bucket.rate}`}>
            <span>{bucket.rate ? `USt ${bucket.rate} %` : `USt ${bucket.category}`}</span>
            <span>{formatMoney(bucket.vat)}</span>
          </div>
        ))}
        <div className={styles.gross}>
          <span>Brutto</span>
          <span>{formatMoney(totals.gross)}</span>
        </div>
      </div>

      {reasons.length > 0 ? (
        <p className={styles.note}>{reasons.join(" ")}</p>
      ) : null}

      {draft.precedingInvoiceNumber ? (
        <p className={styles.note}>
          Berichtigt {draft.precedingInvoiceNumber}
          {draft.precedingInvoiceDate ? ` vom ${formatDateDe(draft.precedingInvoiceDate)}` : ""}.
        </p>
      ) : null}

      <section className={styles.payment}>
        <div className={styles.label} style={{ color }}>
          Zahlung
        </div>
        <div>SEPA-Überweisung · {draft.paymentTerms || "—"}</div>
        <div>Kontoinhaber {draft.accountHolder || draft.seller.name || "—"}</div>
        <div>IBAN {draft.iban || "—"}</div>
        <div className={styles.muted}>
          BIC {draft.bic || "—"} · Verwendungszweck {draft.invoiceNumber || "—"}
        </div>
      </section>
    </article>
  );
}

function PartyLines({ lines }: { lines: string[] }) {
  const visible = lines.map((line) => line.trim()).filter(Boolean);
  if (visible.length === 0) return <div>—</div>;
  return (
    <>
      {visible.map((line, index) => (
        <div key={`${line}-${index}`}>{line}</div>
      ))}
    </>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className={styles.metaLabel}>{label}</div>
      <div>{value || "—"}</div>
    </div>
  );
}
