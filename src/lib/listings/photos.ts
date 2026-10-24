import { SUPABASE_URL } from "@/lib/supabase/env";

export const PHOTO_BUCKET = "listing-photos";

/** Acepta rutas del bucket, URLs absolutas o archivos locales de /public (página de ejemplo). */
export const photoUrl = (path: string) =>
  path.startsWith("http") || path.startsWith("/")
    ? path
    : `${SUPABASE_URL}/storage/v1/object/public/${PHOTO_BUCKET}/${path}`;

export const coverOf = (l: { listing_photos?: { storage_path: string; position: number }[] }) =>
  [...(l.listing_photos ?? [])].sort((a, b) => a.position - b.position)[0]?.storage_path;
