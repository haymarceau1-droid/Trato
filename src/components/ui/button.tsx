import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-sm px-4 text-sm font-semibold transition-[transform,box-shadow,colors] disabled:pointer-events-none disabled:opacity-50";
const sticker =
  "border-2 border-foreground shadow-[3px_3px_0_0_var(--foreground)] hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_0_var(--foreground)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none";
const variants = {
  primary: `${sticker} bg-primary text-primary-foreground`,
  outline: `${sticker} bg-card text-foreground`,
  ghost: "text-foreground hover:bg-muted",
  danger: `${sticker} bg-danger text-white`,
  soft: `${sticker} bg-primary-soft text-primary`,
} as const;
const sizes = { md: "", lg: "min-h-12 px-6 text-base", icon: "w-11 px-0" } as const;

type Style = { variant?: keyof typeof variants; size?: keyof typeof sizes };

export const buttonClass = ({ variant = "primary", size = "md" }: Style = {}, extra?: string) =>
  cn(base, variants[variant], sizes[size], extra);

export function Button({ variant, size, className, ...props }: ComponentProps<"button"> & Style) {
  return <button type="button" className={buttonClass({ variant, size }, className)} {...props} />;
}

export function LinkButton({
  variant,
  size,
  className,
  ...props
}: ComponentProps<typeof Link> & Style) {
  return <Link className={buttonClass({ variant, size }, className)} {...props} />;
}
