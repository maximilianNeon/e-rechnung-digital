import type { Appearance, InvoiceDraft, SellerProfile } from "./model";

const STORAGE_KEY = "erechnungdigital.sellerProfile.v1";

export function loadSellerProfile(): SellerProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SellerProfile;
  } catch {
    return null;
  }
}

export function saveSellerProfile(profile: SellerProfile): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function clearSellerProfile(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function profileFromDraft(draft: InvoiceDraft): SellerProfile {
  return {
    name: draft.seller.name,
    street: draft.seller.address.street,
    postalCode: draft.seller.address.postalCode,
    city: draft.seller.address.city,
    country: draft.seller.address.country,
    vatId: draft.seller.vatId,
    taxNumber: draft.seller.taxNumber,
    email: draft.seller.email,
    phone: draft.seller.phone,
    contactName: draft.seller.contactName,
    iban: draft.iban,
    bic: draft.bic,
    accountHolder: draft.accountHolder || draft.seller.name,
    brandColor: draft.appearance.brandColor,
    logoDataUrl: draft.appearance.logoDataUrl,
  };
}

export function applyProfileToDraft(draft: InvoiceDraft, profile: SellerProfile): InvoiceDraft {
  const appearance: Appearance = {
    brandColor: profile.brandColor ?? draft.appearance.brandColor,
    logoDataUrl: profile.logoDataUrl ?? draft.appearance.logoDataUrl,
  };
  return {
    ...draft,
    seller: {
      ...draft.seller,
      name: profile.name,
      address: {
        street: profile.street,
        postalCode: profile.postalCode,
        city: profile.city,
        country: profile.country || "DE",
      },
      vatId: profile.vatId,
      taxNumber: profile.taxNumber,
      email: profile.email,
      phone: profile.phone,
      contactName: profile.contactName,
    },
    iban: profile.iban,
    bic: profile.bic,
    accountHolder: profile.accountHolder,
    appearance,
  };
}
