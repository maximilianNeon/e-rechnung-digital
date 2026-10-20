import { Link } from "react-router-dom";
import { Brand } from "./Brand";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <Brand size="sm" />
      <div className={styles.links}>
        <Link to="/impressum">Impressum</Link>
        <Link to="/datenschutz">Datenschutz</Link>
        <Link to="/nutzung">Nutzung</Link>
      </div>
    </footer>
  );
}
