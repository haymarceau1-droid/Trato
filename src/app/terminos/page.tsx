import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { Prose, TemplateNotice } from "@/components/static/prose";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  alternates: { canonical: "/terminos" },
};

export default function TermsPage() {
  return (
    <Prose title="Términos y condiciones" intro="Última actualización: [fecha].">
      <TemplateNotice />
      <h2>1. Quiénes somos</h2>
      <p>
        {brand.name} es una plataforma de anuncios clasificados operada por [razón social / persona
        física], con domicilio en [domicilio]. Contacto: {brand.contactEmail}.
      </p>
      <h2>2. Qué hacemos y qué no</h2>
      <p>
        {brand.name} permite a las personas publicar y encontrar anuncios de autos y motos usados.
        No somos parte de las operaciones de compraventa, no procesamos pagos, no inspeccionamos
        vehículos ni garantizamos la veracidad de los anuncios.
      </p>
      <h2>3. Cuenta y uso</h2>
      <p>
        Debes ser mayor de edad y proporcionar datos verdaderos. Eres responsable de la actividad de
        tu cuenta. Podemos limitar, pausar o retirar anuncios y cuentas que incumplan estos
        términos.
      </p>
      <h2>4. Reglas de publicación</h2>
      <ul>
        <li>Solo vehículos de tu propiedad o que estés autorizado a vender.</li>
        <li>Información y fotos reales y actuales; precio real.</li>
        <li>
          Prohibido solicitar anticipos o apartados, publicar vehículos robados o con documentación
          ilícita, o incluir datos de contacto en la descripción.
        </li>
        <li>Límites: [5] anuncios activos por usuario y [10] publicaciones por día.</li>
      </ul>
      <h2>5. Moderación</h2>
      <p>
        Los anuncios pueden ser revisados y retirados. Un anuncio con múltiples reportes puede
        pausarse automáticamente mientras se revisa.
      </p>
      <h2>6. Responsabilidad</h2>
      <p>
        [Cláusula de limitación de responsabilidad conforme a la legislación mexicana aplicable.]
      </p>
      <h2>7. Ley aplicable y jurisdicción</h2>
      <p>[Leyes de los Estados Unidos Mexicanos y tribunales de [ciudad].]</p>
    </Prose>
  );
}
