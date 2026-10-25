export type RuleSource = "EN 16931" | "XRechnung";

export interface ValidationRuleInfo {
  /** Official rule id, e.g. BR-DE-15 */
  id: string;
  /** Short German label of what the rule demands */
  title: string;
  source: RuleSource;
  severity: "Fehler" | "Warnung";
  /** Business terms (BT/BG) the rule talks about */
  terms: string[];
  meaning: string;
  cause: string;
  fix: string;
  related: string[];
}

export const RULES_UPDATED = "2026-10-25";

export const rules: ValidationRuleInfo[] = [
  {
    id: "BR-01",
    title: "Spezifikationskennung fehlt",
    source: "EN 16931",
    severity: "Fehler",
    terms: ["BT-24"],
    meaning:
      "Jede E-Rechnung muss angeben, nach welcher Spezifikation sie aufgebaut ist. Diese Kennung steht ganz oben im XML und sagt der Software des Empfängers, welche Regeln gelten.",
    cause:
      "Die Rechnung wurde von Hand oder mit einem unvollständigen Generator erzeugt. Manchmal wird das Feld beim Umbau einer Vorlage gelöscht.",
    fix: "Lass die Datei von einer Software erzeugen, die die Kennung automatisch setzt. Für XRechnung muss zusätzlich die richtige XRechnung-Kennung stehen (siehe BR-DE-21).",
    related: ["BR-DE-21"],
  },
  {
    id: "BR-02",
    title: "Rechnungsnummer fehlt",
    source: "EN 16931",
    severity: "Fehler",
    terms: ["BT-1"],
    meaning:
      "Eine E-Rechnung braucht eine Rechnungsnummer. Sie muss einmalig sein und darf in deinem Rechnungskreis nicht doppelt vorkommen (§ 14 Abs. 4 UStG).",
    cause: "Das Feld Rechnungsnummer ist leer oder enthält nur Leerzeichen.",
    fix: "Vergib eine fortlaufende Nummer, zum Beispiel 2026-001. Buchstaben, Ziffern und Bindestriche sind erlaubt.",
    related: ["BR-03"],
  },
  {
    id: "BR-03",
    title: "Rechnungsdatum fehlt",
    source: "EN 16931",
    severity: "Fehler",
    terms: ["BT-2"],
    meaning: "Das Ausstellungsdatum der Rechnung ist Pflicht.",
    cause: "Das Datum fehlt oder steht in einem Format, das die Software nicht als Datum erkennt.",
    fix: "Trag das Rechnungsdatum ein. Im CII-XML steht es als JJJJMMTT, etwa 20261025.",
    related: ["BR-02"],
  },
  {
    id: "BR-04",
    title: "Rechnungsart fehlt",
    source: "EN 16931",
    severity: "Fehler",
    terms: ["BT-3"],
    meaning:
      "Der Typcode sagt, ob es eine Rechnung (380), eine Gutschrift (381), eine korrigierte Rechnung (384) oder eine andere Belegart ist.",
    cause: "Der Code fehlt im XML.",
    fix: "Für eine normale Rechnung 380 setzen. Bei XRechnung sind nur bestimmte Codes erlaubt (siehe BR-DE-17).",
    related: ["BR-DE-17"],
  },
  {
    id: "BR-05",
    title: "Währung fehlt",
    source: "EN 16931",
    severity: "Fehler",
    terms: ["BT-5"],
    meaning: "Die Rechnungswährung muss als dreistelliger ISO-4217-Code angegeben sein, in Deutschland meist EUR.",
    cause: "Der Währungscode fehlt oder ist kein gültiger Code.",
    fix: "EUR als Rechnungswährung angeben.",
    related: [],
  },
  {
    id: "BR-06",
    title: "Name des Verkäufers fehlt",
    source: "EN 16931",
    severity: "Fehler",
    terms: ["BT-27"],
    meaning: "Der vollständige Name deines Unternehmens als Rechnungssteller ist Pflicht.",
    cause: "Das Feld für den Absendernamen ist leer.",
    fix: "Trag den Namen ein, wie er im Handelsregister oder Gewerbeschein steht.",
    related: ["BR-08", "BR-07"],
  },
  {
    id: "BR-07",
    title: "Name des Käufers fehlt",
    source: "EN 16931",
    severity: "Fehler",
    terms: ["BT-44"],
    meaning: "Der Name des Rechnungsempfängers ist Pflicht.",
    cause: "Das Feld für den Empfängernamen ist leer.",
    fix: "Trag den vollständigen Namen des Kunden ein.",
    related: ["BR-10", "BR-06"],
  },
  {
    id: "BR-08",
    title: "Anschrift des Verkäufers fehlt",
    source: "EN 16931",
    severity: "Fehler",
    terms: ["BG-5"],
    meaning: "Die Rechnung muss die Postanschrift des Verkäufers enthalten.",
    cause: "Die Adressgruppe des Absenders fehlt komplett.",
    fix: "Straße, PLZ, Ort und Land des Absenders eintragen.",
    related: ["BR-09", "BR-DE-3", "BR-DE-4"],
  },
  {
    id: "BR-09",
    title: "Ländercode des Verkäufers fehlt",
    source: "EN 16931",
    severity: "Fehler",
    terms: ["BT-40"],
    meaning: "In der Absenderanschrift muss der Ländercode nach ISO 3166-1 stehen, für Deutschland DE.",
    cause: "Das Land fehlt oder ist als Text wie „Deutschland“ statt als Code hinterlegt.",
    fix: "DE als Ländercode verwenden.",
    related: ["BR-08", "BR-11"],
  },
  {
    id: "BR-10",
    title: "Anschrift des Käufers fehlt",
    source: "EN 16931",
    severity: "Fehler",
    terms: ["BG-8"],
    meaning: "Die Rechnung muss die Postanschrift des Käufers enthalten.",
    cause: "Die Adressgruppe des Empfängers fehlt.",
    fix: "Straße, PLZ, Ort und Land des Empfängers eintragen.",
    related: ["BR-11", "BR-DE-8", "BR-DE-9"],
  },
  {
    id: "BR-11",
    title: "Ländercode des Käufers fehlt",
    source: "EN 16931",
    severity: "Fehler",
    terms: ["BT-55"],
    meaning: "In der Empfängeranschrift muss der Ländercode stehen.",
    cause: "Das Land des Kunden fehlt oder ist kein ISO-Code.",
    fix: "Den zweistelligen Code eintragen, zum Beispiel DE, AT oder FR.",
    related: ["BR-10", "BR-09"],
  },
  {
    id: "BR-16",
    title: "Keine Rechnungsposition",
    source: "EN 16931",
    severity: "Fehler",
    terms: ["BG-25"],
    meaning: "Eine E-Rechnung braucht mindestens eine Position mit Bezeichnung, Menge, Einheit und Preis.",
    cause: "Die Positionsliste ist leer. Das passiert oft bei Dateien im Profil MINIMUM, die keine Positionen tragen.",
    fix: "Mindestens eine Leistung oder einen Artikel als Position anlegen. Für die E-Rechnungspflicht ein Profil ab EN 16931 verwenden.",
    related: ["BR-CO-10"],
  },
  {
    id: "BR-CO-10",
    title: "Summe der Positionen stimmt nicht",
    source: "EN 16931",
    severity: "Fehler",
    terms: ["BT-106", "BT-131"],
    meaning: "Die Summe der Nettobeträge aller Positionen muss genau dem Gesamtnettobetrag der Rechnung entsprechen.",
    cause:
      "Rundungsfehler: Positionsbeträge wurden mit mehr als zwei Nachkommastellen addiert oder eine Position wurde nachträglich geändert, ohne die Summe neu zu rechnen.",
    fix: "Jeden Positionsbetrag kaufmännisch auf zwei Stellen runden und erst dann addieren. Eine Software rechnet das automatisch.",
    related: ["BR-CO-15", "BR-16"],
  },
  {
    id: "BR-CO-15",
    title: "Bruttosumme stimmt nicht",
    source: "EN 16931",
    severity: "Fehler",
    terms: ["BT-112", "BT-109", "BT-110"],
    meaning: "Der Gesamtbetrag mit Umsatzsteuer muss Nettosumme plus Umsatzsteuer ergeben.",
    cause: "Die Steuer wurde pro Position gerundet, aber auf Rechnungsebene anders summiert, oder ein Betrag wurde von Hand überschrieben.",
    fix: "Netto, Steuer und Brutto aus denselben gerundeten Werten berechnen.",
    related: ["BR-CO-10"],
  },
  {
    id: "BR-CO-25",
    title: "Fälligkeit oder Zahlungsbedingungen fehlen",
    source: "EN 16931",
    severity: "Fehler",
    terms: ["BT-9", "BT-20"],
    meaning: "Ist ein Betrag zu zahlen, muss die Rechnung ein Fälligkeitsdatum oder Zahlungsbedingungen nennen.",
    cause: "Beides ist leer.",
    fix: "Fälligkeitsdatum setzen oder Zahlungsbedingungen wie „14 Tage netto“ eintragen.",
    related: ["BR-DE-1", "BR-DE-18"],
  },
  {
    id: "BR-CO-26",
    title: "Kennung des Verkäufers fehlt",
    source: "EN 16931",
    severity: "Fehler",
    terms: ["BT-29", "BT-30", "BT-31"],
    meaning:
      "Damit der Käufer den Lieferanten automatisch zuordnen kann, braucht die Rechnung eine Verkäuferkennung, eine Registernummer oder die USt-IdNr.",
    cause: "Keine dieser drei Angaben ist vorhanden.",
    fix: "Am einfachsten die USt-IdNr. eintragen. Ohne USt-IdNr. eine Verkäuferkennung angeben, etwa die Steuernummer oder die Lieferantennummer beim Kunden. E-RechnungDigital setzt die Steuernummer dann automatisch als Kennung.",
    related: ["BR-DE-16"],
  },
  {
    id: "BR-E-10",
    title: "Befreiungsgrund bei steuerfreier Leistung fehlt",
    source: "EN 16931",
    severity: "Fehler",
    terms: ["BT-120", "BT-121"],
    meaning: "Wer eine Leistung als steuerbefreit (Kategorie E) abrechnet, muss den Grund als Text oder Code angeben.",
    cause: "Kategorie E ist gesetzt, aber kein Befreiungsgrund.",
    fix: "Den Paragraphen nennen, zum Beispiel „Steuerfrei nach § 4 Nr. 21 UStG“.",
    related: ["BR-O-10", "BR-AE-10"],
  },
  {
    id: "BR-O-10",
    title: "Hinweis bei nicht steuerbarem Umsatz fehlt",
    source: "EN 16931",
    severity: "Fehler",
    terms: ["BT-120", "BT-121"],
    meaning:
      "Kategorie O (nicht steuerbar) braucht einen Befreiungsgrund. Für Kleinunternehmer nach § 19 UStG ist in der XRechnung Kategorie E mit 0 % passender, weil O weder Steuernummer noch Steuersatz erlaubt.",
    cause: "Kategorie O ist gesetzt, aber kein Text oder Code für den Grund.",
    fix: "Den Grund als Text angeben. Als Kleinunternehmer besser Kategorie E mit 0 % und dem Hinweis „Kein Umsatzsteuerausweis gemäß § 19 UStG“ verwenden.",
    related: ["BR-E-10"],
  },
  {
    id: "BR-AE-10",
    title: "Hinweis bei Reverse Charge fehlt",
    source: "EN 16931",
    severity: "Fehler",
    terms: ["BT-120", "BT-121"],
    meaning:
      "Bei Steuerschuldnerschaft des Leistungsempfängers (Kategorie AE) muss der Grund in der Steueraufschlüsselung stehen.",
    cause: "Kategorie AE ist gesetzt, aber kein Befreiungsgrund.",
    fix: "Als Grund „Steuerschuldnerschaft des Leistungsempfängers (§ 13b UStG)“ angeben. Zusätzlich die USt-IdNr. beider Seiten eintragen.",
    related: ["BR-E-10"],
  },
  {
    id: "PEPPOL-EN16931-R010",
    title: "Elektronische Adresse des Käufers fehlt",
    source: "XRechnung",
    severity: "Fehler",
    terms: ["BT-49"],
    meaning:
      "Seit XRechnung 3.0 muss die Rechnung eine elektronische Adresse des Käufers enthalten. Bei Versand per E-Mail ist das meist die E-Mail-Adresse des Empfängers mit dem Schema EM, im Peppol-Netz seine Peppol-ID.",
    cause: "Die E-Mail des Empfängers wurde nicht eingetragen oder die Software schreibt sie nicht als elektronische Adresse ins XML.",
    fix: "E-Mail-Adresse des Rechnungsempfängers eintragen, zum Beispiel rechnung@kunde.de. Behörden nennen ihre Adresse oft zusammen mit der Leitweg-ID.",
    related: ["PEPPOL-EN16931-R020", "BR-DE-15"],
  },
  {
    id: "PEPPOL-EN16931-R020",
    title: "Elektronische Adresse des Verkäufers fehlt",
    source: "XRechnung",
    severity: "Fehler",
    terms: ["BT-34"],
    meaning:
      "Seit XRechnung 3.0 muss auch der Verkäufer eine elektronische Adresse angeben, meist die eigene Rechnungs-E-Mail mit dem Schema EM.",
    cause: "Keine E-Mail beim Absender oder die Software schreibt sie nur als Kontakt, nicht als elektronische Adresse.",
    fix: "E-Mail des Absenders eintragen. E-RechnungDigital übernimmt sie automatisch als elektronische Adresse.",
    related: ["PEPPOL-EN16931-R010", "BR-DE-7"],
  },
  {
    id: "BR-DE-1",
    title: "Zahlungsanweisungen fehlen",
    source: "XRechnung",
    severity: "Fehler",
    terms: ["BG-16"],
    meaning: "Eine XRechnung muss sagen, wie bezahlt werden soll, etwa per Überweisung mit IBAN.",
    cause: "Die Gruppe Zahlungsanweisungen fehlt ganz.",
    fix: "Zahlungsart Überweisung (Code 58) und deine IBAN eintragen.",
    related: ["BR-CO-25"],
  },
  {
    id: "BR-DE-2",
    title: "Kontaktdaten des Verkäufers fehlen",
    source: "XRechnung",
    severity: "Fehler",
    terms: ["BG-6"],
    meaning: "XRechnung verlangt eine Kontaktgruppe beim Verkäufer mit Name, Telefon und E-Mail.",
    cause: "Die Gruppe Verkäuferkontakt fehlt komplett.",
    fix: "Ansprechpartner, Telefonnummer und E-Mail des Absenders eintragen.",
    related: ["BR-DE-5", "BR-DE-6", "BR-DE-7"],
  },
  {
    id: "BR-DE-3",
    title: "Ort des Verkäufers fehlt",
    source: "XRechnung",
    severity: "Fehler",
    terms: ["BT-37"],
    meaning: "In der Absenderanschrift muss der Ort stehen.",
    cause: "Das Feld Ort ist leer.",
    fix: "Ort des Absenders eintragen.",
    related: ["BR-DE-4", "BR-08"],
  },
  {
    id: "BR-DE-4",
    title: "PLZ des Verkäufers fehlt",
    source: "XRechnung",
    severity: "Fehler",
    terms: ["BT-38"],
    meaning: "In der Absenderanschrift muss die Postleitzahl stehen.",
    cause: "Das Feld PLZ ist leer.",
    fix: "Postleitzahl des Absenders eintragen. Deutsche PLZ haben fünf Ziffern.",
    related: ["BR-DE-3", "BR-08"],
  },
  {
    id: "BR-DE-5",
    title: "Ansprechpartner des Verkäufers fehlt",
    source: "XRechnung",
    severity: "Fehler",
    terms: ["BT-41"],
    meaning: "XRechnung verlangt einen Namen für den Kontakt beim Verkäufer. Das kann eine Person oder eine Abteilung sein.",
    cause: "Kein Ansprechpartner eingetragen.",
    fix: "Namen oder Abteilung eintragen, zum Beispiel „Buchhaltung“.",
    related: ["BR-DE-2", "BR-DE-6", "BR-DE-7"],
  },
  {
    id: "BR-DE-6",
    title: "Telefonnummer des Verkäufers fehlt",
    source: "XRechnung",
    severity: "Fehler",
    terms: ["BT-42"],
    meaning: "XRechnung verlangt eine Telefonnummer beim Verkäuferkontakt.",
    cause: "Keine Telefonnummer eingetragen.",
    fix: "Telefonnummer des Absenders eintragen. Sie muss mindestens drei Ziffern haben (siehe BR-DE-27).",
    related: ["BR-DE-2", "BR-DE-27"],
  },
  {
    id: "BR-DE-7",
    title: "E-Mail des Verkäufers fehlt",
    source: "XRechnung",
    severity: "Fehler",
    terms: ["BT-43"],
    meaning: "XRechnung verlangt eine E-Mail-Adresse beim Verkäuferkontakt.",
    cause: "Keine E-Mail eingetragen.",
    fix: "E-Mail des Absenders eintragen, zum Beispiel rechnung@deinefirma.de.",
    related: ["BR-DE-2", "BR-DE-28"],
  },
  {
    id: "BR-DE-8",
    title: "Ort des Käufers fehlt",
    source: "XRechnung",
    severity: "Fehler",
    terms: ["BT-52"],
    meaning: "In der Empfängeranschrift muss der Ort stehen.",
    cause: "Das Feld Ort beim Empfänger ist leer.",
    fix: "Ort des Empfängers eintragen.",
    related: ["BR-DE-9", "BR-10"],
  },
  {
    id: "BR-DE-9",
    title: "PLZ des Käufers fehlt",
    source: "XRechnung",
    severity: "Fehler",
    terms: ["BT-53"],
    meaning: "In der Empfängeranschrift muss die Postleitzahl stehen.",
    cause: "Das Feld PLZ beim Empfänger ist leer.",
    fix: "Postleitzahl des Empfängers eintragen.",
    related: ["BR-DE-8", "BR-10"],
  },
  {
    id: "BR-DE-14",
    title: "Steuersatz fehlt",
    source: "XRechnung",
    severity: "Fehler",
    terms: ["BT-119"],
    meaning: "In jeder Steueraufschlüsselung muss der Steuersatz stehen, auch wenn er 0 % ist.",
    cause: "Bei steuerfreien oder Reverse-Charge-Positionen wurde der Satz weggelassen statt 0 einzutragen.",
    fix: "Den Satz immer angeben: 19, 7 oder 0.",
    related: ["BR-E-10", "BR-AE-10"],
  },
  {
    id: "BR-DE-15",
    title: "Käuferreferenz fehlt",
    source: "XRechnung",
    severity: "Fehler",
    terms: ["BT-10"],
    meaning:
      "Jede XRechnung braucht eine Käuferreferenz. Bei Behörden ist das die Leitweg-ID, bei Unternehmen zum Beispiel eine Bestell- oder Projektnummer.",
    cause: "Das Feld Käuferreferenz ist leer. Das ist der häufigste Grund, warum Portale eine XRechnung ablehnen.",
    fix: "Leitweg-ID beim Auftraggeber erfragen und eintragen. Ohne Vorgabe des Kunden eine eigene Referenz wie die Bestellnummer verwenden.",
    related: ["BR-DE-16"],
  },
  {
    id: "BR-DE-16",
    title: "Steuernummer oder USt-IdNr. fehlt",
    source: "XRechnung",
    severity: "Fehler",
    terms: ["BT-31", "BT-32", "BT-63"],
    meaning:
      "Wer Umsatzsteuer ausweist oder eine steuerrelevante Kategorie nutzt, muss USt-IdNr. oder Steuernummer angeben.",
    cause: "Weder USt-IdNr. noch Steuernummer sind eingetragen.",
    fix: "USt-IdNr. (DE und neun Ziffern) oder die Steuernummer vom Finanzamt eintragen.",
    related: ["BR-CO-26"],
  },
  {
    id: "BR-DE-17",
    title: "Rechnungsart nicht erlaubt",
    source: "XRechnung",
    severity: "Fehler",
    terms: ["BT-3"],
    meaning:
      "XRechnung erlaubt nur bestimmte Belegarten, unter anderem 380 (Rechnung), 381 (Gutschrift), 384 (Korrektur), 389 (Selbstfakturierung) und 326 (Teilrechnung).",
    cause: "Ein anderer Code aus der UNTDID-1001-Liste wurde verwendet.",
    fix: "Für normale Rechnungen 380 verwenden, für Gutschriften 381.",
    related: ["BR-04", "BR-DE-26"],
  },
  {
    id: "BR-DE-18",
    title: "Skonto falsch formatiert",
    source: "XRechnung",
    severity: "Fehler",
    terms: ["BT-20"],
    meaning:
      "Skonto muss in den Zahlungsbedingungen in einem festen Format stehen, damit Software es lesen kann: #SKONTO#TAGE=14#PROZENT=2.00#",
    cause: "Skonto wurde als freier Text geschrieben oder das Format ist unvollständig.",
    fix: "Skonto genau im Format #SKONTO#TAGE=n#PROZENT=n.nn# angeben und mit einem Zeilenumbruch abschließen.",
    related: ["BR-CO-25"],
  },
  {
    id: "BR-DE-21",
    title: "Falsche XRechnung-Kennung",
    source: "XRechnung",
    severity: "Warnung",
    terms: ["BT-24"],
    meaning:
      "Eine XRechnung muss sich als XRechnung ausweisen. Für Version 3.0 lautet die Kennung urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0.",
    cause:
      "Die Datei ist eine gültige EN-16931- oder ZUGFeRD-Rechnung, aber nicht als XRechnung gekennzeichnet. Der Prüfer der KoSIT wendet dann die deutschen Regeln trotzdem an und meldet die Abweichung.",
    fix: "Wenn der Empfänger ausdrücklich XRechnung verlangt, die XRechnung-Kennung setzen. Sonst reicht eine EN-16931-konforme Rechnung oft aus.",
    related: ["BR-01"],
  },
  {
    id: "BR-DE-26",
    title: "Verweis auf Ursprungsrechnung fehlt",
    source: "XRechnung",
    severity: "Warnung",
    terms: ["BG-3"],
    meaning: "Eine korrigierte Rechnung (Typ 384) soll auf die Rechnung verweisen, die sie korrigiert.",
    cause: "Typ 384 gesetzt, aber keine vorausgehende Rechnung angegeben.",
    fix: "Nummer und Datum der ursprünglichen Rechnung eintragen.",
    related: ["BR-DE-17"],
  },
  {
    id: "BR-DE-27",
    title: "Telefonnummer zu kurz",
    source: "XRechnung",
    severity: "Warnung",
    terms: ["BT-42"],
    meaning: "Die Telefonnummer des Verkäufers soll mindestens drei Ziffern enthalten.",
    cause: "Platzhalter wie „-“ oder „k. A.“ im Telefonfeld.",
    fix: "Eine echte Telefonnummer eintragen.",
    related: ["BR-DE-6"],
  },
  {
    id: "BR-DE-28",
    title: "E-Mail-Adresse ungültig",
    source: "XRechnung",
    severity: "Warnung",
    terms: ["BT-43"],
    meaning: "Die E-Mail des Verkäufers soll genau ein @ enthalten und nicht mit einem Punkt beginnen oder enden.",
    cause: "Tippfehler oder mehrere Adressen in einem Feld.",
    fix: "Genau eine gültige E-Mail-Adresse eintragen.",
    related: ["BR-DE-7"],
  },
];

export function ruleSlug(id: string): string {
  return id.toLowerCase();
}

export function rulePath(id: string): string {
  return `/pruefregeln/${ruleSlug(id)}`;
}

export function getRule(idOrSlug: string): ValidationRuleInfo | undefined {
  const needle = idOrSlug.trim().toUpperCase();
  return rules.find((rule) => rule.id === needle);
}

export function ruleHeadline(rule: ValidationRuleInfo): string {
  return `${rule.id}: ${rule.title}`;
}

export function ruleDescription(rule: ValidationRuleInfo): string {
  return `${rule.id} (${rule.source}) einfach erklärt: ${rule.title}. Was die Prüfregel bedeutet, warum sie auslöst und wie du die E-Rechnung korrigierst.`;
}
