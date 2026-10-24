import { cn } from "@/lib/utils";

export const Skeleton = ({ className }: { className?: string }) => (
  <div aria-hidden className={cn("bg-muted animate-pulse rounded-xl", className)} />
);
