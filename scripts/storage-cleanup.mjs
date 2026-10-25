// Run periodically against the same DATABASE_URL and UPLOAD_DIR as the application.
import pg from "pg";
import { unlink } from "node:fs/promises";
import { resolve, join } from "node:path";
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
const root = resolve(process.env.UPLOAD_DIR || ".data/uploads");
try {
  const { rows } = await client.query(
    "SELECT storage_key FROM storage_deletions ORDER BY created_at LIMIT 1000",
  );
  let removed = 0;
  for (const { storage_key: key } of rows) {
    if (!/^[a-f0-9-]{36}\/[a-f0-9-]{36}\.webp$/.test(key)) continue;
    try {
      await unlink(join(root, key));
    } catch (error) {
      if (error.code !== "ENOENT") continue;
    }
    await client.query("DELETE FROM storage_deletions WHERE storage_key=$1", [
      key,
    ]);
    removed++;
  }
  await client.query("DELETE FROM sessions WHERE expires_at<=now()");
  await client.query(
    "DELETE FROM auth_attempts WHERE window_start<now()-interval '1 day'",
  );
  console.log(
    `Processed ${removed} queued file deletions and expired authentication records.`,
  );
} finally {
  await client.end();
}
