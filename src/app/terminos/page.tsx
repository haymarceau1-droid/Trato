import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/config/brand";
import { site } from "@/config/site";
import { Prose, TemplateNotice } from "@/components/static/prose";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: `Reglas de uso de ${brand.name}: quién puede publicar, qué está prohibido y cómo funciona el servicio.`,
  alternates: { canonical: "/terminos" },
};

const { legal } = brand;

export default function TermsPage() {
  return (
    <Prose title="Términos y condiciones" intro={`Última actualización: ${legal.updated}.`}>
      <TemplateNotice />

      <h2>1. Quiénes somos</h2>
      <p>
        {brand.name} es un sitio de anuncios clasificados de autos y motos usados en México, operado
        por {legal.responsable}, con domicilio en {legal.domicilio} (RFC {legal.rfc}). Contacto:{" "}
        <a href={`mailto:${brand.contactEmail}`}>{brand.contactEmail}</a>.
      </p>

      <h2>2. Qué hacemos y qué no</h2>
      <p>
        {brand.name} pone en contacto a quien vende con quien compra un vehículo.{" "}
        <strong>No somos parte de la compraventa</strong>: no vendemos vehículos, no los
        inspeccionamos, no garantizamos su estado, historial ni la veracidad de los anuncios, y no
        procesamos ni retenemos pagos. La operación, el precio, la entrega y los papeles se acuerdan
        directamente entre las personas.
      </p>
      <p>
        Te recomendamos seguir la <Link href="/consejos">guía para comprar seguro</Link>: ver el
        vehículo en persona, revisar factura y REPUVE, y no dar anticipos.
      </p>

      <h2>3. Tu cuenta</h2>
      <ul>
        <li>Debes ser mayor de 18 años y darnos datos verdaderos.</li>
        <li>Eres responsable de lo que se haga con tu cuenta y de mantener seguro tu acceso.</li>
        <li>Una persona, una cuenta. No puedes vender tu cuenta ni usar la de otra persona.</li>
        <li>
          Puedes borrar tu cuenta cuando quieras desde <Link href="/cuenta">Mi perfil</Link>.
        </li>
      </ul>

      <h2>4. Reglas para publicar</h2>
      <ul>
        <li>Publica solo vehículos de tu propiedad o que estés autorizado a vender.</li>
        <li>
          La información, el precio y las fotos deben ser reales y actuales. Las fotos deben ser del
          vehículo.
        </li>
        <li>
          Prohibido pedir o aceptar anticipos, apartados o depósitos antes de que el comprador vea
          el vehículo.
        </li>
        <li>
          Prohibido publicar vehículos robados, con documentación irregular, o con reporte de robo.
        </li>
        <li>
          No incluyas teléfonos, enlaces ni datos de contacto en la descripción: el contacto va por
          tu anuncio.
        </li>
        <li>
          Límites: hasta {site.maxActivePerUser} anuncios activos por persona (los negocios pueden
          tener más con un plan) y {site.maxPublishPerDay} publicaciones por día. Cada anuncio dura{" "}
          {site.listingTtlDays} días y puede renovarse.
        </li>
      </ul>

      <h2>5. Contenido que publicas</h2>
      <p>
        Sigues siendo dueño de tus textos y fotos. Nos autorizas, sin costo y mientras tu anuncio
        esté publicado, a mostrarlos y distribuirlos dentro de {brand.name} y en vistas previas al
        compartir el enlace. Responde por lo que publicas: si infringe derechos de terceros, nos
        libras de reclamaciones derivadas de ello.
      </p>

      <h2>6. Moderación</h2>
      <p>
        Revisamos reportes y señales de riesgo. Podemos pausar, pedirte corregir o retirar anuncios
        y suspender cuentas que incumplan estos términos o pongan en riesgo a otras personas. Un
        anuncio con varios reportes puede pausarse automáticamente mientras se revisa.
      </p>

      <h2>7. Precios, impulsos y planes</h2>
      <p>
        Publicar como particular (hasta {site.maxActivePerUser} anuncios activos) es gratis y{" "}
        {brand.name} no cobra comisión por ventas. Los impulsos y planes de negocio se describen en{" "}
        <Link href="/precios">Precios</Link>; están expresados en pesos mexicanos y, para planes de
        negocio, más IVA. Antes de cualquier cobro verás el precio total y lo que incluye.
        [Condiciones de pago, facturación, cancelación y reembolso: completar cuando se active el
        cobro.]
      </p>

      <h2>8. Responsabilidad</h2>
      <p>
        El sitio se ofrece “tal cual”. Hacemos lo posible por mantenerlo disponible y seguro, pero
        no garantizamos que no tenga interrupciones o errores. En la medida permitida por la ley,{" "}
        {brand.name} no responde por daños derivados de operaciones entre personas usuarias ni por
        contenido publicado por terceros. Esto no limita los derechos que la Ley Federal de
        Protección al Consumidor te reconoce frente a quien te venda un bien o servicio.
      </p>

      <h2>9. Datos personales</h2>
      <p>
        Tratamos tus datos según nuestro <Link href="/privacidad">Aviso de privacidad</Link> y
        usamos cookies según la <Link href="/cookies">Política de cookies</Link>.
      </p>

      <h2>10. Quejas y contacto</h2>
      <p>
        Escríbenos a <a href={`mailto:${brand.contactEmail}`}>{brand.contactEmail}</a> o usa el
        botón <em>Reportar</em> de cada anuncio. También puedes acudir a la Procuraduría Federal del
        Consumidor (Profeco) si tienes una controversia con un proveedor.
      </p>

      <h2>11. Cambios, ley aplicable y jurisdicción</h2>
      <p>
        Podemos actualizar estos términos; publicaremos la versión vigente con su fecha y, si el
        cambio es importante, te avisaremos. Se rigen por las leyes de los Estados Unidos Mexicanos.
        [Para controversias, las partes se someten a los tribunales de [ciudad y estado],
        renunciando a cualquier otro fuero, sin perjuicio de los derechos del consumidor ante
        Profeco y los tribunales de su domicilio.]
      </p>
    </Prose>
  );
}
