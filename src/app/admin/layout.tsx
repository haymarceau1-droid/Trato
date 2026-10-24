import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getUser } from "@/lib/listings/queries";

export const metadata: Metadata = {
  title: "Administración",
  robots: { index: false, follow: false },
};

const tabs = [
  ["/admin", "Resumen"],
  ["/admin/reportes", "Reportes"],
  ["/admin/revision", "En revisión"],
  ["/admin/usuarios", "Usuarios"],
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (user?.profile?.role !== "admin" || user.profile.is_blocked) notFound();
  return (
    <div className="container-page py-6">
      <h1 className="mb-4 text-2xl font-extrabold">Administración</h1>
      <nav aria-label="Administración" className="no-scrollbar mb-6 flex gap-2 overflow-x-auto">
        {tabs.map(([href, label]) => (
          <Link
            key={href}
            href={href!}
            className="border-border bg-card hover:bg-muted inline-flex min-h-11 shrink-0 items-center rounded-xl border px-4 text-sm font-semibold"
          >
            {label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
