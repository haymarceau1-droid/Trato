"use client";

import { useOptimistic, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart } from "@phosphor-icons/react/dist/ssr";
import { toggleFavorite } from "@/actions/favorites";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  listingId,
  initial,
  className,
}: {
  listingId: string;
  initial: boolean;
  className?: string;
}) {
  const router = useRouter();
  const path = usePathname();
  const [, start] = useTransition();
  const [fav, setFav] = useOptimistic(initial, (_, next: boolean) => next);

  return (
    <button
      type="button"
      aria-pressed={fav}
      aria-label={fav ? "Quitar de favoritos" : "Guardar en favoritos"}
      onClick={() =>
        start(async () => {
          setFav(!fav);
          const res = await toggleFavorite(listingId);
          if (!res.ok) router.push(`/acceder?next=${encodeURIComponent(path)}`);
        })
      }
      className={cn(
        "wiggle bg-card border-foreground hover:bg-muted grid size-11 place-items-center rounded-sm border-2",
        className,
      )}
    >
      <Heart
        weight={fav ? "fill" : "bold"}
        className={cn("size-5", fav ? "text-danger" : "text-foreground")}
        aria-hidden
      />
    </button>
  );
}
