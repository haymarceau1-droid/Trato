import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { Prose, TemplateNotice } from "@/components/static/prose";

export const metadata: Metadata = {
  title: "Aviso de privacidad",
  alternates: { canonical: "/privacidad" },
};

export default function PrivacyPage() {
  return (
    <Prose title="Aviso de privacidad" intro="Última actualización: [fecha].">
      <TemplateNotice />
      <h2>Responsable</h2>
      <p>
        [Razón social / persona física], con domicilio en [domicilio], es responsable del
        tratamiento de tus datos personales conforme a la Ley Federal de Protección de Datos
        Personales en Posesión de los Particulares (LFPDPPP).
      </p>
      <h2>Datos que recabamos</h2>
      <ul>
        <li>Identificación y contacto: nombre mostrado, número de celular, correo electrónico.</li>
        <li>Ubicación general: estado y ciudad.</li>
        <li>Contenido que publicas: fotos y datos del vehículo.</li>
        <li>Datos de uso: visitas a anuncios, favoritos y reportes.</li>
      </ul>
      <h2>Finalidades</h2>
      <p>
        Crear tu cuenta, verificar tu teléfono, publicar tus anuncios, permitir que quienes inicien
        sesión sesión te contacten, prevenir fraudes y mejorar el servicio.
      </p>
      <h2>Tu teléfono</h2>
      <p>
        Tu número solo se muestra a usuarios con sesión iniciada que decidan contactarte y no
        aparece en páginas públicas ni en buscadores.
      </p>
      <h2>Fotografías</h2>
      <p>Eliminamos los metadatos (incluida la ubicación GPS) de tus fotos antes de subirlas.</p>
      <h2>Proveedores</h2>
      <p>
        Usamos proveedores de infraestructura y mensajería SMS: [Supabase, Vercel, Twilio u otro].
        [Detallar transferencias.]
      </p>
      <h2>Derechos ARCO</h2>
      <p>
        Puedes acceder, rectificar, cancelar u oponerte al tratamiento de tus datos escribiendo a{" "}
        {brand.contactEmail}.
      </p>
      <h2>Cambios</h2>
      <p>Publicaremos cualquier cambio en esta página.</p>
    </Prose>
  );
}
