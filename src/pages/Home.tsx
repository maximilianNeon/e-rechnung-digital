import { Link } from "react-router-dom";
import { InvoicePreview } from "../components/InvoicePreview";
import { Seo } from "../components/Seo";
import { createEmptyDraft } from "../lib/model";
import styles from "./Home.module.css";

const sample = (() => {
  const d = createEmptyDraft();
  d.invoiceNumber = "RE-2026-014";
  d.issueDate = "2026-10-20";
  d.deliveryDate = "2026-10-18";
  d.dueDate = "2026-11-03";
  d.buyerReference = "Projekt Helder";
  d.seller = {
    name: "Atelier Nord GmbH",
    address: { street: "Hafenstraße 12", postalCode: "20457", city: "Hamburg", country: "DE" },
    vatId: "DE123456789",
    taxNumber: "12/345/67890",
    email: "lena@atelier-nord.de",
    phone: "+49 40 123456",
    contactName: "Lena Hartung",
    customerNumber: "",
  };
  d.buyer = {
    name: "Studio Helder",
    address: { street: "Schulterblatt 88", postalCode: "20357", city: "Hamburg", country: "DE" },
    vatId: "DE987654321",
    taxNumber: "",
    email: "rechnung@studio-helder.de",
    phone: "",
    contactName: "Mara Helder",
    customerNumber: "K-220",
  };
  d.lines = [
    {
      id: "1",
      description: "Konzeption",
      details: "Workshop, Zielbild und Ablauf",
      quantity: "12",
      unit: "HUR",
      unitPrice: "95,00",
      taxCase: "standard19",
      articleNumber: "KON-01",
    },
    {
      id: "2",
      description: "Gestaltung",
      details: "",
      quantity: "8",
      unit: "HUR",
      unitPrice: "110,00",
      taxCase: "standard19",
      articleNumber: "GES-01",
    },
  ];
  d.iban = "DE89 3704 0044 0532 0130 00";
  d.bic = "COBADEFFXXX";
  return d;
})();

export function HomePage() {
  return (
    <main>
      <Seo path="/" />
      <div className={styles.notice}>
        <span className={styles.liveDot} />
        <span>E-Rechnungspflicht: Was 2027 und 2028 gilt</span>
        <Link to="/ratgeber/pflicht-2027">Zeitplan ansehen →</Link>
      </div>
      <section className={styles.hero}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>E-RECHNUNG · PRIVATSPHÄRE BY DESIGN</p>
          <h1 className={styles.headline}>Die Rechnung bleibt bei dir.</h1>
          <p className={styles.sub}>
            Erstellen, lesen, bearbeiten und prüfen. XRechnung und ZUGFeRD entstehen lokal auf
            deinem Gerät – ohne Konto und ohne zentrale Speicherung.
          </p>
          <div className={styles.actions}>
            <Link to="/erstellen" className={styles.primary}>
              Rechnung erstellen
            </Link>
            <Link to="/oeffnen" className={styles.secondary}>
              Rechnung öffnen
            </Link>
          </div>
          <div className={styles.trust}>
            <span>XRechnung 3.0.2</span>
            <span className={styles.dot} />
            <span>ZUGFeRD 2.5.2</span>
            <span className={styles.dot} />
            <span>Ohne Konto</span>
          </div>
        </div>
        <div className={styles.preview}>
          <div className={`${styles.formatChip} ${styles.xmlChip}`}>XRechnung · XML</div>
          <div className={`${styles.formatChip} ${styles.pdfChip}`}>ZUGFeRD · PDF/A-3</div>
          <InvoicePreview draft={sample} badge="Gültig" />
          <div className={styles.localChip}>
            <span className={styles.localIcon}>✓</span>
            Privatsphäre by Design
          </div>
        </div>
      </section>

      <section className={styles.deadlines}>
        <div className={styles.deadlineIntro}>
          <p className={styles.stepsLabel}>DIE UMSTELLUNG LÄUFT</p>
          <h2>Ein Zeitplan. Drei klare Termine.</h2>
          <Link to="/ratgeber/pflicht-2027">Gesetzeslage im Detail →</Link>
        </div>
        <div className={styles.timeline}>
          <div className={styles.timelineItem}>
            <span className={styles.year}>2025</span>
            <strong>Empfangen</strong>
            <p>Inländische Unternehmen müssen E-Rechnungen empfangen können.</p>
          </div>
          <div className={`${styles.timelineItem} ${styles.timelineCurrent}`}>
            <span className={styles.year}>2027</span>
            <strong>Große Aussteller</strong>
            <p>Über 800.000 € Vorjahresumsatz endet die Übergangsfrist.</p>
          </div>
          <div className={styles.timelineItem}>
            <span className={styles.year}>2028</span>
            <strong>Regelfall B2B</strong>
            <p>Die Übergangsfristen enden. Gesetzliche Ausnahmen bleiben.</p>
          </div>
        </div>
      </section>

      <section className={styles.steps}>
        <div className={styles.stepsIntro}>
          <p className={styles.stepsLabel}>VOM ENTWURF ZUR E-RECHNUNG</p>
          <h2>Einmal ausfüllen.<br />Zweimal mitnehmen.</h2>
          <p>
            Kein Assistent, der dich durch zehn Seiten schickt. Formular und Rechnung bleiben
            nebeneinander – bis alles stimmt.
          </p>
          <Link to="/erstellen" className={styles.stepsLink}>
            Rechnung erstellen <span aria-hidden>↗</span>
          </Link>
        </div>
        <div className={styles.workflow}>
          <div className={styles.workflowItem}>
            <span className={styles.workflowMark} aria-hidden>
              <svg viewBox="0 0 24 24">
                <path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5" />
              </svg>
            </span>
            <div>
              <p className={styles.workflowEyebrow}>Eingabe</p>
              <h3>Alles bleibt im Blick</h3>
              <p>Angaben links, fertiger Beleg rechts. Jede Änderung erscheint sofort.</p>
            </div>
          </div>
          <div className={styles.workflowItem}>
            <span className={styles.workflowMark} aria-hidden>
              <svg viewBox="0 0 24 24">
                <path d="m5 12 4 4L19 6" />
              </svg>
            </span>
            <div>
              <p className={styles.workflowEyebrow}>Prüfung</p>
              <h3>Fehler dort, wo sie entstehen</h3>
              <p>Pflichtfelder, IBAN und Steuerangaben werden direkt am Feld geprüft.</p>
            </div>
          </div>
          <div className={`${styles.workflowItem} ${styles.workflowOutput}`}>
            <span className={styles.workflowMark} aria-hidden>
              <svg viewBox="0 0 24 24">
                <path d="M12 3v12m0 0 5-5m-5 5-5-5M5 20h14" />
              </svg>
            </span>
            <div>
              <p className={styles.workflowEyebrow}>Ausgabe</p>
              <h3>Zwei Formate, ein Inhalt</h3>
              <p>Die strukturierte E-Rechnung und das lesbare PDF sind gemeinsam fertig.</p>
              <div className={styles.outputFiles}>
                <span><b>XML</b> XRechnung</span>
                <span><b>PDF</b> ZUGFeRD</span>
              </div>
            </div>
          </div>
        </div>
        <p className={styles.privacy}>
          <span className={styles.dot} />
          Privatsphäre by Design: die Rechnung entsteht lokal, du behältst die Kontrolle.
        </p>
      </section>
    </main>
  );
}
