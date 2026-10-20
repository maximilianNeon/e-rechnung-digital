import { Link, Navigate, useParams } from "react-router-dom";
import { Seo } from "../../components/Seo";
import { getGuide, guidePath, guides } from "./guides";
import styles from "./Guide.module.css";

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}.${m}.${y}`;
}

export function GuideIndexPage() {
  return (
    <main className={styles.page}>
      <Seo path="/ratgeber" />
      <p className={styles.eyebrow}>RATGEBER</p>
      <h1>Ratgeber</h1>
      <p className={styles.lead}>Kurze Seiten zu den häufigsten Fragen rund um die E-Rechnung.</p>
      <div className={styles.list}>
        {guides.map((g) => (
          <Link key={g.slug} to={guidePath(g)}>
            <strong>{g.title}</strong>
            <span>{g.description}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}

export function GuidePage() {
  const { slug } = useParams();
  const guide = slug ? getGuide(slug) : undefined;

  if (!guide) {
    return (
      <main className={styles.page}>
        <Seo
          path={`/ratgeber/${slug ?? "unbekannt"}`}
          title="Seite nicht gefunden"
          description="Dieser Ratgeber-Eintrag existiert nicht."
          indexable={false}
        />
        <h1>Seite nicht gefunden</h1>
        <p>
          <Link to="/ratgeber">Zurück zum Ratgeber</Link>
        </p>
      </main>
    );
  }

  if (guide.canonicalPath) {
    return <Navigate to={guide.canonicalPath} replace />;
  }

  const related = guide.related
    .map((relatedSlug) => getGuide(relatedSlug))
    .filter((item): item is NonNullable<typeof item> => !!item);

  return (
    <main className={styles.page}>
      <Seo path={`/ratgeber/${guide.slug}`} type="article" />

      <div className={styles.breadcrumb}>
        <Link to="/ratgeber">Ratgeber</Link>
        <span>/</span>
        <span>{guide.title}</span>
      </div>
      <p className={styles.eyebrow}>
        RATGEBER · STAND {formatDate(guide.updated).toUpperCase()}
      </p>
      <h1>{guide.title}</h1>
      <p className={styles.lead}>{guide.description}</p>

      <section className={styles.answerBox} aria-labelledby="kurzantwort">
        <p className={styles.answerLabel}>KURZANTWORT</p>
        <h2 id="kurzantwort">{guide.keyword}</h2>
        <p>{guide.summary}</p>
      </section>

      <div className={styles.contentLayout}>
        <aside className={styles.toc} aria-label="Inhalt">
          <span>AUF DIESER SEITE</span>
          {guide.sections.map((section) => (
            <a key={section.id} href={`#${section.id}`}>
              {section.heading}
            </a>
          ))}
          {guide.faq.length > 0 ? <a href="#faq">Häufige Fragen</a> : null}
          {guide.sources.length > 0 ? <a href="#quellen">Quellen</a> : null}
        </aside>

        <article className={styles.article}>
          {guide.sections.map((section) => (
            <section key={section.id} id={section.id}>
              <h2>{section.heading}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
            </section>
          ))}

          {guide.faq.length > 0 ? (
            <section id="faq" className={styles.faq}>
              <h2>Häufige Fragen</h2>
              {guide.faq.map((item) => (
                <details key={item.question}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </section>
          ) : null}

          {guide.sources.length > 0 ? (
            <section id="quellen">
              <h2>Quellen</h2>
              <ul>
                {guide.sources.map((source) => (
                  <li key={source.href}>
                    {source.href.startsWith("/") ? (
                      <Link to={source.href}>{source.label}</Link>
                    ) : (
                      <a href={source.href} rel="noopener noreferrer" target="_blank">
                        {source.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {related.length > 0 ? (
            <section className={styles.related}>
              <h2>Weiterlesen</h2>
              <div className={styles.relatedList}>
                {related.map((item) => (
                  <Link key={item.slug} to={guidePath(item)}>
                    {item.title}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <Link to="/erstellen" className={styles.cta}>
            Rechnung erstellen
          </Link>
        </article>
      </div>
    </main>
  );
}
