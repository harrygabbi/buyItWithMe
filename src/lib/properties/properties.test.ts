import { test } from "node:test";
import assert from "node:assert/strict";
import { propertySchema } from "../validation/property";
import { createDemoProperties } from "./demo-data";
import {
  CORE_FIELDS,
  getReadiness,
  getStatus,
  getOverview,
  selectProperties,
} from "./readiness";
import { createPropertyRepository, STORAGE_KEY } from "./repository";
import type { PropertyInput } from "../../types/property";
const valid: PropertyInput = {
  address: "123 Test Street, Vancouver, BC",
  propertyType: "Condo",
  askingPrice: 650000,
  bedrooms: 0,
  bathrooms: 1,
  squareFeet: 600,
};
function memory(initial?: string) {
  const items = new Map<string, string>();
  if (initial !== undefined) items.set(STORAGE_KEY, initial);
  return {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => {
      items.set(key, value);
    },
  };
}
test("six Core fields are required independently; zero bedrooms is valid", () => {
  assert.equal(CORE_FIELDS.length, 6);
  assert.equal(getReadiness(valid).percentage, 100);
  for (const { key } of CORE_FIELDS) {
    const incomplete = { ...valid, [key]: undefined };
    assert.equal(getReadiness(incomplete).isReady, false);
    assert.equal(getReadiness(incomplete).percentage, 83);
  }
  assert.equal(getReadiness({}).percentage, 0);
});
test("invalid values never complete Core readiness or enable published status", () => {
  const p = { ...createDemoProperties()[0], askingPrice: -1 };
  assert.equal(getReadiness(p).isReady, false);
  assert.equal(getStatus(p), "Draft");
  assert.equal(getReadiness({ ...p, askingPrice: NaN }).isReady, false);
});
test("schema accepts numeric form strings and optional blanks, rejects invalid inputs", () => {
  const result = propertySchema.safeParse({
    ...valid,
    askingPrice: "650000",
    bedrooms: "0",
    bathrooms: "1.5",
    yearBuilt: "",
    lotSize: "",
  });
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.bedrooms, 0);
    assert.equal(result.data.yearBuilt, undefined);
  }
  for (const key of ["askingPrice", "bedrooms", "bathrooms", "squareFeet"])
    assert.equal(
      propertySchema.safeParse({ ...valid, [key]: "" }).success,
      false,
    );
  assert.equal(
    propertySchema.safeParse({ ...valid, bathrooms: 1.3 }).success,
    false,
  );
  assert.equal(
    propertySchema.safeParse({ ...valid, bedrooms: -1 }).success,
    false,
  );
  assert.equal(
    propertySchema.safeParse({ ...valid, propertyType: "Castle" }).success,
    false,
  );
  assert.equal(
    propertySchema.safeParse({ ...valid, address: "  " }).success,
    false,
  );
});
test("overview is computed from data, ignores past open houses, and handles empty list", () => {
  const now = new Date("2026-10-24T12:00:00.000Z");
  const data = createDemoProperties(now);
  assert.deepEqual(getOverview(data, now), {
    total: 3,
    upcoming: 2,
    published: 1,
    readiness: 94,
  });
  assert.deepEqual(getOverview([], now), {
    total: 0,
    upcoming: 0,
    published: 0,
    readiness: 0,
  });
  assert.equal(getOverview(data, new Date("2027-01-01")).upcoming, 0);
});
test("repository seeds once, saves updates, persists across instances, and preserves an empty list", () => {
  const storage = memory();
  const repository = createPropertyRepository(storage);
  assert.equal(repository.list().length, 3);
  const now = new Date().toISOString();
  const p = {
    ...valid,
    id: "new",
    published: false,
    isDemo: false,
    createdAt: now,
    updatedAt: now,
  };
  repository.save(p);
  const reloaded = createPropertyRepository(storage);
  assert.equal(reloaded.list().length, 4);
  assert.equal(reloaded.list().find((p) => p.id === "new")?.bedrooms, 0);
  reloaded.save({ ...p, address: "456 Updated Street" });
  assert.equal(reloaded.list().length, 4);
  assert.equal(
    reloaded.list().find((p) => p.id === "new")?.address,
    "456 Updated Street",
  );
  reloaded.list().forEach((p) => reloaded.remove(p.id));
  assert.deepEqual(createPropertyRepository(storage).list(), []);
});
test("malformed data is not overwritten and storage failures are actionable", () => {
  for (const raw of [
    "{bad",
    "null",
    "{}",
    '{"version":2,"properties":[]}',
    '{"version":1,"properties":[{}]}',
  ]) {
    const storage = memory(raw);
    assert.throws(
      () => createPropertyRepository(storage).list(),
      /could not be read/,
    );
    assert.equal(storage.getItem(STORAGE_KEY), raw);
  }
  assert.throws(
    () =>
      createPropertyRepository({
        getItem() {
          throw Error();
        },
        setItem() {},
      }).list(),
    /storage is unavailable/,
  );
  assert.throws(
    () =>
      createPropertyRepository({
        getItem() {
          return null;
        },
        setItem() {
          throw Error();
        },
      }).list(),
    /could not save/,
  );
});
test("search, status filters, and updated ordering compose without mutating data", () => {
  const data = createDemoProperties();
  assert.equal(
    selectProperties(data, "  PACIFIC  ", "All statuses", "recent").length,
    1,
  );
  assert.equal(
    selectProperties(data, "", "Draft", "recent")[0].id,
    "demo-lynn",
  );
  assert.equal(
    selectProperties(data, "R2948721", "Published", "recent").length,
    1,
  );
  assert.equal(selectProperties(data, "cedar", "Draft", "recent").length, 0);
  assert.equal(
    selectProperties(data, "", "All statuses", "oldest")[0].id,
    "demo-lynn",
  );
  assert.equal(data[0].id, "demo-cedar");
});

