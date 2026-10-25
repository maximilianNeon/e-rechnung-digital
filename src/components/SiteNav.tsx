import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Brand } from "./Brand";
import styles from "./SiteNav.module.css";

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className={styles.nav}>
      <div className={styles.bar}>
        <Brand />
        <div className={styles.links}>
          <NavLink to="/erstellen" className={styles.link}>
            Erstellen
          </NavLink>
          <NavLink to="/oeffnen" className={styles.link}>
            Lesen
          </NavLink>
          <NavLink to="/ratgeber/pflicht-2027" className={styles.link}>
            Pflicht 2027
          </NavLink>
          <Link to="/erstellen" className={styles.cta}>
            Rechnung erstellen
          </Link>
        </div>
        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Schließen" : "Menü"}
        </button>
      </div>
      {open ? (
        <nav id="site-menu" className={styles.menu}>
          <NavLink to="/erstellen" onClick={close}>
            Rechnung erstellen
          </NavLink>
          <NavLink to="/oeffnen" onClick={close}>
            Rechnung öffnen
          </NavLink>
          <NavLink to="/ratgeber/pflicht-2027" onClick={close}>
            Pflicht 2027
          </NavLink>
          <NavLink to="/ratgeber" onClick={close}>
            Ratgeber
          </NavLink>
          <NavLink to="/pruefregeln" onClick={close}>
            Prüfregeln
          </NavLink>
        </nav>
      ) : null}
    </header>
  );
}
