import { z } from "zod";
import { database } from "@/lib/server/db";
import {
  currentUser,
  rateLimit,
  register,
  newSession,
  signOut,
  checkPassword,
  digest,
} from "@/lib/server/auth";
import {
  originGuard,
  jsonBody,
  response,
  failure,
  HttpError,
} from "@/lib/server/http";
export const runtime = "nodejs";
const credentials = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    email: z
      .email()
      .max(254)
      .transform((v) => v.toLowerCase()),
    password: z.string().min(12, "Use at least 12 characters.").max(128),
  })
  .strict();
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ action: string }> },
) {
  try {
    const { action } = await params;
    if (action !== "me") throw new HttpError(404, "Not found.");
    const user = await currentUser();
    return response({ user });
  } catch (e) {
    return failure(e);
  }
}
export async function POST(
  request: Request,
  { params }: { params: Promise<{ action: string }> },
) {
  try {
    originGuard(request);
    const { action } = await params;
    if (action === "logout") {
      await signOut();
      return response({ ok: true });
    }
    if (!["register", "login"].includes(action))
      throw new HttpError(404, "Not found.");
    await rateLimit("global-auth", 300);
    const input = credentials.parse(await jsonBody(request));
    await rateLimit(`auth:${input.email}`);
    if (action === "register") {
      if (!input.name) throw new HttpError(400, "Enter your name.");
      const id = await register(input.name, input.email, input.password);
      await newSession(id);
      return response({ ok: true }, 201);
    }
    const { rows } = await database().query(
      "SELECT id,password_hash FROM users WHERE email=$1",
      [input.email],
    );
    // The same password derivation runs for unknown accounts to avoid a cheap timing oracle.
    const valid = await checkPassword(
      input.password,
      rows[0]?.password_hash ||
        `${digest("dummy-salt").slice(0, 32)}:${"0".repeat(128)}`,
    );
    if (!rows[0] || !valid)
      throw new HttpError(401, "Email or password is incorrect.");
    await newSession(rows[0].id);
    return response({ ok: true });
  } catch (e) {
    return failure(e);
  }
}
