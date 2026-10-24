import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const tones = {
  green: "bg-success-soft text-success",
  red: "bg-primary-soft text-primary",
  amber: "bg-warning-soft text-warning",
  gray: "bg-muted text-muted-foreground",
} as const;

export const Badge = ({
  tone = "gray",
  children,
  className,
}: {
  tone?: keyof typeof tones;
  children: ReactNode;
  className?: string;
}) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
      tones[tone],
      className,
    )}
  >
    {children}
  </span>
);
