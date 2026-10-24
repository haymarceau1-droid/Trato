import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { Prose } from "@/components/static/prose";

export const metadata: Metadata = { title: "Contacto", alternates: { canonical: "/contacto" } };

export default function ContactPage() {
  return (
    <Prose title="Contacto" intro="¿Dudas, sugerencias o un problema con tu cuenta? Escríbenos.">
      <p>
        Correo: <a href={`mailto:${brand.contactEmail}`}>{brand.contactEmail}</a>
      </p>
      <p>
        Respondemos en uno o dos días hábiles. Para denunciar un anuncio, usa el botón{" "}
        <strong>Reportar</strong> dentro del anuncio: es la forma más rápida de que lo revisemos.
      </p>
      <p role="note" className="bg-warning-soft text-warning rounded-sm p-3 text-sm">
        Por completar: reemplaza el correo de contacto en <code>src/config/brand.ts</code>.
      </p>
    </Prose>
  );
}
