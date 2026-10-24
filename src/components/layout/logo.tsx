import Link from "next/link";
import { brand } from "@/config/brand";

export const Logo = ({ className }: { className?: string }) => (
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
    <span className="text-2xl tracking-wide uppercase">{brand.name}</span>
  </Link>
);
