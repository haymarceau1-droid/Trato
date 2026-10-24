"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, PlusCircle, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/autos", label: "Buscar", icon: Search },
  { href: "/publicar", label: "Publicar", icon: PlusCircle },
  { href: "/favoritos", label: "Favoritos", icon: Heart },
  { href: "/mis-anuncios", label: "Cuenta", icon: User },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav
      aria-label="Navegación móvil"
      className="border-border bg-card fixed inset-x-0 bottom-0 z-40 border-t md:hidden"
    >
      <ul className="grid grid-cols-5 pb-[env(safe-area-inset-bottom)]">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/"
              ? path === "/"
              : path.startsWith(href) || (href === "/autos" && path.startsWith("/motos"));
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
