import { Pool, type PoolClient } from "pg";
const globalDb = globalThis as unknown as { openhousePool?: Pool };
export function database() {
  if (!process.env.DATABASE_URL)
    throw new Error("DATABASE_URL is not configured.");
  return (globalDb.openhousePool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    connectionTimeoutMillis: 5000,
  }));
}
export async function transaction<T>(
  work: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await database().connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
