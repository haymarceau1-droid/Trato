"use client";

import { useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { CaretLeft, CaretRight } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/**
 * Fotos de la tarjeta: se desliza con el dedo (scroll-snap) o con las flechas al pasar el ratón.
 * `children` es el panel de datos que sube desde abajo al pasar el ratón.
 */
export function CardGallery({
  photos,
  alt,
  priority,
  children,
}: {
  photos: string[];
  alt: string;
  priority?: boolean;
  children?: ReactNode;
}) {
  const scroller = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const many = photos.length > 1;

  const go = (e: React.MouseEvent, dir: -1 | 1) => {
    // La tarjeta entera es un enlace: las flechas no deben abrir el anuncio.
    e.preventDefault();
    e.stopPropagation();
    const el = scroller.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };

  const arrow =
    "bg-card/95 text-foreground absolute top-1/2 z-20 hidden size-8 -translate-y-1/2 place-items-center rounded-full opacity-0 shadow-md transition-opacity group-hover/img:opacity-100 hover:bg-card md:grid";

  return (
    <div className="bg-muted group/img relative aspect-[4/3] overflow-hidden rounded-md">
      {photos.length === 0 ? null : (
        <ul
          ref={scroller}
          onScroll={(e) => {
            const el = e.currentTarget;
            setIndex(Math.round(el.scrollLeft / el.clientWidth));
          }}
          className="no-scrollbar flex size-full snap-x snap-mandatory overflow-x-auto"
        >
          {photos.map((src, i) => (
            <li key={src} className="relative size-full shrink-0 snap-center">
              <Image
                src={src}
                alt={i === 0 ? alt : `${alt}, foto ${i + 1}`}
                fill
                priority={priority && i === 0}
                loading={i === 0 && priority ? undefined : "lazy"}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover"
              />
            </li>
          ))}
        </ul>
      )}

      {many && (
        <>
          <button
            type="button"
            aria-label="Foto anterior"
            onClick={(e) => go(e, -1)}
            disabled={index === 0}
            className={cn(arrow, "left-2 disabled:hidden")}
          >
            <CaretLeft className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Foto siguiente"
            onClick={(e) => go(e, 1)}
            disabled={index >= photos.length - 1}
            className={cn(arrow, "right-2 disabled:hidden")}
          >
            <CaretRight className="size-4" aria-hidden />
          </button>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-2 z-10 flex justify-center gap-1 transition-[bottom] duration-300 group-hover/img:bottom-[3.25rem]"
          >
            {photos.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "size-1.5 rounded-full shadow transition-all",
                  i === index ? "w-3 bg-white" : "bg-white/60",
                )}
              />
            ))}
          </div>
        </>
      )}

      {children && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 translate-y-3 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-3 pt-8 pb-2.5 opacity-0 transition duration-300 group-hover/img:translate-y-0 group-hover/img:opacity-100">
          {children}
        </div>
      )}
    </div>
  );
}
