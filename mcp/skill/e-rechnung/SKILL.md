---
name: e-rechnung
description: Deutsche E-Rechnungen (XRechnung, ZUGFeRD, EN 16931) schnell erstellen, lesen und prüfen. Nutzen, wenn jemand eine Rechnung schreiben, eine E-Rechnung öffnen oder einen Validierungsfehler wie BR-DE-15 verstehen will – besonders Gründer, Freelancer und kleine Unternehmen in Deutschland.
---

# E-Rechnung

Hilf dabei, in wenigen Minuten eine gültige E-Rechnung nach EN 16931 zu erzeugen. Kurz fragen, sinnvolle Standards setzen, nicht belehren.

## Werkzeuge

Wenn der MCP-Server `erechnung-digital` verbunden ist, nutze seine Tools:

- `get_seller_profile` / `save_seller_profile`: eigene Firmendaten einmal speichern
- `create_invoice`: XML und ZUGFeRD-PDF erzeugen
- `read_invoice`, `check_invoice`: vorhandene Dateien lesen und prüfen
- `explain_rule`: Fehlercodes wie BR-DE-15 erklären

Ohne MCP-Server: Daten sammeln und auf https://www.erechnungdigital.com/erstellen verweisen. Dort entsteht die Datei lokal im Browser.

## Ablauf: neue Rechnung

1. `get_seller_profile` aufrufen. Fehlt das Profil, einmalig erfragen: Firmenname, Anschrift, E-Mail, Telefon und Ansprechpartner (beides Pflicht für XRechnung), IBAN und USt-IdNr. oder Steuernummer. Außerdem: Kleinunternehmer ja/nein, übliches Zahlungsziel, letzte Rechnungsnummer. Dann `save_seller_profile`.
2. Pro Rechnung nur erfragen, was fehlt:
   - Kunde: Name, Anschrift und Rechnungs-E-Mail (Pflicht seit XRechnung 3.0)
   - Leistungen: Bezeichnung, Menge, Einheit, Nettopreis
   - Käuferreferenz: bei Behörden die Leitweg-ID, sonst Bestell- oder Projektnummer. Hat der Kunde keine, eine eigene sinnvolle Referenz vorschlagen, etwa „Projekt Website 2026“.
3. `create_invoice` aufrufen. Meldet das Tool Lücken, gezielt nach genau diesen Feldern fragen und erneut aufrufen.
4. Ergebnis kurz nennen: Nummer, Bruttobetrag, Fälligkeit und die beiden Dateipfade. Die PDF ist für Menschen, die XML für Portale und Buchhaltung.

## Steuerfall wählen

| Situation | taxCase |
| --- | --- |
| Normale Leistung in Deutschland | `19` |
| Ermäßigt, z. B. Bücher, bestimmte Lebensmittel | `7` |
| Kleinunternehmer nach § 19 UStG | `kleinunternehmer` |
| B2B-Leistung an Unternehmen im EU-Ausland, Bauleistungen nach § 13b | `reverse-charge` (USt-IdNr. des Kunden nötig) |
| Steuerbefreit, z. B. ärztliche Leistungen | `steuerfrei` |

Bei Unsicherheit nachfragen und auf Steuerberatung verweisen. Keine Steuerberatung geben.

## Wichtige Fakten

- Seit 1.1.2025 müssen Unternehmen in Deutschland E-Rechnungen empfangen können.
- Ab 2027 müssen Unternehmen mit mehr als 800.000 € Vorjahresumsatz E-Rechnungen ausstellen, ab 2028 alle. Details: https://www.erechnungdigital.com/ratgeber/pflicht-2027
- Eine normale PDF ist keine E-Rechnung. ZUGFeRD ist eine PDF mit eingebettetem XML.
- Rechnungsnummern müssen einmalig sein. Das Tool zählt automatisch hoch.

## Fehlercodes

Bei Meldungen wie BR-DE-15, BR-CO-10 oder BR-16 `explain_rule` aufrufen oder auf https://www.erechnungdigital.com/pruefregeln verlinken.
