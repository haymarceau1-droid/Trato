import type { ReactNode } from "react";
import { CarProfile } from "@/components/ui/icons";

export const EmptyState = ({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children?: ReactNode;
}) => (
  <div className="border-border bg-card flex flex-col items-center gap-3 rounded-md border-2 border-dashed px-6 py-12 text-center">
    <CarProfile weight="duotone" className="text-primary size-16" aria-hidden />
    <p className="font-display text-2xl">{title}</p>
    {hint && <p className="text-muted-foreground max-w-md text-sm">{hint}</p>}
    {children}
  </div>
);
