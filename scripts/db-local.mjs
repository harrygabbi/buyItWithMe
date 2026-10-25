import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
const root = resolve(".data");
const directory = resolve(root, "postgres");
const bin = process.env.PG_BIN || "/opt/homebrew/opt/postgresql@16/bin";
mkdirSync(root, { recursive: true, mode: 0o700 });
function run(command, args) {
  const r = spawnSync(command, args, { stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status || 1);
}
if (!existsSync(resolve(directory, "PG_VERSION"))) {
  if (existsSync(".env.local"))
    throw new Error(
      "Existing .env.local found. Configure DATABASE_URL manually or move it before local database setup.",
    );
  const password = randomBytes(32).toString("hex");
  const pwfile = resolve(root, "pg-password");
  writeFileSync(pwfile, password, { mode: 0o600 });
  run(resolve(bin, "initdb"), [
    "-D",
    directory,
    "-U",
    "openhouse",
    "--auth-local=trust",
    "--auth-host=scram-sha-256",
    `--pwfile=${pwfile}`,
  ]);
  writeFileSync(
    ".env.local",
    `DATABASE_URL=postgresql://openhouse:${password}@127.0.0.1:55432/openhouse\nAPP_ORIGIN=http://localhost:3000\nSESSION_COOKIE_SECURE=false\nUPLOAD_DIR=.data/uploads\n`,
    { mode: 0o600 },
  );
}
const status = spawnSync(resolve(bin, "pg_ctl"), ["-D", directory, "status"], {
  stdio: "ignore",
});
if (status.status !== 0)
  run(resolve(bin, "pg_ctl"), [
    "-D",
    directory,
    "-l",
    resolve(root, "postgres.log"),
    "-o",
    "-p 55432 -h 127.0.0.1 -k /tmp",
    "start",
  ]);
const env = readFileSync(".env.local", "utf8");
const url = new URL(env.match(/^DATABASE_URL=(.+)$/m)[1]);
const pg = await import("pg");
const client = new pg.default.Client({
  connectionString: url.toString().replace(/\/openhouse$/, "/postgres"),
});
await client.connect();
if (
  !(await client.query("SELECT 1 FROM pg_database WHERE datname='openhouse'"))
    .rowCount
)
  await client.query("CREATE DATABASE openhouse");
await client.end();
console.log("Local PostgreSQL is ready. Run npm run db:migrate.");
