import { Seo } from "../../components/Seo";
import styles from "./Legal.module.css";

export function NutzungPage() {
  return (
    <main className={styles.page}>
      <Seo path="/nutzung" />
      <p className={styles.eyebrow}>RECHTLICHES</p>
      <h1>Nutzung</h1>
      <p className={styles.lead}>
        Mit dem Zugriff auf E-RechnungDigital und der Nutzung des Werkzeugs gelten diese
        Nutzungsbedingungen sowie unsere Datenschutzerklärung. Wenn Sie nicht einverstanden sind,
        nutzen Sie das Angebot bitte nicht.
      </p>

      <section className={styles.block}>
        <h2>1. LEISTUNGSBESCHREIBUNG</h2>
        <p>E-RechnungDigital ist ein Browser-Werkzeug, mit dem Sie:</p>
        <ul>
          <li>E-Rechnungen als XRechnung (strukturiertes XML) erstellen können</li>
          <li>ZUGFeRD-PDFs mit eingebettetem XML erzeugen können</li>
          <li>vorhandene XML- oder ZUGFeRD-Dateien öffnen und weiterbearbeiten können</li>
          <li>Pflichtfelder und gängige Formate technisch prüfen können</li>
        </ul>
        <p>
          Das Angebot befindet sich in aktiver Weiterentwicklung. Funktionen können hinzukommen,
          geändert oder entfernt werden.
        </p>
      </section>

      <section className={styles.block}>
        <h2>2. KEIN KONTO, LOKALE VERARBEITUNG</h2>
        <p>
          Für die Kernfunktionen brauchen Sie kein Konto. Rechnungsdaten entstehen lokal in Ihrem
          Browser. Der Download ist der Ausgang der Datei. Aufbewahrung, Versand und Archivierung
          liegen bei Ihnen.
        </p>
      </section>

      <section className={styles.block}>
        <h2>3. KEINE STEUER- ODER RECHTSBERATUNG</h2>
        <p>
          E-RechnungDigital ist kein Steuerberater und kein Rechtsanwalt. Hinweise zu Pflicht und
          Formaten dienen der Orientierung und ersetzen keine individuelle Beratung. Ob eine
          Rechnung materiell und formal vollständig ist, prüfen Sie vor dem Versand selbst.
        </p>
      </section>

      <section className={styles.block}>
        <h2>4. KEINE GARANTIE AUF ANNAHME</h2>
        <p>
          Portale, Behörden, Kunden oder Software Dritter können eine Datei ablehnen. Wir
          garantieren nicht, dass jeder Empfänger jede erzeugte Datei akzeptiert. Formatprüfungen im
          Werkzeug ersetzen keine Abnahme durch den Empfänger.
        </p>
      </section>

      <section className={styles.block}>
        <h2>5. IHRE VERANTWORTUNG</h2>
        <p>Sie sind allein dafür verantwortlich:</p>
        <ul>
          <li>richtige und vollständige Angaben in der Rechnung</li>
          <li>rechtmäßige Nutzung und Weitergabe der erzeugten Dateien</li>
          <li>Aufbewahrung nach den für Sie geltenden Vorschriften</li>
          <li>eigene Sicherungskopien Ihrer Daten und Downloads</li>
        </ul>
      </section>

      <section className={styles.block}>
        <h2>6. NUTZUNGSRECHT</h2>
        <p>
          Wir gewähren Ihnen ein einfaches, nicht übertragbares, widerrufliches Recht, E-RechnungDigital
          im Rahmen dieser Bedingungen zu nutzen. Sie dürfen die Anwendung nicht kopieren,
          reverse engineeren, missbräuchlich einsetzen oder Rechte Dritter verletzen.
        </p>
      </section>

      <section className={styles.block}>
        <h2>7. GEISTIGES EIGENTUM</h2>
        <p>
          E-RechnungDigital einschließlich Design, Texte und Software unterliegt dem Urheberrecht und
          sonstigen Schutzrechten. Alle nicht ausdrücklich eingeräumten Rechte bleiben vorbehalten.
          Die von Ihnen erzeugten Rechnungsdateien und deren Inhalt bleiben Ihre Sache; wir erheben
          keinen Anspruch darauf.
        </p>
      </section>

      <section className={styles.block}>
        <h2>8. HAFTUNGSAUSSCHLUSS</h2>
        <p>
          Das Werkzeug wird „wie besehen“ bereitgestellt. Wir übernehmen keine Gewähr dafür, dass es
          fehlerfrei, ununterbrochen oder für Ihren konkreten Anwendungsfall geeignet ist. Zwingende
          gesetzliche Gewährleistungsrechte bleiben unberührt.
        </p>
        <p>
          Soweit gesetzlich zulässig, haften wir nicht für mittelbare Schäden, entgangenen Gewinn,
          Datenverlust oder Ablehnung durch Empfängerportale. Die Haftung für Vorsatz, grobe
          Fahrlässigkeit sowie Verletzung von Leben, Körper oder Gesundheit bleibt unberührt, soweit
          eine Beschränkung gesetzlich unzulässig ist.
        </p>
      </section>

      <section className={styles.block}>
        <h2>9. ÄNDERUNGEN</h2>
        <p>
          Wir können diese Nutzungsbedingungen anpassen. Die aktuelle Fassung gilt ab Veröffentlichung
          auf dieser Seite. Die fortgesetzte Nutzung nach einer Änderung gilt als Zustimmung, soweit
          das gesetzlich zulässig ist.
        </p>
      </section>

      <section className={styles.block}>
        <h2>10. RECHT UND STREITBEILEGUNG</h2>
        <p>
          Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss der Kollisionsnormen. Für
          Verbraucher bleiben zwingende Schutzvorschriften ihres Aufenthaltsstaats unberührt.
        </p>
        <p>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung bereit:{" "}
          <a
            href="https://ec.europa.eu/consumers/odr/"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://ec.europa.eu/consumers/odr/
          </a>
          . Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </section>

      <section className={styles.block}>
        <h2>11. KONTAKT</h2>
        <p>
          Fragen zu diesen Nutzungsbedingungen:{" "}
          <a href="mailto:info@erechnungdigital.com">info@erechnungdigital.com</a>
        </p>
        <p>Stand: 20. Oktober 2026</p>
      </section>
    </main>
  );
}
