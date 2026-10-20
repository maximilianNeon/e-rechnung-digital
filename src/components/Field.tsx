import type { ReactNode } from "react";
import type { FieldResult } from "../lib/validation";
import styles from "./Field.module.css";

interface FieldProps {
  label: string;
  fieldId?: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  result?: FieldResult;
  /** When true and the field is empty/invalid, show the red missing state. */
  markMissing?: boolean;
  suffix?: string;
  children: ReactNode;
  className?: string;
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className={styles.check}>
      <circle cx="8" cy="8" r="7" fill="#E7F3EC" />
      <path
        d="M4.8 8.2L7 10.4L11.3 5.8"
        fill="none"
        stroke="#1B6B45"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Field({
  label,
  fieldId,
  required,
  optional,
  hint,
  result,
  markMissing,
  suffix,
  children,
  className,
}: FieldProps) {
  const missing =
    !!markMissing &&
    (!result || result.status === "empty" || result.status === "invalid");
  const invalid = result?.status === "invalid" || missing;
  const valid = result?.status === "valid" && !missing;
  const message =
    result?.status === "invalid"
      ? result.message
      : missing
        ? "Noch offen."
        : undefined;

  return (
    <label
      className={`${styles.field} ${className ?? ""}`}
      data-field={fieldId}
      id={fieldId ? `field-${fieldId}` : undefined}
    >
      <span className={styles.labelRow}>
        <span className={styles.label}>
          {label}
          {required ? <span className={styles.dot} aria-hidden /> : null}
        </span>
        {optional ? <span className={styles.optional}>Optional</span> : null}
      </span>
      <span className={`${styles.control} ${invalid ? styles.invalid : ""}`}>
        {children}
        {suffix ? <span className={styles.suffix}>{suffix}</span> : null}
        {valid ? <CheckIcon /> : null}
      </span>
      {invalid && message ? <span className={styles.error}>{message}</span> : null}
      {!invalid && hint ? <span className={styles.hint}>{hint}</span> : null}
    </label>
  );
}
