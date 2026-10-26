"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { signOut } from "@/actions/account";
import { Car, Heart, Plus, SealCheck, ShieldCheck, User } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

const item =
  "hover:bg-muted focus-visible:bg-muted flex min-h-11 items-center gap-3 rounded-sm px-3 text-sm font-medium outline-none";

function Row({
  href,
  icon,
  children,
  onClick,
}: {
  href: string;
  icon: ReactNode;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <Link role="menuitem" href={href} className={item} onClick={onClick}>
      <span className="text-muted-foreground">{icon}</span>
      {children}
    </Link>
  );
}

/** Avatar redondo con menú de cuenta. Vive fuera de la barra flotante, a la derecha. */
export function ProfileMenu({
  name,
  email,
  avatarUrl,
  verified,
  isAdmin,
  className,
}: {
  name: string;
  email: string | null;
  avatarUrl: string | null;
  verified?: boolean;
  isAdmin?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const items = Array.from(
          root.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
        );
        const i = items.indexOf(document.activeElement as HTMLElement);
        const next =
          e.key === "ArrowDown" ? (i + 1) % items.length : (i <= 0 ? items.length : i) - 1;
        items[next]?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    // Al abrir con teclado, el foco entra al primer enlace.
    root.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const avatar = (size: string, text: string) => (
    <span
      className={cn(
        "bg-foreground text-background font-display grid shrink-0 place-items-center overflow-hidden rounded-full",
        size,
        text,
      )}
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
    </span>
  );

  return (
    <div ref={root} className={cn("relative", className)}>
      <button
        ref={trigger}
        type="button"
        aria-label="Menú de tu cuenta"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "group/avatar relative rounded-full p-0.5 shadow-lg transition-all duration-200",
          open ? "ring-primary ring-2" : "ring-border hover:ring-foreground ring-2",
        )}
      >
        {avatar("size-11", "text-xl")}
        {verified && (
          <span
            aria-hidden
            className="bg-card text-primary absolute -right-0.5 -bottom-0.5 grid size-5 place-items-center rounded-full shadow"
          >
            <SealCheck className="size-4" />
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Cuenta"
          className="border-border bg-card absolute top-full right-0 mt-3 w-72 origin-top-right rounded-md border p-2 shadow-2xl"
          style={{ animation: "menu-pop 160ms cubic-bezier(0.34, 1.4, 0.64, 1)" }}
        >
          <Link
            role="menuitem"
            href="/cuenta"
            onClick={close}
            className="hover:bg-muted focus-visible:bg-muted flex items-center gap-3 rounded-sm p-3 outline-none"
          >
            {avatar("size-12", "text-2xl")}
            <span className="min-w-0">
              <span className="block truncate font-semibold">{name}</span>
              {email && (
                <span className="text-muted-foreground block truncate text-xs">{email}</span>
              )}
              <span className="text-primary mt-0.5 block text-xs font-semibold">
                {verified ? "Celular verificado · " : ""}Ver mi perfil
              </span>
            </span>
          </Link>

          <div className="border-border my-1 border-t" />
          <Row href="/mis-anuncios" icon={<Car className="size-5" aria-hidden />} onClick={close}>
            Mis anuncios
          </Row>
          <Row href="/favoritos" icon={<Heart className="size-5" aria-hidden />} onClick={close}>
            Favoritos
          </Row>
          <Row href="/cuenta" icon={<User className="size-5" aria-hidden />} onClick={close}>
            Datos, contacto y apariencia
          </Row>
          {isAdmin && (
            <Row
              href="/admin"
              icon={<ShieldCheck className="size-5" aria-hidden />}
              onClick={close}
            >
              Administración
            </Row>
          )}

          <Link
            role="menuitem"
            href="/publicar"
            onClick={close}
            className="bg-primary text-primary-foreground mt-2 flex min-h-11 items-center justify-center gap-2 rounded-sm text-sm font-semibold hover:opacity-90"
          >
            <Plus className="size-4" aria-hidden /> Publicar un vehículo
          </Link>

          <form action={signOut} className="border-border mt-2 border-t pt-1">
            <button type="submit" role="menuitem" className={cn(item, "w-full text-left")}>
              Cerrar sesión
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
