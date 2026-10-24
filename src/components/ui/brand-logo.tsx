import { BRAND_LOGO_SLUGS } from "@/lib/brand-logos";
import { slugify } from "@/lib/listings/slug";
import { cn } from "@/lib/utils";

/**
 * Logo monocromo de la marca. Se pinta con una máscara CSS sobre `currentColor`, así hereda el color
 * del texto y no pesa en el JavaScript. Sin logo disponible: monograma con la misma forma.
 */
export function BrandLogo({ name, className }: { name: string; className?: string }) {
  const slug = slugify(name);
  if (BRAND_LOGO_SLUGS.has(slug)) {
    const mask = `url(/logos/${slug}.svg) center / contain no-repeat`;
    return (
      <span
        aria-hidden
        className={cn("inline-block size-6 shrink-0 bg-current", className)}
        style={{ mask, WebkitMask: mask }}
      />
    );
  }
  const letters = name
    .replace(/[^\p{L}\p{N} ]/gu, "")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("size-6 shrink-0", className)}>
      <rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <text
        x="12"
        y="12.5"
        textAnchor="middle"
        dominantBaseline="central"
        fill="currentColor"
        fontFamily="var(--font-display)"
        fontSize={letters.length > 1 ? 9 : 13}
      >
        {letters}
      </text>
    </svg>
  );
}
