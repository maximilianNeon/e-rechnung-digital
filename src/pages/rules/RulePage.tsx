import { Link, useParams } from "react-router-dom";
import { Seo } from "../../components/Seo";
import styles from "../guides/Guide.module.css";
import { getRule, ruleDescription, ruleHeadline, rulePath, rules } from "./rules";

export function RuleIndexPage() {
  const groups = (["XRechnung", "EN 16931"] as const).map((source) => ({
    source,
    items: rules.filter((rule) => rule.source === source),
  }));

  return (
    <main className={styles.page}>
      <Seo path="/pruefregeln" />
      <p className={styles.eyebrow}>PRÜFREGELN</p>
      <h1>Prüfregeln der E-Rechnung</h1>
      <p className={styles.lead}>
        Dein Portal oder Validator meldet BR-DE-15 oder BR-CO-10? Hier steht zu jeder Regel, was sie
        bedeutet und wie du die Rechnung korrigierst.
      </p>
      <article className={styles.article}>
        {groups.map((group) => (
          <section key={group.source}>
            <h2>{group.source === "XRechnung" ? "XRechnung (BR-DE, Peppol)" : "EN 16931 (BR, BR-CO)"}</h2>
            <div className={styles.list}>
              {group.items.map((rule) => (
                <Link key={rule.id} to={rulePath(rule.id)}>
                  <strong>{rule.id}</strong>
                  <span>{rule.title}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </article>
    </main>
  );
}

export function RulePage() {
  const { slug } = useParams();
  const rule = slug ? getRule(slug) : undefined;

  if (!rule) {
    return (
      <main className={styles.page}>
        <Seo
          path={`/pruefregeln/${slug ?? "unbekannt"}`}
          title="Prüfregel nicht gefunden"
          description="Diese Prüfregel ist hier noch nicht erklärt."
          indexable={false}
        />
        <h1>Prüfregel nicht gefunden</h1>
        <p>
          <Link to="/pruefregeln">Alle Prüfregeln</Link>
        </p>
      </main>
    );
  }

  const related = rule.related
    .map((id) => getRule(id))
    .filter((item): item is NonNullable<typeof item> => !!item);

  return (
    <main className={styles.page}>
      <Seo path={rulePath(rule.id)} type="article" />

      <div className={styles.breadcrumb}>
        <Link to="/pruefregeln">Prüfregeln</Link>
        <span>/</span>
        <span>{rule.id}</span>
      </div>
      <p className={styles.eyebrow}>
        {rule.source.toUpperCase()} · {rule.severity.toUpperCase()} · {rule.terms.join(", ")}
      </p>
      <h1>{ruleHeadline(rule)}</h1>
      <p className={styles.lead}>{ruleDescription(rule)}</p>

      <section className={styles.answerBox} aria-labelledby="kurzantwort">
        <p className={styles.answerLabel}>KURZANTWORT</p>
        <h2 id="kurzantwort">So behebst du {rule.id}</h2>
        <p>{rule.fix}</p>
      </section>

      <article className={styles.article}>
        <section id="bedeutung">
          <h2>Was {rule.id} bedeutet</h2>
          <p>{rule.meaning}</p>
        </section>
        <section id="ursache">
          <h2>Typische Ursache</h2>
          <p>{rule.cause}</p>
        </section>
        <section id="loesung">
          <h2>Lösung</h2>
          <p>{rule.fix}</p>
          <p>
            Mit E-RechnungDigital prüfst du Pflichtfelder vor dem Download. Eine vorhandene Datei
            kannst du unter <Link to="/oeffnen">E-Rechnung öffnen</Link> laden, korrigieren und neu
            erzeugen – lokal im Browser.
          </p>
        </section>

        {related.length > 0 ? (
          <section className={styles.related}>
            <h2>Verwandte Prüfregeln</h2>
            <div className={styles.relatedList}>
              {related.map((item) => (
                <Link key={item.id} to={rulePath(item.id)}>
                  {ruleHeadline(item)}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <Link to="/oeffnen" className={styles.cta}>
          Rechnung öffnen und prüfen
        </Link>
      </article>
    </main>
  );
}
