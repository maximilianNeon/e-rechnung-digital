import type { ReactNode } from "react";
import styles from "./CollapsibleSection.module.css";

interface CollapsibleSectionProps {
  id: string;
  title: string;
  open: boolean;
  onToggle: () => void;
  badge?: ReactNode;
  children: ReactNode;
  hasError?: boolean;
}

export function CollapsibleSection({
  id,
  title,
  open,
  onToggle,
  badge,
  children,
  hasError,
}: CollapsibleSectionProps) {
  return (
    <section className={`${styles.section} ${hasError ? styles.hasError : ""}`} data-section={id}>
      <button
        type="button"
        className={styles.head}
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`section-${id}`}
      >
        <span className={styles.title}>{title}</span>
        <span className={styles.meta}>
          {badge}
          <svg
            className={`${styles.chevron} ${open ? styles.open : ""}`}
            width="14"
            height="14"
            viewBox="0 0 12 12"
            aria-hidden
          >
            <path
              d="M2.5 4.5L6 8L9.5 4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
      {open ? (
        <div id={`section-${id}`} className={styles.body}>
          {children}
        </div>
      ) : null}
    </section>
  );
}
