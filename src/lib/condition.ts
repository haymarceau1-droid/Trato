/** Palabra que acompaña a una calificación de estado (0–100) indicada por el vendedor. */
export function conditionLabel(n: number): string {
  if (n >= 90) return "Excelente";
  if (n >= 75) return "Muy bueno";
  if (n >= 50) return "Bueno";
  if (n >= 25) return "Regular";
  return "Necesita trabajo";
}
