import { SealCheck as BadgeCheck } from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";

export const VerifiedBadge = () => (
  <Badge tone="green">
    <BadgeCheck className="size-3.5" aria-hidden /> Teléfono verificado
  </Badge>
);
