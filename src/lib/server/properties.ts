import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { database, transaction } from "./db";
import { HttpError } from "./http";
import {
  FIELDS,
  type Fact,
  type ManagedProperty,
  type Room,
  type Media,
} from "@/lib/managed/fields";
import {
  draftSchema,
  completeness,
  roomSchema,
  documentSchema,
  amenitySchema,
} from "@/lib/managed/validation";
export async function owned(
  client: Pick<PoolClient, "query">,
  owner: string,
  id: string,
  lock = false,
) {
  if (!/^[a-f0-9-]{36}$/i.test(id))
    throw new HttpError(404, "Property not found.");
  const { rows } = await client.query(
    `SELECT * FROM properties WHERE id=$1 AND owner_id=$2 ${lock ? "FOR UPDATE" : ""}`,
    [id, owner],
  );
  if (!rows[0]) throw new HttpError(404, "Property not found.");
  return rows[0];
}
export async function getProperty(
  owner: string,
  id: string,
  client: Pick<PoolClient, "query"> = database(),
): Promise<ManagedProperty> {
  const row = await owned(client, owner, id);
  const [details, facts, rooms, media, documents, amenities] =
    await Promise.all([
      client.query("SELECT * FROM property_details WHERE property_id=$1", [id]),
      client.query("SELECT * FROM property_facts WHERE property_id=$1", [id]),
      client.query(
        "SELECT * FROM property_rooms WHERE property_id=$1 ORDER BY updated_at,id",
        [id],
      ),
      client.query(
        "SELECT * FROM property_media WHERE property_id=$1 ORDER BY display_order,id",
        [id],
      ),
      client.query(
        "SELECT * FROM property_documents WHERE property_id=$1 ORDER BY created_at,id",
        [id],
      ),
      client.query(
        "SELECT * FROM property_amenities WHERE property_id=$1 ORDER BY updated_at,id",
        [id],
      ),
    ]);
  const factsByKey = new Map(facts.rows.map((f) => [f.fact_key, f]));
  const values: Record<string, Fact> = {};
  for (const field of FIELDS) {
    const metadata = factsByKey.get(field.key);
    const raw =
      field.table === "properties"
        ? row[field.key]
        : field.table === "property_details"
          ? details.rows[0]?.[field.key]
          : (metadata?.text_value ??
            metadata?.number_value ??
            metadata?.boolean_value);
    const value =
      raw == null ? null : field.kind === "number" ? Number(raw) : raw;
    values[field.key] = {
      value,
      verification: metadata?.verification || "Unknown",
      source: metadata?.source_reference || "",
      updatedAt: metadata?.updated_at?.toISOString(),
    };
  }
  const roomModels: Room[] = rooms.rows.map((r) => ({
    id: r.id,
    verification: r.verification,
    source: r.source_reference,
    name: r.name,
    type: r.room_type,
    floor: r.floor,
    length: r.length === null ? null : Number(r.length),
    width: r.width === null ? null : Number(r.width),
    unit: r.unit,
    description: r.description,
    features: r.features,
    ceilingHeight: r.ceiling_height === null ? null : Number(r.ceiling_height),
    orientation: r.orientation,
    naturalLight: r.natural_light,
    windowCount: r.window_count,
    closet: r.closet,
  }));
  const mediaModels: Media[] = media.rows.map((m) => ({
    id: m.id,
    description: m.description,
    position: m.display_order,
    cover: m.is_cover,
    roomId: m.room_id,
    url: `/api/properties/${id}/media/${m.id}/file`,
    uploadedAt: m.uploaded_at.toISOString(),
  }));
  return {
    id,
    ownerId: row.owner_id,
    status: row.status,
    facts: values,
    rooms: roomModels,
    amenities: amenities.rows.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      verification: a.verification,
      source: a.source_reference,
      updatedAt: a.updated_at.toISOString(),
    })),
    media: mediaModels,
    documents: documents.rows.map((d) => ({
      id: d.id,
      title: d.title,
      kind: d.kind,
      reference: d.storage_reference,
      access: d.access_level,
      createdAt: d.created_at.toISOString(),
    })),
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    publishedAt: row.published_at?.toISOString() || null,
    revision: row.revision,
    completeness: completeness(
      values,
      mediaModels.length,
      roomModels.length,
      amenities.rows.filter(
        (a) =>
          a.verification !== "Unknown" && a.verification !== "Not applicable",
      ).length,
    ),
  };
}
async function recalculate(client: PoolClient, owner: string, id: string) {
  const property = await getProperty(owner, id, client);
  const ready = property.completeness.Core.missing.length === 0;
  const status =
    property.status === "Archived"
      ? "Archived"
      : property.status === "Published" && ready
        ? "Published"
        : ready
          ? "Ready"
          : "Draft";
  await client.query(
    "UPDATE properties SET status=$1,updated_at=now(),revision=revision+1 WHERE id=$2",
    [status, id],
  );
  return getProperty(owner, id, client);
}
export async function saveProperty(owner: string, input: unknown, id?: string) {
  const draft = draftSchema.parse(input);
  return transaction(async (client) => {
    const propertyId = id || randomUUID();
    if (id) {
      const current = await owned(client, owner, id, true);
      if (draft.revision === undefined || draft.revision !== current.revision)
        throw new HttpError(
          409,
          "This property changed in another session. Reload before saving.",
        );
    } else {
      await client.query("INSERT INTO properties(id,owner_id) VALUES($1,$2)", [
        propertyId,
        owner,
      ]);
      await client.query(
        "INSERT INTO property_details(property_id) VALUES($1)",
        [propertyId],
      );
    }
    for (const [key, fact] of Object.entries(draft.facts)) {
      const definition = FIELDS.find((f) => f.key === key)!;
      const value = fact.value === "" ? null : fact.value;
      if (definition.table !== "facts")
        await client.query(
          `UPDATE ${definition.table} SET ${definition.key}=$1 WHERE ${definition.table === "properties" ? "id" : "property_id"}=$2`,
          [value, propertyId],
        );
      const text =
        definition.table === "facts" && typeof value === "string"
          ? value
          : null;
      const number =
        definition.table === "facts" && typeof value === "number"
          ? value
          : null;
      const boolean =
        definition.table === "facts" && typeof value === "boolean"
          ? value
          : null;
      await client.query(
        "INSERT INTO property_facts(property_id,fact_key,text_value,number_value,boolean_value,verification,source_reference) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(property_id,fact_key) DO UPDATE SET text_value=EXCLUDED.text_value,number_value=EXCLUDED.number_value,boolean_value=EXCLUDED.boolean_value,verification=EXCLUDED.verification,source_reference=EXCLUDED.source_reference,updated_at=now()",
        [
          propertyId,
          key,
          text,
          number,
          boolean,
          fact.verification,
          fact.source,
        ],
      );
    }
    if (draft.status)
      await client.query("UPDATE properties SET status=$1 WHERE id=$2", [
        draft.status,
        propertyId,
      ]);
    return recalculate(client, owner, propertyId);
  });
}
export async function listProperties(owner: string) {
  const { rows } = await database().query(
    "SELECT id FROM properties WHERE owner_id=$1 ORDER BY updated_at DESC",
    [owner],
  );
  return Promise.all(rows.map((row) => getProperty(owner, row.id)));
}
export async function deleteProperty(owner: string, id: string) {
  return transaction(async (client) => {
    await owned(client, owner, id, true);
    await client.query("DELETE FROM properties WHERE id=$1", [id]);
  });
}
export async function saveRoom(
  owner: string,
  propertyId: string,
  input: unknown,
  roomId?: string,
) {
  const room = roomSchema.parse(input);
  return transaction(async (client) => {
    await owned(client, owner, propertyId, true);
    const id = roomId || randomUUID();
    const args = [
      id,
      propertyId,
      room.name,
      room.type,
      room.floor,
      room.length,
      room.width,
      room.unit,
      room.description,
      room.features,
      room.ceilingHeight,
      room.orientation,
      room.naturalLight,
      room.windowCount,
      room.closet,
      room.verification,
      room.source,
    ];
    if (roomId) {
      const existing = await client.query(
        "SELECT id FROM property_rooms WHERE id=$1 AND property_id=$2",
        [id, propertyId],
      );
      if (!existing.rowCount) throw new HttpError(404, "Room not found.");
    }
    await client.query(
      "INSERT INTO property_rooms(id,property_id,name,room_type,floor,length,width,unit,description,features,ceiling_height,orientation,natural_light,window_count,closet,verification,source_reference) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,room_type=EXCLUDED.room_type,floor=EXCLUDED.floor,length=EXCLUDED.length,width=EXCLUDED.width,unit=EXCLUDED.unit,description=EXCLUDED.description,features=EXCLUDED.features,ceiling_height=EXCLUDED.ceiling_height,orientation=EXCLUDED.orientation,natural_light=EXCLUDED.natural_light,window_count=EXCLUDED.window_count,closet=EXCLUDED.closet,verification=EXCLUDED.verification,source_reference=EXCLUDED.source_reference,updated_at=now()",
      args,
    );
    return recalculate(client, owner, propertyId);
  });
}
export async function removeRoom(
  owner: string,
  propertyId: string,
  roomId: string,
) {
  return transaction(async (client) => {
    await owned(client, owner, propertyId, true);
    await client.query(
      "UPDATE property_media SET room_id=NULL WHERE property_id=$1 AND room_id=$2",
      [propertyId, roomId],
    );
    const result = await client.query(
      "DELETE FROM property_rooms WHERE id=$1 AND property_id=$2",
      [roomId, propertyId],
    );
    if (!result.rowCount) throw new HttpError(404, "Room not found.");
    return recalculate(client, owner, propertyId);
  });
}
export async function addDocument(
  owner: string,
  propertyId: string,
  input: unknown,
  documentId?: string,
) {
  const document = documentSchema.parse(input);
  return transaction(async (client) => {
    await owned(client, owner, propertyId, true);
    if (documentId) {
      const result = await client.query(
        "UPDATE property_documents SET title=$1,kind=$2,storage_reference=$3,access_level=$4 WHERE id=$5 AND property_id=$6",
        [
          document.title,
          document.kind,
          document.reference,
          document.access,
          documentId,
          propertyId,
        ],
      );
      if (!result.rowCount) throw new HttpError(404, "Document not found.");
      return recalculate(client, owner, propertyId);
    }
    await client.query(
      "INSERT INTO property_documents(id,property_id,title,kind,storage_reference,access_level) VALUES($1,$2,$3,$4,$5,$6)",
      [
        randomUUID(),
        propertyId,
        document.title,
        document.kind,
        document.reference,
        document.access,
      ],
    );
    return recalculate(client, owner, propertyId);
  });
}
export async function removeDocument(
  owner: string,
  propertyId: string,
  id: string,
) {
  return transaction(async (client) => {
    await owned(client, owner, propertyId, true);
    const result = await client.query(
      "DELETE FROM property_documents WHERE id=$1 AND property_id=$2",
      [id, propertyId],
    );
    if (!result.rowCount) throw new HttpError(404, "Document not found.");
    return recalculate(client, owner, propertyId);
  });
}
export { recalculate };

