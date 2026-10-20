import { Link } from "react-router-dom";
import styles from "./Brand.module.css";

interface BrandProps {
  size?: "sm" | "md";
  to?: string;
}

export function Brand({ size = "md", to = "/" }: BrandProps) {
  const content = (
    <span className={`${styles.mark} ${size === "sm" ? styles.sm : styles.md}`}>
      <span className={styles.dark}>E-Rechnung</span>
      <span className={styles.accent}>Digital</span>
    </span>
  );

  if (to) {
    return (
      <Link to={to} className={styles.link} aria-label="E-RechnungDigital">
        {content}
      </Link>
    );
  }
  return content;
}
