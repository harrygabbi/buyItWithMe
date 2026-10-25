import type { Property } from "@/types/property";
import type { ManagedProperty } from "./fields";
export function dashboardProperty(record: ManagedProperty): Property {
  const value = (key: string) => record.facts[key]?.value;
  return {
    id: record.id,
    address:
      [
        value("street_address"),
        value("city"),
        value("province"),
        value("postal_code"),
        value("country"),
      ]
        .filter(Boolean)
        .join(", ") || String(value("title") || "Untitled property"),
    propertyType:
      (value("property_type") as Property["propertyType"]) || undefined,
    askingPrice: (value("listing_price") as number) ?? undefined,
    bedrooms: (value("bedrooms") as number) ?? undefined,
    bathrooms:
      value("full_bathrooms") === null && value("half_bathrooms") === null
        ? undefined
        : Number(value("full_bathrooms") || 0) +
          Number(value("half_bathrooms") || 0) * 0.5,
    squareFeet: (value("interior_sqft") as number) ?? undefined,
    yearBuilt: (value("year_built") as number) ?? undefined,
    lotSize: (value("lot_size") as number) ?? undefined,
    description: (value("description") as string) || undefined,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    published: record.status === "Published",
    isDemo: false,
    image: (record.media.find((media) => media.cover) || record.media[0])?.url,
    managedStatus: record.status,
    managedCompletion: record.completeness.Core,
  };
}
