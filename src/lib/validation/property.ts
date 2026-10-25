import { z } from "zod";
import { baselineAnswersSchema } from "./baseline";
import { PROPERTY_TYPES } from "@/types/property";
const numeric = (schema: z.ZodNumber) =>
  z.preprocess(
    (v) =>
      v === "" || v == null ? undefined : typeof v === "string" ? Number(v) : v,
    schema,
  );
const optionalNumber = (schema: z.ZodNumber) =>
  z.preprocess(
    (v) =>
      v === "" || v == null ? undefined : typeof v === "string" ? Number(v) : v,
    schema.optional(),
  );
export const propertySchema = z.object({
  baselineAnswers: baselineAnswersSchema.optional(),
  address: z
    .string()
    .trim()
    .min(5, "Enter a full property address.")
    .max(250, "Use 250 characters or fewer."),
  propertyType: z.enum(PROPERTY_TYPES, { error: "Choose a property type." }),
  askingPrice: numeric(
    z
      .number({ error: "Enter an asking price." })
      .positive("Price must be greater than zero.")
      .max(1_000_000_000, "Enter a price under $1 billion."),
  ),
  bedrooms: numeric(
    z
      .number({ error: "Enter the number of bedrooms." })
      .int("Use a whole number.")
      .min(0, "Bedrooms cannot be negative.")
      .max(100, "Enter 100 bedrooms or fewer."),
  ),
  bathrooms: numeric(
    z
      .number({ error: "Enter the number of bathrooms." })
      .min(0, "Bathrooms cannot be negative.")
      .max(100, "Enter 100 bathrooms or fewer.")
      .multipleOf(0.5, "Use half-bath increments (for example, 2.5)."),
  ),
  squareFeet: numeric(
    z
      .number({ error: "Enter finished interior square footage." })
      .positive("Square footage must be greater than zero.")
      .max(10_000_000, "Enter a smaller square footage."),
  ),
  listingNumber: z
    .string()
    .trim()
    .max(50, "Use 50 characters or fewer.")
    .optional(),
  lotSize: optionalNumber(
    z
      .number()
      .positive("Lot size must be greater than zero.")
      .max(1_000_000_000),
  ),
  yearBuilt: optionalNumber(
    z
      .number()
      .int("Use a whole year.")
      .min(1600, "Enter a year from 1600 onward.")
      .max(
        new Date().getFullYear() + 5,
        "Enter a year no more than five years in the future.",
      ),
  ),
  description: z
    .string()
    .trim()
    .max(1500, "Use 1,500 characters or fewer.")
    .optional(),
});
// Stored drafts can be incomplete; each present field must still be valid.
export const storedPropertySchema = propertySchema.partial().extend({
  id: z.string().min(1),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  published: z.boolean(),
  isDemo: z.boolean(),
  image: z
    .enum(["/images/house.jpg", "/images/condo.jpg", "/images/townhouse.jpg"])
    .optional(),
  nextOpenHouse: z.iso.datetime().optional(),
});
