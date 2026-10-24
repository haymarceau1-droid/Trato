export const buildTitle = (p: {
  brand: string;
  model: string;
  year: number;
  version?: string | null;
}) => [p.brand, p.model, p.year, p.version].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
