import Link from "next/link";
import { Check } from "@/components/ui/icons";
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
              <Check weight="bold" className="size-3.5" />
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
            className="text-primary inline-flex min-h-11 items-center underline"
          >
            Consultar el REPUVE
          </a>
        )}
        <Link href="/consejos" className="inline-flex min-h-11 items-center underline">
          Guía completa anti-estafa
        </Link>
      </p>
    </aside>
  );
}
