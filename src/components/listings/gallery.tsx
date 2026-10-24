"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Gallery({ photos, title }: { photos: string[]; title: string }) {
  const [emblaRef, embla] = useEmblaCarousel({ loop: photos.length > 1 });
  const [index, setIndex] = useState(0);
  const [full, setFull] = useState(false);

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => setIndex(embla.selectedScrollSnap());
    embla.on("select", onSelect);
    return () => void embla.off("select", onSelect);
  }, [embla]);

  useEffect(() => {
    embla?.reInit();
  }, [full, embla]);

  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFull(false);
      if (e.key === "ArrowLeft") embla?.scrollPrev();
      if (e.key === "ArrowRight") embla?.scrollNext();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [full, embla]);

  const prev = useCallback(() => embla?.scrollPrev(), [embla]);
  const next = useCallback(() => embla?.scrollNext(), [embla]);

  if (!photos.length) return <div className="bg-muted aspect-[4/3] rounded-md" />;

  return (
    <div
      className={cn(full ? "fixed inset-0 z-50 flex flex-col justify-center bg-black" : "relative")}
      {...(full ? { role: "dialog", "aria-modal": true, "aria-label": "Galería de fotos" } : {})}
    >
      <div ref={emblaRef} className={cn("overflow-hidden", !full && "rounded-md")}>
        <div className="flex">
          {photos.map((src, i) => (
            <div
              key={src}
              className={cn(
                "relative min-w-0 flex-[0_0_100%]",
                full ? "h-[80dvh]" : "bg-muted aspect-[4/3]",
              )}
            >
              <Image
                src={src}
                alt={`${title} — foto ${i + 1} de ${photos.length}`}
                fill
                priority={i === 0}
                sizes={full ? "100vw" : "(min-width: 1024px) 60vw, 100vw"}
                className={full ? "object-contain" : "cursor-zoom-in object-cover"}
                onClick={() => setFull(true)}
              />
            </div>
          ))}
        </div>
      </div>

      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Foto anterior"
            className="absolute top-1/2 left-2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-white"
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Foto siguiente"
            className="absolute top-1/2 right-2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-white"
          >
            <ChevronRight />
          </button>
        </>
      )}
      <span
        className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white"
        aria-live="polite"
      >
        {index + 1} / {photos.length}
      </span>
      {full ? (
        <button
          type="button"
          onClick={() => setFull(false)}
          aria-label="Cerrar galería"
          className="absolute top-3 right-3 grid size-11 place-items-center rounded-full bg-black/60 text-white"
        >
          <X />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setFull(true)}
          aria-label="Ver en pantalla completa"
          className="absolute right-3 bottom-3 grid size-11 place-items-center rounded-full bg-black/60 text-white"
        >
          <Maximize2 className="size-5" />
        </button>
      )}
    </div>
  );
}
