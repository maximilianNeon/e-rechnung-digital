import { Seo } from "../../components/Seo";
import styles from "./Legal.module.css";

export function DatenschutzPage() {
  return (
    <main className={styles.page}>
      <Seo path="/datenschutz" />
      <p className={styles.eyebrow}>RECHTLICHES</p>
      <h1>Datenschutz</h1>
      <p className={styles.lead}>
        Die Rechnung sehen wir nicht. Unten steht, was trotzdem anfällt, sobald die Website
        erreichbar ist.
      </p>

      <section className={styles.block}>
        <h2>VERANTWORTLICH</h2>
        <p className={styles.placeholder}>
          [Dieselben Angaben wie im Impressum: Name, Anschrift, E-Mail]
        </p>
      </section>

      <section className={styles.block}>
        <h2>DIE RECHNUNG</h2>
        <p>
          Nummer, Beträge, Käufer und Positionen entstehen in deinem Browser und verlassen ihn nur
          als Datei, die du selbst herunterlädst. Es gibt kein Konto. Ein Server von uns liest den
          Beleg nicht und speichert ihn nicht.
        </p>
      </section>

      <section className={styles.block}>
        <h2>ABSENDER AUF DIESEM GERÄT</h2>
        <p>
          Wenn du den Aussteller merkst, liegt das nur lokal in diesem Browser. Käufer, Positionen
          und Rechnungsnummer werden nicht gemerkt. Löschen entfernt das Profil von diesem Gerät.
        </p>
      </section>

      <section className={styles.block}>
        <h2>SERVERPROTOKOLL</h2>
        <p>
          Der Hoster sieht technisch, was jede Website sieht: IP-Adresse, Zeitpunkt, aufgerufene
          Seite, Browsertyp. Das braucht der Betrieb. Rechtsgrundlage ist das berechtigte Interesse,
          Art. 6 Abs. 1 lit. f DSGVO. Die Protokolle werden kurz gehalten und nicht für Profile
          genutzt.
        </p>
        <p className={styles.placeholder}>[Name und Sitz des Hosters einsetzen]</p>
      </section>

      <section className={styles.block}>
        <h2>KEINE ANALYSE, KEINE COOKIES</h2>
        <p>
          Keine Reichweitenmessung, keine Werbung, keine Schriften von einem fremden Server.
          Cookies, die nicht für den Betrieb nötig sind, setzen wir nicht. Deshalb gibt es kein
          Einwilligungsfenster.
        </p>
      </section>

      <section className={styles.block}>
        <h2>DEINE RECHTE</h2>
        <p>
          Auskunft, Berichtigung, Löschung, Einschränkung, Widerspruch, und Beschwerde bei der
          Aufsichtsbehörde deines Bundeslands. Weil der Rechnungsinhalt uns nicht erreicht, betrifft
          eine Auskunft vor allem das Serverprotokoll und Nachrichten, die du uns schreibst.
        </p>
        <p className={styles.placeholder}>Stand: Oktober 2026</p>
      </section>
    </main>
  );
}