test("type filters compose with search and status; price and readiness sorts use real data", () => {
  const data = createDemoProperties();
  assert.equal(
    selectProperties(data, "pacific", "Ready to Publish", "recent", "Condo")[0]
      ?.id,
    "demo-pacific",
  );
  assert.equal(
    selectProperties(data, "pacific", "Published", "recent", "Condo").length,
    0,
  );
  assert.equal(
    selectProperties(data, "", "All statuses", "price-asc")[0].id,
    "demo-pacific",
  );
  assert.equal(
    selectProperties(data, "", "All statuses", "price-desc")[0].id,
    "demo-cedar",
  );
  assert.equal(
    selectProperties(data, "", "All statuses", "readiness")[0].id,
    "demo-lynn",
  );
  const withoutPrice = {
    ...data[0],
    id: "missing-price",
    askingPrice: undefined,
  };
  for (const sort of ["price-asc", "price-desc"]) {
    assert.equal(
      selectProperties([withoutPrice, ...data], "", "All statuses", sort).at(-1)
        ?.id,
      "missing-price",
    );
  }
  assert.equal(data[0].id, "demo-cedar");
});

test("baseline answers validate optional numbers, choices, and dates without changing Core readiness", async () => {
  const { BASELINE_FIELDS } = await import("./baseline-fields");
  const keys = BASELINE_FIELDS.map((field) => field.key);
  assert.equal(
    new Set(keys).size,
    keys.length,
    "Question identifiers must be unique for labels and storage.",
  );
  assert.equal(
    propertySchema.safeParse({
      ...valid,
      baselineAnswers: {
        core_parking_spaces: "2",
        core_listing_status: "Active",
        core_possession_availability_date: "2027-02-15",
      },
    }).success,
    true,
  );
  assert.equal(
    propertySchema.safeParse({
      ...valid,
      baselineAnswers: { core_parking_spaces: "-2" },
    }).success,
    false,
  );
  assert.equal(
    propertySchema.safeParse({
      ...valid,
      baselineAnswers: { core_parking_spaces: "2.5" },
    }).success,
    false,
  );
  assert.equal(
    propertySchema.safeParse({
      ...valid,
      baselineAnswers: { core_listing_status: "Invented" },
    }).success,
    false,
  );
  assert.equal(
    propertySchema.safeParse({
      ...valid,
      baselineAnswers: { core_possession_availability_date: "2027-02-31" },
    }).success,
    false,
  );
  assert.equal(
    propertySchema.safeParse({
      ...valid,
      baselineAnswers: { unknown_question: "value" },
    }).success,
    false,
  );
  assert.equal(getReadiness(valid).percentage, 100);
});
test("expanded baseline answers survive repository reload and legacy properties stay readable", () => {
  const storage = memory();
  const repo = createPropertyRepository(storage);
  const legacy = repo.list()[0];
  assert.equal(legacy.baselineAnswers, undefined);
  const answers = {
    core_parking_spaces: "2",
    core_heating_system: "Heat pump",
    essential_bedroom_dimensions: "Primary bedroom: 14 × 12 ft",
    enrichment_nearby_elementary_schools:
      "Verified public listing; checked October 2026",
  };
  repo.save({ ...legacy, baselineAnswers: answers });
  const saved = createPropertyRepository(storage)
    .list()
    .find((property) => property.id === legacy.id);
  assert.deepEqual(saved?.baselineAnswers, answers);
  assert.equal(saved?.image, "/images/house.jpg");
});
