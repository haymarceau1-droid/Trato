import { brand } from "@/config/brand";
import { site } from "@/config/site";
import type { Listing } from "@/types";
import { coverOf, photoUrl } from "@/lib/listings/photos";
import { listingPath } from "@/lib/listings/slug";
import { stateName } from "@/lib/constants";

/** schema.org Car/Motorcycle (Vehicle) + Offer. */
export function listingJsonLd(l: Listing) {
  const cover = coverOf(l);
  return {
    "@context": "https://schema.org",
    "@type": l.vehicle_type === "auto" ? "Car" : "Motorcycle",
    name: l.title,
    description: l.description.slice(0, 300) || l.title,
    brand: { "@type": "Brand", name: l.brand },
    model: l.model,
    vehicleModelDate: String(l.year),
    productionDate: String(l.year),
    mileageFromOdometer: { "@type": "QuantitativeValue", value: l.mileage_km, unitCode: "KMT" },
    vehicleTransmission: l.transmission === "manual" ? "Manual" : "Automática",
    fuelType: l.fuel,
    itemCondition: "https://schema.org/UsedCondition",
    color: l.color ?? undefined,
    image: l.listing_photos.map((p) => photoUrl(p.storage_path)).concat(cover ? [] : []),
    url: `${site.url}${listingPath(l)}`,
    offers: {
      "@type": "Offer",
      price: l.price_mxn,
      priceCurrency: "MXN",
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/UsedCondition",
      areaServed: `${l.city}, ${stateName(l.state)}`,
      seller: { "@type": "Organization", name: brand.name },
    },
  };
}
