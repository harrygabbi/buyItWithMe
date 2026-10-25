import { randomUUID } from "node:crypto";
import { mkdir, writeFile, readFile, unlink } from "node:fs/promises";
import { resolve, join, relative, isAbsolute } from "node:path";
import sharp from "sharp";
import { z } from "zod";
import { database, transaction } from "./db";
import { HttpError } from "./http";
import { owned, recalculate } from "./properties";
export function uploadRoot() {
  const root = resolve(process.env.UPLOAD_DIR || ".data/uploads");
  const publicRoot = resolve("public");
  if (
    root === publicRoot ||
    (!relative(publicRoot, root).startsWith("..") &&
      !isAbsolute(relative(publicRoot, root)))
  )
    throw new Error("UPLOAD_DIR must not be publicly served.");
  return root;
}
function pathFor(key: string) {
  if (!/^[a-f0-9-]{36}\/[a-f0-9-]{36}\.webp$/.test(key))
    throw new Error("Invalid storage key.");
  return join(uploadRoot(), key);
}
export async function cleanupDeletedMedia() {
  const { rows } = await database().query(
    "SELECT storage_key FROM storage_deletions LIMIT 100",
  );
  for (const row of rows) {
    try {
      await unlink(pathFor(row.storage_key));
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "ENOENT") continue;
    }
    await database().query(
      "DELETE FROM storage_deletions WHERE storage_key=$1",
      [row.storage_key],
    );
  }
}
export async function prepareImage(file: File) {
  if (
    !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)
  )
    throw new HttpError(400, "Choose JPEG, PNG, WebP, or AVIF images.");
  if (file.size === 0 || file.size > 10 * 1024 * 1024)
    throw new HttpError(400, "Each photo must be between 1 byte and 10 MB.");
  try {
    const decoder = sharp(Buffer.from(await file.arrayBuffer()), {
      limitInputPixels: 40_000_000,
      animated: false,
    });
    const meta = await decoder.metadata();
    if (
      !meta.width ||
      !meta.height ||
      !["jpeg", "png", "webp", "avif", "heif"].includes(meta.format || "")
    )
      throw Error();
    return await decoder
      .rotate()
      .resize(2560, 2560, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();
  } catch {
    throw new HttpError(
      400,
      "This image could not be decoded. Choose a valid image under 40 megapixels.",
    );
  }
}
export async function limitedFormData(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "Choose photos to upload.");
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 30 * 1024 * 1024) {
      await reader.cancel();
      throw new HttpError(413, "Upload at most 30 MB per batch.");
    }
    chunks.push(value);
  }
  return new Response(Buffer.concat(chunks), {
    headers: { "Content-Type": request.headers.get("content-type") || "" },
  }).formData();
}
export async function uploadPhotos(
  owner: string,
  propertyId: string,
  files: File[],
) {
  await owned(database(), owner, propertyId);
  if (!files.length || files.length > 10)
    throw new HttpError(400, "Upload between 1 and 10 photos at a time.");
  const images: { id: string; buffer: Buffer; description: string }[] = [];
  for (const file of files)
    images.push({
      id: randomUUID(),
      buffer: await prepareImage(file),
      description: file.name.slice(0, 200),
    });
  const written: string[] = [];
  try {
    return await transaction(async (client) => {
      await owned(client, owner, propertyId, true);
      const { rows } = await client.query(
        "SELECT count(*)::int AS count FROM property_media WHERE property_id=$1",
        [propertyId],
      );
      if (rows[0].count + images.length > 100)
        throw new HttpError(400, "A property can contain up to 100 photos.");
      await mkdir(join(uploadRoot(), propertyId), {
        recursive: true,
        mode: 0o700,
      });
      for (const [index, image] of images.entries()) {
        const key = `${propertyId}/${image.id}.webp`;
        await writeFile(pathFor(key), image.buffer, {
          flag: "wx",
          mode: 0o600,
        });
        written.push(key);
        await client.query(
          "INSERT INTO property_media(id,property_id,storage_key,description,display_order,is_cover,mime_type,byte_size) VALUES($1,$2,$3,$4,$5,$6,$7,$8)",
          [
            image.id,
            propertyId,
            key,
            image.description,
            rows[0].count + index,
            rows[0].count === 0 && index === 0,
            "image/webp",
            image.buffer.length,
          ],
        );
      }
      return recalculate(client, owner, propertyId);
    });
  } catch (error) {
    for (const key of written) await unlink(pathFor(key)).catch(() => {});
    throw error;
  }
}
export async function mediaFile(owner: string, propertyId: string, id: string) {
  await owned(database(), owner, propertyId);
  const { rows } = await database().query(
    "SELECT storage_key FROM property_media WHERE id=$1 AND property_id=$2",
    [id, propertyId],
  );
  if (!rows[0]) throw new HttpError(404, "Photo not found.");
  try {
    return await readFile(pathFor(rows[0].storage_key));
  } catch {
    throw new HttpError(
      404,
      "The photo file is unavailable. Upload it again or restore storage.",
    );
  }
}
export async function arrangePhotos(
  owner: string,
  propertyId: string,
  input: unknown,
) {
  const data = z
    .object({
      order: z.array(z.uuid()).max(100).optional(),
      coverId: z.uuid().optional(),
    })
    .strict()
    .parse(input);
  return transaction(async (client) => {
    await owned(client, owner, propertyId, true);
    const { rows } = await client.query(
      "SELECT id FROM property_media WHERE property_id=$1",
      [propertyId],
    );
    const ids = new Set(rows.map((r) => r.id));
    if (data.coverId && !ids.has(data.coverId))
      throw new HttpError(404, "Photo not found.");
    if (
      data.order &&
      (data.order.length !== ids.size ||
        new Set(data.order).size !== ids.size ||
        data.order.some((id) => !ids.has(id)))
    )
      throw new HttpError(409, "Photo order changed. Reload and try again.");
    if (data.coverId) {
      await client.query(
        "UPDATE property_media SET is_cover=false WHERE property_id=$1",
        [propertyId],
      );
      await client.query(
        "UPDATE property_media SET is_cover=true WHERE id=$1 AND property_id=$2",
        [data.coverId, propertyId],
      );
    }
    if (data.order)
      for (const [index, id] of data.order.entries())
        await client.query(
          "UPDATE property_media SET display_order=$1 WHERE id=$2 AND property_id=$3",
          [index, id, propertyId],
        );
    return recalculate(client, owner, propertyId);
  });
}
export async function updatePhoto(
  owner: string,
  propertyId: string,
  id: string,
  input: unknown,
) {
  const data = z
    .object({
      description: z.string().trim().max(500),
      roomId: z.uuid().nullable(),
    })
    .strict()
    .parse(input);
  return transaction(async (client) => {
    await owned(client, owner, propertyId, true);
    if (
      data.roomId &&
      !(
        await client.query(
          "SELECT id FROM property_rooms WHERE id=$1 AND property_id=$2",
          [data.roomId, propertyId],
        )
      ).rowCount
    )
      throw new HttpError(404, "Room not found.");
    if (
      !(
        await client.query(
          "UPDATE property_media SET description=$1,room_id=$2 WHERE id=$3 AND property_id=$4",
          [data.description, data.roomId, id, propertyId],
        )
      ).rowCount
    )
      throw new HttpError(404, "Photo not found.");
    return recalculate(client, owner, propertyId);
  });
}
export async function deletePhoto(
  owner: string,
  propertyId: string,
  id: string,
) {
  const property = await transaction(async (client) => {
    await owned(client, owner, propertyId, true);
    if (
      !(
        await client.query(
          "DELETE FROM property_media WHERE id=$1 AND property_id=$2",
          [id, propertyId],
        )
      ).rowCount
    )
      throw new HttpError(404, "Photo not found.");
    const { rows } = await client.query(
      "SELECT id,is_cover FROM property_media WHERE property_id=$1 ORDER BY display_order,id",
      [propertyId],
    );
    if (rows.length && !rows.some((r) => r.is_cover))
      await client.query(
        "UPDATE property_media SET is_cover=true WHERE id=$1",
        [rows[0].id],
      );
    return recalculate(client, owner, propertyId);
  });
  await cleanupDeletedMedia();
  return property;
}
