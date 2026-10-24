import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { tList } from "@/i18n";
import { site } from "@/config/site";

export function ScamTips({ showRepuve = false }: { showRepuve?: boolean }) {
  return (
    <aside
      className="border-warning/30 bg-warning-soft text-warning rounded-2xl border p-4"
      aria-label="Consejos anti-estafa"
    >
      <h2 className="mb-2 flex items-center gap-2 font-bold">
        <ShieldCheck className="size-5" aria-hidden /> Compra seguro
      </h2>
      <ul className="list-disc space-y-1 pl-5 text-sm">
        {tList("scam.items").map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
      <p className="mt-3 text-sm">
        {showRepuve && (
          <>
            <a
              href={site.repuveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline"
            >
              Consultar el REPUVE (sitio oficial)
            </a>
            {" · "}
          </>
        )}
        <Link href="/consejos" className="font-semibold underline">
          Ver todos los consejos
        </Link>
      </p>
    </aside>
  );
}
