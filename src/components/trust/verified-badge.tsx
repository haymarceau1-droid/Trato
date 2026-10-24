import { SealCheck as BadgeCheck } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";

export const VerifiedBadge = () => (
  <Badge tone="green">
    <BadgeCheck className="size-3.5" aria-hidden /> Teléfono verificado
  </Badge>
);
