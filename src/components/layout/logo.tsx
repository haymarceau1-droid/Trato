import Link from "next/link";
import { brand } from "@/config/brand";

/**
 * Marca solo tipográfica sobre fondo oscuro: "rod" en verde, "ara" en blanco y ".mx" en rojo
 * (los colores de la bandera de México). Si el nombre cambia, se reparte igual: 3 primeras letras, resto y extensión.
 */
export const Logo = ({ className }: { className?: string }) => {
  const dot = brand.name.indexOf(".");
  const main = dot > 0 ? brand.name.slice(0, dot) : brand.name;
  const ext = dot > 0 ? brand.name.slice(dot) : "";
  return (
    <Link
      href="/"
      className={`font-display inline-flex min-h-11 items-center ${className ?? ""}`}
      aria-label={`${brand.name} — inicio`}
    >
      <span className="text-2xl tracking-wide">
        <span className="text-[#22a55b]">{main.slice(0, 3)}</span>
        <span className="text-white">{main.slice(3)}</span>
        {ext && <span className="text-primary">{ext}</span>}
      </span>
    </Link>
  );
};
