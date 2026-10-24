import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/button";
import { Prose } from "@/components/static/prose";

export const metadata: Metadata = {
  title: "Cómo vender rápido tu auto o moto",
  description:
    "Consejos para vender tu vehículo usado más rápido: fotos, precio, descripción y trato seguro.",
  alternates: { canonical: "/como-vender" },
};

export default function SellPage() {
  return (
    <Prose
      title="Cómo vender rápido"
      intro="No necesitas ser experto: con buenas fotos, un precio justo y un trato seguro, tu auto o moto se vende más rápido y con menos vueltas."
    >
      <h2>Fotos que venden</h2>
      <ul>
        <li>Lava el vehículo y fotografía de día, en un lugar despejado.</li>
        <li>Sube al menos 6 fotos: frente, laterales, atrás, tablero, interior y motor.</li>
        <li>Pon como portada la mejor foto de 3/4 frontal.</li>
      </ul>
      <h2>Un precio justo</h2>
      <p>
        Al publicar te mostramos el precio medio de anuncios similares cuando hay suficientes datos.
        Un precio cercano a ese promedio atrae más contactos. Si aceptas ofertas, marca “Precio
        negociable”.
      </p>
      <h2>Descripción clara</h2>
      <ul>
        <li>Menciona servicios, llantas, detalles y razón de venta.</li>
        <li>Indica el tipo de factura y si la tenencia está al corriente.</li>
        <li>No escribas teléfono ni enlaces: te contactan por WhatsApp desde el anuncio.</li>
      </ul>
      <h2>Trato seguro</h2>
      <ul>
        <li>Nunca pidas ni aceptes depósitos por adelantado; tampoco los des.</li>
        <li>Reúnete en un lugar público y acompañado.</li>
        <li>Cobra en el momento de la entrega y firma contrato de compraventa.</li>
        <li>
          Marca el anuncio como <strong>vendido</strong> en cuanto cierres.
        </li>
      </ul>
      <p>
        <LinkButton href="/publicar">Publicar mi anuncio</LinkButton>
      </p>
    </Prose>
  );
}
