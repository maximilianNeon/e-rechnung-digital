import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brand } from "../components/Brand";
import { InvoicePreview } from "../components/InvoicePreview";
import { Seo } from "../components/Seo";
import { downloadBytes, downloadText } from "../lib/download";
import type { InvoiceDraft } from "../lib/model";
import { decodeDraft } from "../lib/share";
import { canExport } from "../lib/validation";
import styles from "./Open.module.css";

/** Target of the links the hosted MCP server returns: /rechnung#v1.… */
export function SharedInvoicePage() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<InvoiceDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!window.location.hash) {
      setError("Dieser Link enthält keine Rechnung.");
      return;
    }
    decodeDraft(window.location.hash)
      .then(setDraft)
      .catch(() => setError("Der Link ist unvollständig oder beschädigt. Lass die Rechnung im Chat neu erstellen."));
  }, []);

  const download = async (kind: "pdf" | "xml") => {
    if (!draft) return;
    setBusy(true);
    setError(null);
    try {
      const { generateInvoiceFiles } = await import("../lib/generate");
      const result = await generateInvoiceFiles(draft);
      if (kind === "xml") downloadText(result.xml, `${result.fileBase}.xml`, "application/xml");
      else downloadBytes(result.pdf, `${result.fileBase}.pdf`, "application/pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erzeugen fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  };

  const valid = draft ? canExport(draft) : false;

  return (
    <div className={styles.page}>
      <Seo path="/rechnung" />
      <header className={styles.appBar}>
        <Brand size="sm" />
        <span className={styles.title}>Rechnung aus dem Chat</span>
        <Link to="/erstellen" className={styles.link}>
          Neue Rechnung
        </Link>
      </header>

      <div className={styles.body}>
        <div className={styles.panel}>
          <h1>Deine E-Rechnung</h1>
          <p className={styles.sub}>
            Erstellt von deinem KI-Assistenten. Die Dateien entstehen jetzt in diesem Browser – die
            Rechnungsdaten stehen nur im Link und werden nicht an unseren Server geschickt.
          </p>

          {error ? <div className={styles.error}>{error}</div> : null}

          {draft ? (
            <>
              <div className={styles.status}>
                <span className={valid ? styles.ok : styles.bad}>
                  {valid ? "Pflichtangaben vollständig." : "Unvollständig – bitte im Editor ergänzen."}
                </span>
              </div>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.primary}
                  disabled={busy || !valid}
                  onClick={() => void download("pdf")}
                >
                  ZUGFeRD-PDF laden
                </button>
                <button
                  type="button"
                  className={styles.secondary}
                  disabled={busy || !valid}
                  onClick={() => void download("xml")}
                >
                  XRechnung-XML laden
                </button>
              </div>
              <p className={styles.sub}>
                Die PDF ist für Kunden, die eine lesbare Rechnung möchten. Das XML ist für Behördenportale
                und Buchhaltungssoftware.
              </p>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.secondary}
                  onClick={() => navigate("/erstellen", { state: { draft, unknownFields: [] } })}
                >
                  Im Editor bearbeiten
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
