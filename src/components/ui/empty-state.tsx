import type { ReactNode } from "react";

export const EmptyState = ({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children?: ReactNode;
}) => (
  <div className="border-border bg-card flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-12 text-center">
    <p className="text-lg font-semibold">{title}</p>
    {hint && <p className="text-muted-foreground max-w-md text-sm">{hint}</p>}
    {children}
  </div>
);
