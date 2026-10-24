import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const inputClass =
  "min-h-11 w-full rounded-sm border border-border bg-card px-3 text-base text-foreground placeholder:text-muted-foreground aria-[invalid=true]:border-danger";

export function Field({
  label,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5 text-sm font-medium", className)}>
      <span>{label}</span>
      {children}
      {hint && !error && <span className="text-muted-foreground text-xs font-normal">{hint}</span>}
      {error && (
        <span role="alert" className="text-danger text-xs font-normal">
          {error}
        </span>
      )}
    </label>
  );
}

export const Input = ({ className, ...p }: ComponentProps<"input">) => (
  <input className={cn(inputClass, className)} {...p} />
);
export const Select = ({ className, ...p }: ComponentProps<"select">) => (
  <select className={cn(inputClass, className)} {...p} />
);
export const Textarea = ({ className, ...p }: ComponentProps<"textarea">) => (
  <textarea className={cn(inputClass, "min-h-32 py-2", className)} {...p} />
);
