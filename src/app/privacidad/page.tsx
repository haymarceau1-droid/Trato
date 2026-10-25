import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/config/brand";
import { site } from "@/config/site";
import { LinkButton } from "@/components/ui/button";
import { Prose, TemplateNotice } from "@/components/static/prose";

export const metadata: Metadata = {
  title: "Aviso de privacidad",
  description: `Cómo ${brand.name} trata tus datos personales y cómo ejercer tus derechos ARCO.`,
  alternates: { canonical: "/privacidad" },
};

const { legal } = brand;
const arcoMail = `mailto:${brand.contactEmail}?subject=${encodeURIComponent("Solicitud de derechos ARCO")}&body=${encodeURIComponent(
  "Nombre completo:\nCorreo o celular con el que te registraste:\nDerecho que quieres ejercer (Acceso, Rectificación, Cancelación, Oposición, Revocación del consentimiento o Limitación de uso):\nDescripción clara de los datos y de lo que solicitas:\n\nAdjunta copia de una identificación oficial vigente.",
)}`;

export default function PrivacyPage() {
  return (
    <Prose title="Aviso de privacidad" intro={`Última actualización: ${legal.updated}.`}>
      <TemplateNotice />

      <div className="border-border bg-card rounded-md border p-5">
        <p className="font-display text-xl">En corto</p>
        <ul>
          <li>Solo pedimos lo necesario: nombre para mostrar, celular o correo, y tu ciudad.</li>
          <li>
            Tu celular nunca aparece en páginas públicas ni en Google; lo ve quien inicia sesión y
            te contacta.
          </li>
          <li>
            No usamos cookies de publicidad ni de análisis. Solo las necesarias para que funcione tu
            sesión.
          </li>
          <li>
            Puedes ver, corregir, descargar o borrar tus datos cuando quieras, desde tu cuenta o por
            correo.
          </li>
          <li>No vendemos tus datos.</li>
        </ul>
      </div>

      <h2>1. Responsable del tratamiento</h2>
      <p>
        {legal.responsable}, con domicilio en {legal.domicilio} (RFC {legal.rfc}), en adelante “
        {brand.name}”, es responsable del tratamiento de tus datos personales conforme a la Ley
        Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y su
        normatividad aplicable. Contacto:{" "}
        <a href={`mailto:${brand.contactEmail}`}>{brand.contactEmail}</a>.
      </p>

      <h2>2. Datos personales que recabamos</h2>
      <ul>
        <li>
          <strong>Identificación y contacto:</strong> nombre para mostrar, número de celular y/o
          correo electrónico. Si entras con Google, recibimos de Google tu nombre, correo y foto de
          perfil (nunca tu contraseña).
        </li>
        <li>
          <strong>Ubicación general:</strong> estado y ciudad de tu perfil y de tus anuncios (no
          recabamos tu ubicación exacta; eliminamos la ubicación GPS de tus fotos).
        </li>
        <li>
          <strong>Contenido que publicas:</strong> datos del vehículo, descripción y fotografías.
        </li>
        <li>
          <strong>Uso del servicio:</strong> favoritos, reportes que envías, vistas a anuncios y
          registros técnicos básicos (dirección IP, dispositivo y navegador) para seguridad y
          prevención de fraude.
        </li>
      </ul>
      <p>
        No recabamos datos personales sensibles ni datos financieros o patrimoniales. Los pagos
        entre compradores y vendedores no pasan por {brand.name}.
      </p>

      <h2>3. Para qué usamos tus datos</h2>
      <p>
        <strong>Finalidades necesarias</strong> (sin ellas no podemos darte el servicio):
      </p>
      <ul>
        <li>Crear y proteger tu cuenta y verificar tu número de celular por SMS.</li>
        <li>Publicar tus anuncios y mostrarlos en el sitio.</li>
        <li>
          Permitir que quien inicie sesión te contacte por WhatsApp o llamada desde tu anuncio.
        </li>
        <li>Moderar anuncios, atender reportes y prevenir fraudes o usos indebidos.</li>
        <li>Cumplir obligaciones legales y atender requerimientos de autoridad.</li>
      </ul>
      <p>
        <strong>Finalidades adicionales</strong> (puedes negarte sin perder el servicio): enviarte
        avisos sobre tu cuenta o novedades del sitio, y generar estadísticas agregadas para
        mejorarlo. Para oponerte escribe a{" "}
        <a href={`mailto:${brand.contactEmail}`}>{brand.contactEmail}</a>; no afecta tu uso de{" "}
        {brand.name}.
      </p>

      <h2>4. Con quién compartimos tus datos</h2>
      <p>No vendemos tus datos. Los compartimos únicamente en estos casos:</p>
      <ul>
        <li>
          <strong>Con otras personas usuarias:</strong> tu nombre para mostrar, ciudad, antigüedad y
          estatus de verificación son públicos en tu perfil y anuncios. Tu número de celular solo se
          muestra a quien inicia sesión y pulsa WhatsApp o Llamar en tu anuncio.
        </li>
        <li>
          <strong>Proveedores que tratan datos por nuestra cuenta</strong> (encargados):
          alojamiento, base de datos y almacenamiento de archivos (Supabase y Vercel), envío de SMS
          de verificación ([proveedor de SMS, p. ej. Twilio]), inicio de sesión con Google y envío
          de correos ([proveedor de correo]). Solo pueden usar los datos para prestarnos ese
          servicio. Algunos pueden estar ubicados fuera de México.
        </li>
        <li>
          <strong>Autoridades</strong> cuando una ley o una orden fundada y motivada lo exija.
        </li>
      </ul>

      <h2 id="arco">5. Tus derechos (ARCO) y cómo ejercerlos</h2>
      <p>
        Tienes derecho a <strong>Acceder</strong> a tus datos, <strong>Rectificarlos</strong>,{" "}
        <strong>Cancelarlos</strong> y <strong>Oponerte</strong> a su tratamiento, así como a
        revocar tu consentimiento y limitar el uso o divulgación de tus datos.
      </p>
      <ul>
        <li>
          <strong>Desde tu cuenta</strong>, en <Link href="/cuenta">Mi perfil</Link>: corrige tus
          datos, descarga una copia de tu información o borra tu cuenta y todo lo asociado a ella.
        </li>
        <li>
          <strong>Por correo</strong> a{" "}
          <a href={`mailto:${brand.contactEmail}`}>{brand.contactEmail}</a>, indicando tu nombre, el
          medio para responderte, el derecho que ejerces, una descripción clara de los datos y copia
          de una identificación oficial. Te respondemos en un máximo de 20 días hábiles y, si
          procede, lo hacemos efectivo en los 15 días hábiles siguientes.
        </li>
      </ul>
      <p>
        <LinkButton href={arcoMail} variant="outline">
          Enviar solicitud ARCO por correo
        </LinkButton>
      </p>
      <p>
        Si consideras que tu derecho no fue atendido, puedes acudir ante la Secretaría
        Anticorrupción y Buen Gobierno, autoridad en materia de protección de datos personales.
      </p>

      <h2>6. Cookies y tecnologías similares</h2>
      <p>
        Usamos solo cookies y almacenamiento local <strong>necesarios</strong> para mantener tu
        sesión y guardar tu borrador. No usamos cookies de publicidad ni de seguimiento de terceros.
        Detalle y cómo desactivarlas en la <Link href="/cookies">Política de cookies</Link>.
      </p>

      <h2>7. Conservación</h2>
      <p>
        Conservamos tus datos mientras tengas una cuenta. Si la borras, eliminamos tu perfil,
        anuncios, fotos y favoritos, salvo lo que una ley nos obligue a conservar.
      </p>

      <h2>8. Menores de edad</h2>
      <p>
        {brand.name} es solo para personas mayores de 18 años. Si detectamos una cuenta de un menor,
        la eliminamos.
      </p>

      <h2>9. Cambios a este aviso</h2>
      <p>
        Si cambia, publicaremos la nueva versión en esta página con su fecha de actualización y, si
        el cambio es importante, te avisaremos por el medio de contacto que nos diste. Te
        recomendamos revisarla de vez en cuando.
      </p>
      <p className="text-muted-foreground text-sm">
        Tu límite de {site.maxActivePerUser} anuncios y el resto de reglas del servicio están en los{" "}
        <Link href="/terminos">Términos y condiciones</Link>.
      </p>
    </Prose>
  );
}
