"use client";

import { useRouter } from "next/navigation";
import { SORTS } from "@/lib/constants";
import { buildUrl, type Filters } from "@/lib/listings/filters-url";
import { Select } from "@/components/ui/field";

export function SortSelect({ filters }: { filters: Filters }) {
  const router = useRouter();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="sr-only sm:not-sr-only">Ordenar por</span>
      <Select
        className="min-h-11 w-auto"
        value={filters.sort}
        onChange={(e) =>
          router.push(buildUrl({ ...filters, sort: e.target.value as Filters["sort"], page: 1 }))
        }
      >
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </Select>
    </label>
  );
}
