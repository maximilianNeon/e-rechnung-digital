import { Link } from "react-router-dom";
import { Seo } from "../../components/Seo";
import styles from "./Pflicht2027.module.css";
import { pflicht2027Faq } from "./pflicht2027Data";

export function Pflicht2027Page() {
  return (
    <main className={styles.page}>
      <Seo path="/ratgeber/pflicht-2027" />

      <header className={styles.hero}>
        <div className={styles.breadcrumb}>
          <Link to="/ratgeber">Ratgeber</Link>
          <span>/</span>
          <span>Pflicht 2027</span>
        </div>
        <p className={styles.eyebrow}>GESETZESLAGE · STAND 20. OKTOBER 2026</p>
        <h1>E-Rechnungspflicht 2027: Was Unternehmen jetzt wissen müssen</h1>
        <p className={styles.lead}>
          Seit 2025 beginnt die Umstellung auf strukturierte Rechnungen. 2027 endet die
          Übergangsfrist für größere Aussteller, 2028 grundsätzlich für alle inländischen
          B2B-Umsätze. Hier steht, wer betroffen ist, welche Ausnahmen gelten und was eine echte
          E-Rechnung ausmacht.
        </p>
        <div className={styles.heroActions}>
          <Link to="/erstellen" className={styles.primary}>
            E-Rechnung erstellen
          </Link>
          <a href="#zeitplan" className={styles.secondary}>
            Zum Zeitplan
          </a>
        </div>
      </header>

      <section className={styles.answerBox} aria-labelledby="kurzantwort">
        <p className={styles.answerLabel}>KURZANTWORT</p>
        <h2 id="kurzantwort">Die 800.000-Euro-Grenze entscheidet über 2027</h2>
        <p>
          Für Umsätze im Jahr 2027 dürfen Rechnungsaussteller mit einem Gesamtumsatz von höchstens
          800.000 Euro im Vorjahr noch die Übergangsregel nutzen. Wer darüber liegt, muss bei
          betroffenen inländischen B2B-Umsätzen grundsätzlich E-Rechnungen ausstellen. Ab dem
          1. Januar 2028 endet diese Umsatzgrenzen-Ausnahme.
        </p>
      </section>

      <div className={styles.contentLayout}>
        <aside className={styles.toc} aria-label="Inhalt">
          <span>AUF DIESER SEITE</span>
          <a href="#was-ist-eine-e-rechnung">Was ist eine E-Rechnung?</a>
          <a href="#zeitplan">Zeitplan 2025–2028</a>
          <a href="#betroffen">Wer ist betroffen?</a>
          <a href="#ausnahmen">Ausnahmen</a>
          <a href="#formate">Zulässige Formate</a>
          <a href="#empfang">Empfang und Versand</a>
          <a href="#aufbewahrung">Aufbewahrung</a>
          <a href="#faq">Häufige Fragen</a>
        </aside>

        <article className={styles.article}>
          <section id="was-ist-eine-e-rechnung">
            <p className={styles.kicker}>GRUNDLAGE</p>
            <h2>Was ist eine E-Rechnung?</h2>
            <p>
              Eine E-Rechnung ist nach § 14 UStG eine Rechnung in einem strukturierten
              elektronischen Format. Dieses Format muss die elektronische Verarbeitung
              ermöglichen und grundsätzlich der europäischen Norm EN 16931 entsprechen oder mit
              ihr interoperabel sein.
            </p>
            <div className={styles.comparison}>
              <div>
                <span className={styles.yes}>E-RECHNUNG</span>
                <strong>XRechnung</strong>
                <p>Strukturiertes XML, direkt maschinenlesbar.</p>
              </div>
              <div>
                <span className={styles.yes}>E-RECHNUNG</span>
                <strong>ZUGFeRD</strong>
                <p>PDF/A-3 mit eingebettetem strukturiertem XML.</p>
              </div>
              <div>
                <span className={styles.no}>KEINE E-RECHNUNG</span>
                <strong>Einfache PDF</strong>
                <p>Menschenlesbar, aber ohne strukturierte Rechnungsdaten.</p>
              </div>
            </div>
          </section>

          <section id="zeitplan">
            <p className={styles.kicker}>FRISTEN</p>
            <h2>Der Zeitplan von 2025 bis 2028</h2>
            <div className={styles.timeline}>
              <div className={styles.timelineRow}>
                <div className={styles.date}>1. Januar 2025</div>
                <div>
                  <h3>Empfang wird notwendig</h3>
                  <p>
                    Inländische Unternehmen müssen E-Rechnungen empfangen können. Ein
                    E-Mail-Postfach genügt. Für die Ausstellung dürfen bis Ende 2026 noch alle
                    Unternehmen die allgemeine Übergangsregel nutzen.
                  </p>
                </div>
              </div>
              <div className={`${styles.timelineRow} ${styles.highlight}`}>
                <div className={styles.date}>1. Januar 2027</div>
                <div>
                  <h3>Umsatzgrenze von 800.000 Euro</h3>
                  <p>
                    Für Umsätze 2027 bleibt die Übergangsregel nur, wenn der Gesamtumsatz des
                    Ausstellers im Vorjahr höchstens 800.000 Euro betrug. Größere Aussteller müssen
                    grundsätzlich E-Rechnungen verwenden. Ein nicht normgerechtes EDI-Verfahren
                    darf mit Zustimmung noch bis Ende 2027 weiterlaufen.
                  </p>
                </div>
              </div>
              <div className={styles.timelineRow}>
                <div className={styles.date}>1. Januar 2028</div>
                <div>
                  <h3>Übergangsfristen enden</h3>
                  <p>
                    Bei betroffenen Umsätzen zwischen inländischen Unternehmen ist die
                    E-Rechnung dann der Regelfall – unabhängig von der Umsatzhöhe. Dauerhafte
                    gesetzliche Ausnahmen gelten weiterhin.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="betroffen">
            <p className={styles.kicker}>GELTUNGSBEREICH</p>
            <h2>Wer ist von der Pflicht betroffen?</h2>
            <p>
              Die Pflicht betrifft grundsätzlich Leistungen eines inländischen Unternehmers an
              einen anderen inländischen Unternehmer für dessen Unternehmen. Als inländisch gilt,
              wer hier Sitz, Geschäftsleitung oder eine am Umsatz beteiligte Betriebsstätte hat.
              Auch Freiberufler, Vermieter, Ärzte, Vereine mit unternehmerischem Bereich und
              Kleinunternehmer gelten grundsätzlich als Unternehmer.
            </p>
            <p>
              Entscheidend ist der konkrete Umsatz. Rechnungen an private Endverbraucher sind
              nicht Teil der B2B-E-Rechnungspflicht. Für Rechnungen an Behörden können zusätzlich
              die Regeln des öffentlichen Auftragswesens gelten, etwa XRechnung und Leitweg-ID.
            </p>
          </section>

          <section id="ausnahmen">
            <p className={styles.kicker}>AUSNAHMEN</p>
            <h2>Wann keine E-Rechnung vorgeschrieben ist</h2>
            <ul className={styles.checkList}>
              <li>Rechnungen an private Endverbraucher (B2C)</li>
              <li>Viele steuerfreie Umsätze nach § 4 Nr. 8 bis 29 UStG</li>
              <li>Kleinbetragsrechnungen bis 250 Euro brutto</li>
              <li>Fahrausweise, die als Rechnung gelten</li>
              <li>Leistungen von Kleinunternehmern nach § 19 UStG</li>
              <li>Bestimmte Leistungen an juristische Personen, die keine Unternehmer sind</li>
            </ul>
            <div className={styles.note}>
              <strong>Wichtig für Kleinunternehmer:</strong>
              <p>
                Sie sind von der Ausstellung einer E-Rechnung ausgenommen, müssen aber seit
                1. Januar 2025 E-Rechnungen empfangen können.
              </p>
            </div>
          </section>

          <section id="formate">
            <p className={styles.kicker}>FORMATE</p>
            <h2>XRechnung und ZUGFeRD</h2>
            <p>
              XRechnung ist ein strukturiertes XML-Format und besonders im Austausch mit Behörden
              verbreitet. ZUGFeRD kombiniert eine menschenlesbare PDF mit einem eingebetteten XML.
              Für die gesetzliche E-Rechnung muss das verwendete Profil die vollständigen
              strukturierten Rechnungsdaten nach EN 16931 enthalten. Bei ZUGFeRD sind dafür etwa
              die Profile EN 16931 und XRECHNUNG geeignet; reine Sicht- oder Minimalprofile
              reichen nicht.
            </p>
            <p>
              Bei einem hybriden Format ist der strukturierte Teil maßgeblich. Weichen PDF und XML
              voneinander ab, sind die XML-Daten für die umsatzsteuerliche Beurteilung entscheidend.
            </p>
          </section>

          <section id="empfang">
            <p className={styles.kicker}>PRAXIS</p>
            <h2>Empfangen und versenden</h2>
            <p>
              Das Gesetz schreibt keinen einzelnen Übermittlungsweg vor. Möglich sind zum Beispiel
              E-Mail, ein Download-Portal, eine elektronische Schnittstelle, EDI oder ein gemeinsam
              genutzter Speicherort. Welcher Weg verwendet wird, stimmen die Geschäftspartner
              miteinander ab.
            </p>
            <p>
              Für die Empfangsbereitschaft reicht laut Bundesfinanzministerium bereits ein
              E-Mail-Postfach. Der Empfänger muss die Daten nicht zwingend automatisiert
              weiterverarbeiten, aber er muss den strukturierten Teil aufbewahren können.
            </p>
          </section>

          <section id="aufbewahrung">
            <p className={styles.kicker}>ARCHIV</p>
            <h2>Acht Jahre im Originalformat aufbewahren</h2>
            <p>
              Ein- und ausgehende Rechnungen sind umsatzsteuerlich acht Jahre aufzubewahren. Bei
              einer E-Rechnung muss mindestens der strukturierte XML-Teil unversehrt in seiner
              ursprünglichen Form erhalten bleiben. E-RechnungDigital ist kein Archiv: Nach dem
              Download liegt die Aufbewahrung bei dir.
            </p>
          </section>

          <section className={styles.prepare}>
            <div>
              <p className={styles.kicker}>JETZT VORBEREITEN</p>
              <h2>Was du vor 2027 erledigen solltest</h2>
            </div>
            <ol>
              <li>E-Mail-Postfach oder Schnittstelle für den Empfang festlegen.</li>
              <li>Entscheiden, ob XRechnung, ZUGFeRD oder beide Formate gebraucht werden.</li>
              <li>Pflichtfelder und Käuferreferenzen im Rechnungsprozess erfassen.</li>
              <li>Eine unveränderbare Aufbewahrung des strukturierten XML organisieren.</li>
              <li>Rechnungsversand mit wichtigen Kunden und Behörden testen.</li>
            </ol>
            <Link to="/erstellen" className={styles.primary}>
              Erste E-Rechnung erstellen
            </Link>
          </section>

          <section id="faq">
            <p className={styles.kicker}>FAQ</p>
            <h2>Häufige Fragen zur E-Rechnungspflicht</h2>
            <div className={styles.faq}>
              {pflicht2027Faq.map((item) => (
                <details key={item.question}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section className={styles.sources}>
            <p className={styles.kicker}>QUELLEN</p>
            <h2>Offizielle Grundlagen</h2>
            <ul>
              <li>
                <a
                  href="https://www.gesetze-im-internet.de/ustg_1980/__14.html"
                  target="_blank"
                  rel="noreferrer"
                >
                  § 14 UStG – Ausstellung von Rechnungen
                </a>
              </li>
              <li>
                <a
                  href="https://www.gesetze-im-internet.de/ustg_1980/__27.html"
                  target="_blank"
                  rel="noreferrer"
                >
                  § 27 Abs. 38 UStG – Übergangsregelungen
                </a>
              </li>
              <li>
                <a
                  href="https://www.bundesfinanzministerium.de/Content/DE/FAQ/e-rechnung.html"
                  target="_blank"
                  rel="noreferrer"
                >
                  Bundesfinanzministerium – FAQ zur E-Rechnung
                </a>
              </li>
            </ul>
            <p className={styles.disclaimer}>
              Stand: 20. Oktober 2026. Diese Seite erklärt die allgemeine Rechtslage und ersetzt
              keine steuerliche oder rechtliche Beratung für deinen Einzelfall.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
