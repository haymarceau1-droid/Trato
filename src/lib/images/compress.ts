import { site } from "@/config/site";

const TARGET_BYTES = 300 * 1024;
const HARD_LIMIT_BYTES = site.maxStoredKB * 1024;

export class ImageTooBigError extends Error {}

/**
 * Redimensiona (máx. 1600 px) y re-codifica a WebP en el navegador, apuntando a ~300 KB.
 * Si aun así pasa de {site.maxStoredKB} KB, baja la calidad y el tamaño hasta que quepa.
 * Re-dibujar en un canvas elimina los metadatos EXIF (incluida la ubicación).
 */
export async function compressImage(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) throw new Error("Solo se permiten imágenes.");
  if (file.size > site.maxUploadMB * 1024 * 1024)
    throw new ImageTooBigError(`Pesa más de ${site.maxUploadMB} MB.`);
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    let best = null as Blob | null;
    for (const side of [1600, 1280, 1024]) {
      const scale = Math.min(1, side / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.82, 0.72, 0.62, 0.5, 0.4]) {
        const blob = await new Promise<Blob | null>((res) =>
          canvas.toBlob(res, "image/webp", quality),
        );
        if (!blob) continue;
        best = blob;
        if (blob.size <= TARGET_BYTES) return blob;
      }
      // Con este tamaño ya cabe en el tope aunque no llegue al objetivo.
      if (best && best.size <= HARD_LIMIT_BYTES) return best;
    }
    if (!best) throw new Error("No se pudo procesar la imagen.");
    if (best.size > HARD_LIMIT_BYTES)
      throw new ImageTooBigError("No se pudo reducir lo suficiente.");
    return best;
  } finally {
    bitmap.close();
  }
}
