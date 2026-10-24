"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  PencilSimple as Pencil,
  Pause,
  Play,
  ArrowsClockwise as RefreshCw,
  Tag,
  Trash as Trash2,
} from "@phosphor-icons/react/dist/ssr";
import { deleteListing, renewListing, setListingStatus } from "@/actions/listings";
import type { Listing } from "@/types";
import { formatDate, formatMXN } from "@/lib/format";
import { coverOf, photoUrl } from "@/lib/listings/photos";
import { listingPath } from "@/lib/listings/slug";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClass } from "@/components/ui/button";

const STATUS = {
  active: { label: "Activo", tone: "green" },
  paused: { label: "En pausa", tone: "amber" },
  sold: { label: "Vendido", tone: "gray" },
  expired: { label: "Vencido", tone: "red" },
  removed: { label: "Retirado", tone: "red" },
} as const;

export function MyListingRow({ listing: l }: { listing: Listing }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const cover = coverOf(l);
  const st = STATUS[l.status];

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      setError(null);
      const res = await fn();
      if (!res.ok)
        setError(
          res.error ?? "No pudimos hacerlo ahora. Tu anuncio sigue igual; intenta de nuevo.",
        );
      else router.refresh();
    });

  return (
    <li className="border-border bg-card rounded-md border p-3">
      <div className="flex gap-3">
        <div className="bg-muted relative size-24 shrink-0 overflow-hidden rounded-sm sm:size-28">
          {cover && (
            <Image src={photoUrl(cover)} alt="" fill sizes="112px" className="object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={st.tone}>{st.label}</Badge>
            {l.needs_review && <Badge tone="amber">En revisión</Badge>}
          </div>
          <Link href={listingPath(l)} className="line-clamp-1 font-semibold hover:underline">
            {l.title}
          </Link>
          <p className="font-display">{formatMXN(l.price_mxn)}</p>
          <p className="text-muted-foreground flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1">
              <Eye className="size-3.5" aria-hidden /> {l.views_count}
            </span>
            <span>Vence {formatDate(l.expires_at)}</span>
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {l.status !== "removed" && (
          <Link
            href={`/mis-anuncios/${l.id}/editar`}
            className={buttonClass({ variant: "outline" }, "min-h-10")}
          >
            <Pencil className="size-4" aria-hidden /> Editar
          </Link>
        )}
        {l.status === "active" && (
          <Button
            variant="outline"
            className="min-h-10"
            disabled={pending}
            onClick={() => run(() => setListingStatus(l.id, "paused"))}
          >
            <Pause className="size-4" aria-hidden /> Pausar
          </Button>
        )}
        {l.status === "paused" && !l.needs_review && (
          <Button
            variant="outline"
            className="min-h-10"
            disabled={pending}
            onClick={() => run(() => setListingStatus(l.id, "active"))}
          >
            <Play className="size-4" aria-hidden /> Reactivar
          </Button>
        )}
        {(l.status === "active" || l.status === "paused") && (
          <Button
            variant="outline"
            className="min-h-10"
            disabled={pending}
            onClick={() => run(() => setListingStatus(l.id, "sold"))}
          >
            <Tag className="size-4" aria-hidden /> Vendido
          </Button>
        )}
        {(l.status === "active" || l.status === "expired" || l.status === "paused") && (
          <Button
            variant="soft"
            className="min-h-10"
            disabled={pending}
            onClick={() => run(() => renewListing(l.id))}
          >
            <RefreshCw className="size-4" aria-hidden /> Renovar 60 días
          </Button>
        )}
        <Button
          variant="ghost"
          className="text-danger min-h-10"
          disabled={pending}
          onClick={() =>
            confirm("¿Eliminar este anuncio? No se puede deshacer.") &&
            run(() => deleteListing(l.id))
          }
        >
          <Trash2 className="size-4" aria-hidden /> Eliminar
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-danger mt-2 text-sm">
          {error}
        </p>
      )}
    </li>
  );
}
