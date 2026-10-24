"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-page grid min-h-[60dvh] place-items-center py-16 text-center">
      <div className="space-y-4">
        <h1 className="text-2xl font-extrabold">Se nos atoró algo</h1>
        <p className="text-muted-foreground">
          Fue un fallo nuestro, no tuyo, y tus anuncios están a salvo. Intenta de nuevo en un
          momento.
        </p>
        <Button onClick={reset}>Reintentar</Button>
      </div>
    </div>
  );
}
