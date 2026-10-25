export type Category = "Core" | "Essential" | "Enrichment";
export type Verification =
  "Unknown" | "Realtor-provided" | "Verified" | "Not applicable";
export interface FieldDefinition {
  key: string;
  label: string;
  category: Category;
  group: string;
  kind: "text" | "textarea" | "number" | "select" | "boolean";
  options?: string[];
  required?: boolean;
  integer?: boolean;
  min?: number;
  max?: number;
  conditional?: "land";
  table: "properties" | "property_details" | "facts";
}
const core = (
  key: string,
  label: string,
  kind: FieldDefinition["kind"] = "text",
  extra: Partial<FieldDefinition> = {},
): FieldDefinition => ({
  key,
  label,
  category: "Core",
  group: "Listing information",
  kind,
  table: "properties",
  required: true,
  ...extra,
});
const detail = (
  key: string,
  label: string,
  kind: FieldDefinition["kind"] = "text",
  extra: Partial<FieldDefinition> = {},
): FieldDefinition => ({
  key,
  label,
  category: "Essential",
  group: "Interior",
  kind,
  table: "property_details",
  ...extra,
});
const fact = (
  key: string,
  label: string,
  kind: FieldDefinition["kind"] = "text",
  group = "Property features",
): FieldDefinition => ({
  key,
  label,
  kind,
  group,
  category: "Enrichment",
  table: "facts",
});
export const FIELDS: FieldDefinition[] = [
  core("title", "Property title"),
  core("street_address", "Street address"),
  core("city", "City"),
  core("province", "Province / state"),
  core("postal_code", "Postal / ZIP code"),
  core("country", "Country"),
  core("property_type", "Property type", "select", {
    options: ["Detached house", "Townhouse", "Condo", "Duplex", "Other"],
  }),
  core("listing_price", "Listing price (CAD)", "number", {
    min: 0.01,
    max: 1_000_000_000,
  }),
  core("description", "Property description", "textarea"),
  detail("bedrooms", "Bedrooms", "number", {
    category: "Core",
    group: "Basic property details",
    required: true,
    integer: true,
    min: 0,
    max: 100,
  }),
  detail("full_bathrooms", "Full bathrooms", "number", {
    category: "Core",
    group: "Basic property details",
    required: true,
    integer: true,
    min: 0,
    max: 100,
  }),
  detail("half_bathrooms", "Half bathrooms", "number", {
    category: "Core",
    group: "Basic property details",
    required: true,
    integer: true,
    min: 0,
    max: 100,
  }),
  detail("interior_sqft", "Interior area (sq ft)", "number", {
    category: "Core",
    group: "Basic property details",
    required: true,
    min: 0.01,
    max: 10_000_000,
  }),
  detail("year_built", "Year built", "number", {
    category: "Core",
    group: "Basic property details",
    required: true,
    integer: true,
    min: 1600,
    max: new Date().getFullYear() + 5,
  }),
  detail(
    "lot_applicable",
    "This property has an applicable lot area",
    "boolean",
    { category: "Core", group: "Basic property details" },
  ),
  detail("lot_size", "Lot size (sq ft)", "number", {
    category: "Core",
    group: "Basic property details",
    required: true,
    conditional: "land",
    min: 0.01,
    max: 1_000_000_000,
  }),
  ...[
    ["annual_tax", "Annual property taxes (CAD)"],
    ["hoa_fee", "Strata / HOA fees (CAD)"],
    ["additional_fees", "Additional known fees (CAD)"],
  ].map(([k, l]) =>
    detail(k, l, "number", { group: "Financial", min: 0, max: 1_000_000_000 }),
  ),
  detail("fee_frequency", "Fee frequency", "select", {
    group: "Financial",
    options: ["Monthly", "Quarterly", "Annually", "Other"],
  }),
  detail("fee_inclusions", "What the fees include", "textarea", {
    group: "Financial",
  }),
  ...[
    ["flooring", "Flooring types"],
    ["appliances", "Kitchen appliances"],
    ["storage", "Storage"],
    ["renovations", "Renovations / upgrades"],
  ].map(([k, l]) => detail(k, l, "textarea")),
  detail("laundry", "Laundry availability", "select", {
    options: ["In suite", "Shared", "Hookups only", "None"],
  }),
  detail("basement", "Basement type", "select", {
    options: ["None", "Unfinished", "Partially finished", "Finished"],
  }),
  detail("fireplace", "Fireplace", "boolean"),
  ...[
    ["heating", "Heating type"],
    ["cooling", "Cooling type"],
    ["water_heating", "Water heating"],
    ["electrical", "Electrical information"],
    ["plumbing", "Plumbing information"],
    ["internet", "Internet availability"],
  ].map(([k, l]) => detail(k, l, "textarea", { group: "Building systems" })),
  detail("roof_year", "Roof replacement year", "number", {
    group: "Building systems",
    integer: true,
    min: 1600,
    max: new Date().getFullYear() + 5,
  }),
  ...[
    ["balcony", "Balcony"],
    ["patio", "Patio"],
    ["backyard", "Backyard"],
    ["fence", "Fence"],
    ["garage", "Garage"],
    ["driveway", "Driveway"],
  ].map(([k, l]) => detail(k, l, "boolean", { group: "Exterior" })),
  detail("parking_spaces", "Parking spaces", "number", {
    group: "Exterior",
    integer: true,
    min: 0,
    max: 1000,
  }),
  detail("parking_type", "Parking type", "text", { group: "Exterior" }),
  ...[
    ["rental_rules", "Rental restrictions"],
    ["pet_rules", "Pet restrictions"],
    ["age_rules", "Age restrictions, where applicable"],
    ["other_rules", "Other building / community rules"],
  ].map(([k, l]) =>
    detail(k, l, "textarea", { group: "Restrictions / rules" }),
  ),
  ...[
    ["smart_thermostat", "Smart thermostat"],
    ["security_cameras", "Security cameras"],
    ["smart_locks", "Smart locks"],
    ["solar", "Solar panels"],
    ["ev_charging", "EV charging"],
  ].map(([k, l]) => fact(k, l, "boolean")),
  fact("energy_features", "Energy efficiency features", "textarea"),
  fact("accessibility", "Accessibility features", "textarea"),
  ...[
    ["schools", "Nearby schools"],
    ["parks", "Nearby parks"],
    ["groceries", "Grocery stores"],
    ["transit", "Transit access"],
    ["community", "Community facilities"],
  ].map(([k, l]) => fact(k, l, "textarea", "Neighborhood")),
  ...[
    ["fixtures", "Included fixtures"],
    ["maintenance", "Known maintenance history"],
    ["appliance_models", "Appliance model information"],
    ["notes", "Custom property notes"],
  ].map(([k, l]) => fact(k, l, "textarea", "Additional information")),
];
export type FactValue = string | number | boolean | null;
export interface Fact {
  value: FactValue;
  verification: Verification;
  source: string;
  updatedAt?: string;
}
export interface Room {
  verification: Verification;
  source: string;
  id: string;
  name: string;
  type: string;
  floor: string;
  length: number | null;
  width: number | null;
  unit: "ft" | "m";
  description: string;
  features: string[];
  ceilingHeight: number | null;
  orientation: string;
  naturalLight: string;
  windowCount: number | null;
  closet: string;
}
export interface Media {
  id: string;
  description: string;
  position: number;
  cover: boolean;
  roomId: string | null;
  url: string;
  uploadedAt: string;
}
export interface DocumentReference {
  id: string;
  title: string;
  kind: string;
  reference: string;
  access: "Private" | "Realtor-approved";
  createdAt: string;
}
export interface Completion {
  completed: number;
  total: number;
  percentage: number;
  missing: { key: string; label: string }[];
}
export interface Amenity {
  id: string;
  name: string;
  description: string;
  verification: Verification;
  source: string;
  updatedAt: string;
}
export interface ManagedProperty {
  id: string;
  ownerId: string;
  status: "Draft" | "Ready" | "Published" | "Archived";
  facts: Record<string, Fact>;
  rooms: Room[];
  amenities: Amenity[];
  media: Media[];
  documents: DocumentReference[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  revision: number;
  completeness: Record<Category, Completion>;
}
export function applicable(
  field: FieldDefinition,
  facts: Record<string, Fact>,
) {
  return (
    field.conditional !== "land" ||
    ["Detached house", "Duplex"].includes(String(facts.property_type?.value)) ||
    facts.lot_applicable?.value === true
  );
}

export const COLLECTION_REQUIREMENTS = [
  {
    key: "photos",
    label: "At least one usable property photo",
    category: "Core" as Category,
  },
  {
    key: "rooms",
    label: "Room-level details",
    category: "Enrichment" as Category,
  },
  {
    key: "amenities",
    label: "Additional property amenities",
    category: "Enrichment" as Category,
  },
];
