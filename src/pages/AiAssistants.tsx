import { Link } from "react-router-dom";
import { Seo } from "../components/Seo";
import styles from "./guides/Guide.module.css";

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
        Mit dem MCP-Server von E-RechnungDigital schreiben Claude, ChatGPT, Cursor und andere
        Assistenten deine E-Rechnung direkt im Chat. Lokal auf deinem Rechner, ohne Upload.
      </p>

      <section className={styles.answerBox} aria-labelledby="kurzantwort">
        <p className={styles.answerLabel}>SO SIEHT ES AUS</p>
        <h2 id="kurzantwort">Ein Satz, eine fertige Rechnung</h2>
        <p>
          „Schreib eine Rechnung an die Kunde GmbH, Hauptstraße 5, 80331 München: 5 Stunden
          Webdesign à 90 €, Bestellnummer PO-4711.“ Der Assistent nimmt deine gespeicherten
          Firmendaten, zählt die Rechnungsnummer hoch, prüft die Pflichtangaben und legt XML und
          ZUGFeRD-PDF in deinem Ordner ab.
        </p>
      </section>

      <article className={styles.article}>
        <section id="einrichten">
          <h2>Einrichten in Claude Desktop</h2>
          <p>
            Voraussetzung ist Node.js ab Version 20. Öffne in Claude Desktop Einstellungen →
            Entwickler → Konfiguration bearbeiten und trag den Server ein:
          </p>
          <pre className={styles.code}>{desktopConfig}</pre>
          <p>In Claude Code reicht ein Befehl:</p>
          <pre className={styles.code}>claude mcp add erechnung-digital -- npx -y erechnung-digital-mcp</pre>
          <p>
            Cursor, VS Code und Windsurf nutzen denselben Befehl als Server vom Typ stdio.
          </p>
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
          <h2>Privat wie im Browser</h2>
          <p>
            Der Server läuft auf deinem Rechner. Rechnungen und Firmendaten werden lokal gespeichert
            und nicht an E-RechnungDigital übertragen. Was du in den Chat schreibst, verarbeitet dein
            KI-Anbieter nach seinen eigenen Bedingungen.
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
