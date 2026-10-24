import type { VehicleType } from "@/lib/constants";

export type ListingStatus = "active" | "paused" | "sold" | "expired" | "removed";

export interface ListingPhoto {
  id: string;
  storage_path: string;
  position: number;
}

export interface Listing {
  id: string;
  user_id: string;
  vehicle_type: VehicleType;
  status: ListingStatus;
  slug: string;
  title: string;
  brand: string;
  brand_slug: string;
  model: string;
  model_slug: string;
  version: string | null;
  year: number;
  color: string | null;
  transmission: "manual" | "automatica";
  fuel: "gasolina" | "diesel" | "hibrido" | "electrico";
  mileage_km: number;
  owners_count: number | null;
  invoice_type: "original" | "refacturado" | "aseguradora" | "sin_factura";
  plates_state: string | null;
  tenencia_al_corriente: boolean;
  body_type: string | null;
  doors: number | null;
  engine_liters: number | null;
  traction: string | null;
  moto_type: string | null;
  engine_cc: number | null;
  price_mxn: number;
  negotiable: boolean;
  state: string;
  city: string;
  city_slug: string;
  description: string;
  needs_review: boolean;
  review_reasons: string[];
  reports_count: number;
  created_at: string;
  updated_at: string;
  expires_at: string;
  views_count: number;
  listing_photos: ListingPhoto[];
}

export interface PublicProfile {
  id: string;
  display_name: string;
  city: string | null;
  state: string | null;
  avatar_url: string | null;
  phone_verified: boolean;
  created_at: string;
  active_listings: number;
}

export interface CatalogBrand {
  name: string;
  slug: string;
  vehicle_type: VehicleType;
  models: { name: string; slug: string }[];
}
