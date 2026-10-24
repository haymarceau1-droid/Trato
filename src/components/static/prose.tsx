import type { ReactNode } from "react";

export function Prose({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <article className="container-page max-w-3xl py-10">
      <h1 className="text-3xl font-extrabold">{title}</h1>
      {intro && <p className="text-muted-foreground mt-2 text-lg">{intro}</p>}
      <div className="[&_a]:text-primary mt-8 space-y-6 text-[15px] leading-relaxed [&_a]:font-semibold [&_a]:underline [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_li]:mt-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
    </article>
  );
}

export const TemplateNotice = () => (
  <p
    role="note"
    className="border-warning/40 bg-warning-soft text-warning rounded-sm border p-4 text-sm font-medium"
  >
    Documento base por completar. Antes de lanzar, reemplaza los campos entre [corchetes] (datos del
    responsable, proveedores, jurisdicción) y hazlo revisar por un abogado mexicano.
  </p>
);
