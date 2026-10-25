import { z } from "zod";
import { requireUser } from "@/lib/server/auth";
import {
  originGuard,
  jsonBody,
  response,
  failure,
  HttpError,
} from "@/lib/server/http";
import {
  getProperty,
  saveAmenity,
  removeAmenity,
  saveProperty,
  deleteProperty,
  saveRoom,
  removeRoom,
  addDocument,
  removeDocument,
} from "@/lib/server/properties";
import {
  limitedFormData,
  uploadPhotos,
  mediaFile,
  arrangePhotos,
  deletePhoto,
  updatePhoto,
  cleanupDeletedMedia,
} from "@/lib/server/media";
export const runtime = "nodejs";
type Context = { params: Promise<{ segments: string[] }> };
async function handle(request: Request, context: Context) {
  try {
    const user = await requireUser();
    if (request.method !== "GET") originGuard(request);
    const [id, resource, child, action, ...rest] = (await context.params)
      .segments;
    if (
      !z.uuid().safeParse(id).success ||
      (child && !z.uuid().safeParse(child).success)
    )
      throw new HttpError(404, "Not found.");
    if (rest.length) throw new HttpError(404, "Not found.");
    if (request.method === "GET") {
      if (resource === "media" && child && action === "file") {
        const bytes = await mediaFile(user.id, id, child);
        return new Response(new Uint8Array(bytes), {
          headers: {
            "Content-Type": "image/webp",
            "Cache-Control": "private, no-store",
            "X-Content-Type-Options": "nosniff",
          },
        });
      }
      if (!resource) return response(await getProperty(user.id, id));
    }
    if (request.method === "PATCH") {
      if (resource === "documents" && child && !action)
        return response(
          await addDocument(user.id, id, await jsonBody(request), child),
        );
      if (resource === "amenities" && child && !action)
        return response(
          await saveAmenity(user.id, id, await jsonBody(request), child),
        );
      if (!resource)
        return response(
          await saveProperty(user.id, await jsonBody(request), id),
        );
      if (resource === "media" && !action)
        return response(
          child
            ? await updatePhoto(user.id, id, child, await jsonBody(request))
            : await arrangePhotos(user.id, id, await jsonBody(request)),
        );
      if (resource === "rooms" && child && !action)
        return response(
          await saveRoom(user.id, id, await jsonBody(request), child),
        );
    }
    if (request.method === "POST" && !child) {
      if (resource === "amenities")
        return response(
          await saveAmenity(user.id, id, await jsonBody(request)),
          201,
        );
      if (resource === "rooms")
        return response(
          await saveRoom(user.id, id, await jsonBody(request)),
          201,
        );
      if (resource === "documents")
        return response(
          await addDocument(user.id, id, await jsonBody(request)),
          201,
        );
      if (resource === "media") {
        await getProperty(user.id, id);
        const form = await limitedFormData(request);
        const files = form
          .getAll("photos")
          .filter((value): value is File => value instanceof File);
        return response(await uploadPhotos(user.id, id, files), 201);
      }
    }
    if (request.method === "DELETE" && !action) {
      if (resource === "amenities" && child)
        return response(await removeAmenity(user.id, id, child));
      if (resource === "rooms" && child)
        return response(await removeRoom(user.id, id, child));
      if (resource === "media" && child)
        return response(await deletePhoto(user.id, id, child));
      if (resource === "documents" && child)
        return response(await removeDocument(user.id, id, child));
      if (!resource) {
        await deleteProperty(user.id, id);
        await cleanupDeletedMedia();
        return response({ ok: true });
      }
    }
    throw new HttpError(404, "Not found.");
  } catch (e) {
    return failure(e);
  }
}
export { handle as GET, handle as POST, handle as PATCH, handle as DELETE };
