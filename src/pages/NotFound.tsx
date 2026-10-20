import { Link } from "react-router-dom";
import { Seo } from "../components/Seo";
import styles from "./NotFound.module.css";

export function NotFoundPage() {
  return (
    <main className={styles.page}>
      <Seo
        path="/404"
        title="Seite nicht gefunden"
        description="Diese Seite gibt es bei E-RechnungDigital nicht."
        indexable={false}
      />
      <p className={styles.eyebrow}>404</p>
      <h1>Seite nicht gefunden</h1>
      <p className={styles.lead}>
        Der Link führt nirgendwo hin. Zur Startseite oder in den Ratgeber.
      </p>
      <div className={styles.actions}>
        <Link to="/" className={styles.primary}>
          Zur Startseite
        </Link>
        <Link to="/ratgeber" className={styles.secondary}>
          Ratgeber
        </Link>
      </div>
    </main>
  );
}
