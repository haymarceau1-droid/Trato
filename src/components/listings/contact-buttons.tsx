"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ContactButtons({ listingId }: { listingId: string }) {
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
      setError("No pudimos obtener el contacto. Revisa tu conexión.");
    } finally {
      setBusy(null);
    }
  }

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
        Inicia sesión para ver el contacto del vendedor. Nunca des anticipos.
      </p>
    </div>
  );
}
