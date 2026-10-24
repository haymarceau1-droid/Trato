/** Frase sobre el mercado con cifras reales; sin datos aún, queda sin números. */
export function marketLine(m: { active: number; sold: number; sold30d: number }) {
  const n = (v: number) => v.toLocaleString("es-MX");
  const parts = [
    m.active > 0
      ? `${n(m.active)} ${m.active === 1 ? "vehículo en venta" : "vehículos en venta"}`
      : null,
    m.sold30d > 0
      ? `${n(m.sold30d)} vendidos este mes`
      : m.sold > 0
        ? `${n(m.sold)} ya vendidos`
        : null,
  ].filter(Boolean);
  return parts.length
    ? `Mercado de usados seguro · ${parts.join(" · ")}`
    : "El mercado de usados de México, seguro y sin comisiones";
}
