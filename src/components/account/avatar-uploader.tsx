"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setAvatar } from "@/actions/account";
import { Button } from "@/components/ui/button";
import { ImageTooBigError, compressAvatar } from "@/lib/images/compress";
import { PHOTO_BUCKET } from "@/lib/listings/photos";

/** Foto de perfil: redonda, se recorta en cuadrado y se comprime en el navegador antes de subirla. */
export function AvatarUploader({
  userId,
  name,
  avatarUrl,
}: {
  userId: string;
  name: string;
  avatarUrl: string | null;
}) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const blob = await compressAvatar(file);
      const path = `${userId}/avatar-${crypto.randomUUID()}.webp`;
      // El cliente de Supabase pesa ~100 KB: se descarga solo al subir una foto.
      const { createClient } = await import("@/lib/supabase/client");
      const { error: upErr } = await createClient()
        .storage.from(PHOTO_BUCKET)
        .upload(path, blob, { contentType: "image/webp", cacheControl: "31536000" });
      if (upErr) throw upErr;
      start(async () => {
        const res = await setAvatar(path);
        if (!res.ok) setError(res.error);
        else router.refresh();
      });
    } catch (e) {
      setError(
        e instanceof ImageTooBigError
          ? "Esa imagen pesa demasiado. Elige una de menos de 12 MB."
          : "No pudimos subir la foto. Revisa tu conexión e intenta de nuevo.",
      );
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  const working = busy || pending;
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={working}
        aria-label="Cambiar foto de perfil"
        className="bg-foreground text-background font-display group relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-full text-4xl"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            referrerPolicy="no-referrer"
            className="size-full object-cover"
          />
        ) : (
          name.charAt(0).toUpperCase()
        )}
        <span className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-center font-sans text-[11px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100">
          {working ? "Subiendo…" : "Cambiar"}
        </span>
      </button>
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => input.current?.click()} disabled={working}>
            {avatarUrl ? "Cambiar foto" : "Subir foto"}
          </Button>
          {avatarUrl && (
            <Button
              variant="ghost"
              disabled={working}
              onClick={() =>
                start(async () => {
                  const res = await setAvatar(null);
                  if (!res.ok) setError(res.error);
                  else router.refresh();
                })
              }
            >
              Quitar
            </Button>
          )}
        </div>
        <p className="text-muted-foreground text-xs">Se recorta en cuadrado. Máximo 12 MB.</p>
        {error && (
          <p role="alert" className="text-danger text-sm">
            {error}
          </p>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label="Elegir foto de perfil"
        onChange={(e) => void onFile(e.target.files?.[0])}
      />
    </div>
  );
}
