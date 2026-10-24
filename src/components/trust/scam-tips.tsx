import Link from "next/link";
import { tList } from "@/i18n";
import { site } from "@/config/site";

export function ScamTips({ showRepuve = false }: { showRepuve?: boolean }) {
  return (
    <aside
      className="border-foreground bg-card rounded-md border-2 p-5"
      aria-label="Consejos anti-estafa"
    >
      <h2 className="mb-3 text-xl">Antes de dar un peso</h2>
      <ul className="space-y-2 text-[15px]">
        {tList("scam.items").map((i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              aria-hidden
              className="border-foreground mt-0.5 grid size-5 shrink-0 place-items-center border-2 text-xs"
            >
              ✓
            </span>
            {i}
          </li>
        ))}
      </ul>
      <p className="mt-4 flex flex-wrap gap-x-4 text-sm font-semibold">
        {showRepuve && (
          <a
            href={site.repuveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            Consultar el REPUVE
          </a>
        )}
        <Link href="/consejos" className="underline">
          Guía completa
        </Link>
      </p>
    </aside>
  );
}
