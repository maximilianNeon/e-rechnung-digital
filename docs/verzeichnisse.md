# Einreichung: ChatGPT und Claude

Alles, was die Formulare abfragen, zum Kopieren. Stand: 25.10.2026.

## Gemeinsame Angaben

| Feld | Wert |
| --- | --- |
| Name | E-RechnungDigital |
| MCP-Server-URL | `https://www.erechnungdigital.com/mcp` |
| Transport | Streamable HTTP, zustandslos |
| Authentifizierung | Keine |
| Website | https://www.erechnungdigital.com |
| Dokumentation | https://www.erechnungdigital.com/ki-assistenten |
| Datenschutz | https://www.erechnungdigital.com/datenschutz |
| Nutzungsbedingungen | https://www.erechnungdigital.com/nutzung |
| Support | https://www.erechnungdigital.com/impressum · info@erechnungdigital.com |
| Icon | `public/icon-512.png` (512 × 512 PNG) |
| Firma | NEON Software Solutions GmbH, Brunnenstraße 195, 10119 Berlin |

**Kurzbeschreibung (≤ 200 Zeichen)**
> Deutsche E-Rechnungen im Chat erstellen: XRechnung und ZUGFeRD nach EN 16931, mit geprüften Pflichtangaben und verständlich erklärten Fehlercodes.

**Beschreibung (≤ 2.000 Zeichen)**
> E-RechnungDigital erstellt deutsche E-Rechnungen direkt im Gespräch. Du sagst, wem du was berechnen willst – der Assistent fragt fehlende Angaben nach, prüft alle Pflichtfelder nach EN 16931 und XRechnung 3.0 und gibt dir einen Link, über den du die Rechnung als ZUGFeRD-PDF (für Kunden) und XRechnung-XML (für Behördenportale und Buchhaltungssoftware) herunterlädst.
>
> Ab 2027 müssen Unternehmen in Deutschland E-Rechnungen an andere Unternehmen ausstellen, ab 2028 alle. E-RechnungDigital richtet sich an Selbstständige, Gründer und kleine Firmen, die dafür keine Buchhaltungssoftware einführen wollen. Unterstützt werden 19 % und 7 % Umsatzsteuer, Kleinunternehmer nach § 19 UStG, Reverse Charge nach § 13b UStG, steuerfreie Leistungen und Gutschriften. Die erzeugten Dateien bestehen den offiziellen KoSIT-Validator.
>
> Vorhandene E-Rechnungen lassen sich prüfen, und Fehlercodes wie BR-DE-15 werden in einfachem Deutsch erklärt.
>
> Datenschutz: Der Server speichert nichts. Er prüft die Angaben im Arbeitsspeicher (Rechenzentrum Frankfurt) und gibt einen Link zurück, der die Rechnung im Teil hinter „#“ trägt. Dieser Teil wird nie an einen Server gesendet; PDF und XML entstehen im Browser des Nutzers.

**Tools**

| Tool | Zweck | readOnly | destructive | openWorld |
| --- | --- | --- | --- | --- |
| `create_invoice` | E-Rechnung prüfen und Download-Link erzeugen | true | false | false |
| `check_invoice` | XML einer E-Rechnung prüfen | true | false | false |
| `explain_rule` | Prüfregel wie BR-DE-15 erklären | true | false | false |

**Datenverarbeitung:** eigener Server, keine Drittanbieter-API, keine Gesundheitsdaten, keine Speicherung. Verarbeitet werden Firmen- und Kundendaten, Positionen, Beträge und Bankverbindung, nur zur Erzeugung der angeforderten Rechnung.

## Testfälle

Absenderdaten für alle positiven Fälle (einmal nennen, der Assistent merkt sie sich im Gespräch):
> Ich bin Test Studio Nord UG, Teststraße 1, 10115 Berlin, USt-IdNr. DE123456789, rechnung@teststudio.example, Telefon 030 1234567, Ansprechpartner Buchhaltung, IBAN DE89370400440532013000.

**Positiv** (Tool soll genutzt werden)
1. „Schreib eine Rechnung Nr. 2026-001 an Bäckerei Krume GmbH, Oderberger Str. 3, 10435 Berlin, buchhaltung@krume.example: 12 Stunden Webdesign à 75 €, Referenz Website-Relaunch.“ → `create_invoice`, Brutto 1.071,00 €, Link auf /rechnung.
2. „Rechnung 2026-002 an die Stadt Musterstadt, Rathausplatz 1, 12345 Musterstadt, rechnung@musterstadt.example, Leitweg-ID 04011000-12345-03: Beratung pauschal 1.200 €.“ → `create_invoice` mit Leitweg-ID als Käuferreferenz.
3. „Ich bin Kleinunternehmerin ohne USt-IdNr., Steuernummer 30/123/45678. Rechnung 2026-003 an Max Muster GmbH, Hauptstr. 5, 80331 München, ap@muster.example, Referenz PO-77: Logo-Design 350 €.“ → `create_invoice` mit Steuerfall kleinunternehmer, USt 0 €.
4. „Was bedeutet der Fehler BR-DE-15 in meiner XRechnung?“ → `explain_rule`.
5. „Prüf bitte diese XRechnung: <XML einfügen>“ → `check_invoice`.

**Negativ** (Tool soll nicht oder nur mit Rückfrage genutzt werden)
1. „Wie hoch ist der Mehrwertsteuersatz in Frankreich?“ → kein Tool.
2. „Schreib mir eine Mahnung als Brief.“ → kein Tool, keine E-Rechnung.
3. „Erstell eine Rechnung an Bäckerei Krume.“ (ohne Leistungen und Beträge) → Rückfrage statt Erfindung von Positionen.

## ChatGPT (platform.openai.com/plugins)

1. Organisation verifizieren (Org-Einstellungen → Verification). Rolle: Owner oder „Apps Management Write“.
2. „Upload new or existing plugin“, MCP-Server-URL oben, Auth: keine.
3. **Domain-Verifizierung:** Das Portal zeigt ein Token. Das Token an Claude geben – es muss unter `https://www.erechnungdigital.com/.well-known/openai-apps-challenge` liegen.
4. Annotationen werden automatisch gescannt (alle drei sind gesetzt).
5. Testfälle oben eintragen, Demo-Video-URL (Bildschirmaufnahme eines Durchlaufs, z. B. unlisted auf YouTube), Icon hochladen.
6. **Länder:** Deutschland (DE) auswählen – falls DE nicht angeboten wird, ist der Plugin-Katalog in der EU noch nicht freigegeben.
7. „Submit for review“; Rückmeldung per E-Mail, danach veröffentlichen.

## Claude (claude.ai/directory/manage)

1. Mit einem bezahlten Claude-Konto anmelden („Submit new“ → „MCP connector“).
2. Felder aus „Gemeinsame Angaben“ übernehmen, Kategorien z. B. „Finance“ und „Productivity“.
3. Anwendungsfälle: die positiven Testfälle 1–4.
4. Slug wählen – ist danach fest: `erechnung-digital`.
5. Sieben Bestätigungen zur Richtlinie abhaken, absenden. Nach dem automatischen Scan erscheint der Konnektor als „Community“; Rückfragen an mcp-review@anthropic.com.

## Claude Desktop (.mcpb)

Kein Verzeichnis mehr. Download liegt auf https://www.erechnungdigital.com/downloads/erechnung-digital.mcpb und ist auf /ki-assistenten verlinkt. Neu bauen: `cd mcp && npm run build:mcpb`.
