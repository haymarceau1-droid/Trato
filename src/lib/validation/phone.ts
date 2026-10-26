import { parsePhoneNumberFromString } from "libphonenumber-js";

/** Teléfono mexicano → E.164 (+52XXXXXXXXXX) o null si no es válido. */
export function toMxE164(raw: string): string | null {
  const p = parsePhoneNumberFromString(raw.trim(), "MX");
  return p && p.isValid() && p.country === "MX" ? p.number : null;
}
