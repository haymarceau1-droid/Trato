"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import {
  CaretLeft as ChevronLeft,
  CaretRight as ChevronRight,
  ArrowsOut as Maximize2,
  X,
} from "@/components/ui/icons";
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
    <div className="space-y-2">
      <div
        className={cn(
          full ? "fixed inset-0 z-50 flex flex-col justify-center bg-black" : "relative",
        )}
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
              className="absolute top-1/2 left-2 grid size-11 -translate-y-1/2 place-items-center rounded-sm bg-black/50 text-white"
            >
              <ChevronLeft />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Foto siguiente"
              className="absolute top-1/2 right-2 grid size-11 -translate-y-1/2 place-items-center rounded-sm bg-black/50 text-white"
            >
              <ChevronRight />
            </button>
          </>
        )}
        <span
          className="absolute bottom-3 left-3 rounded-sm bg-black/60 px-3 py-1 text-xs font-semibold text-white"
          aria-live="polite"
        >
          {index + 1} / {photos.length}
        </span>
        {full ? (
          <button
            type="button"
            onClick={() => setFull(false)}
            aria-label="Cerrar galería"
            className="absolute top-3 right-3 grid size-11 place-items-center rounded-sm bg-black/60 text-white"
          >
            <X />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setFull(true)}
            aria-label="Ver en pantalla completa"
            className="absolute right-3 bottom-3 grid size-11 place-items-center rounded-sm bg-black/60 text-white"
          >
            <Maximize2 className="size-5" />
          </button>
        )}
      </div>
      {!full && photos.length > 1 && (
        <ul className="no-scrollbar flex gap-2 overflow-x-auto" aria-label="Miniaturas">
          {photos.map((src, i) => (
            <li key={src} className="shrink-0">
              <button
                type="button"
                onClick={() => embla?.scrollTo(i)}
                aria-label={`Ver foto ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  "relative block h-14 w-[4.5rem] overflow-hidden rounded-sm border-2 sm:h-16 sm:w-24",
                  i === index
                    ? "border-primary"
                    : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <Image src={src} alt="" fill sizes="96px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
