"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FacebookIcon } from "@/components/ui/facebook-icon";
import { Phone } from "@/components/ui/icons";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { Button } from "@/components/ui/button";

const LockIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
  >
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

function useContact(listingId: string, loggedIn: boolean) {
  const router = useRouter();
  const path = usePathname();
  const [busy, setBusy] = useState<"wa" | "tel" | "fb" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function contact(kind: "wa" | "tel" | "fb") {
    // Sin sesión no se pide nada al servidor: se envía a iniciar sesión y se vuelve a este anuncio.
    if (!loggedIn) return router.push(`/acceder?next=${encodeURIComponent(path)}`);
    setBusy(kind);
    setError(null);
    try {
      const res = await fetch(`/api/contacto/${listingId}`, { cache: "no-store" });
      if (res.status === 401) return router.push(`/acceder?next=${encodeURIComponent(path)}`);
      const data = await res.json();
      if (!res.ok) return setError(data.error ?? "No pudimos obtener el contacto.");
      const url = { wa: data.whatsapp, tel: data.tel, fb: data.facebook }[kind];
      if (!url) return setError("El vendedor no tiene ese medio de contacto.");
      if (kind === "fb") window.open(url, "_blank", "noopener,noreferrer");
      else window.location.href = url;
    } catch {
      setError("No pudimos abrir el contacto. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setBusy(null);
    }
  }
  return { busy, error, contact };
}

export function ContactButtons({
  listingId,
  hasFacebook,
  loggedIn,
}: {
  listingId: string;
  hasFacebook?: boolean;
  loggedIn: boolean;
}) {
  const { busy, error, contact } = useContact(listingId, loggedIn);
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Button size="lg" variant="whatsapp" disabled={busy !== null} onClick={() => contact("wa")}>
          <WhatsAppIcon className="size-5 shrink-0" /> WhatsApp
        </Button>
        <Button size="lg" variant="outline" disabled={busy !== null} onClick={() => contact("tel")}>
          <Phone className="size-5 shrink-0" aria-hidden /> Llamar
        </Button>
      </div>
      {hasFacebook && (
        <Button
          size="lg"
          variant="outline"
          className="w-full"
          disabled={busy !== null}
          onClick={() => contact("fb")}
        >
          <FacebookIcon className="size-5 shrink-0" /> Contactar en Facebook
        </Button>
      )}
      {error && (
        <p role="alert" className="text-danger text-sm">
          {error}
        </p>
      )}
      {loggedIn ? (
        <p className="text-muted-foreground text-xs">
          Revisa el vehículo en persona antes de pagar y nunca des anticipos.
        </p>
      ) : (
        <p className="bg-primary-soft text-foreground flex items-start gap-2 rounded-sm p-3 text-xs">
          <LockIcon className="text-primary mt-0.5 size-4 shrink-0" />
          <span>
            <strong>Inicia sesión gratis</strong> para ver el WhatsApp y el teléfono del vendedor.
            Así evitamos que robots copien su número y lo llenen de spam.
          </span>
        </p>
      )}
    </div>
  );
}

/** Barra fija en móvil: el contacto siempre a un toque, sin tener que subir a los botones. */
export function MobileContactBar({
  listingId,
  price,
  hasFacebook,
  loggedIn,
}: {
  listingId: string;
  price: string;
  hasFacebook?: boolean;
  loggedIn: boolean;
}) {
  const { busy, error, contact } = useContact(listingId, loggedIn);
  return (
    <div className="sticky-actions border-foreground bg-card fixed inset-x-0 bottom-14 z-30 border-t-2 px-4 py-2 md:hidden">
      <div className="flex items-center gap-3">
        <p className="font-display text-lg leading-none whitespace-nowrap">{price}</p>
        <Button
          className="ml-auto flex-1"
          variant="whatsapp"
          disabled={busy !== null}
          onClick={() => contact("wa")}
        >
          <WhatsAppIcon className="size-5 shrink-0" /> WhatsApp
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0"
          aria-label="Llamar"
          disabled={busy !== null}
          onClick={() => contact("tel")}
        >
          <Phone className="size-5 shrink-0" aria-hidden />
        </Button>
        {hasFacebook && (
          <Button
            variant="outline"
            size="icon"
            className="shrink-0"
            aria-label="Contactar en Facebook"
            disabled={busy !== null}
            onClick={() => contact("fb")}
          >
            <FacebookIcon className="size-5 shrink-0" />
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-danger pt-1 text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
