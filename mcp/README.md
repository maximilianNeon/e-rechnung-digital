# E-RechnungDigital MCP-Server

E-Rechnungen direkt im KI-Chat erstellen, lesen und prüfen: in Claude, ChatGPT, Cursor, VS Code und jedem anderen Client mit MCP-Unterstützung.

- **E-Rechnung erstellen**: XRechnung 3.0 (CII-XML) und ZUGFeRD-PDF
- **Lesen und prüfen** von XRechnung- und ZUGFeRD-Dateien
- **Fehlercodes erklären**, etwa BR-DE-15 oder BR-CO-10
- **Lokal**: Rechnungsdaten verlassen den Rechner nicht

Beispiel im Chat:

> Schreib eine Rechnung an die Kunde GmbH, Hauptstraße 5, 80331 München: 5 Stunden Webdesign à 90 €, Bestellnummer PO-4711.

## Installation

Voraussetzung: Node.js 20 oder neuer.

### Claude Desktop

In `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "erechnung-digital": {
      "command": "npx",
      "args": ["-y", "erechnung-digital-mcp"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add erechnung-digital -- npx -y erechnung-digital-mcp
```

### Cursor, VS Code, Windsurf

Server vom Typ `stdio` mit dem Befehl `npx -y erechnung-digital-mcp` eintragen.

## Tools

| Tool | Zweck |
| --- | --- |
| `get_seller_profile` | Gespeicherte eigene Firmendaten lesen |
| `save_seller_profile` | Firmendaten einmal speichern, danach reichen Kunde und Positionen |
| `create_invoice` | XRechnung-XML und ZUGFeRD-PDF erzeugen, Pflichtangaben vorher prüfen |
| `read_invoice` | XML oder ZUGFeRD-PDF als strukturierte Daten lesen |
| `check_invoice` | Datei auf Pflichtangaben und EN-16931-Regeln prüfen |
| `explain_rule` | Prüfregel in einfachem Deutsch erklären |

## Speicherorte

| Was | Standard | Ändern mit |
| --- | --- | --- |
| Absenderprofil | `~/.erechnung-digital/profile.json` | `ERECHNUNG_HOME` |
| Erzeugte Rechnungen | `~/E-Rechnungen` | `ERECHNUNG_OUTPUT_DIR` oder Parameter `outputDir` |

## Skill

Unter `skill/e-rechnung/SKILL.md` liegt ein Agent Skill. Er beschreibt den Ablauf: welche Angaben abgefragt werden und welcher Steuerfall wann gilt. In Claude unter Einstellungen → Skills hochladen.

## Grenzen

`check_invoice` findet die häufigsten Ablehnungsgründe, ersetzt aber nicht den offiziellen KoSIT-Validator. Ob ein Portal eine Datei annimmt, hängt vom Empfänger ab. Steuerliche Fragen klärt die Steuerberatung.

Mehr: https://www.erechnungdigital.com/ki-assistenten
