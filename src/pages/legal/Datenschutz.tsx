import { Seo } from "../../components/Seo";
import styles from "./Legal.module.css";

export function DatenschutzPage() {
  return (
    <main className={styles.page}>
      <Seo path="/datenschutz" />
      <p className={styles.eyebrow}>RECHTLICHES</p>
      <h1>Datenschutz</h1>
      <p className={styles.lead}>
        Bei E-RechnungDigital nehmen wir Privatsphäre ernst. Diese Erklärung beschreibt, welche
        Informationen beim Besuch der Website und bei der Nutzung des Werkzeugs anfallen – und was
        lokal auf Ihrem Gerät bleibt.
      </p>
      <p className={styles.lead}>
        Kurzfassung: Rechnungsinhalte entstehen lokal im Browser. Es gibt kein Konto und keinen
        Upload Ihrer Belege an uns. Wir speichern Ihre Rechnungen nicht.
      </p>

      <section className={styles.block}>
        <h2>1. VERANTWORTLICHER</h2>
        <p>Verantwortlich im Sinne der DSGVO:</p>
        <p>NEON Software Solutions GmbH</p>
        <p>Brunnenstraße 195</p>
        <p>10119 Berlin</p>
        <p>Deutschland</p>
        <p>
          E-Mail:{" "}
          <a href="mailto:info@erechnungdigital.com">info@erechnungdigital.com</a>
        </p>
        <p>
          Rechtlich: <a href="mailto:Max@neon.dev">Max@neon.dev</a>
        </p>
      </section>

      <section className={styles.block}>
        <h2>2. RECHNUNGSDATEN (LOKAL)</h2>
        <p>
          Nummer, Beträge, Parteien, Positionen und Zahlungsangaben werden in Ihrem Browser
          verarbeitet. Sie verlassen Ihr Gerät nur, wenn Sie selbst eine Datei herunterladen oder
          weitergeben. Wir lesen diese Inhalte nicht und speichern sie nicht auf unseren Systemen.
        </p>
        <p>
          Rechtsgrundlage für die rein lokale Verarbeitung auf Ihrem Endgerät sind Sie selbst; uns
          gegenüber werden diese Daten nicht übermittelt.
        </p>
      </section>

      <section className={styles.block}>
        <h2>3. ABSENDERPROFIL AUF DIESEM GERÄT</h2>
        <p>
          Wenn Sie den Aussteller für die nächste Rechnung merken, speichert der Browser die Angaben
          lokal (localStorage) auf diesem Gerät. Käufer, Positionen und Rechnungsnummer werden dabei
          nicht dauerhaft gemerkt. Sie können das Profil jederzeit im Werkzeug löschen; damit
          entfällt die lokale Speicherung.
        </p>
        <p>Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an komfortabler Nutzung) bzw. Ihre Einwilligung durch die aktive Speicherung.</p>
      </section>

      <section className={styles.block}>
        <h2>4. KI-ASSISTENTEN (MCP-SERVER)</h2>
        <p>
          E-RechnungDigital lässt sich mit KI-Assistenten wie ChatGPT, Claude oder Cursor verbinden.
          Dafür gibt es zwei Wege, die sich beim Datenschutz unterscheiden.
        </p>
        <p>
          <strong>Lokal (Claude-Desktop-Erweiterung oder Programm „erechnung-digital-mcp“):</strong>{" "}
          Das Programm läuft vollständig auf Ihrem eigenen Rechner. Absenderprofil und erzeugte
          Rechnungen speichert es dort als Dateien. An uns werden keine Rechnungsdaten übertragen.
          Beim Herunterladen über die Paketverwaltung npm (npm, Inc., ein Unternehmen von GitHub)
          verarbeitet npm technisch übliche Zugriffsdaten wie die IP-Adresse nach seinen eigenen
          Bestimmungen.
        </p>
        <p>
          <strong>Gehostet (Verbindung unter https://www.erechnungdigital.com/mcp):</strong> Wenn Sie
          E-RechnungDigital als App oder Konnektor in ChatGPT oder Claude.ai nutzen, schickt der
          Anbieter des Assistenten die Rechnungsangaben aus dem Gespräch an unseren Server. Das sind
          Absender- und Empfängerdaten, Positionen, Beträge und Bankverbindung. Der Server prüft die
          Angaben und gibt einen Link zurück. Die Verarbeitung findet nur im Arbeitsspeicher statt, in
          einem Rechenzentrum von Vercel Inc. in Frankfurt am Main. Wir speichern die Rechnungsdaten
          nicht und schreiben sie nicht in Protokolle. Es fallen nur die unter Punkt 5 beschriebenen
          technischen Zugriffsdaten an. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Bereitstellung
          der von Ihnen angeforderten Funktion).
        </p>
        <p>
          Der zurückgegebene Link enthält die Rechnungsdaten im Teil hinter dem Zeichen „#“. Diesen Teil
          sendet Ihr Browser nicht an unseren Server; PDF und XML entstehen beim Öffnen in Ihrem
          Browser. Wer den Link erhält, kann die Rechnung sehen. Geben Sie ihn deshalb nur bewusst
          weiter.
        </p>
        <p>
          Was Sie in den Chat eingeben und was der Assistent aus den Werkzeugen zurückbekommt,
          verarbeitet der Anbieter des jeweiligen KI-Assistenten (z. B. OpenAI oder Anthropic) nach
          seinen eigenen Datenschutzbestimmungen. Darauf haben wir keinen Einfluss.
        </p>
      </section>

      <section className={styles.block}>
        <h2>5. HOSTING UND SERVERPROTOKOLLE</h2>
        <p>
          Die Website wird über einen Hosting-Anbieter bereitgestellt (derzeit Vercel Inc.). Beim
          Aufruf entstehen technisch übliche Zugriffsdaten, etwa IP-Adresse, Zeitpunkt, aufgerufene
          URL, Referrer und Browsertyp. Das ist für Betrieb, Sicherheit und Fehleranalyse
          erforderlich.
        </p>
        <p>
          Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse am sicheren Betrieb der
          Website). Protokolle werden nicht für Werbeprofile genutzt und nur so lange aufbewahrt, wie
          es für die genannten Zwecke nötig ist.
        </p>
        <p>
          Mit dem Hosting kann eine Verarbeitung in den USA oder anderen Drittländern verbunden sein.
          Soweit einschlägig, stützt sich die Übermittlung auf geeignete Garantien des Anbieters
          (z. B. Standardvertragsklauseln).
        </p>
      </section>

      <section className={styles.block}>
        <h2>6. KEINE ANALYSE, KEINE WERBE-COOKIES</h2>
        <p>
          Wir setzen keine Reichweitenmessung, kein Tracking und keine Werbung ein. Schriften und
          Anwendungslogik werden mit der Website ausgeliefert. Cookies, die nicht für den technischen
          Betrieb nötig sind, setzen wir nicht. Deshalb gibt es kein Einwilligungsbanner für
          Marketing-Cookies.
        </p>
      </section>

      <section className={styles.block}>
        <h2>7. KONTAKT PER E-MAIL</h2>
        <p>
          Wenn Sie uns schreiben, verarbeiten wir die von Ihnen mitgeteilten Daten (z. B. E-Mail und
          Nachrichtentext), um Ihre Anfrage zu beantworten. Rechtsgrundlage: Art. 6 Abs. 1 lit. b
          bzw. lit. f DSGVO.
        </p>
      </section>

      <section className={styles.block}>
        <h2>8. SPEICHERDAUER</h2>
        <p>
          Serverprotokolle und Korrespondenz speichern wir nur so lange, wie es für Betrieb,
          Sicherheit oder die Bearbeitung Ihrer Anfrage erforderlich ist bzw. gesetzliche
          Aufbewahrungspflichten bestehen. Lokale Daten auf Ihrem Gerät steuern Sie selbst.
        </p>
      </section>

      <section className={styles.block}>
        <h2>9. IHRE RECHTE</h2>
        <p>Sie haben nach der DSGVO insbesondere das Recht auf:</p>
        <ul>
          <li>Auskunft über die bei uns gespeicherten personenbezogenen Daten</li>
          <li>Berichtigung unrichtiger Daten</li>
          <li>Löschung</li>
          <li>Einschränkung der Verarbeitung</li>
          <li>Widerspruch gegen Verarbeitungen auf Basis berechtigter Interessen</li>
          <li>Datenübertragbarkeit, soweit anwendbar</li>
          <li>Beschwerde bei einer Datenschutzaufsichtsbehörde</li>
        </ul>
        <p>
          Weil Rechnungsinhalte uns nicht erreichen, betrifft eine Auskunft vor allem
          Serverprotokolle und Nachrichten, die Sie uns senden. Zur Ausübung Ihrer Rechte genügt eine
          E-Mail an{" "}
          <a href="mailto:info@erechnungdigital.com">info@erechnungdigital.com</a>.
        </p>
      </section>

      <section className={styles.block}>
        <h2>10. SICHERHEIT</h2>
        <p>
          Wir treffen angemessene technische und organisatorische Maßnahmen, unter anderem Transport
          per HTTPS. Eine absolute Sicherheit bei der Übertragung über das Internet können wir nicht
          garantieren.
        </p>
      </section>

      <section className={styles.block}>
        <h2>11. ÄNDERUNGEN</h2>
        <p>
          Wir können diese Datenschutzerklärung anpassen, etwa wenn sich Funktionen oder Hosting
          ändern. Die aktuelle Fassung finden Sie stets auf dieser Seite.
        </p>
        <p>Stand: 25. Oktober 2026</p>
      </section>
    </main>
  );
}
