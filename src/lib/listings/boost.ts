import type { Listing } from "@/types";

/** ¿El anuncio está impulsado ahora mismo? (la fecha de fin es futura). */
export const isBoosted = (l: Pick<Listing, "boosted_until">, now = Date.now()) =>
  Boolean(l.boosted_until && new Date(l.boosted_until).getTime() > now);
