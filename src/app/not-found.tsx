import { LinkButton } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page grid min-h-[60dvh] place-items-center py-16 text-center">
      <div className="space-y-4">
        <p className="text-primary text-6xl font-extrabold">404</p>
        <h1 className="text-2xl font-extrabold">No encontramos esa página</h1>
        <p className="text-muted-foreground">
          Puede que el enlace esté mal escrito o que ya no exista.
        </p>
        <LinkButton href="/">Volver al inicio</LinkButton>
      </div>
    </div>
  );
}
