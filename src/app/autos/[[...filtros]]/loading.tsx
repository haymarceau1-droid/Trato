import { ListingGridSkeleton } from "@/components/listings/listing-card";

export default function Loading() {
  return (
    <div className="container-page py-6">
      <div className="bg-muted mb-6 h-8 w-64 animate-pulse rounded" />
      <ListingGridSkeleton />
    </div>
  );
}
