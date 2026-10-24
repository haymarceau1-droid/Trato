import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/config/brand";
import { Prose } from "@/components/static/prose";

export const metadata: Metadata = {
  title: "Política de cookies",
  description: `Qué cookies y almacenamiento local usa ${brand.name}, para qué sirven y cómo desactivarlos.`,
  alternates: { canonical: "/cookies" },
};

const ROWS = [
  ["sb-…-auth-token", "Cookie", "Mantiene tu sesión iniciada.", "Hasta cerrar sesión", "Necesaria"],
  [
    "trato:draft:v1",
    "Almacenamiento local",
    "Guarda el borrador de tu anuncio en tu navegador.",
    "Hasta que lo publiques o borres",
    "Necesaria (función que pides)",
  ],
  [
    "viewed:<id>",
    "Almacenamiento de sesión",
    "Evita contar dos veces tu visita al mismo anuncio.",
    "Hasta cerrar la pestaña",
    "Necesaria",
  ],
  [
    "trato:aviso-cookies",
    "Almacenamiento local",
    "Recuerda que ya viste este aviso.",
    "Sin vencimiento",
    "Necesaria",
  ],
  [
    "Caché sin conexión",
    "Service worker",
    "Muestra una página de “sin conexión” si pierdes internet.",
    "Hasta actualizar el sitio",
    "Necesaria",
  ],
];

export default function CookiesPage() {
  return (
    <Prose title="Política de cookies" intro={`Última actualización: ${brand.legal.updated}.`}>
      <p>
        {brand.name} usa solo lo indispensable para funcionar.{" "}
        <strong>
          No usamos cookies de publicidad ni de análisis, y no hay cookies de terceros con fines de
          seguimiento.
        </strong>{" "}
        Por eso no necesitas aceptar nada para navegar; el aviso que ves solo te informa.
      </p>

      <h2>Qué guardamos en tu navegador</h2>
      <div className="border-border overflow-x-auto rounded-md border">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <caption className="sr-only">Cookies y almacenamiento local de {brand.name}</caption>
          <thead className="bg-muted">
            <tr>
              {["Nombre", "Tipo", "Para qué sirve", "Duración", "Categoría"].map((h) => (
                <th key={h} scope="col" className="px-3 py-2 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {ROWS.map((r) => (
              <tr key={r[0]}>
                <th scope="row" className="px-3 py-2 font-mono text-xs font-medium">
                  {r[0]}
                </th>
                {r.slice(1).map((c) => (
                  <td key={c} className="px-3 py-2 align-top">
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Cómo desactivarlas</h2>
      <p>
        Puedes borrar o bloquear cookies y datos del sitio desde la configuración de tu navegador
        (Chrome, Safari, Firefox y Edge lo permiten). Si las bloqueas, no podrás iniciar sesión ni
        guardar borradores.
      </p>

      <h2>Si esto cambia</h2>
      <p>
        Si algún día añadimos herramientas de análisis o publicidad, actualizaremos esta página y te
        pediremos tu permiso <strong>antes</strong> de activarlas. Más sobre tus datos en el{" "}
        <Link href="/privacidad">Aviso de privacidad</Link>.
      </p>
    </Prose>
  );
}
