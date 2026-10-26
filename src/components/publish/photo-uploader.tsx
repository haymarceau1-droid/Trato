"use client";

import { useEffect, useRef, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DotsSixVertical as GripVertical,
  ImageSquare as ImagePlus,
  Star,
  Trash as Trash2,
} from "@/components/ui/icons";
import { site } from "@/config/site";
import { ImageTooBigError, compressImage } from "@/lib/images/compress";
import { PHOTO_BUCKET } from "@/lib/listings/photos";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export interface PhotoItem {
  path: string;
  url: string;
}

function Thumb({
  photo,
  index,
  onRemove,
  onCover,
}: {
  photo: PhotoItem;
  index: number;
  onRemove: () => void;
  onCover: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: photo.path,
  });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "border-border bg-muted relative aspect-[4/3] overflow-hidden rounded-sm border",
        isDragging && "z-10 shadow-lg",
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.url} alt={`Foto ${index + 1}`} className="size-full object-cover" />
      {index === 0 && (
        <span className="bg-primary text-primary-foreground absolute top-1.5 left-1.5 rounded-sm px-2 py-0.5 text-[11px] font-bold">
          Portada
        </span>
      )}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/55 p-1 text-white">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Mover foto ${index + 1}`}
          className="grid size-9 cursor-grab touch-none place-items-center"
        >
          <GripVertical className="size-5" />
        </button>
        {index > 0 && (
          <button
            type="button"
            onClick={onCover}
            aria-label={`Hacer portada la foto ${index + 1}`}
            className="grid size-9 place-items-center"
          >
            <Star className="size-5" />
          </button>
        )}
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Eliminar foto ${index + 1}`}
          className="grid size-9 place-items-center"
        >
          <Trash2 className="size-5" />
        </button>
      </div>
    </li>
  );
}

const SHOTS = ["Frente", "Costado", "Trasera", "Interior", "Tablero con km", "Motor"];

export function PhotoUploader({
  userId,
  listingId,
  photos,
  onChange,
}: {
  userId: string;
  listingId: string;
  photos: PhotoItem[];
  onChange: (next: PhotoItem[]) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const latest = useRef(photos);
  useEffect(() => {
    latest.current = photos;
  }, [photos]);

  async function addFiles(files: FileList | File[]) {
    setError(null);
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length < Array.from(files).length) setError("Solo se permiten imágenes.");
    const room = site.maxPhotos - latest.current.length;
    if (list.length > room)
      setError(`Máximo ${site.maxPhotos} fotos. Se agregaron solo ${Math.max(room, 0)}.`);
    const supabase = createClient();
    for (const file of list.slice(0, Math.max(room, 0))) {
      setBusy((n) => n + 1);
      try {
        const blob = await compressImage(file);
        const path = `${userId}/${listingId}/${crypto.randomUUID()}.webp`;
        const { error: upErr } = await supabase.storage
          .from(PHOTO_BUCKET)
          .upload(path, blob, { contentType: "image/webp", cacheControl: "31536000" });
        if (upErr) throw upErr;
        onChange([...latest.current, { path, url: URL.createObjectURL(blob) }]);
      } catch (e) {
        setError(
          e instanceof ImageTooBigError
            ? `“${file.name}” es demasiado pesada (máximo ${site.maxUploadMB} MB por foto). Prueba con otra o redúcela antes de subirla.`
            : "Una foto no se pudo subir, pero las demás están bien. Revisa tu conexión y vuelve a elegirla.",
        );
      } finally {
        setBusy((n) => n - 1);
      }
    }
    if (input.current) input.current.value = "";
  }

  function remove(path: string) {
    const removed = photos.find((p) => p.path === path);
    // Las fotos subidas en esta sesión no están en ningún anuncio: se borran del bucket.
    if (removed?.url.startsWith("blob:"))
      void createClient().storage.from(PHOTO_BUCKET).remove([path]);
    onChange(photos.filter((p) => p.path !== path));
  }

  function onDragEnd(e: DragEndEvent) {
    if (!e.over || e.active.id === e.over.id) return;
    const from = photos.findIndex((p) => p.path === e.active.id);
    const to = photos.findIndex((p) => p.path === e.over!.id);
    onChange(arrayMove(photos, from, to));
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          void addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "rounded-md border-2 border-dashed p-6 text-center",
          over ? "border-primary bg-primary-soft" : "border-border bg-card",
        )}
      >
        <ImagePlus className="text-muted-foreground mx-auto mb-2 size-8" aria-hidden />
        <p className="font-semibold">Arrastra tus fotos aquí o</p>
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="bg-primary text-primary-foreground mt-2 inline-flex min-h-11 items-center rounded-sm px-5 text-sm font-semibold"
        >
          Elegir fotos
        </button>
        <input
          ref={input}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => e.target.files && void addFiles(e.target.files)}
          aria-label="Elegir fotos"
        />
        <p className="text-muted-foreground mt-2 text-xs">
          De 1 a {site.maxPhotos} fotos de hasta {site.maxUploadMB} MB cada una. La primera es la
          portada. Quitamos la ubicación de tus fotos automáticamente.
        </p>
      </div>

      <ul aria-label="Fotos sugeridas" className="flex flex-wrap gap-2">
        {SHOTS.map((shot, i) => (
          <li
            key={shot}
            className={cn(
              "inline-flex min-h-8 items-center gap-1.5 rounded-sm border px-2.5 text-xs font-semibold",
              i < photos.length
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            {i < photos.length ? "✓" : i + 1} {shot}
          </li>
        ))}
      </ul>

      {busy > 0 && (
        <p role="status" className="text-muted-foreground text-sm">
          Subiendo {busy} {busy === 1 ? "foto" : "fotos"}…
        </p>
      )}
      {error && (
        <p role="alert" className="text-danger text-sm">
          {error}
        </p>
      )}

      {photos.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={photos.map((p) => p.path)} strategy={rectSortingStrategy}>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos.map((p, i) => (
                <Thumb
                  key={p.path}
                  photo={p}
                  index={i}
                  onRemove={() => remove(p.path)}
                  onCover={() => onChange(arrayMove(photos, i, 0))}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
