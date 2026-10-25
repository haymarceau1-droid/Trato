import Link from "next/link";
import { MAP_PATHS, MAP_VIEWBOX } from "@/lib/mexico-map";
import { MX_STATES, stateName } from "@/lib/constants";
import type { Listing } from "@/types";
import { MapPin } from "@/components/ui/icons";

/** Centro del subpolígono más grande del estado (sirve para colocar el marcador). */
function center(d: string): [number, number] | null {
  let best: { area: number; cx: number; cy: number } | null = null;
  for (const sub of d.split("M").filter(Boolean)) {
    const nums = sub.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    for (let i = 0; i + 1 < nums.length; i += 2) {
      minX = Math.min(minX, nums[i]!);
      maxX = Math.max(maxX, nums[i]!);
      minY = Math.min(minY, nums[i + 1]!);
      maxY = Math.max(maxY, nums[i + 1]!);
    }
    const area = (maxX - minX) * (maxY - minY);
    if (Number.isFinite(area) && (!best || area > best.area))
      best = { area, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
  }
  return best ? [best.cx, best.cy] : null;
}

/** Mini mapa de México con el estado del vehículo resaltado y un marcador (ubicación aproximada, nunca una dirección). */
export function LocationMap({ l }: { l: Pick<Listing, "state" | "city" | "vehicle_type"> }) {
  const known = MX_STATES.some((s) => s.slug === l.state);
  if (!known) return null;
  const pin = center(MAP_PATHS[l.state] ?? "");
  const name = stateName(l.state);
  const kind = l.vehicle_type === "moto" ? "motos" : "autos";

  return (
    <div className="border-border bg-card grid gap-4 rounded-md border p-4 sm:grid-cols-[minmax(0,16rem)_1fr] sm:items-center">
      <svg
        viewBox={MAP_VIEWBOX}
        role="img"
        aria-label={`Mapa de México con ${name} resaltado`}
        className="w-full"
      >
        {MX_STATES.map((s) => (
          <path
            key={s.slug}
            d={MAP_PATHS[s.slug]}
            fillRule="evenodd"
            className={s.slug === l.state ? "fill-primary" : "fill-border"}
            stroke="var(--card)"
            strokeWidth={1.2}
            strokeLinejoin="round"
          />
        ))}
        {pin && (
          <g transform={`translate(${pin[0]} ${pin[1]})`}>
            <circle r={26} className="fill-foreground/15" />
            <circle r={11} className="fill-foreground" stroke="var(--card)" strokeWidth={4} />
          </g>
        )}
      </svg>
      <div className="space-y-2">
        <p className="flex items-center gap-2 text-lg font-semibold">
          <MapPin className="text-primary size-5 shrink-0" aria-hidden />
          {l.city}, {name}
        </p>
        <p className="text-muted-foreground text-sm">
          Ubicación aproximada. La dirección exacta la acuerdas con el vendedor: reúnanse en un
          lugar público y con buena luz.
        </p>
        <Link href={`/${kind}/${l.state}`} className="text-sm font-semibold underline">
          Ver más {kind} en {name}
        </Link>
      </div>
    </div>
  );
}
