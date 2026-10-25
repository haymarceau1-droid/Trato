"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "@/actions/account";
import { cn } from "@/lib/utils";

const item = "hover:bg-muted flex min-h-11 items-center rounded-sm px-3 text-sm font-medium";

/** Avatar redondo con menú de cuenta. Vive fuera de la barra flotante, a la derecha. */
export function ProfileMenu({
  name,
  email,
  avatarUrl,
  className,
}: {
  name: string;
  email: string | null;
  avatarUrl: string | null;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className={cn("relative", className)}>
      <button
        type="button"
        aria-label="Menú de tu cuenta"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
        className="bg-foreground text-background font-display ring-border hover:ring-foreground grid size-12 place-items-center overflow-hidden rounded-full text-xl shadow-lg ring-2 transition-shadow"
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
      </button>
      {open && (
        <div
          role="menu"
          className="border-border bg-card absolute top-full right-0 mt-2 w-64 rounded-md border p-2 shadow-2xl"
        >
          <div className="border-border mb-1 border-b px-3 pt-1 pb-3">
            <p className="truncate font-semibold">{name}</p>
            {email && <p className="text-muted-foreground truncate text-xs">{email}</p>}
          </div>
          <Link role="menuitem" href="/cuenta" className={item} onClick={() => setOpen(false)}>
            Mi perfil
          </Link>
          <Link
            role="menuitem"
            href="/mis-anuncios"
            className={item}
            onClick={() => setOpen(false)}
          >
            Mis anuncios
          </Link>
          <Link role="menuitem" href="/favoritos" className={item} onClick={() => setOpen(false)}>
            Favoritos
          </Link>
          <form action={signOut} className="border-border mt-1 border-t pt-1">
            <button type="submit" role="menuitem" className={cn(item, "w-full text-left")}>
              Cerrar sesión
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
