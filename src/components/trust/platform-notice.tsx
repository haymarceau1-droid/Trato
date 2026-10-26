import Link from "next/link";
import { brand } from "@/config/brand";
import { ShieldCheck } from "@/components/ui/icons";

/** Aviso de postura y de responsabilidad en la página del anuncio. */
export function PlatformNotice() {
  return (
    <aside
      aria-label="Aviso sobre estafas y responsabilidad"
      className="border-border bg-card flex gap-4 rounded-md border p-5"
    >
      <ShieldCheck className="text-primary mt-0.5 size-6 shrink-0" aria-hidden />
      <div className="space-y-2 text-sm">
        <p className="text-base font-semibold">En {brand.name} no hay lugar para las estafas.</p>
        <p className="text-muted-foreground">
          Revisamos los reportes y retiramos los anuncios sospechosos. Aun así, {brand.name} solo
          conecta a quien vende con quien compra: no participa en la compraventa ni en los pagos.
          Todo lo que acuerdes, pagues o hagas fuera de la plataforma es tu responsabilidad, y{" "}
          {brand.name} no puede ser responsable de ello. Verifica siempre el vehículo y sus papeles
          en persona antes de pagar.
        </p>
        <p className="font-semibold">
          <Link href="/terminos" className="underline">
            Términos de uso
          </Link>
          <span className="text-muted-foreground mx-2" aria-hidden>
            ·
          </span>
          <Link href="/consejos" className="underline">
            Consejos anti-estafa
          </Link>
        </p>
      </div>
    </aside>
  );
}
