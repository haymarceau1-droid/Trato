const MAX_SIDE = 1600;
const TARGET_BYTES = 300 * 1024;

/**
 * Redimensiona (máx. 1600 px) y re-codifica a WebP en el navegador.
 * Re-dibujar en un canvas elimina los metadatos EXIF (incluida la ubicación).
 */
export async function compressImage(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) throw new Error("Solo se permiten imágenes.");
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  let blob: Blob | null = null;
  for (const quality of [0.82, 0.72, 0.62, 0.5]) {
    blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/webp", quality));
    if (blob && blob.size <= TARGET_BYTES) break;
  }
  if (!blob) throw new Error("No se pudo procesar la imagen.");
  return blob;
}
