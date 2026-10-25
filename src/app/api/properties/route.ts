import { requireUser } from "@/lib/server/auth";
import { listProperties, saveProperty } from "@/lib/server/properties";
import { response, failure, originGuard, jsonBody } from "@/lib/server/http";
export const runtime = "nodejs";
export async function GET() {
  try {
    return response(await listProperties((await requireUser()).id));
  } catch (e) {
    return failure(e);
  }
}
export async function POST(request: Request) {
  try {
    const user = await requireUser();
    originGuard(request);
    return response(await saveProperty(user.id, await jsonBody(request)), 201);
  } catch (e) {
    return failure(e);
  }
}
