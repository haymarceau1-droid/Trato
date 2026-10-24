import { site } from "@/config/site";

export type ReviewReason = "precio_bajo" | "anticipo" | "telefono" | "enlace";

export const REVIEW_MESSAGES: Record<ReviewReason, string> = {
  precio_bajo: "Tu precio es mucho más bajo que el de anuncios similares.",
  anticipo:
    "Mencionas anticipos o apartados. Nunca pidas dinero antes de que el comprador vea el vehículo.",
  telefono:
    "Incluiste un número de teléfono en la descripción. Los compradores te contactarán desde el botón de WhatsApp.",
  enlace: "Incluiste un enlace en la descripción. Por seguridad no se permiten enlaces externos.",
};

const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const DEPOSIT =
  /\b(anticipo|apartado|apartar|deposito para apartar|deposito de apartado|adelanto|enganche para apartar)\b/;
const PHONE = /(?:\+?\d[\s().-]{0,2}){10,}/;
const LINK = /(https?:\/\/|www\.|wa\.me|bit\.ly|t\.me|\b[a-z0-9-]+\.(?:com|mx|net|org|info|xyz)\b)/;

/** Señales simples: el anuncio se publica pero queda en `needs_review`. */
export function detectSuspicious(input: {
  description: string;
  price: number;
  medianPrice: number | null;
}): ReviewReason[] {
  const text = normalize(input.description);
  const reasons: ReviewReason[] = [];
  if (input.medianPrice && input.price < input.medianPrice * site.suspiciousPriceRatio)
    reasons.push("precio_bajo");
  if (DEPOSIT.test(text)) reasons.push("anticipo");
  if (PHONE.test(input.description)) reasons.push("telefono");
  if (LINK.test(text)) reasons.push("enlace");
  return reasons;
}
