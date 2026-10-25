import { z } from "zod";
import { createDemoProperties } from "./demo-data";
import { storedPropertySchema } from "@/lib/validation/property";
import type { Property } from "@/types/property";
export const STORAGE_KEY = "openhouse-ai.properties.v1";
const envelope = z.object({
  version: z.literal(1),
  properties: z.array(storedPropertySchema),
});
export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
export interface PropertyRepository {
  list(): Property[];
  save(property: Property): Property;
  remove(id: string): void;
}
export class PropertyStorageError extends Error {}
// Browser-only demonstration storage. Swap this repository for a Supabase implementation later.
export function createPropertyRepository(
  storage: StorageAdapter,
): PropertyRepository {
  function write(properties: Property[]) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, properties }));
    } catch {
      throw new PropertyStorageError(
        "Your browser could not save these changes. Check site storage permissions or available space and try again.",
      );
    }
  }
  function list(): Property[] {
    let raw: string | null;
    try {
      raw = storage.getItem(STORAGE_KEY);
    } catch {
      throw new PropertyStorageError(
        "Browser storage is unavailable. Allow site storage, then reload to use this prototype.",
      );
    }
    if (raw === null) {
      const properties = createDemoProperties();
      write(properties);
      return properties;
    }
    try {
      const parsed = envelope.safeParse(JSON.parse(raw));
      if (parsed.success) return parsed.data.properties;
    } catch {
      /* Retain malformed data for recovery; do not silently overwrite it. */
    }
    throw new PropertyStorageError(
      "Saved prototype data could not be read. You can reset this browser’s prototype data to restore the demonstration properties.",
    );
  }
  return {
    list,
    save(property) {
      const validated = storedPropertySchema.parse(property);
      const properties = list();
      const index = properties.findIndex((p) => p.id === property.id);
      if (index < 0) properties.push(validated);
      else properties[index] = validated;
      write(properties);
      return validated;
    },
    remove(id) {
      write(list().filter((p) => p.id !== id));
    },
  };
}
export function browserRepository() {
  try {
    return createPropertyRepository(window.localStorage);
  } catch {
    throw new PropertyStorageError(
      "Browser storage is unavailable. Allow site storage and try again.",
    );
  }
}
export function resetPrototype() {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, properties: createDemoProperties() }),
    );
  } catch {
    throw new PropertyStorageError(
      "The prototype could not be reset. Check browser storage permissions.",
    );
  }
}
