export interface GuideFaq {
  question: string;
  answer: string;
}

export interface GuideSource {
  label: string;
  href: string;
}

export interface Guide {
  slug: string;
  title: string;
  description: string;
  keyword: string;
  updated: string;
  summary: string;
  sections: { id: string; heading: string; body: string[] }[];
  faq: GuideFaq[];
  sources: GuideSource[];
  related: string[];
  /** If set, the index links here instead of /ratgeber/:slug */
  canonicalPath?: string;
}

export const guides: Guide[] = [
  {
    slug: "e-rechnung-erstellen",
    title: "E-Rechnung erstellen",
    description:
      "E-Rechnung kostenlos erstellen: Pflichtfelder, Prüfung und Download als XRechnung-XML oder ZUGFeRD-PDF im Browser.",
    keyword: "E-Rechnung erstellen kostenlos",
    updated: "2026-10-20",
    summary:
      "Eine gültige E-Rechnung braucht strukturierte Daten, nicht nur eine PDF. Im Browser füllst du Absender, Empfänger, Positionen und Zahlung aus, prüfst die Pflichtfelder und nimmst XRechnung oder ZUGFeRD mit – ohne Konto und ohne Upload.",
    sections: [
      {
        id: "was-du-brauchst",
        heading: "Was du brauchst",
        body: [
          "Für eine E-Rechnung nach EN 16931 brauchst du mindestens: Rechnungsnummer und -datum, Leistungsdatum, Käuferreferenz, Absender mit Anschrift und USt-IdNr. oder Steuernummer sowie E-Mail, Empfängeranschrift, mindestens eine Position mit Menge, Einheit, Preis und Steuerfall sowie IBAN und Fälligkeit oder Zahlungsbedingungen.",
          "Bei Rechnungen an Behörden gehört die Leitweg-ID in die Käuferreferenz. Bei anderen Empfängern reicht eine klare Referenz, etwa eine Bestell- oder Projektnummer.",
          "Optional sind Logo und Markenfarbe. Sie erscheinen in der Vorschau und im sichtbaren PDF, ändern aber nichts am strukturierten XML.",
        ],
      },
      {
        id: "ablauf",
        heading: "Ablauf im Werkzeug",
        body: [
          "Alles steht auf einer Seite: links die Angaben, rechts der Beleg. Jede Änderung erscheint sofort in der Vorschau. Herunterladen geht erst, wenn Pflichtfelder und Formate stimmen.",
          "Unter Leistungen kannst du zu jeder Bezeichnung eine mehrzeilige Beschreibung ergänzen. Die Beschreibung landet im XML als Produktbeschreibung und bleibt in Vorschau, Druck und PDF erhalten.",
          "Als Ergebnis bekommst du die E-Rechnung als strukturierte Datei (XRechnung-XML) und optional die lesbare ZUGFeRD-PDF mit demselben XML darin.",
        ],
      },
      {
        id: "formate",
        heading: "Welche Datei du weitergibst",
        body: [
          "Öffentliche Auftraggeber erwarten oft reines XRechnung-XML. Viele Unternehmen wollen zusätzlich eine lesbare PDF und nutzen ZUGFeRD.",
          "Beide Formate können denselben Inhalt tragen. Entscheidend ist das strukturierte XML. Eine einfache PDF ohne eingebettetes XML ist seit 2025 keine E-Rechnung.",
        ],
      },
      {
        id: "privat",
        heading: "Privat im Browser",
        body: [
          "Nummer, Beträge und Positionen entstehen auf deinem Gerät. Es gibt kein Konto und keinen Upload der Rechnungsdaten an einen Server von E-RechnungDigital.",
          "Aufbewahren, meist über Jahre, bleibt deine Aufgabe. Ob der Empfänger die Datei annimmt, hängt von seinem Portal oder seiner Software ab.",
        ],
      },
    ],
    faq: [
      {
        question: "Kostet das Erstellen etwas?",
        answer:
          "Nein. E-RechnungDigital erzeugt XRechnung und ZUGFeRD im Browser ohne Konto und ohne Abo.",
      },
      {
        question: "Reicht eine normale PDF?",
        answer:
          "Nein. Eine E-Rechnung braucht strukturierte, maschinenlesbare Daten. Eine einfache PDF gilt als sonstige Rechnung.",
      },
      {
        question: "Wann kann ich herunterladen?",
        answer:
          "Sobald Pflichtfelder und Formatprüfungen gültig sind. Offene Felder werden markiert, bevor der Export startet.",
      },
    ],
    sources: [
      {
        label: "§ 14 UStG",
        href: "https://www.gesetze-im-internet.de/ustg_1980/__14.html",
      },
      {
        label: "BMF FAQ E-Rechnung",
        href: "https://www.bundesfinanzministerium.de/Content/DE/FAQ/e-rechnung.html",
      },
    ],
    related: ["pflichtangaben", "xrechnung", "zugferd", "e-rechnung-pruefen"],
  },
  {
    slug: "xrechnung",
    title: "XRechnung",
    description:
      "XRechnung erklären und erstellen: Format, Pflichtfelder, CII-XML und Unterschied zu einer normalen PDF.",
    keyword: "XRechnung erstellen",
    updated: "2026-10-20",
    summary:
      "XRechnung ist die deutsche Ausprägung der europäischen Norm EN 16931. Sie liefert strukturiertes XML – vor allem für den öffentlichen Auftraggeber, aber auch überall dort, wo reine Maschinendaten erwartet werden.",
    sections: [
      {
        id: "was-ist-xrechnung",
        heading: "Was ist XRechnung?",
        body: [
          "XRechnung beschreibt, wie Rechnungsdaten in Deutschland strukturiert übermittelt werden. Technisch liegt EN 16931 zugrunde. Typisch ist ein reines XML ohne sichtbare PDF.",
          "Version 3.0.2 ist die derzeit übliche Zielversion. Zusätzliche deutsche Regeln betreffen unter anderem Käuferreferenz und Verkäufer-E-Mail.",
        ],
      },
      {
        id: "syntax",
        heading: "CII und UBL",
        body: [
          "XRechnung erlaubt unter anderem UBL und Cross Industry Invoice (CII). E-RechnungDigital erzeugt CII-XML, das für XRechnung geeignet ist.",
          "Im Dokument stehen unter anderem Prozesskennung, Leitweg oder Käuferreferenz, Parteien, Positionen, Steueraufschlüsselung und Zahlungsdaten.",
        ],
      },
      {
        id: "wann",
        heading: "Wann XRechnung sinnvoll ist",
        body: [
          "Öffentliche Auftraggeber und Portale wie die zentrale Rechnungseingangsplattform erwarten oft XRechnung als XML-Datei.",
          "Wenn der Empfänger eine lesbare PDF will, ist ZUGFeRD oft praktischer – mit demselben strukturierten Inhalt darin.",
        ],
      },
      {
        id: "erstellen",
        heading: "XRechnung im Browser erzeugen",
        body: [
          "Unter Rechnung erstellen füllst du die Pflichtfelder aus. Der Download „E-Rechnung“ liefert die strukturierte XML-Datei. Die Vorschau zeigt denselben Inhalt lesbar an.",
          "Vor dem Versand solltest du Nummer, Steuer und Käuferreferenz noch einmal prüfen. Ein Browser-Werkzeug kann nicht garantieren, dass jedes Portal jede Datei annimmt.",
        ],
      },
    ],
    faq: [
      {
        question: "Ist XRechnung eine PDF?",
        answer:
          "Nein. XRechnung ist strukturiertes XML. Eine PDF kann daneben existieren, ist aber nicht die XRechnung selbst.",
      },
      {
        question: "Brauche ich eine Leitweg-ID?",
        answer:
          "Bei Rechnungen an die öffentliche Hand ja, als Käuferreferenz. Bei anderen Empfängern reicht oft eine andere Referenz.",
      },
    ],
    sources: [
      {
        label: "KoSIT XRechnung",
        href: "https://www.xrechnung.verdi.de/",
      },
      {
        label: "BMF FAQ E-Rechnung",
        href: "https://www.bundesfinanzministerium.de/Content/DE/FAQ/e-rechnung.html",
      },
    ],
    related: ["zugferd", "xrechnung-vs-zugferd", "leitweg-id", "e-rechnung-erstellen"],
  },
  {
    slug: "zugferd",
    title: "ZUGFeRD",
    description:
      "ZUGFeRD erstellen: PDF/A-3 mit eingebettetem XML, passende Profile und Unterschied zu einer einfachen PDF.",
    keyword: "ZUGFeRD erstellen",
    updated: "2026-10-20",
    summary:
      "ZUGFeRD verbindet eine lesbare PDF für Menschen mit demselben strukturierten XML für Maschinen. Geeignete Profile erfüllen die Anforderungen an eine E-Rechnung.",
    sections: [
      {
        id: "was-ist-zugferd",
        heading: "Was ist ZUGFeRD?",
        body: [
          "ZUGFeRD / Factur-X steckt EN-16931-XML in eine PDF/A-3. Menschen öffnen die PDF, Software liest das eingebettete XML.",
          "Wenn sichtbare PDF und XML auseinanderlaufen, gilt für die maschinelle Verarbeitung das XML.",
        ],
      },
      {
        id: "profile",
        heading: "Welche Profile reichen",
        body: [
          "Für die E-Rechnungspflicht reichen Profile MINIMUM und BASIC-WL nicht. Es braucht ein profil, das EN 16931 abdeckt, etwa EN 16931 / COMFORT bzw. die passende Factur-X-Stufe.",
          "E-RechnungDigital erzeugt ZUGFeRD 2.5.2 mit demselben CII-Inhalt, den du auch als reine E-Rechnung-XML herunterlädst.",
        ],
      },
      {
        id: "wann",
        heading: "Wann ZUGFeRD sinnvoll ist",
        body: [
          "Viele Unternehmen wollen eine Datei, die sich öffnen, drucken und archivieren lässt – und trotzdem strukturierte Daten enthält.",
          "Behörden erwarten oft reines XRechnung-XML. Prüfe die Vorgabe des Empfängers, bevor du nur die PDF verschickst.",
        ],
      },
      {
        id: "erstellen",
        heading: "ZUGFeRD im Browser erzeugen",
        body: [
          "Nach dem Ausfüllen der Rechnung lädst du die PDF herunter. Darin steckt das XML. Parallel kannst du die reine E-Rechnung als XML mitnehmen.",
          "Logo und Farbe prägen die sichtbare Darstellung. Die strukturierten Beträge und Steuerfälle bleiben davon unabhängig.",
        ],
      },
    ],
    faq: [
      {
        question: "Ist jede ZUGFeRD-Datei eine E-Rechnung?",
        answer:
          "Nur mit einem geeigneten Profil, das strukturierte EN-16931-Daten enthält. Sehr schlanke Profile reichen nicht.",
      },
      {
        question: "Was gilt bei Abweichungen zwischen PDF und XML?",
        answer:
          "Für die maschinelle Verarbeitung zählt das eingebettete XML.",
      },
    ],
    sources: [
      {
        label: "Forum elektronische Rechnung Deutschland",
        href: "https://www.ferd-net.de/",
      },
      {
        label: "BMF FAQ E-Rechnung",
        href: "https://www.bundesfinanzministerium.de/Content/DE/FAQ/e-rechnung.html",
      },
    ],
    related: ["xrechnung", "xrechnung-vs-zugferd", "e-rechnung-erstellen", "e-rechnung-oeffnen"],
  },
  {
    slug: "e-rechnung-oeffnen",
    title: "E-Rechnung öffnen",
    description:
      "XRechnung oder ZUGFeRD öffnen: XML-Rechnung im Browser lesen, Felder übernehmen und weiterbearbeiten.",
    keyword: "XRechnung öffnen",
    updated: "2026-10-20",
    summary:
      "Eine vorhandene XML- oder ZUGFeRD-Datei kannst du lokal öffnen, prüfen und in dasselbe Formular übernehmen – ohne die Datei auf einen Server zu laden.",
    sections: [
      {
        id: "ablauf",
        heading: "So öffnest du eine Datei",
        body: [
          "Unter Rechnung öffnen ziehst du XML oder ZUGFeRD-PDF hinein oder wählst die Datei aus. Der Browser liest sie nur lokal.",
          "Bekannte Felder erscheinen in der Vorschau und lassen sich ins Formular übernehmen. Unbekannte oder nicht unterstützte Felder siehst du als Warnung, bevor etwas verloren geht.",
        ],
      },
      {
        id: "weiter",
        heading: "Noch nicht verschickt oder schon verschickt",
        body: [
          "Wenn die Rechnung noch nicht raus ist, behältst du Nummer und Datum und arbeitest weiter.",
          "Wenn sie schon verschickt wurde, erzeugst du typischerweise eine Korrektur mit neuer Nummer und Verweis auf die alte Rechnung.",
        ],
      },
      {
        id: "grenzen",
        heading: "Was übernommen wird",
        body: [
          "Übernommen werden die gängigen CII-Felder zu Parteien, Positionen, Steuer und Zahlung. Exotische Erweiterungen einzelner Portale können fehlen.",
          "Die Rechnungsnummer kommt aus dem eigentlichen Belegdokument, nicht aus Prozesskennungen wie Peppol-URNs im Kopf der Datei.",
        ],
      },
    ],
    faq: [
      {
        question: "Kann ich eine normale PDF öffnen?",
        answer:
          "Nur wenn sie ZUGFeRD mit eingebettetem XML ist. Eine reine Bild-PDF enthält keine strukturierten Rechnungsdaten zum Übernehmen.",
      },
      {
        question: "Wird die Datei hochgeladen?",
        answer:
          "Nein. Das Öffnen passiert im Browser. Ein Server von E-RechnungDigital sieht den Beleg nicht.",
      },
    ],
    sources: [
      {
        label: "BMF FAQ E-Rechnung",
        href: "https://www.bundesfinanzministerium.de/Content/DE/FAQ/e-rechnung.html",
      },
    ],
    related: ["e-rechnung-pruefen", "e-rechnung-erstellen", "zugferd", "xrechnung"],
  },
  {
    slug: "e-rechnung-pruefen",
    title: "E-Rechnung prüfen",
    description:
      "E-Rechnung prüfen und validieren: welche Felder das Werkzeug prüft und was weiterhin bei dir bleibt.",
    keyword: "E-Rechnung prüfen",
    updated: "2026-10-20",
    summary:
      "Direkt am Feld prüft E-RechnungDigital Formate und Pflichtangaben. Ob ein Empfängerportal die Datei annimmt, kann kein Browser-Werkzeug allein garantieren.",
    sections: [
      {
        id: "direkt",
        heading: "Was direkt geprüft wird",
        body: [
          "Geprüft werden unter anderem IBAN, BIC, USt-IdNr., E-Mail, PLZ, Datum, Menge, Geldbeträge und eine Leitweg-ID, wenn das Feld wie eine aussieht.",
          "Pflichtfelder müssen vor dem Export stehen. Offene Punkte werden markiert und der Download bleibt gesperrt.",
        ],
      },
      {
        id: "en16931",
        heading: "Struktur und EN 16931",
        body: [
          "Beim Erzeugen der Datei laufen Validierungen des eingesetzten Formats. Fehler werden angezeigt, statt eine kaputte Datei still zu speichern.",
          "Das ersetzt keine Prüfung durch dein Steuerprogramm oder das Portal des Empfängers.",
        ],
      },
      {
        id: "bleibt",
        heading: "Was bei dir bleibt",
        body: [
          "Inhaltliche Richtigkeit der Leistung, Aufbewahrung und die Frage, ob der Empfänger die Datei annimmt, liegen bei dir.",
          "E-RechnungDigital ist kein Steuerberater und kein Archiv.",
        ],
      },
    ],
    faq: [
      {
        question: "Ist die Prüfung eine gesetzliche Freigabe?",
        answer:
          "Nein. Sie hilft bei Formaten und Pflichtfeldern, ersetzt aber keine steuerliche oder portalbezogene Prüfung.",
      },
      {
        question: "Warum ist der Download gesperrt?",
        answer:
          "Weil mindestens ein Pflichtfeld fehlt oder ungültig ist. Die markierten Felder zeigen, was noch fehlt.",
      },
    ],
    sources: [
      {
        label: "§ 14 UStG",
        href: "https://www.gesetze-im-internet.de/ustg_1980/__14.html",
      },
    ],
    related: ["pflichtangaben", "e-rechnung-erstellen", "leitweg-id", "e-rechnung-oeffnen"],
  },
  {
    slug: "xrechnung-vs-zugferd",
    title: "XRechnung oder ZUGFeRD",
    description:
      "Unterschied XRechnung und ZUGFeRD: wann XML allein reicht und wann die PDF mit eingebettetem XML sinnvoll ist.",
    keyword: "Unterschied XRechnung ZUGFeRD",
    updated: "2026-10-20",
    summary:
      "Beide können dieselbe strukturierte Rechnung tragen. XRechnung ist oft reines XML, ZUGFeRD eine PDF mit XML darin. Die Wahl hängt vom Empfänger ab.",
    sections: [
      {
        id: "vergleich",
        heading: "Kurz verglichen",
        body: [
          "XRechnung: strukturiertes XML, typisch für Behörden und Portale, die Maschinenlesbarkeit erwarten.",
          "ZUGFeRD: PDF/A-3 mit eingebettetem XML, gut wenn Menschen die Datei öffnen und gleichzeitig Software die Daten lesen soll.",
          "Eine einfache PDF ohne XML ist in beiden Fällen keine E-Rechnung.",
        ],
      },
      {
        id: "wahl",
        heading: "Wie du dich entscheidest",
        body: [
          "Steht in der Vorgabe „XRechnung“ oder „XML“, nimm die E-Rechnung als XML.",
          "Will der Empfänger eine lesbare Datei und akzeptiert ZUGFeRD bzw. Factur-X, nimm die PDF.",
          "Im Zweifel beides mitnehmen: denselben Inhalt einmal als XML, einmal als ZUGFeRD.",
        ],
      },
      {
        id: "im-werkzeug",
        heading: "Im Werkzeug",
        body: [
          "E-RechnungDigital erzeugt denselben CII-Kern für beide Downloads. Du wechselst nicht das inhaltliche Formular, sondern nur die Ausgabe.",
        ],
      },
    ],
    faq: [
      {
        question: "Muss ich mich festlegen?",
        answer:
          "Oft nein. Viele verschicken je nach Empfänger XML oder ZUGFeRD. Der strukturierte Inhalt kann derselbe sein.",
      },
      {
        question: "Welches Format ist gesetzlich vorgeschrieben?",
        answer:
          "Vorgeschrieben ist eine strukturierte E-Rechnung nach den Regeln des UStG und EN 16931 – nicht ein bestimmtes Dateiendungsmarketing.",
      },
    ],
    sources: [
      {
        label: "BMF FAQ E-Rechnung",
        href: "https://www.bundesfinanzministerium.de/Content/DE/FAQ/e-rechnung.html",
      },
    ],
    related: ["xrechnung", "zugferd", "e-rechnung-erstellen", "pflicht-2027"],
  },
  {
    slug: "pflicht-2027",
    title: "E-Rechnungspflicht 2027 und 2028",
    description:
      "Empfang seit 2025, Ausstellung ab 2027 für größere Umsätze, ab 2028 für betroffene B2B-Umsätze.",
    keyword: "E-Rechnungspflicht 2027",
    updated: "2026-10-20",
    summary:
      "Die ausführliche Gesetzeslage mit Fristen, 800.000-Euro-Grenze, Ausnahmen und Quellen steht auf der eigenen Pflicht-2027-Seite.",
    sections: [
      {
        id: "hinweis",
        heading: "Ausführliche Seite",
        body: [
          "Zeitplan, Umsatzgrenze, Ausnahmen, Formate und FAQ sind auf der eigenen Seite zur E-Rechnungspflicht 2027 zusammengefasst.",
        ],
      },
    ],
    faq: [],
    sources: [
      {
        label: "E-Rechnungspflicht 2027 im Detail",
        href: "/ratgeber/pflicht-2027",
      },
    ],
    related: ["e-rechnung-erstellen", "xrechnung", "kleinunternehmer", "pflichtangaben"],
    canonicalPath: "/ratgeber/pflicht-2027",
  },
  {
    slug: "leitweg-id",
    title: "Leitweg-ID",
    description:
      "Leitweg-ID Aufbau, Beispiel und Prüfung: so gehört die Käuferreferenz bei Behörden in die E-Rechnung.",
    keyword: "Leitweg-ID",
    updated: "2026-10-20",
    summary:
      "Die Leitweg-ID steuert den Rechnungseingang bei der öffentlichen Hand. In der E-Rechnung gehört sie in die Käuferreferenz.",
    sections: [
      {
        id: "was",
        heading: "Was die Leitweg-ID ist",
        body: [
          "Die Leitweg-ID identifiziert die empfangende Stelle. Ohne passende ID kommt die Rechnung im Behördensystem oft nicht an.",
          "Du bekommst sie in der Regel vom Auftraggeber oder aus dem Vergabevorgang – nicht aus dem Rechnungsprogramm selbst.",
        ],
      },
      {
        id: "aufbau",
        heading: "Aufbau und Prüfung",
        body: [
          "Typisch sind Ziffernblöcke, getrennt durch Bindestriche, inklusive Prüfziffer. Das genaue Muster hängt von Bund, Land oder Kommune ab.",
          "E-RechnungDigital prüft Muster und Prüfziffer, wenn das Feld wie eine Leitweg-ID aussieht. Eine inhaltlich falsche, aber formal gültige ID erkennt kein Formatcheck.",
        ],
      },
      {
        id: "im-formular",
        heading: "Im Formular",
        body: [
          "Trage die Leitweg-ID als Käuferreferenz ein. Bei Nicht-Behörden kannst du dort eine andere Referenz nutzen, etwa eine Bestellnummer.",
        ],
      },
    ],
    faq: [
      {
        question: "Brauche ich immer eine Leitweg-ID?",
        answer:
          "Nur wenn der Empfänger sie verlangt – typisch bei der öffentlichen Hand. Sonst reicht eine andere Käuferreferenz.",
      },
      {
        question: "Woher bekomme ich die ID?",
        answer:
          "Vom Auftraggeber, aus der Bestellung oder dem Portal. Das Rechnungsprogramm erzeugt sie nicht.",
      },
    ],
    sources: [
      {
        label: "KoSIT / XRechnung",
        href: "https://www.xrechnung.verdi.de/",
      },
    ],
    related: ["xrechnung", "pflichtangaben", "e-rechnung-erstellen", "e-rechnung-pruefen"],
  },
  {
    slug: "kleinunternehmer",
    title: "Kleinunternehmer und E-Rechnung",
    description:
      "E-Rechnung für Kleinunternehmer nach § 19 UStG: Empfangspflicht, Ausstellung und Hinweistext ohne Umsatzsteuer.",
    keyword: "E-Rechnung Kleinunternehmer",
    updated: "2026-10-20",
    summary:
      "Kleinunternehmer nach § 19 UStG müssen E-Rechnungen empfangen können, sind von der Ausstellungspflicht aber ausgenommen. Wenn sie trotzdem strukturiert abrechnen, gehört der Hinweis ohne Umsatzsteuerausweis in die Rechnung.",
    sections: [
      {
        id: "pflicht",
        heading: "Was für Kleinunternehmer gilt",
        body: [
          "Seit 1. Januar 2025 müssen auch Kleinunternehmer E-Rechnungen empfangen können. Ein E-Mail-Postfach genügt oft als Einstieg.",
          "Von der Pflicht, selbst E-Rechnungen auszustellen, sind sie ausgenommen. Details und Übergangsfristen für andere Unternehmen stehen in der Gesetzeslage 2027.",
        ],
      },
      {
        id: "ausstellen",
        heading: "Wenn du trotzdem eine E-Rechnung schreibst",
        body: [
          "Wähle bei der Position den Steuerfall § 19. Dann erscheint der passende Hinweistext und kein Umsatzsteuerbetrag.",
          "Absender, Empfänger, Positionen und Zahlungsdaten bleiben nötig, wenn du eine vollständige strukturierte Datei erzeugen willst.",
        ],
      },
      {
        id: "empfang",
        heading: "Empfang und Ablage",
        body: [
          "Eingehende E-Rechnungen solltest du im Originalformat aufbewahren. Mindestens der strukturierte Teil muss erhalten bleiben.",
          "Zum Lesen kannst du XML oder ZUGFeRD lokal öffnen und die Felder ansehen.",
        ],
      },
    ],
    faq: [
      {
        question: "Muss ich als Kleinunternehmer XRechnung schreiben?",
        answer:
          "Zur Ausstellungspflicht nein. Empfangen können musst du seit 2025 trotzdem.",
      },
      {
        question: "Darf ich Umsatzsteuer ausweisen?",
        answer:
          "Unter § 19 UStG weist du keine Umsatzsteuer aus. Im Werkzeug wählst du dafür den Fall § 19.",
      },
    ],
    sources: [
      {
        label: "§ 19 UStG",
        href: "https://www.gesetze-im-internet.de/ustg_1980/__19.html",
      },
      {
        label: "BMF FAQ E-Rechnung",
        href: "https://www.bundesfinanzministerium.de/Content/DE/FAQ/e-rechnung.html",
      },
    ],
    related: ["pflicht-2027", "pflichtangaben", "e-rechnung-erstellen", "e-rechnung-oeffnen"],
  },
  {
    slug: "pflichtangaben",
    title: "Pflichtangaben einer E-Rechnung",
    description:
      "Pflichtangaben einer E-Rechnung: welche Felder vor dem Export stehen müssen und was geprüft wird.",
    keyword: "Pflichtangaben E-Rechnung",
    updated: "2026-10-20",
    summary:
      "Neben den klassischen Rechnungsangaben braucht die E-Rechnung strukturierte Felder wie Käuferreferenz und maschinenlesbare Steuer- und Positionsdaten.",
    sections: [
      {
        id: "minimum",
        heading: "Minimum vor dem Export",
        body: [
          "Rechnungsnummer und -datum, Leistungsdatum, Käuferreferenz, Absender mit Steuerangabe und E-Mail, Empfängeranschrift, Positionen mit Menge, Einheit, Preis und Steuer sowie IBAN und Fälligkeit oder Zahlungsbedingungen.",
          "Fehlt etwas davon, bleibt der Download gesperrt und die offenen Felder werden markiert.",
        ],
      },
      {
        id: "steuer",
        heading: "Steuer und Ausnahmen",
        body: [
          "Pro Position wählst du den Steuerfall, etwa 19 %, 7 %, befreit, § 19 oder § 13b. Dazu gehören passende Hinweise im XML.",
          "Ob die gewählte Ausnahme materiell richtig ist, prüft das Werkzeug nicht – nur ob die Angabe formal gesetzt ist.",
        ],
      },
      {
        id: "behoerde",
        heading: "Zusätzlich bei Behörden",
        body: [
          "Die Leitweg-ID gehört in die Käuferreferenz. Ohne sie scheitert der Eingang oft unabhängig davon, ob alle anderen Felder stimmen.",
        ],
      },
    ],
    faq: [
      {
        question: "Reicht Name und Betrag?",
        answer:
          "Nein. Für eine E-Rechnung brauchst du die strukturierten Pflichtangaben inklusive Käuferreferenz, Steuerfall und Zahlung.",
      },
      {
        question: "Wo sehe ich, was fehlt?",
        answer:
          "Im Formular: offene Pflichtfelder werden markiert, bevor Export oder Druck starten.",
      },
    ],
    sources: [
      {
        label: "§ 14 UStG",
        href: "https://www.gesetze-im-internet.de/ustg_1980/__14.html",
      },
    ],
    related: ["e-rechnung-erstellen", "leitweg-id", "e-rechnung-pruefen", "kleinunternehmer"],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}

export function guidePath(guide: Guide): string {
  return guide.canonicalPath ?? `/ratgeber/${guide.slug}`;
}