export async function saveAmenity(
  owner: string,
  propertyId: string,
  input: unknown,
  id?: string,
) {
  const amenity = amenitySchema.parse(input);
  return transaction(async (client) => {
    await owned(client, owner, propertyId, true);
    if (
      id &&
      !(
        await client.query(
          "SELECT id FROM property_amenities WHERE id=$1 AND property_id=$2",
          [id, propertyId],
        )
      ).rowCount
    )
      throw new HttpError(404, "Amenity not found.");
    await client.query(
      "INSERT INTO property_amenities(id,property_id,name,description,verification,source_reference) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,verification=EXCLUDED.verification,source_reference=EXCLUDED.source_reference,updated_at=now()",
      [
        id || randomUUID(),
        propertyId,
        amenity.name,
        amenity.description,
        amenity.verification,
        amenity.source,
      ],
    );
    return recalculate(client, owner, propertyId);
  });
}
export async function removeAmenity(
  owner: string,
  propertyId: string,
  id: string,
) {
  return transaction(async (client) => {
    await owned(client, owner, propertyId, true);
    if (
      !(
        await client.query(
          "DELETE FROM property_amenities WHERE id=$1 AND property_id=$2",
          [id, propertyId],
        )
      ).rowCount
    )
      throw new HttpError(404, "Amenity not found.");
    return recalculate(client, owner, propertyId);
  });
}
