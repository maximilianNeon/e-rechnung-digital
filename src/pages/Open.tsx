import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brand } from "../components/Brand";
import { InvoicePreview } from "../components/InvoicePreview";
import { Seo } from "../components/Seo";
import type { InvoiceDraft } from "../lib/model";
import { applyEditMode } from "../lib/editMode";
import { canExport } from "../lib/validation";
import styles from "./Open.module.css";

export function OpenPage() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<InvoiceDraft | null>(null);
  const [unknownFields, setUnknownFields] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"keep" | "correct">("keep");
  const [dragging, setDragging] = useState(false);

  const onFile = async (file: File | null) => {
    if (!file) return;
    setError(null);
    try {
      const { parseInvoiceFile } = await import("../lib/parse");
      const result = await parseInvoiceFile(file);
      setDraft(result.draft);
      setUnknownFields(result.unknownFields);
      setWarnings(result.warnings);
    } catch (err) {
      setDraft(null);
      setError(err instanceof Error ? err.message : "Datei konnte nicht gelesen werden.");
    }
  };

  const continueEdit = () => {
    if (!draft) return;
    const next = applyEditMode(draft, mode);
    navigate("/erstellen", { state: { draft: next, unknownFields } });
  };

  const valid = draft ? canExport(draft) : false;

  return (
    <div className={styles.page}>
      <Seo path="/oeffnen" />
      <header className={styles.appBar}>
        <Brand size="sm" />
        <span className={styles.title}>Rechnung öffnen</span>
        <Link to="/erstellen" className={styles.link}>
          Neue Rechnung
        </Link>
      </header>

      <div className={styles.body}>
        <div className={styles.panel}>
          <h1>Rechnung öffnen</h1>
          <p className={styles.sub}>
            XML oder ZUGFeRD-PDF. Die Datei wird nur in diesem Browser gelesen.
          </p>

          <label
            className={`${styles.drop} ${dragging ? styles.dragging : ""}`}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.currentTarget.querySelector("input")?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              void onFile(e.dataTransfer.files?.[0] ?? null);
            }}
          >
            <span className={styles.dropIcon} aria-hidden>
              <svg viewBox="0 0 24 24">
                <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v5h14v-5" />
              </svg>
            </span>
            <strong>Rechnung hierher ziehen</strong>
            <span>oder auswählen · XML, PDF</span>
            <input
              type="file"
              accept=".xml,.pdf,application/pdf,text/xml,application/xml"
              hidden
              onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
            />
          </label>

          {error ? <div className={styles.error}>{error}</div> : null}
          {warnings.map((w) => (
            <div key={w} className={styles.warn}>
              {w}
            </div>
          ))}
          {unknownFields.length > 0 ? (
            <div className={styles.warn}>
              Vor dem Bearbeiten beachten: {unknownFields.join(", ")} werden nicht übernommen.
            </div>
          ) : null}

          {draft ? (
            <>
              <div className={styles.status}>
                <span className={valid ? styles.ok : styles.bad}>{valid ? "Gültig." : "Unvollständig."}</span>
                <ul>
                  <li>Käuferreferenz {draft.buyerReference ? "vorhanden" : "fehlt"}</li>
                  <li>Umsatzsteuer {draft.seller.vatId || draft.seller.taxNumber ? "vorhanden" : "fehlt"}</li>
                  <li>IBAN {draft.iban ? "vorhanden" : "fehlt"}</li>
                </ul>
              </div>

              <fieldset className={styles.choice}>
                <legend>Wie soll die Rechnung weitergehen?</legend>
                <label>
                  <input
                    type="radio"
                    name="mode"
                    checked={mode === "keep"}
                    onChange={() => setMode("keep")}
                  />
                  <span>
                    <strong>Noch nicht verschickt</strong>
                    <em>Nummer und Datum bleiben.</em>
                  </span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="mode"
                    checked={mode === "correct"}
                    onChange={() => setMode("correct")}
                  />
                  <span>
                    <strong>Schon verschickt</strong>
                    <em>Neue Nummer, Verweis auf die alte Rechnung.</em>
                  </span>
                </label>
              </fieldset>

              <div className={styles.actions}>
                <button type="button" className={styles.primary} onClick={continueEdit}>
                  Bearbeiten
                </button>
              </div>
            </>
          ) : null}
        </div>

        <aside className={styles.preview}>
          {draft ? <InvoicePreview draft={draft} badge={valid ? "Gültig" : "Entwurf"} /> : null}
        </aside>
      </div>
    </div>
  );
}
