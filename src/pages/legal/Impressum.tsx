import { Seo } from "../../components/Seo";
import styles from "./Legal.module.css";

export function ImpressumPage() {
  return (
    <main className={styles.page}>
      <Seo path="/impressum" />
      <p className={styles.eyebrow}>RECHTLICHES</p>
      <h1>Impressum</h1>
      <p className={styles.lead}>
        Angaben nach § 5 DDG. Alles in Klammern ersetzt du vor dem Start durch deine eigenen Daten.
        Das ist die Struktur, kein fertiges Gutachten.
      </p>

      <section className={styles.block}>
        <h2>ANBIETER</h2>
        <p className={styles.placeholder}>[Name und Rechtsform]</p>
        <p className={styles.placeholder}>[Straße und Hausnummer]</p>
        <p className={styles.placeholder}>[PLZ und Ort, Deutschland]</p>
      </section>

      <section className={styles.block}>
        <h2>KONTAKT</h2>
        <p className={styles.placeholder}>[E-Mail]</p>
        <p className={styles.placeholder}>[Telefon, schnelle Kontaktaufnahme]</p>
      </section>

      <section className={styles.block}>
        <h2>REGISTER UND STEUER</h2>
        <p className={styles.placeholder}>[Registergericht und Nummer, falls vorhanden]</p>
        <p className={styles.placeholder}>
          [USt-IdNr. nach § 27a UStG, oder der Hinweis als Kleinunternehmer]
        </p>
      </section>

      <section className={styles.block}>
        <h2>VERANTWORTLICH FÜR DEN INHALT</h2>
        <p>Nach § 18 Abs. 2 MStV, für die redaktionellen Seiten.</p>
        <p className={styles.placeholder}>[Name und Anschrift]</p>
      </section>

      <section className={styles.block}>
        <h2>STREITBEILEGUNG</h2>
        <p>
          Wir sind nicht verpflichtet, an einem Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen, und tun das auch nicht. § 36 VSBG. Diesen Satz
          bestätigst du, bevor die Seite online geht.
        </p>
      </section>

      <section className={styles.block}>
        <h2>BARRIEREFREIHEIT</h2>
        <p>
          Wenn E-RechnungDigital sich an Verbraucher richtet, gehört hier die Erklärung nach dem
          Barrierefreiheitsstärkungsgesetz hin. Richtet sich das Angebot nur an Unternehmen, sagst
          du das hier in einem Satz.
        </p>
      </section>

      <section className={styles.block}>
        <h2>KEIN RAT</h2>
        <p>
          E-RechnungDigital ist kein Steuerberater und kein Rechtsanwalt. Die Rechnung entsteht in
          deinem Browser. Ob sie vollständig ist und wie lange du sie aufbewahrst, bleibt deine
          Sache.
        </p>
      </section>
    </main>
  );
}
