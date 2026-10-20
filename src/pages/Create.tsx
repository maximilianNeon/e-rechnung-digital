import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Brand } from "../components/Brand";
import { CollapsibleSection } from "../components/CollapsibleSection";
import { Field } from "../components/Field";
import { InvoiceDocument } from "../components/InvoiceDocument";
import { InvoicePreview } from "../components/InvoicePreview";
import { Seo } from "../components/Seo";
import { downloadBytes, downloadText } from "../lib/download";
import {
  BRAND_COLORS,
  UNIT_OPTIONS,
  createEmptyDraft,
  emptyLine,
  type BrandColor,
  type InvoiceDraft,
  type TaxCase,
} from "../lib/model";
import {
  applyProfileToDraft,
  clearSellerProfile,
  loadSellerProfile,
  profileFromDraft,
  saveSellerProfile,
} from "../lib/profile";
import { createSampleDraft } from "../lib/sample";
import {
  canExport,
  getExportBlockers,
  getMissingFieldIds,
  sectionForField,
  validateBic,
  validateDate,
  validateDueDate,
  validateEmail,
  validateIban,
  validateLeitwegId,
  validateMoney,
  validatePostalCode,
  validateQuantity,
  validateRequired,
  validateVatId,
} from "../lib/validation";
import styles from "./Create.module.css";

type LocationState = {
  draft?: InvoiceDraft;
  unknownFields?: string[];
};

type SectionId = "appearance" | "invoice" | "seller" | "buyer" | "lines" | "payment";

const DEFAULT_OPEN: Record<SectionId, boolean> = {
  appearance: true,
  invoice: true,
  seller: true,
  buyer: true,
  lines: true,
  payment: true,
};

