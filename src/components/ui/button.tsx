import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50";
const variants = {
  primary: "bg-primary text-primary-foreground hover:opacity-90",
  outline: "border border-border bg-card text-foreground hover:bg-muted",
  ghost: "text-foreground hover:bg-muted",
  danger: "bg-danger text-white hover:opacity-90",
  soft: "bg-primary-soft text-primary hover:opacity-90",
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
