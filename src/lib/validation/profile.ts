import { z } from "zod";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { MX_STATES } from "@/lib/constants";

export const profileSchema = z.object({
  display_name: z.string().trim().min(2, "Escribe tu nombre").max(50),
  state: z
    .enum(MX_STATES.map((s) => s.slug) as [string, ...string[]])
    .optional()
    .or(z.literal("")),
  city: z.string().trim().max(60).optional(),
});

/** Teléfono mexicano → E.164 (+52XXXXXXXXXX) o null si no es válido. */
export function toMxE164(raw: string): string | null {
  const p = parsePhoneNumberFromString(raw.trim(), "MX");
  return p && p.isValid() && p.country === "MX" ? p.number : null;
}
