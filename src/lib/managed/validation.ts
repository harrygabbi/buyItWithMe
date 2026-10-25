import { z } from "zod";
import {
  FIELDS,
  COLLECTION_REQUIREMENTS,
  type Fact,
  type ManagedProperty,
  applicable,
  type Category,
  type Completion,
} from "./fields";
const fieldMap = new Map(FIELDS.map((f) => [f.key, f]));
export const factSchema = z.object({
  value: z.union([
    z.string().trim().max(10000),
    z.number().finite(),
    z.boolean(),
    z.null(),
  ]),
  verification: z.enum([
    "Unknown",
    "Realtor-provided",
    "Verified",
    "Not applicable",
  ]),
  source: z.string().trim().max(1000).default(""),
});
export const draftSchema = z
  .object({
    revision: z.number().int().positive().optional(),
    facts: z.record(z.string(), factSchema).default({}),
    status: z.enum(["Draft", "Archived"]).optional(),
  })
  .strict()
  .superRefine((draft, ctx) => {
    for (const [key, fact] of Object.entries(draft.facts)) {
      const definition = fieldMap.get(key);
      const fail = (message: string) =>
        ctx.addIssue({
          code: "custom",
          message,
          path: ["facts", key, "value"],
        });
      if (!definition) {
        fail("Unknown property field.");
        continue;
      }
      if (
        (fact.verification === "Unknown" ||
          fact.verification === "Not applicable") &&
        fact.value !== null &&
        fact.value !== ""
      ) {
        fail("Unknown and not-applicable facts must not contain a value.");
        continue;
      }
      if (fact.verification === "Verified" && !fact.source.trim())
        fail("Add the source used to verify this fact.");
      if (fact.value === null || fact.value === "") continue;
      if (definition.kind === "number") {
        if (typeof fact.value !== "number") fail("Enter a number.");
        else if (
          (definition.min !== undefined && fact.value < definition.min) ||
          (definition.max !== undefined && fact.value > definition.max) ||
          (definition.integer && !Number.isInteger(fact.value))
        )
          fail("Enter a valid value within the allowed range.");
      } else if (definition.kind === "boolean") {
        if (typeof fact.value !== "boolean")
          fail("Choose Yes, No, or Unknown.");
      } else if (typeof fact.value !== "string") fail("Enter text.");
      else if (definition.options && !definition.options.includes(fact.value))
        fail("Choose an option from the list.");
    }
  });
export function validFact(key: string, fact?: Fact) {
  if (
    !fact ||
    fact.verification === "Unknown" ||
    fact.verification === "Not applicable" ||
    fact.value === null ||
    fact.value === ""
  )
    return false;
  return draftSchema.safeParse({ facts: { [key]: fact } }).success;
}
export function completeness(
  facts: Record<string, Fact>,
  mediaCount: number,
  rooms = 0,
  amenities = 0,
): ManagedProperty["completeness"] {
  const result = {} as Record<Category, Completion>;
  for (const category of ["Core", "Essential", "Enrichment"] as const) {
    const definitions = FIELDS.filter(
      (f) => f.category === category && applicable(f, facts),
    );
    const relevant = definitions.filter((f) =>
      category === "Core"
        ? f.required
        : facts[f.key]?.verification !== "Not applicable",
    );
    const missing = relevant
      .filter((f) => !validFact(f.key, facts[f.key]))
      .map((f) => ({ key: f.key, label: f.label }));
    let total = relevant.length;
    let completed = total - missing.length;
    const collectionCounts: Record<string, number> = {
      photos: mediaCount,
      rooms,
      amenities,
    };
    for (const requirement of COLLECTION_REQUIREMENTS.filter(
      (item) => item.category === category,
    )) {
      total++;
      if (collectionCounts[requirement.key] > 0) completed++;
      else missing.push({ key: requirement.key, label: requirement.label });
    }
    result[category] = {
      completed,
      total,
      percentage: total ? Math.round((completed / total) * 100) : 100,
      missing,
    };
  }
  return result;
}
const measurement = z.number().positive().max(100000).nullable();
export const roomSchema = z
  .object({
    verification: z
      .enum(["Unknown", "Realtor-provided", "Verified", "Not applicable"])
      .default("Realtor-provided"),
    source: z.string().trim().max(1000).default(""),
    name: z.string().trim().min(1, "Enter a room name.").max(120),
    type: z.string().trim().max(120).default(""),
    floor: z.string().trim().max(80).default(""),
    length: measurement.default(null),
    width: measurement.default(null),
    unit: z.enum(["ft", "m"]).default("ft"),
    description: z.string().trim().max(3000).default(""),
    features: z.array(z.string().trim().max(120)).max(30).default([]),
    ceilingHeight: measurement.default(null),
    orientation: z.string().trim().max(120).default(""),
    naturalLight: z.string().trim().max(500).default(""),
    windowCount: z.number().int().min(0).max(1000).nullable().default(null),
    closet: z.string().trim().max(1000).default(""),
  })
  .strict()
  .refine(
    (value) => value.verification !== "Verified" || !!value.source.trim(),
    {
      message: "Verified room information requires a source.",
      path: ["source"],
    },
  );
export const documentSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    kind: z.enum([
      "Floor plan",
      "Disclosure",
      "Inspection",
      "Strata",
      "Appliance manual",
      "Other",
    ]),
    reference: z.string().trim().min(1).max(1000),
    access: z.enum(["Private", "Realtor-approved"]).default("Private"),
  })
  .strict();

export const amenitySchema = z
  .object({
    name: z.string().trim().min(1, "Enter an amenity name.").max(120),
    description: z.string().trim().max(3000).default(""),
    verification: z
      .enum(["Unknown", "Realtor-provided", "Verified", "Not applicable"])
      .default("Realtor-provided"),
    source: z.string().trim().max(1000).default(""),
  })
  .strict()
  .refine(
    (value) => value.verification !== "Verified" || !!value.source.trim(),
    { message: "Verified amenities require a source.", path: ["source"] },
  );
