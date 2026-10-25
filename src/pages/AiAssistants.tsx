import { Link } from "react-router-dom";
import { Seo } from "../components/Seo";
import styles from "./guides/Guide.module.css";

const MCP_URL = "https://www.erechnungdigital.com/mcp";

const desktopConfig = `{
  "mcpServers": {
    "erechnung-digital": {
      "command": "npx",
      "args": ["-y", "erechnung-digital-mcp"]
    }
  }
}`;

const tools = [
  ["create_invoice", "E-Rechnung als XML und ZUGFeRD-PDF erzeugen, Pflichtangaben vorher prüfen"],
  ["save_seller_profile", "Eigene Firmendaten einmal speichern, danach reichen Kunde und Positionen"],
  ["read_invoice", "XRechnung oder ZUGFeRD-PDF lesen und als Daten zurückgeben"],
  ["check_invoice", "Vorhandene Datei auf Pflichtangaben und EN-16931-Regeln prüfen"],
  ["explain_rule", "Fehlercodes wie BR-DE-15 in einfachem Deutsch erklären"],
] as const;

export function AiAssistantsPage() {
  return (
    <main className={styles.page}>
      <Seo path="/ki-assistenten" />
      <p className={styles.eyebrow}>KI-ASSISTENTEN · MCP</p>
      <h1>E-Rechnung im KI-Chat erstellen</h1>
      <p className={styles.lead}>
        Mit E-RechnungDigital schreiben ChatGPT, Claude, Cursor und andere Assistenten deine
        E-Rechnung direkt im Chat: XRechnung und ZUGFeRD, mit geprüften Pflichtangaben.
      </p>

      <section className={styles.answerBox} aria-labelledby="kurzantwort">
        <p className={styles.answerLabel}>SO SIEHT ES AUS</p>
        <h2 id="kurzantwort">Ein Satz, eine fertige Rechnung</h2>
        <p>
          „Schreib eine Rechnung an die Kunde GmbH, Hauptstraße 5, 80331 München: 5 Stunden
          Webdesign à 90 €, Bestellnummer PO-4711.“ Der Assistent nimmt deine gespeicherten
          Firmendaten, prüft die Pflichtangaben und liefert XRechnung-XML und ZUGFeRD-PDF.
        </p>
      </section>

      <article className={styles.article}>
        <section id="claude-desktop">
          <h2>Claude Desktop: per Doppelklick</h2>
          <p>
            Lade die Erweiterung herunter und öffne die Datei. Claude Desktop installiert sie und fragt
            nach dem Ordner für deine Rechnungen. Alles läuft auf deinem Rechner, ohne weitere
            Installation.
          </p>
          <p>
            <a className={styles.cta} href="/downloads/erechnung-digital.mcpb" download>
              Erweiterung für Claude Desktop laden
            </a>
          </p>
        </section>

        <section id="chatgpt-claude">
          <h2>ChatGPT und Claude.ai: als Konnektor</h2>
          <p>
            Im Browser und am Handy verbindest du E-RechnungDigital über diese Adresse. Sie braucht kein
            Konto und keinen Schlüssel:
          </p>
          <pre className={styles.code}>{MCP_URL}</pre>
          <p>
            In Claude.ai unter Einstellungen → Konnektoren → Eigenen Konnektor hinzufügen. In ChatGPT
            unter Einstellungen → Apps (Entwicklermodus) bzw. später direkt im App-Verzeichnis. Der
            Assistent bekommt dann einen Link, über den du PDF und XML lädst. Die Dateien entstehen
            erst in deinem Browser.
          </p>
        </section>

        <section id="entwickler">
          <h2>Claude Code, Cursor, VS Code</h2>
          <p>Lokal als Programm, Voraussetzung ist Node.js ab Version 20:</p>
          <pre className={styles.code}>claude mcp add erechnung-digital -- npx -y erechnung-digital-mcp</pre>
          <p>Claude Desktop ohne Erweiterung nutzt dieselbe Konfiguration:</p>
          <pre className={styles.code}>{desktopConfig}</pre>
        </section>

        <section id="werkzeuge">
          <h2>Was der Assistent damit kann</h2>
          <ul>
            {tools.map(([name, text]) => (
              <li key={name}>
                <strong>{name}</strong>: {text}
              </li>
            ))}
          </ul>
        </section>

        <section id="datenschutz">
          <h2>Datenschutz</h2>
          <p>
            Lokal (Erweiterung, Claude Code, Cursor) bleiben Rechnungen und Firmendaten auf deinem
            Rechner. Über ChatGPT und Claude.ai prüft unser Server in Frankfurt die Angaben nur im
            Arbeitsspeicher und speichert nichts; die Rechnungsdaten stecken danach nur im Link. Was du
            in den Chat schreibst, verarbeitet dein KI-Anbieter nach seinen eigenen Bedingungen.{" "}
            <Link to="/datenschutz">Mehr in der Datenschutzerklärung</Link>.
          </p>
        </section>

        <section id="grenzen">
          <h2>Grenzen</h2>
          <p>
            Die Prüfung findet die häufigsten Ablehnungsgründe, ersetzt aber nicht den offiziellen
            Validator der KoSIT. Steuerliche Fragen, etwa zum richtigen Steuerfall, klärt deine
            Steuerberatung. Fehlercodes erklären die <Link to="/pruefregeln">Prüfregeln</Link>.
          </p>
        </section>

        <Link to="/erstellen" className={styles.cta}>
          Lieber im Browser erstellen
        </Link>
      </article>
    </main>
  );
}
