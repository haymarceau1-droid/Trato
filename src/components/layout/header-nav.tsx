"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/autos", label: "Autos", match: ["/autos"] },
  { href: "/motos", label: "Motos", match: ["/motos"] },
  { href: "/consejos", label: "Consejos", match: ["/consejos"] },
  { href: "/como-vender", label: "Cómo vender", match: ["/como-vender"] },
];

/** Enlaces del menú con la sección actual resaltada. */
export function HeaderNav() {
  const path = usePathname();
  return (
    <nav
      aria-label="Principal"
      className="mx-auto hidden max-w-xl items-center gap-1 overflow-hidden transition-[max-width,opacity] duration-300 group-data-[compact=true]/bar:pointer-events-none group-data-[compact=true]/bar:max-w-0 group-data-[compact=true]/bar:opacity-0 md:flex"
    >
      {links.map((l) => {
        const active = l.match.some((m) => path === m || path.startsWith(m + "/"));
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-sm px-4 py-2 text-sm font-semibold transition-colors",
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
