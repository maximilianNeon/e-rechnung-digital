import { validateBic, validateIban, validatePostalCode, validateVatId } from "./validation";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

assert(validateIban("DE89 3704 0044 0532 0130 00").status === "valid", "IBAN valid");
assert(validateIban("DE89 3704 0044 0532 013").status === "invalid", "IBAN short invalid");
assert(validateBic("COBADEFFXXX").status === "valid", "BIC valid");
assert(validateVatId("DE123456789").status === "valid", "VAT valid");
assert(validateVatId("DE123").status === "invalid", "VAT invalid");
assert(validatePostalCode("20457", "DE").status === "valid", "PLZ valid");
assert(validatePostalCode("2045", "DE").status === "invalid", "PLZ invalid");

console.log("validation.test.ts ok");
