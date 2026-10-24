import { LinkButton } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page grid min-h-[60dvh] place-items-center py-16 text-center">
      <div className="space-y-4">
        <p className="text-primary font-display text-6xl">404</p>
        <h1 className="text-2xl font-extrabold">No encontramos esa página</h1>
        <p className="text-muted-foreground">
          El enlace puede estar mal escrito o la página ya no existe. Tus anuncios y favoritos están
          a salvo.
        </p>
        <LinkButton href="/">Ir a ver autos y motos</LinkButton>
      </div>
    </div>
  );
}
