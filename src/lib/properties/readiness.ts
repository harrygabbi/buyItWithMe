import { propertySchema } from "@/lib/validation/property";
import type { Property, PropertyStatus } from "@/types/property";
export const CORE_FIELDS = [
  { key: "address", label: "Property address" },
  { key: "propertyType", label: "Property type" },
  { key: "askingPrice", label: "Asking price" },
  { key: "bedrooms", label: "Bedrooms" },
  { key: "bathrooms", label: "Bathrooms" },
  { key: "squareFeet", label: "Finished interior square footage" },
] as const;
export function getReadiness(property: Partial<Property>) {
  if (property.managedCompletion)
    return {
      ...property.managedCompletion,
      isReady: property.managedCompletion.missing.length === 0,
    };
  const missing = CORE_FIELDS.filter(
    ({ key }) => !propertySchema.shape[key].safeParse(property[key]).success,
  );
  return {
    percentage: Math.round(
      ((CORE_FIELDS.length - missing.length) / CORE_FIELDS.length) * 100,
    ),
    isReady: missing.length === 0,
    missing,
  };
}
export function getStatus(property: Property): PropertyStatus {
  if (property.managedStatus)
    return property.managedStatus === "Ready"
      ? "Ready to Publish"
      : property.managedStatus;
  const { isReady } = getReadiness(property);
  return isReady
    ? property.published
      ? "Published"
      : "Ready to Publish"
    : "Draft";
}
export function getOverview(properties: Property[], now = new Date()) {
  return {
    total: properties.length,
    upcoming: properties.filter(
      (p) => p.nextOpenHouse && new Date(p.nextOpenHouse) >= now,
    ).length,
    published: properties.filter((p) => getStatus(p) === "Published").length,
    readiness: properties.length
      ? Math.round(
          properties.reduce((sum, p) => sum + getReadiness(p).percentage, 0) /
            properties.length,
        )
      : 0,
  };
}
export function selectProperties(
  properties: Property[],
  search: string,
  status: string,
  sort: string,
  propertyType = "All types",
) {
  return properties
    .filter(
      (p) =>
        (!search.trim() ||
          `${p.address ?? ""} ${p.propertyType ?? ""} ${p.listingNumber ?? ""}`
            .toLowerCase()
            .includes(search.trim().toLowerCase())) &&
        (status === "All statuses" || getStatus(p) === status) &&
        (propertyType === "All types" || p.propertyType === propertyType),
    )
    .sort((a, b) => {
      if (sort === "price-asc" || sort === "price-desc") {
        // Missing prices stay at the bottom in either direction.
        if (a.askingPrice === undefined)
          return b.askingPrice === undefined ? 0 : 1;
        if (b.askingPrice === undefined) return -1;
        return sort === "price-asc"
          ? a.askingPrice - b.askingPrice
          : b.askingPrice - a.askingPrice;
      }
      if (sort === "readiness")
        return (
          getReadiness(a).percentage - getReadiness(b).percentage ||
          b.updatedAt.localeCompare(a.updatedAt)
        );
      return sort === "oldest"
        ? a.updatedAt.localeCompare(b.updatedAt)
        : b.updatedAt.localeCompare(a.updatedAt);
    });
}
