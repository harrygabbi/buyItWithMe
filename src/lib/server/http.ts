import { z } from "zod";
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function originGuard(request: Request) {
  const expected = process.env.APP_ORIGIN;
  if (!expected) throw new HttpError(503, "APP_ORIGIN is not configured.");
  if (request.headers.get("origin") !== expected)
    throw new HttpError(
      403,
      "This request did not originate from this application.",
    );
}
export async function jsonBody(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "Request body is required.");
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > 250000) {
      await reader.cancel();
      throw new HttpError(413, "Request is too large.");
    }
    chunks.push(value);
  }
  const body = Buffer.concat(chunks).toString("utf8");
  try {
    return JSON.parse(body);
  } catch {
    throw new HttpError(400, "Enter valid request data.");
  }
}
export function response(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}
export function failure(error: unknown) {
  if (error instanceof HttpError)
    return response({ error: error.message }, error.status);
  if (error instanceof z.ZodError)
    return response(
      {
        error: "Check the highlighted values.",
        issues: error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      400,
    );
  console.error(
    "Server request failed",
    error instanceof Error ? error.message : "Unknown error",
  );
  return response(
    {
      error:
        "The server could not complete this request. Check database/storage availability and try again.",
    },
    503,
  );
}
