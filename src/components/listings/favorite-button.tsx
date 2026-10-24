"use client";

import { useOptimistic, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart } from "lucide-react";
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
        "bg-card/90 hover:bg-card grid size-11 place-items-center rounded-full shadow-sm backdrop-blur",
        className,
      )}
    >
      <Heart
        className={cn("size-5", fav ? "fill-danger text-danger" : "text-foreground")}
        aria-hidden
      />
    </button>
  );
}
