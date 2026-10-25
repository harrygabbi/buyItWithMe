import {
  randomBytes,
  randomUUID,
  createHash,
  scrypt,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { database } from "./db";
import { HttpError } from "./http";
const derive = (password: string, salt: string) =>
  new Promise<Buffer>((resolve, reject) => {
    scrypt(
      password,
      salt,
      64,
      { N: 32768, maxmem: 64 * 1024 * 1024 },
      (error, key) => (error ? reject(error) : resolve(key)),
    );
  });
const COOKIE = "openhouse_session";
const lifespan = 7 * 24 * 3600;
export interface Realtor {
  id: string;
  name: string;
  email: string;
}
export const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = await derive(password, salt);
  return `${salt}:${key.toString("hex")}`;
}
export async function checkPassword(password: string, encoded: string) {
  const [salt, hash] = encoded.split(":");
  const expected = Buffer.from(hash, "hex");
  const key = await derive(password, salt);
  return expected.length === key.length && timingSafeEqual(expected, key);
}
export async function currentUser(): Promise<Realtor | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const { rows } = await database().query(
    "SELECT u.id,u.name,u.email FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>now()",
    [digest(token)],
  );
  return rows[0] || null;
}
export async function requireUser() {
  const user = await currentUser();
  if (!user) throw new HttpError(401, "Sign in to manage your properties.");
  return user;
}
export async function requirePageUser() {
  const user = await currentUser();
  if (!user) redirect("/login");
  return user;
}
export async function newSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const jar = await cookies();
  const old = jar.get(COOKIE)?.value;
  if (old)
    await database().query("DELETE FROM sessions WHERE token_hash=$1", [
      digest(old),
    ]);
  await database().query("DELETE FROM sessions WHERE expires_at<=now()");
  await database().query(
    "INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '7 days')",
    [digest(token), userId],
  );
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.SESSION_COOKIE_SECURE !== "false",
    sameSite: "lax",
    path: "/",
    maxAge: lifespan,
  });
}
export async function signOut() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token)
    await database().query("DELETE FROM sessions WHERE token_hash=$1", [
      digest(token),
    ]);
  jar.delete(COOKIE);
}
export async function rateLimit(key: string, limit = 12) {
  const { rows } = await database().query(
    "INSERT INTO auth_attempts(key) VALUES($1) ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN auth_attempts.window_start<now()-interval '15 minutes' THEN 1 ELSE auth_attempts.attempts+1 END,window_start=CASE WHEN auth_attempts.window_start<now()-interval '15 minutes' THEN now() ELSE auth_attempts.window_start END RETURNING attempts",
    [digest(key)],
  );
  if (rows[0].attempts > limit)
    throw new HttpError(429, "Too many attempts. Try again in 15 minutes.");
}
export async function register(name: string, email: string, password: string) {
  const id = randomUUID();
  try {
    await database().query(
      "INSERT INTO users(id,name,email,password_hash,authentication_identity) VALUES($1,$2,$3,$4,$5)",
      [id, name, email, await hashPassword(password), `password:${email}`],
    );
    return id;
  } catch (error) {
    if ((error as { code?: string }).code === "23505")
      throw new HttpError(
        409,
        "An account could not be created with that email. Try signing in.",
      );
    throw error;
  }
}
