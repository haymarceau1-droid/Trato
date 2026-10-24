import Link from "next/link";
import { brand } from "@/config/brand";

export const Logo = ({ className }: { className?: string }) => (
  <Link
    href="/"
    className={`inline-flex items-center gap-2 font-extrabold tracking-tight ${className ?? ""}`}
    aria-label={`${brand.name} — inicio`}
  >
    <span
      aria-hidden
      className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-lg text-lg"
    >
      {brand.logoMark}
    </span>
    <span className="text-xl">{brand.name}</span>
  </Link>
);
