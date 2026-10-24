export default function Loading() {
  return (
    <div className="container-page py-10" aria-busy="true" aria-live="polite">
      <div className="bg-muted mb-6 h-8 w-56 animate-pulse rounded" />
      <div className="bg-muted h-64 animate-pulse rounded-md" />
      <span className="sr-only">Cargando…</span>
    </div>
  );
}
