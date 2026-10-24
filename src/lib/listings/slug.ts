/** Misma lógica que public.slugify() en SQL. */
export const slugify = (txt: string) =>
  txt
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const UUID_TAIL = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

export const listingPath = (l: { slug: string; id: string }) => `/anuncio/${l.slug}-${l.id}`;

export const parseListingId = (param: string) => UUID_TAIL.exec(param)?.[1]?.toLowerCase() ?? null;