export function CreatePage() {
  const location = useLocation();
  const incoming = (location.state as LocationState | null) ?? null;
  const formRef = useRef<HTMLFormElement>(null);

  const [draft, setDraft] = useState<InvoiceDraft>(() => {
    const base = incoming?.draft ? structuredClone(incoming.draft) : createEmptyDraft();
    const profile = loadSellerProfile();
    return profile && !incoming?.draft ? applyProfileToDraft(base, profile) : base;
  });
  const [rememberSeller, setRememberSeller] = useState(() => !!loadSellerProfile());
  const [profileSaved, setProfileSaved] = useState(() => !!loadSellerProfile());
  const [exportError, setExportError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showMissing, setShowMissing] = useState(false);
  const [pane, setPane] = useState<"form" | "preview">("form");
  const [openSections, setOpenSections] = useState(DEFAULT_OPEN);

  const blockers = useMemo(() => getExportBlockers(draft), [draft]);
  const missingIds = useMemo(() => getMissingFieldIds(draft), [draft]);
  const ready = blockers.length === 0;

  useEffect(() => {
    if (!rememberSeller) return;
    saveSellerProfile(profileFromDraft(draft));
    setProfileSaved(true);
  }, [
    rememberSeller,
    draft.seller,
    draft.iban,
    draft.bic,
    draft.accountHolder,
    draft.appearance.brandColor,
    draft.appearance.logoDataUrl,
  ]);

  useEffect(() => {
    if (ready) setShowMissing(false);
  }, [ready]);

  const update = (patch: Partial<InvoiceDraft>) => setDraft((d) => ({ ...d, ...patch }));

  const updateSeller = (patch: Partial<InvoiceDraft["seller"]>) =>
    setDraft((d) => ({ ...d, seller: { ...d.seller, ...patch } }));

  const updateSellerAddress = (patch: Partial<InvoiceDraft["seller"]["address"]>) =>
    setDraft((d) => ({
      ...d,
      seller: { ...d.seller, address: { ...d.seller.address, ...patch } },
    }));

  const updateBuyer = (patch: Partial<InvoiceDraft["buyer"]>) =>
    setDraft((d) => ({ ...d, buyer: { ...d.buyer, ...patch } }));

  const updateBuyerAddress = (patch: Partial<InvoiceDraft["buyer"]["address"]>) =>
    setDraft((d) => ({
      ...d,
      buyer: { ...d.buyer, address: { ...d.buyer.address, ...patch } },
    }));

  const updateLine = (id: string, patch: Partial<InvoiceDraft["lines"][number]>) =>
    setDraft((d) => ({
      ...d,
      lines: d.lines.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    }));

  const removeLine = (id: string) =>
    setDraft((d) => ({
      ...d,
      lines: d.lines.length <= 1 ? d.lines : d.lines.filter((l) => l.id !== id),
    }));

  const toggleSection = (id: SectionId) =>
    setOpenSections((s) => ({ ...s, [id]: !s[id] }));

  const isMissing = (fieldId: string) => showMissing && missingIds.has(fieldId);

  const sectionHasError = (section: SectionId) =>
    showMissing && [...missingIds].some((id) => sectionForField(id) === section);

  const revealMissing = () => {
    setShowMissing(true);
    setPane("form");
    const first = blockers[0]?.field;
    if (!first) return;
    const section = sectionForField(first) as SectionId;
    setOpenSections((s) => ({ ...s, [section]: true }));
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el =
          formRef.current?.querySelector(`[data-field="${first}"]`) ??
          formRef.current?.querySelector(`[data-section="${section}"]`);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
  };

  const onLogo = async (file: File | null) => {
    if (!file) {
      update({ appearance: { ...draft.appearance, logoDataUrl: null } });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      update({
        appearance: { ...draft.appearance, logoDataUrl: String(reader.result) },
      });
    };
    reader.readAsDataURL(file);
  };

  const exportFiles = async (kind: "xml" | "pdf") => {
    if (!canExport(draft)) {
      revealMissing();
      return;
    }
    setBusy(true);
    setExportError(null);
    try {
      const { generateInvoiceFiles } = await import("../lib/generate");
      const result = await generateInvoiceFiles(draft);
      if (kind === "xml") {
        downloadText(result.xml, `${result.fileBase}.xml`, "application/xml");
      } else {
        downloadBytes(result.pdf, `${result.fileBase}.pdf`, "application/pdf");
      }
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Export fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  };

  const printInvoice = () => {
    if (!canExport(draft)) {
      revealMissing();
      return;
    }
    window.print();
  };

  const buyerRefResult = (() => {
    const v = draft.buyerReference.trim();
    if (!v) return validateRequired(v);
    if (v.includes("-") && /^\d/.test(v)) return validateLeitwegId(v);
    return validateRequired(v);
  })();

  const statusLabel = ready
    ? "Bereit zum Herunterladen"
    : blockers.length === 1
      ? `Noch 1 Angabe: ${blockers[0].label}`
      : `Noch ${blockers.length} Angaben`;

  const fillSample = () => {
    setDraft(createSampleDraft());
    setShowMissing(false);
    setExportError(null);
    setOpenSections(DEFAULT_OPEN);
  };

  return (
    <div className={styles.page}>
      <Seo path="/erstellen" />
      <header className={styles.appBar}>
        <Brand size="sm" />
        <span className={styles.appBarTitle}>Neue Rechnung</span>
        <Link to="/oeffnen" className={styles.appBarLink}>
          Rechnung öffnen
        </Link>
      </header>

      <div className={styles.paneSwitch} role="tablist" aria-label="Ansicht">
        <button
          type="button"
          role="tab"
          aria-selected={pane === "form"}
          className={pane === "form" ? styles.paneActive : undefined}
          onClick={() => setPane("form")}
        >
          Angaben
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={pane === "preview"}
          className={pane === "preview" ? styles.paneActive : undefined}
          onClick={() => setPane("preview")}
        >
          Dokument
        </button>
      </div>

      <div className={styles.body} data-pane={pane}>
        <form
          ref={formRef}
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            void exportFiles("pdf");
          }}
        >
          <div className={styles.intro}>
            <div className={styles.introTop}>
              <h1>Neue Rechnung</h1>
              <button type="button" className={styles.sampleBtn} onClick={fillSample}>
                Beispiel füllen
              </button>
            </div>
            <p>
              Alles auf einer Seite. Der Punkt an der Bezeichnung heißt: ohne diese Angabe lässt
              sich die Rechnung nicht exportieren.
            </p>
          </div>

          {incoming?.unknownFields && incoming.unknownFields.length > 0 ? (
            <div className={styles.errorBanner}>
              Bekannte Felder wurden übernommen. Nicht übernommen:{" "}
              {incoming.unknownFields.join(", ")}.
            </div>
          ) : null}

          <CollapsibleSection
            id="appearance"
            title="Erscheinung"
            open={openSections.appearance}
            onToggle={() => toggleSection("appearance")}
            badge={<span className={styles.optionalBadge}>Optional</span>}
          >
            <div className={styles.appearanceRow}>
              <div className={styles.logoBox} style={{ background: draft.appearance.brandColor }}>
                {draft.appearance.logoDataUrl ? (
                  <img src={draft.appearance.logoDataUrl} alt="" />
                ) : (
                  (draft.seller.name || "N").slice(0, 1).toUpperCase()
                )}
              </div>
              <div className={styles.grow}>
                <div>Logo</div>
                <div className={styles.hintMuted}>PNG oder JPG. Bleibt auf diesem Gerät.</div>
              </div>
              <label className={styles.remove}>
                Hochladen
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  hidden
                  onChange={(e) => void onLogo(e.target.files?.[0] ?? null)}
                />
              </label>
              {draft.appearance.logoDataUrl ? (
                <button type="button" className={styles.remove} onClick={() => void onLogo(null)}>
                  Entfernen
                </button>
              ) : null}
            </div>
            <div>
              <div className={styles.colorLabel}>Farbe</div>
              <div className={styles.swatches}>
                {BRAND_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={styles.swatch}
                    data-active={draft.appearance.brandColor === c}
                    onClick={() =>
                      update({ appearance: { ...draft.appearance, brandColor: c as BrandColor } })
                    }
                    aria-label={`Farbe ${c}`}
                  >
                    <span className={styles.swatchInner} style={{ background: c }} />
                  </button>
                ))}
              </div>
              <p className={styles.hintMuted} style={{ marginTop: 8 }}>
                Nur Kopfzeile und Linie. Beträge und Text bleiben schwarz.
              </p>
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            id="invoice"
            title="Rechnung"
            open={openSections.invoice}
            onToggle={() => toggleSection("invoice")}
            hasError={sectionHasError("invoice")}
          >
            <div className={styles.row}>
              <Field
                label="Rechnungsnummer"
                fieldId="invoiceNumber"
                required
                markMissing={isMissing("invoiceNumber")}
                result={validateRequired(draft.invoiceNumber)}
              >
                <input
                  value={draft.invoiceNumber}
                  onChange={(e) => update({ invoiceNumber: e.target.value })}
                />
              </Field>
              <Field
                label="Rechnungsdatum"
                fieldId="issueDate"
                required
                className={styles.fixed168}
                markMissing={isMissing("issueDate")}
                result={validateDate(draft.issueDate)}
              >
                <input
                  type="date"
                  value={draft.issueDate}
                  onChange={(e) => update({ issueDate: e.target.value })}
                />
              </Field>
            </div>
            <div className={styles.row}>
              <Field
                label="Leistungsdatum"
                fieldId="deliveryDate"
                required
                markMissing={isMissing("deliveryDate")}
                result={validateDate(draft.deliveryDate)}
              >
                <input
                  type="date"
                  value={draft.deliveryDate}
                  onChange={(e) => update({ deliveryDate: e.target.value })}
                />
              </Field>
              <Field
                label="Fällig am"
                fieldId="dueDate"
                required
                markMissing={isMissing("dueDate")}
                result={validateDueDate(draft.dueDate, draft.issueDate)}
              >
                <input
                  type="date"
                  value={draft.dueDate}
                  onChange={(e) => update({ dueDate: e.target.value })}
                />
              </Field>
            </div>
            <Field
              label="Käuferreferenz"
              fieldId="buyerReference"
              required
              markMissing={isMissing("buyerReference")}
              result={buyerRefResult}
              hint="Bei einer Behörde die Leitweg-ID, sonst eine Referenz des Empfängers."
            >
              <input
                value={draft.buyerReference}
                onChange={(e) => update({ buyerReference: e.target.value })}
              />
            </Field>
          </CollapsibleSection>

          <CollapsibleSection
            id="seller"
            title="Absender"
            open={openSections.seller}
            onToggle={() => toggleSection("seller")}
            hasError={sectionHasError("seller")}
            badge={
              profileSaved ? (
                <span className={styles.saved}>Gespeichert auf diesem Gerät</span>
              ) : null
            }
          >
            <div className={styles.profileBar}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={rememberSeller}
                  onChange={(e) => {
                    setRememberSeller(e.target.checked);
                    if (!e.target.checked) {
                      clearSellerProfile();
                      setProfileSaved(false);
                    }
                  }}
                />
                Für die nächste Rechnung merken
              </label>
              {profileSaved ? (
                <button
                  type="button"
                  onClick={() => {
                    clearSellerProfile();
                    setRememberSeller(false);
                    setProfileSaved(false);
                  }}
                >
                  Löschen
                </button>
              ) : null}
            </div>
            <Field
              label="Name"
              fieldId="seller.name"
              required
              markMissing={isMissing("seller.name")}
              result={validateRequired(draft.seller.name)}
            >
              <input
                value={draft.seller.name}
                onChange={(e) => updateSeller({ name: e.target.value })}
              />
            </Field>
            <div className={styles.row}>
              <Field
                label="Straße"
                fieldId="seller.street"
                required
                markMissing={isMissing("seller.street")}
                result={validateRequired(draft.seller.address.street)}
              >
                <input
                  value={draft.seller.address.street}
                  onChange={(e) => updateSellerAddress({ street: e.target.value })}
                />
              </Field>
              <Field
                label="PLZ"
                fieldId="seller.postalCode"
                required
                className={styles.fixed120}
                markMissing={isMissing("seller.postalCode")}
                result={validatePostalCode(
                  draft.seller.address.postalCode,
                  draft.seller.address.country,
                )}
              >
                <input
                  value={draft.seller.address.postalCode}
                  onChange={(e) => updateSellerAddress({ postalCode: e.target.value })}
                />
              </Field>
            </div>
            <div className={styles.row}>
              <Field
                label="Ort"
                fieldId="seller.city"
                required
                markMissing={isMissing("seller.city")}
                result={validateRequired(draft.seller.address.city)}
              >
                <input
                  value={draft.seller.address.city}
                  onChange={(e) => updateSellerAddress({ city: e.target.value })}
                />
              </Field>
              <Field
                label="Land"
                fieldId="seller.country"
                required
                className={styles.fixed168}
                markMissing={isMissing("seller.country")}
                result={validateRequired(draft.seller.address.country)}
              >
                <input
                  value={draft.seller.address.country}
                  onChange={(e) => updateSellerAddress({ country: e.target.value })}
                />
              </Field>
            </div>
            <div className={styles.row}>
              <Field
                label="USt-IdNr."
                fieldId="seller.vatId"
                required={!draft.seller.taxNumber.trim()}
                markMissing={isMissing("seller.vatId")}
                result={
                  draft.seller.vatId
                    ? validateVatId(draft.seller.vatId)
                    : draft.seller.taxNumber
                      ? { status: "valid" }
                      : { status: "empty" }
                }
              >
                <input
                  value={draft.seller.vatId}
                  onChange={(e) => updateSeller({ vatId: e.target.value })}
                />
              </Field>
              <Field
                label="E-Mail"
                fieldId="seller.email"
                required
                markMissing={isMissing("seller.email")}
                result={validateEmail(draft.seller.email)}
              >
                <input
                  value={draft.seller.email}
                  onChange={(e) => updateSeller({ email: e.target.value })}
                />
              </Field>
            </div>
            <Field
              label="Steuernummer"
              fieldId="seller.taxNumber"
              optional={!!draft.seller.vatId.trim()}
              markMissing={isMissing("seller.taxNumber")}
              hint="Oder die USt-IdNr. Eins von beiden reicht."
            >
              <input
                value={draft.seller.taxNumber}
                onChange={(e) => updateSeller({ taxNumber: e.target.value })}
              />
            </Field>
          </CollapsibleSection>

          <CollapsibleSection
            id="buyer"
            title="Empfänger"
            open={openSections.buyer}
            onToggle={() => toggleSection("buyer")}
            hasError={sectionHasError("buyer")}
          >
            <div className={styles.row}>
              <Field
                label="Name"
                fieldId="buyer.name"
                required
                markMissing={isMissing("buyer.name")}
                result={validateRequired(draft.buyer.name)}
              >
                <input
                  value={draft.buyer.name}
                  onChange={(e) => updateBuyer({ name: e.target.value })}
                />
              </Field>
              <Field
                label="E-Mail"
                optional
                result={draft.buyer.email ? validateEmail(draft.buyer.email) : undefined}
              >
                <input
                  value={draft.buyer.email}
                  onChange={(e) => updateBuyer({ email: e.target.value })}
                />
              </Field>
            </div>
            <div className={styles.row}>
              <Field
                label="Straße"
                fieldId="buyer.street"
                required
                markMissing={isMissing("buyer.street")}
                result={validateRequired(draft.buyer.address.street)}
              >
                <input
                  value={draft.buyer.address.street}
                  onChange={(e) => updateBuyerAddress({ street: e.target.value })}
                />
              </Field>
              <Field
                label="PLZ"
                fieldId="buyer.postalCode"
                required
                className={styles.fixed120}
                markMissing={isMissing("buyer.postalCode")}
                result={validatePostalCode(
                  draft.buyer.address.postalCode,
                  draft.buyer.address.country || "DE",
                )}
              >
                <input
                  value={draft.buyer.address.postalCode}
                  onChange={(e) => updateBuyerAddress({ postalCode: e.target.value })}
                />
              </Field>
              <Field
                label="Ort"
                fieldId="buyer.city"
                required
                markMissing={isMissing("buyer.city")}
                result={validateRequired(draft.buyer.address.city)}
              >
                <input
                  value={draft.buyer.address.city}
                  onChange={(e) => updateBuyerAddress({ city: e.target.value })}
                />
              </Field>
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            id="lines"
            title="Leistungen"
            open={openSections.lines}
            onToggle={() => toggleSection("lines")}
            hasError={sectionHasError("lines")}
            badge={
              <span className={styles.countBadge}>
                {draft.lines.length} Position{draft.lines.length === 1 ? "" : "en"}
              </span>
            }
          >
            {draft.lines.map((line, index) => (
              <div key={line.id} className={styles.positionBlock}>
                <div className={styles.positionHead}>
                  <span>Position {index + 1}</span>
                  <button
                    type="button"
                    className={styles.remove}
                    onClick={() => removeLine(line.id)}
                    disabled={draft.lines.length <= 1}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
                      <path
                        d="M3 3L9 9M9 3L3 9"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </svg>
                    Entfernen
                  </button>
                </div>
                <Field
                  label="Bezeichnung"
                  fieldId={`line.${line.id}.description`}
                  required
                  markMissing={isMissing(`line.${line.id}.description`)}
                  result={validateRequired(line.description)}
                >
                  <input
                    value={line.description}
                    onChange={(e) => updateLine(line.id, { description: e.target.value })}
                  />
                </Field>
                <Field label="Beschreibung" optional>
                  <textarea
                    rows={3}
                    value={line.details}
                    onChange={(e) => updateLine(line.id, { details: e.target.value })}
                  />
                </Field>
                <div className={styles.row}>
                  <Field
                    label="Menge"
                    fieldId={`line.${line.id}.quantity`}
                    required
                    className={styles.fixed88}
                    markMissing={isMissing(`line.${line.id}.quantity`)}
                    result={validateQuantity(line.quantity)}
                  >
                    <input
                      value={line.quantity}
                      onChange={(e) => updateLine(line.id, { quantity: e.target.value })}
                    />
                  </Field>
                  <Field
                    label="Einheit"
                    fieldId={`line.${line.id}.unit`}
                    required
                    className={styles.fixed188}
                    markMissing={isMissing(`line.${line.id}.unit`)}
                    result={validateRequired(line.unit)}
                  >
                    <select
                      value={line.unit}
                      onChange={(e) => updateLine(line.id, { unit: e.target.value })}
                    >
                      {UNIT_OPTIONS.map((u) => (
                        <option key={u.value} value={u.value}>
                          {u.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field
                    label="Einzelpreis"
                    fieldId={`line.${line.id}.unitPrice`}
                    required
                    suffix="€"
                    markMissing={isMissing(`line.${line.id}.unitPrice`)}
                    result={validateMoney(line.unitPrice)}
                  >
                    <input
                      value={line.unitPrice}
                      onChange={(e) => updateLine(line.id, { unitPrice: e.target.value })}
                      placeholder="0,00"
                      inputMode="decimal"
                    />
                  </Field>
                  <Field label="USt" required className={styles.fixed110}>
                    <select
                      value={line.taxCase}
                      onChange={(e) =>
                        updateLine(line.id, { taxCase: e.target.value as TaxCase })
                      }
                    >
                      <option value="standard19">19 %</option>
                      <option value="standard7">7 %</option>
                      <option value="exempt">Befreit</option>
                      <option value="kleinunternehmer">§ 19</option>
                      <option value="reverseCharge">§ 13b</option>
                    </select>
                  </Field>
                </div>
              </div>
            ))}
            <button
              type="button"
              className={styles.addLine}
              onClick={() => setDraft((d) => ({ ...d, lines: [...d.lines, emptyLine()] }))}
            >
              + Position hinzufügen
            </button>
          </CollapsibleSection>

          <CollapsibleSection
            id="payment"
            title="Zahlung"
            open={openSections.payment}
            onToggle={() => toggleSection("payment")}
            hasError={sectionHasError("payment")}
          >
            <Field
              label="IBAN"
              fieldId="iban"
              required
              markMissing={isMissing("iban")}
              result={validateIban(draft.iban)}
            >
              <input value={draft.iban} onChange={(e) => update({ iban: e.target.value })} />
            </Field>
            <div className={styles.row}>
              <Field
                label="BIC"
                fieldId="bic"
                optional
                className={styles.fixed200}
                markMissing={isMissing("bic")}
                result={draft.bic ? validateBic(draft.bic) : undefined}
              >
                <input value={draft.bic} onChange={(e) => update({ bic: e.target.value })} />
              </Field>
              <Field
                label="Zahlungsbedingungen"
                fieldId="paymentTerms"
                markMissing={isMissing("paymentTerms")}
                hint="Fälligkeit oder dieser Satz. Eins von beiden reicht."
              >
                <input
                  value={draft.paymentTerms}
                  onChange={(e) => update({ paymentTerms: e.target.value })}
                />
              </Field>
            </div>
          </CollapsibleSection>

          <div className={styles.footer}>
            <p className={styles.legend}>
              Punkt heißt Pflicht vor dem Export. E-Rechnung ist die strukturierte Datei, PDF die
              lesbare Rechnung.
            </p>
            {showMissing && !ready ? (
              <div className={styles.errorBanner}>
                Noch {blockers.length} offene Angabe{blockers.length === 1 ? "" : "en"}. Die roten
                Felder müssen vor dem Download stimmen.
              </div>
            ) : null}
            {exportError ? <div className={styles.errorBanner}>{exportError}</div> : null}
            <div className={styles.footerRow}>
              <div className={styles.status}>
                <span className={`${styles.statusDot} ${ready ? styles.ok : ""}`} />
                {statusLabel}
              </div>
              <div className={styles.downloadMenu}>
                <button
                  type="button"
                  className={`${styles.ghost} ${!ready ? styles.downloadMuted : ""}`}
                  disabled={busy}
                  onClick={() => void exportFiles("xml")}
                >
                  E-Rechnung
                </button>
                <button
                  type="button"
                  className={`${styles.ghost} ${!ready ? styles.downloadMuted : ""}`}
                  disabled={busy}
                  onClick={printInvoice}
                >
                  Drucken
                </button>
                <button
                  type="submit"
                  className={`${styles.download} ${!ready ? styles.downloadMuted : ""}`}
                  disabled={busy}
                >
                  {busy ? "…" : "PDF"}
                </button>
              </div>
            </div>
          </div>
        </form>

        <aside className={styles.previewCol}>
          <div className={styles.previewToolbar}>
            <div className={styles.previewCaption}>DAS DOKUMENT</div>
            <div className={styles.previewActions}>
              <button
                type="button"
                className={`${styles.ghostSm} ${!ready ? styles.downloadMuted : ""}`}
                disabled={busy}
                onClick={printInvoice}
              >
                Drucken
              </button>
              <button
                type="button"
                className={`${styles.downloadSm} ${!ready ? styles.downloadMuted : ""}`}
                disabled={busy}
                onClick={() => void exportFiles("pdf")}
              >
                PDF
              </button>
            </div>
          </div>
          <InvoicePreview draft={draft} badge={ready ? "Gültig" : "Entwurf"} />
        </aside>
      </div>
      <div className={styles.printRoot}>
        <InvoiceDocument draft={draft} />
      </div>
    </div>
  );
}
