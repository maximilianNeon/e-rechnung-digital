import { Seo } from "../../components/Seo";
import styles from "./Legal.module.css";

export function ImpressumPage() {
  return (
    <main className={styles.page}>
      <Seo path="/impressum" />
      <p className={styles.eyebrow}>RECHTLICHES</p>
      <h1>Impressum</h1>
      <p className={styles.lead}>
        Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz) und § 18 Abs. 2 MStV (Medienstaatsvertrag).
      </p>

      <section className={styles.block}>
        <h2>ANBIETER</h2>
        <p>NEON Software Solutions GmbH</p>
        <p>Brunnenstraße 195</p>
        <p>10119 Berlin</p>
        <p>Deutschland</p>
      </section>

      <section className={styles.block}>
        <h2>KONTAKT (E-RECHNUNGDIGITAL)</h2>
        <p>Für Anfragen zum Werkzeug und dieser Website:</p>
        <p>
          E-Mail:{" "}
          <a href="mailto:info@erechnungdigital.com">info@erechnungdigital.com</a>
        </p>
        <p>
          Website:{" "}
          <a href="https://erechnungdigital.com" rel="noopener noreferrer">
            https://erechnungdigital.com
          </a>
        </p>
      </section>

      <section className={styles.block}>
        <h2>KONTAKT (RECHTLICH)</h2>
        <p>
          E-Mail: <a href="mailto:Max@neon.dev">Max@neon.dev</a>
        </p>
      </section>

      <section className={styles.block}>
        <h2>VERANTWORTLICH FÜR DEN INHALT</h2>
        <p>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:</p>
        <p>NEON Software Solutions GmbH</p>
        <p>Brunnenstraße 195</p>
        <p>10119 Berlin</p>
      </section>

      <section className={styles.block}>
        <h2>EU-STREITSCHLICHTUNG</h2>
        <p>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
          <a
            href="https://ec.europa.eu/consumers/odr/"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://ec.europa.eu/consumers/odr/
          </a>
        </p>
        <p>
          Unsere E-Mail-Adresse finden Sie oben im Impressum. Wir sind nicht bereit oder verpflichtet,
          an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </section>

      <section className={styles.block}>
        <h2>HAFTUNG FÜR INHALTE</h2>
        <p>
          Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen
          Gesetzen verantwortlich. Nach §§ 7 bis 10 DDG sind wir als Diensteanbieter jedoch nicht
          verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach
          Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
        </p>
        <p>
          Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den
          allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst
          ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden
          von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
        </p>
      </section>

      <section className={styles.block}>
        <h2>HAFTUNG FÜR LINKS</h2>
        <p>
          Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen
          Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
          Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der
          Seiten verantwortlich.
        </p>
        <p>
          Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße
          überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine
          permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete
          Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von
          Rechtsverletzungen werden wir derartige Links umgehend entfernen.
        </p>
      </section>

      <section className={styles.block}>
        <h2>URHEBERRECHT</h2>
        <p>
          Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem
          deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
          Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung
          des jeweiligen Autors bzw. Erstellers.
        </p>
        <p>
          Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch
          gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden
          die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche
          gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden,
          bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden
          wir derartige Inhalte umgehend entfernen.
        </p>
      </section>

      <section className={styles.block}>
        <h2>ÜBER E-RECHNUNGDIGITAL</h2>
        <p>
          E-RechnungDigital ist ein Browser-Werkzeug zum Erstellen, Öffnen und Prüfen von
          E-Rechnungen als XRechnung und ZUGFeRD. Die Rechnungsdaten entstehen lokal auf Ihrem Gerät.
          E-RechnungDigital ist kein Steuerberater, kein Rechtsanwalt und kein Archiv.
        </p>
      </section>

      <section className={styles.block}>
        <h2>MARKEN UND LOGOS</h2>
        <p>
          Alle auf dieser Website verwendeten Marken, Logos und Produktnamen sind Eigentum ihrer
          jeweiligen Inhaber. Die Nennung dieser Marken dient ausschließlich Informationszwecken und
          stellt keine Billigung oder Zugehörigkeit dar.
        </p>
      </section>
    </main>
  );
}
