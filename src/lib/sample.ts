import type { InvoiceDraft } from "./model";
import { createEmptyDraft } from "./model";

/** Realistic demo invoice for local testing. */
export function createSampleDraft(): InvoiceDraft {
  const draft = createEmptyDraft();
  draft.invoiceNumber = "RE-2026-014";
  draft.issueDate = "2026-10-20";
  draft.deliveryDate = "2026-10-18";
  draft.dueDate = "2026-11-03";
  draft.buyerReference = "Projekt Helder";
  draft.paymentTerms = "14 Tage, 2 % Skonto in 7 Tagen";
  draft.seller = {
    name: "Atelier Nord GmbH",
    address: {
      street: "Hafenstraße 12",
      postalCode: "20457",
      city: "Hamburg",
      country: "DE",
    },
    vatId: "DE123456789",
    taxNumber: "12/345/67890",
    email: "lena@atelier-nord.de",
    phone: "+49 40 123456",
    contactName: "Lena Hartung",
    customerNumber: "",
  };
  draft.buyer = {
    name: "Studio Helder",
    address: {
      street: "Schulterblatt 88",
      postalCode: "20357",
      city: "Hamburg",
      country: "DE",
    },
    vatId: "DE987654321",
    taxNumber: "",
    email: "rechnung@studio-helder.de",
    phone: "",
    contactName: "Mara Helder",
    customerNumber: "K-220",
  };
  draft.lines = [
    {
      id: crypto.randomUUID(),
      description: "Konzeption",
      details: "Workshop, Zielbild und Ablauf der nächsten Schritte",
      quantity: "12",
      unit: "HUR",
      unitPrice: "95,00",
      taxCase: "standard19",
      articleNumber: "KON-01",
    },
    {
      id: crypto.randomUUID(),
      description: "Gestaltung",
      details: "",
      quantity: "8",
      unit: "HUR",
      unitPrice: "110,00",
      taxCase: "standard19",
      articleNumber: "GES-01",
    },
    {
      id: crypto.randomUUID(),
      description: "Projektkoordination",
      details: "Abstimmung mit dem Team und kurzer Status",
      quantity: "4",
      unit: "HUR",
      unitPrice: "85,00",
      taxCase: "standard19",
      articleNumber: "KOOR-01",
    },
  ];
  draft.iban = "DE89 3704 0044 0532 0130 00";
  draft.bic = "COBADEFFXXX";
  draft.accountHolder = "Atelier Nord GmbH";
  draft.appearance = {
    logoDataUrl: null,
    brandColor: "#1B6B45",
  };
  return draft;
}
