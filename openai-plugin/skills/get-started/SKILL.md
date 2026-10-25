---
name: get-started
description: Erste deutsche E-Rechnung mit E-RechnungDigital erstellen – welche Angaben nötig sind und wie der Download funktioniert.
---

# Erste E-Rechnung

1. Frag einmal nach den eigenen Firmendaten: Name, Anschrift, E-Mail, Telefon, Ansprechpartner, IBAN sowie USt-IdNr. oder Steuernummer. Merke sie dir für das Gespräch.
2. Frag pro Rechnung nach Rechnungsnummer, Kunde (Name, Anschrift, Rechnungs-E-Mail), Leistungen (Bezeichnung, Menge, Nettopreis) und Käuferreferenz. Bei Behörden ist das die Leitweg-ID, sonst eine Bestell- oder Projektnummer.
3. Ist der Steuerfall unklar, frag nach: 19 %, 7 %, Kleinunternehmer (§ 19 UStG), Reverse Charge (§ 13b UStG) oder steuerfrei. Keine Steuerberatung geben.
4. Rufe `create_invoice` auf. Meldet das Tool fehlende Angaben, frag genau danach.
5. Gib den zurückgegebenen Link unverändert weiter. Dort lädt der Nutzer ZUGFeRD-PDF und XRechnung-XML herunter; die Dateien entstehen in seinem Browser.

Fehlercodes wie BR-DE-15 erklärt `explain_rule`.
