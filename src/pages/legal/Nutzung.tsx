import { Seo } from "../../components/Seo";
import styles from "./Legal.module.css";

export function NutzungPage() {
  return (
    <main className={styles.page}>
      <Seo path="/nutzung" />
      <p className={styles.eyebrow}>RECHTLICHES</p>
      <h1>Nutzung</h1>
      <p className={styles.lead}>
        Kurze Regeln für das Werkzeug. Vor der Veröffentlichung prüft das jemand, der das darf. Das
        hier ist die Fassung für die Seite, nicht der unterschriebene Vertrag.
      </p>

      <section className={styles.block}>
        <h2>WAS E-RECHNUNGDIGITAL TUT</h2>
        <p>
          Du erstellst, öffnest und prüfst eine E-Rechnung nach XRechnung und ZUGFeRD in deinem
          Browser. E-RechnungDigital ist kein Archiv, kein Mahnwesen und keine Buchhaltung.
        </p>
      </section>

      <section className={styles.block}>
        <h2>WAS BEI DIR BLEIBT</h2>
        <p>
          Die Datei lädst du herunter. Damit ist der Vorgang bei uns zu Ende. Aufbewahren, meist
          über Jahre, ist deine Aufgabe. Ob der Beleg vollständig ist, prüfst du, bevor du ihn
          verschickst.
        </p>
      </section>

      <section className={styles.block}>
        <h2>WAS WIR NICHT ZUSAGEN</h2>
        <p>
          Ein Portal, eine Behörde oder ein Kunde kann eine Datei ablehnen. Dafür gibt es keine
          Garantie auf Annahme. Haftung bleibt im gesetzlichen Rahmen. E-RechnungDigital ersetzt
          keine Steuer- und keine Rechtsberatung.
        </p>
        <p className={styles.placeholder}>
          [Es gilt deutsches Recht. Einen Gerichtsstand trägst du ein, wenn du ihn als Unternehmer
          wirksam vereinbaren kannst.]
        </p>
      </section>
    </main>
  );
}
