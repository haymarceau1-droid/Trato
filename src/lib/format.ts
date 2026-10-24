import { site } from "@/config/site";

const nf = new Intl.NumberFormat(site.locale, { maximumFractionDigits: 0 });

export const formatMXN = (n: number) => `$${nf.format(n)} MXN`;
export const formatNumber = (n: number) => nf.format(n);
export const formatKm = (n: number) => `${nf.format(n)} km`;

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat(site.locale, {
    timeZone: site.timeZone,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));

export const formatMonthYear = (iso: string) =>
  new Intl.DateTimeFormat(site.locale, {
    timeZone: site.timeZone,
    month: "long",
    year: "numeric",
  }).format(new Date(iso));

export function timeAgo(iso: string, now = Date.now()) {
  const days = Math.floor((now - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "Publicado hoy";
  if (days === 1) return "Publicado ayer";
  if (days < 30) return `Publicado hace ${days} días`;
  const months = Math.floor(days / 30);
  return `Publicado hace ${months} ${months === 1 ? "mes" : "meses"}`;
}

/** "abr 2026": mes corto y año, para espacios pequeños. */
export const formatMonthYearShort = (iso: string) =>
  new Intl.DateTimeFormat(site.locale, { timeZone: site.timeZone, month: "short", year: "numeric" })
    .format(new Date(iso))
    .replace(".", "");
