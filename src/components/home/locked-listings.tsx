import { Lock } from "@/components/ui/icons";
import { LinkButton } from "@/components/ui/button";

/**
 * Vista bloqueada de «Recién publicados» para quien no ha iniciado sesión.
 * Son tarjetas de relleno sin datos reales: ningún anuncio llega al navegador.
 */
export function LockedListings() {
  return (
    <div className="relative isolate">
      <ul
        aria-hidden
        className="pointer-events-none grid grid-cols-2 gap-x-4 gap-y-7 blur-[6px] select-none sm:grid-cols-3 lg:grid-cols-4"
      >
        {Array.from({ length: 8 }, (_, i) => (
          <li key={i}>
            <div className="bg-foreground/10 aspect-[4/3] rounded-md" />
            <div className="mt-3 space-y-2">
              <div className="bg-foreground/10 h-4 w-2/3 rounded-sm" />
              <div className="bg-foreground/10 h-3.5 w-full rounded-sm" />
              <div className="bg-foreground/10 h-5 w-1/3 rounded-sm" />
            </div>
          </li>
        ))}
      </ul>
      <div className="absolute inset-0 z-10 grid place-items-center p-4">
        <div className="border-border bg-card max-w-sm space-y-3 rounded-md border p-6 text-center shadow-lg">
          <span className="bg-primary/10 text-primary mx-auto grid size-12 place-items-center rounded-full">
            <Lock className="size-6" aria-hidden />
          </span>
          <h3 className="font-display text-2xl">Inicia sesión para ver los vehículos</h3>
          <p className="text-muted-foreground text-sm">
            Crear tu cuenta es gratis y toma menos de un minuto. Así cuidamos a compradores y
            vendedores.
          </p>
          <LinkButton href="/acceder?next=/" className="w-full">
            Iniciar sesión o registrarme
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
