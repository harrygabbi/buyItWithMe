export const PROPERTY_TYPES = [
  "Detached house",
  "Townhouse",
  "Condo",
  "Duplex",
  "Other",
] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];
export interface PropertyInput {
  address: string;
  propertyType: PropertyType;
  askingPrice: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  listingNumber?: string;
  lotSize?: number;
  yearBuilt?: number;
  description?: string;
  baselineAnswers?: Record<string, string>;
}
export interface Property extends Partial<PropertyInput> {
  id: string;
  createdAt: string;
  updatedAt: string;
  published: boolean;
  isDemo: boolean;
  image?: string;
  nextOpenHouse?: string;
  managedStatus?: "Draft" | "Ready" | "Published" | "Archived";
  managedCompletion?: {
    completed: number;
    total: number;
    percentage: number;
    missing: { key: string; label: string }[];
  };
}
export type PropertyStatus =
  "Draft" | "Ready to Publish" | "Published" | "Archived";
