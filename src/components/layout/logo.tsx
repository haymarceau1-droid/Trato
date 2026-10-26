import Link from "next/link";
import { brand } from "@/config/brand";

/** Marca: cuadro con la inicial y el nombre; si el nombre es un dominio ("rodara.mx") la extensión va en rojo. */
export const Logo = ({ className }: { className?: string }) => {
  const dot = brand.name.indexOf(".");
  const main = dot > 0 ? brand.name.slice(0, dot) : brand.name;
  const ext = dot > 0 ? brand.name.slice(dot) : "";
  return (
    <Link
      href="/"
      className={`font-display inline-flex items-center gap-2 ${className ?? ""}`}
      aria-label={`${brand.name} — inicio`}
    >
      <span
        aria-hidden
        className="bg-primary text-primary-foreground -skew-x-6 px-2 text-xl leading-8 tracking-wide"
      >
        {brand.logoMark}
      </span>
      <span className="text-2xl tracking-wide">
        {main}
        {ext && <span className="text-primary">{ext}</span>}
      </span>
    </Link>
  );
};
