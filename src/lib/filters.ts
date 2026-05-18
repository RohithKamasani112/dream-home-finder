// Centralized filter state shared by listing pages.
import { type Property, type PropertyType, type Listing } from "@/lib/store";

export interface Filters {
  listing: Listing | "all";
  types: PropertyType[];
  quick: string[]; // furnished, readyToMove, newlyAdded, luxury, verified, petFriendly
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  minArea?: number;
  parking?: number;
  furnishing?: "any" | "furnished" | "semi" | "unfurnished";
  facing?: string;
  amenities: string[];
  sort: "recent" | "priceAsc" | "priceDesc" | "viewed";
}

export const DEFAULT_FILTERS: Filters = {
  listing: "all",
  types: [],
  quick: [],
  amenities: [],
  sort: "recent",
};

export function applyFilters(items: Property[], f: Filters): Property[] {
  let out = items.slice();

  if (f.listing !== "all") out = out.filter((p) => p.listing === f.listing);
  if (f.types.length) out = out.filter((p) => f.types.includes(p.type));

  for (const q of f.quick) {
    if (q === "verified") out = out.filter((p) => p.verified);
    else if (q === "furnished") out = out.filter((p) => p.furnished);
    else if (q === "readyToMove") out = out.filter((p) => p.readyToMove);
    else if (q === "newlyAdded") out = out.filter((p) => p.newlyAdded);
    else if (q === "luxury") out = out.filter((p) => p.luxury);
    else if (q === "petFriendly") out = out.filter((p) => p.petFriendly);
  }

  if (f.q) {
    const s = f.q.toLowerCase();
    out = out.filter(
      (p) => p.title.toLowerCase().includes(s) || p.address.toLowerCase().includes(s),
    );
  }
  if (f.minPrice != null) out = out.filter((p) => (p.price ?? p.rent ?? 0) >= f.minPrice!);
  if (f.maxPrice != null) out = out.filter((p) => (p.price ?? p.rent ?? 0) <= f.maxPrice!);
  if (f.beds) out = out.filter((p) => p.beds >= f.beds!);
  if (f.baths) out = out.filter((p) => p.baths >= f.baths!);
  if (f.minArea) out = out.filter((p) => p.area >= f.minArea!);
  if (f.parking) out = out.filter((p) => (p.parking ?? 0) >= f.parking!);
  if (f.facing && f.facing !== "any") out = out.filter((p) => p.facing === f.facing);
  if (f.amenities.length)
    out = out.filter((p) => f.amenities.every((a) => p.amenities.includes(a)));

  if (f.sort === "priceAsc")
    out.sort((a, b) => (a.price ?? a.rent ?? 0) - (b.price ?? b.rent ?? 0));
  else if (f.sort === "priceDesc")
    out.sort((a, b) => (b.price ?? b.rent ?? 0) - (a.price ?? a.rent ?? 0));
  else if (f.sort === "recent") out.sort((a, b) => b.id - a.id);
  return out;
}

export function activeFilterCount(f: Filters): number {
  let n = 0;
  if (f.listing !== "all") n++;
  n += f.types.length;
  n += f.quick.length;
  n += f.amenities.length;
  if (f.minPrice != null || f.maxPrice != null) n++;
  if (f.beds) n++;
  if (f.baths) n++;
  if (f.minArea) n++;
  if (f.parking) n++;
  if (f.facing && f.facing !== "any") n++;
  if (f.furnishing && f.furnishing !== "any") n++;
  return n;
}
