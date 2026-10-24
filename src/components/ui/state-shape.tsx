import { cn } from "@/lib/utils";

/** Silueta del estado (public/estados/<slug>.svg), pintada con el color del texto. */
export function StateShape({ slug, className }: { slug: string; className?: string }) {
  const mask = `url(/estados/${slug}.svg) center / contain no-repeat`;
  return (
    <span
      aria-hidden
      className={cn("inline-block size-6 shrink-0 bg-current", className)}
      style={{ mask, WebkitMask: mask }}
    />
  );
}
