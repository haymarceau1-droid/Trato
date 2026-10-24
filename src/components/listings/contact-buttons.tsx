"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

function useContact(listingId: string) {
  const router = useRouter();
  const path = usePathname();
  const [busy, setBusy] = useState<"wa" | "tel" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function contact(kind: "wa" | "tel") {
    setBusy(kind);
    setError(null);
    try {
      const res = await fetch(`/api/contacto/${listingId}`, { cache: "no-store" });
      if (res.status === 401) return router.push(`/acceder?next=${encodeURIComponent(path)}`);
      const data = await res.json();
      if (!res.ok) return setError(data.error ?? "No pudimos obtener el contacto.");
      window.location.href = kind === "wa" ? data.whatsapp : data.tel;
    } catch {
      setError("No pudimos abrir el contacto. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setBusy(null);
    }
  }
  return { busy, error, contact };
}

export function ContactButtons({ listingId }: { listingId: string }) {
  const { busy, error, contact } = useContact(listingId);
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Button size="lg" disabled={busy !== null} onClick={() => contact("wa")}>
          <MessageCircle className="size-5" aria-hidden /> WhatsApp
        </Button>
        <Button size="lg" variant="outline" disabled={busy !== null} onClick={() => contact("tel")}>
          <Phone className="size-5" aria-hidden /> Llamar
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-danger text-sm">
          {error}
        </p>
      )}
      <p className="text-muted-foreground text-xs">
        Inicia sesión para ver el contacto del vendedor. Revisa el vehículo en persona antes de
        pagar y nunca des anticipos.
      </p>
    </div>
  );
}

/** Barra fija en móvil: el contacto siempre a un toque, sin tener que subir a los botones. */
export function MobileContactBar({ listingId, price }: { listingId: string; price: string }) {
  const { busy, error, contact } = useContact(listingId);
  return (
    <div className="border-foreground bg-card fixed inset-x-0 bottom-14 z-30 border-t-2 px-4 py-2 md:hidden">
      <div className="flex items-center gap-3">
        <p className="font-display text-xl">{price}</p>
        <Button className="ml-auto flex-1" disabled={busy !== null} onClick={() => contact("wa")}>
          <MessageCircle className="size-5" aria-hidden /> WhatsApp
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Llamar"
          disabled={busy !== null}
          onClick={() => contact("tel")}
        >
          <Phone className="size-5" aria-hidden />
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-danger pt-1 text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
