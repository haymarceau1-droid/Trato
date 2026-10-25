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

/**
 * Usuario o enlace de Facebook → "usuario" o "profile.php?id=123"; null si no se reconoce.
 * Acepta "juan.perez", "facebook.com/juan.perez", "https://m.facebook.com/profile.php?id=123", "fb.com/…".
 */
export function parseFacebook(raw: string): string | null {
  let s = raw.trim().replace(/^@/, "");
  if (!s) return null;
  if (/^(https?:\/\/)?([\w-]+\.)?(facebook\.com|fb\.com|m\.me|fb\.me)\//i.test(s)) {
    try {
      const u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
      const id = u.searchParams.get("id");
      if (u.pathname.replace(/\/+$/, "") === "/profile.php" && id && /^\d+$/.test(id))
        return `profile.php?id=${id}`;
      s = u.pathname.split("/").filter(Boolean)[0] ?? "";
    } catch {
      return null;
    }
  }
  return /^[A-Za-z0-9.]{5,50}$/.test(s) ? s : null;
}

/** Enlace de Messenger para el usuario o id guardado. */
export function messengerUrl(stored: string): string {
  const id = stored.match(/^profile\.php\?id=(\d+)$/)?.[1];
  return `https://m.me/${id ?? stored}`;
}
