import { BRAND_LOGO_SLUGS } from "@/lib/brand-logos";
import { slugify } from "@/lib/listings/slug";
import { cn } from "@/lib/utils";

/**
 * Logo monocromo de la marca. Se pinta con una máscara CSS sobre `currentColor`, así hereda el color
 * del texto y no pesa en el JavaScript. Si la marca no tiene logo SVG, no dibuja nada.
 */
export function BrandLogo({ name, className }: { name: string; className?: string }) {
  const slug = slugify(name);
  if (!BRAND_LOGO_SLUGS.has(slug)) return null;
  const mask = `url(/logos/${slug}.svg) center / contain no-repeat`;
  return (
    <span
      aria-hidden
      className={cn("inline-block size-6 shrink-0 bg-current", className)}
      style={{ mask, WebkitMask: mask }}
    />
  );
}
