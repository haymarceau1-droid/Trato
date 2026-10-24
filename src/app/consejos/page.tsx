import type { Metadata } from "next";
import { site } from "@/config/site";
import { Prose } from "@/components/static/prose";

export const metadata: Metadata = {
  title: "Consejos para comprar seguro",
  description:
    "Guía anti-estafas para comprar autos y motos usados en México: anticipos, REPUVE, factura, revisión mecánica y trato en persona.",
  alternates: { canonical: "/consejos" },
};

export default function TipsPage() {
  return (
    <Prose
      title="Consejos para comprar seguro"
      intro="Comprar un vehículo usado es seguro si sigues estos pasos. Guárdalos y compártelos."
    >
      <h2>1. Nunca des anticipos para “apartar”</h2>
      <p>
        Nadie legítimo necesita dinero antes de que veas el vehículo. Si te piden un depósito,
        apartado o “gastos de envío”, es la señal más común de estafa. Paga solo cuando tengas el
        vehículo y los papeles frente a ti.
      </p>
      <h2>2. Verifica el vehículo en el REPUVE</h2>
      <p>
        El Registro Público Vehicular te dice si un auto o moto tiene reporte de robo. Consulta con
        el número de serie (NIV) o las placas en el{" "}
        <a href={site.repuveUrl} target="_blank" rel="noopener noreferrer">
          sitio oficial del REPUVE
        </a>
        . Compara que el NIV del vehículo coincida con el de la factura y la tarjeta de circulación.
      </p>
      <h2>3. Revisa la factura original</h2>
      <ul>
        <li>
          Pide la factura original (o refacturación con su factura de origen) y revisa que esté a
          nombre del vendedor o endosada correctamente.
        </li>
        <li>
          Desconfía de “carta factura” sin documentos de respaldo o facturas de aseguradora no
          declaradas.
        </li>
        <li>Confirma que la tenencia y las verificaciones estén al corriente.</li>
      </ul>
      <h2>4. Reúnete en un lugar público</h2>
      <p>
        Elige un estacionamiento de plaza comercial o una zona concurrida y de día. Ve acompañado y
        avisa a alguien dónde estarás. No des tu domicilio.
      </p>
      <h2>5. Revisa y prueba el vehículo</h2>
      <ul>
        <li>Haz una prueba de manejo y, si puedes, llévalo con un mecánico de confianza.</li>
        <li>
          Revisa que el kilometraje sea coherente con el desgaste de pedales, volante y asientos.
        </li>
        <li>Busca señales de choques: pintura dispareja, holguras en puertas y cofre.</li>
      </ul>
      <h2>6. Cuida tu forma de pago</h2>
      <p>
        Evita cargar efectivo en grandes cantidades: usa transferencia o cheque de caja{" "}
        <em>en el momento de la entrega</em> y firma contrato de compraventa. Haz el cambio de
        propietario y baja de placas de inmediato.
      </p>
      <h2>Señales de alerta</h2>
      <ul>
        <li>Precio muy por debajo del mercado.</li>
        <li>Urgencia (“hay otro comprador, apártalo ya”).</li>
        <li>El vendedor está “fuera del país” o “en una plataforma petrolera”.</li>
        <li>
          Quiere platicar fuera de la app por enlaces raros o pedirte códigos que te llegan por SMS.
        </li>
      </ul>
      <p>
        Si algo no te late, <strong>no sigas</strong> y usa el botón <em>Reportar</em> del anuncio.
      </p>
    </Prose>
  );
}
