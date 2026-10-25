import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { rm } from "node:fs/promises";
import sharp from "sharp";
import { database } from "./db";
import { getProperty, saveProperty } from "./properties";
import { FIELDS, type Fact, type ManagedProperty } from "../managed/fields";
import { completeness, draftSchema } from "../managed/validation";
import { hashPassword, checkPassword } from "./auth";
const origin = "http://localhost:3317";
const provided = (value: Fact["value"]): Fact => ({
  value,
  verification: "Realtor-provided",
  source: "",
});
const required = {
  title: "Integration test townhouse",
  street_address: "123 Test Lane",
  city: "Vancouver",
  province: "BC",
  postal_code: "V6B 1A1",
  country: "Canada",
  property_type: "Condo",
  listing_price: 850000,
  description: "Fictional home for automated integration testing.",
  bedrooms: 0,
  full_bathrooms: 1,
  half_bathrooms: 0,
  interior_sqft: 600,
  year_built: 2020,
};
test(
  "Milestone 2: real PostgreSQL, authenticated APIs, rooms, media, and persistence",
  { timeout: 120000 },
  async (suite) => {
    const prefix = `m2-${randomUUID()}`;
    const directory = resolve(".data", prefix);
    const startServer = () =>
      spawn(
        process.execPath,
        [
          "node_modules/next/dist/bin/next",
          "start",
          "--port",
          "3317",
          "--hostname",
          "127.0.0.1",
        ],
        {
          env: {
            ...process.env,
            APP_ORIGIN: origin,
            SESSION_COOKIE_SECURE: "false",
            UPLOAD_DIR: directory,
          },
          stdio: ["ignore", "pipe", "pipe"],
        },
      );
    let server = startServer();
    let output = "";
    server.stdout?.on("data", (d) => {
      output += d;
    });
    server.stderr?.on("data", (d) => {
      output += d;
    });
    const users: string[] = [];
    let cookieA = "",
      cookieB = "";
    let property: ManagedProperty;
    async function call(
      path: string,
      method = "GET",
      cookie = "",
      body?: unknown,
    ) {
      const response = await fetch(origin + path, {
        method,
        headers: {
          Origin: origin,
          ...(cookie ? { Cookie: cookie } : {}),
          ...(body instanceof FormData
            ? {}
            : { "Content-Type": "application/json" }),
        },
        body:
          body === undefined
            ? undefined
            : body instanceof FormData
              ? body
              : JSON.stringify(body),
        redirect: "manual",
      });
      const data = await response.json();
      return { response, data };
    }
    try {
      let up = false;
      for (let i = 0; i < 100; i++) {
        try {
          const response = await fetch(origin + "/api/auth/me");
          if (response.status === 200) {
            up = true;
            break;
          }
        } catch {}
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      assert.ok(up, output);
      await suite.test(
        "unauthorized API requests and private pages are rejected",
        async () => {
          assert.equal((await call("/api/properties")).response.status, 401);
          const page = await fetch(origin + "/dashboard", {
            redirect: "manual",
          });
          assert.equal(page.status, 307);
          assert.match(page.headers.get("location") || "", /login/);
        },
      );
      await suite.test(
        "registration creates real hashed-password sessions",
        async () => {
          for (const [index, name] of ["Owner A", "Owner B"].entries()) {
            const result = await call("/api/auth/register", "POST", "", {
              name,
              email: `${prefix}-${index}@example.test`,
              password: "An-example-password-8317!",
            });
            assert.equal(
              result.response.status,
              201,
              JSON.stringify(result.data),
            );
            const cookie = result.response.headers
              .get("set-cookie")!
              .split(";")[0];
            assert.match(
              result.response.headers.get("set-cookie")!,
              /HttpOnly/i,
            );
            if (index === 0) cookieA = cookie;
            else cookieB = cookie;
            const me = await call("/api/auth/me", "GET", cookie);
            users.push(me.data.user.id);
            const saved = await database().query(
              "SELECT password_hash FROM users WHERE id=$1",
              [me.data.user.id],
            );
            assert.notEqual(
              saved.rows[0].password_hash,
              "An-example-password-8317!",
            );
            assert.ok(
              await checkPassword(
                "An-example-password-8317!",
                saved.rows[0].password_hash,
              ),
            );
          }
          assert.notEqual(
            await hashPassword("same-password-123"),
            await hashPassword("same-password-123"),
          );
        },
      );
      await suite.test(
        "empty and partial drafts are persisted; owner IDs are not accepted",
        async () => {
          const created = await call("/api/properties", "POST", cookieA, {});
          assert.equal(created.response.status, 201);
          property = created.data;
          assert.equal(property.status, "Draft");
          assert.equal(property.ownerId, users[0]);
          assert.equal(property.completeness.Core.completed, 0);
          const injected = await call("/api/properties", "POST", cookieA, {
            ownerId: users[1],
          });
          assert.equal(injected.response.status, 400);
          const saved = await call(
            `/api/properties/${property.id}`,
            "PATCH",
            cookieA,
            {
              revision: property.revision,
              facts: { title: provided("Partial draft") },
            },
          );
          assert.equal(saved.response.status, 200);
          property = saved.data;
          assert.equal(
            (await getProperty(users[0], property.id)).facts.title.value,
            "Partial draft",
          );
        },
      );
      await suite.test(
        "ownership checks cover reads, writes, rooms, documents, and upload endpoints",
        async () => {
          for (const [path, method, body] of [
            [`/api/properties/${property.id}`, "GET", undefined],
            [
              `/api/properties/${property.id}`,
              "PATCH",
              { revision: property.revision, facts: {} },
            ],
            [
              `/api/properties/${property.id}/rooms`,
              "POST",
              { name: "Unauthorized" },
            ],
            [
              `/api/properties/${property.id}/documents`,
              "POST",
              { title: "Private", kind: "Other", reference: "private-key" },
            ],
            [`/api/properties/${property.id}/media`, "POST", new FormData()],
          ] as const) {
            assert.equal(
              (await call(path, method, cookieB, body)).response.status,
              404,
            );
          }
          assert.equal(
            (await call("/api/properties", "GET", cookieB)).data.length,
            0,
          );
          await assert.rejects(() => getProperty(users[1], property.id));
        },
      );
      await suite.test(
        "malformed values, false verification, and stale updates are rejected",
        async () => {
          const invalid = await call(
            `/api/properties/${property.id}`,
            "PATCH",
            cookieA,
            { revision: property.revision, facts: { bedrooms: provided(-1) } },
          );
          assert.equal(invalid.response.status, 400);
          assert.equal(
            draftSchema.safeParse({
              facts: {
                title: { value: "Claim", verification: "Verified", source: "" },
              },
            }).success,
            false,
          );
          assert.equal(
            draftSchema.safeParse({
              facts: {
                fireplace: {
                  value: false,
                  verification: "Unknown",
                  source: "",
                },
              },
            }).success,
            false,
          );
          assert.equal(
            (
              await call(`/api/properties/${property.id}`, "PATCH", cookieA, {
                revision: property.revision - 1,
                facts: { title: provided("stale") },
              })
            ).response.status,
            409,
          );
        },
      );
      let roomId = "";
      await suite.test(
        "rooms create, update, retrieve, and preserve measurements/features",
        async () => {
          let result = await call(
            `/api/properties/${property.id}/rooms`,
            "POST",
            cookieA,
            {
              name: "Living room",
              type: "Living",
              floor: "Main",
              length: 14.5,
              width: 12,
              unit: "ft",
              ceilingHeight: 9,
              windowCount: 2,
              features: ["Bay window"],
            },
          );
          assert.equal(result.response.status, 201);
          property = result.data;
          roomId = property.rooms[0].id;
          assert.equal(property.rooms[0].length, 14.5);
          result = await call(
            `/api/properties/${property.id}/rooms/${roomId}`,
            "PATCH",
            cookieA,
            {
              name: "Living and dining",
              width: 13,
              length: 14.5,
              unit: "ft",
              features: ["Bay window", "Built-in shelving"],
            },
          );
          property = result.data;
          const reopened = await getProperty(users[0], property.id);
          assert.equal(reopened.rooms[0].name, "Living and dining");
          assert.equal(reopened.rooms[0].width, 13);
          assert.equal(reopened.rooms[0].features.length, 2);
        },
      );
      await suite.test(
        "Core readiness is conditional and cannot be satisfied by unknown/NA values",
        async () => {
          const facts = Object.fromEntries(
            Object.entries(required).map(([k, v]) => [k, provided(v)]),
          );
          assert.equal(
            completeness(facts, 0).Core.missing.some((f) => f.key === "photos"),
            true,
          );
          assert.equal(completeness(facts, 1).Core.missing.length, 0);
          assert.equal(
            completeness(
              { ...facts, property_type: provided("Detached house") },
              1,
            ).Core.missing.some((f) => f.key === "lot_size"),
            true,
          );
          assert.equal(
            completeness(
              { ...facts, property_type: provided("Townhouse") },
              1,
            ).Core.missing.some((f) => f.key === "lot_size"),
            false,
          );
          assert.equal(
            completeness(
              {
                ...facts,
                listing_price: {
                  value: null,
                  verification: "Not applicable",
                  source: "",
                },
              },
              1,
            ).Core.missing.some((f) => f.key === "listing_price"),
            true,
          );
          const result = await call(
            `/api/properties/${property.id}`,
            "PATCH",
            cookieA,
            { revision: property.revision, facts },
          );
          property = result.data;
          assert.equal(property.status, "Draft");
          assert.equal(property.completeness.Core.missing.length, 1);
          assert.equal(property.publishedAt, null);
        },
      );
      await suite.test(
        "server rejects invalid image content and oversized files",
        async () => {
          for (const file of [
            new File(["<svg/>"], "bad.svg", { type: "image/svg+xml" }),
            new File(["not a photo"], "fake.jpg", { type: "image/jpeg" }),
            new File([new Uint8Array(10 * 1024 * 1024 + 1)], "too-large.jpg", {
              type: "image/jpeg",
            }),
          ]) {
            const body = new FormData();
            body.append("photos", file);
            assert.equal(
              (
                await call(
                  `/api/properties/${property.id}/media`,
                  "POST",
                  cookieA,
                  body,
                )
              ).response.status,
              400,
            );
          }
          assert.equal(
            (await getProperty(users[0], property.id)).media.length,
            0,
          );
        },
      );
      await suite.test(
        "multiple images persist, become private WebP assets, and establish Ready status",
        async () => {
          const image = await sharp({
            create: {
              width: 20,
              height: 20,
              channels: 3,
              background: "#557766",
            },
          })
            .jpeg()
            .toBuffer();
          const body = new FormData();
          body.append(
            "photos",
            new File([new Uint8Array(image)], "front.jpg", {
              type: "image/jpeg",
            }),
          );
          body.append(
            "photos",
            new File([new Uint8Array(image)], "garden.jpg", {
              type: "image/jpeg",
            }),
          );
          const result = await call(
            `/api/properties/${property.id}/media`,
            "POST",
            cookieA,
            body,
          );
          assert.equal(
            result.response.status,
            201,
            JSON.stringify(result.data),
          );
          property = result.data;
          assert.equal(property.media.length, 2);
          assert.equal(property.media.filter((m) => m.cover).length, 1);
          assert.equal(property.status, "Ready");
          assert.equal(property.publishedAt, null);
          const file = await fetch(origin + property.media[0].url, {
            headers: { Cookie: cookieA },
          });
          assert.equal(file.status, 200);
          assert.equal(file.headers.get("content-type"), "image/webp");
          assert.match(file.headers.get("cache-control")!, /no-store/);
          assert.equal(
            (await fetch(origin + property.media[0].url)).status,
            401,
          );
          assert.equal(
            (
              await fetch(origin + property.media[0].url, {
                headers: { Cookie: cookieB },
              })
            ).status,
            404,
          );
        },
      );
      await suite.test(
        "cover, ordering, photo metadata, and room photo relationships persist",
        async () => {
          const reverse = property.media.map((m) => m.id).reverse();
          let result = await call(
            `/api/properties/${property.id}/media`,
            "PATCH",
            cookieA,
            { order: reverse, coverId: reverse[0] },
          );
          property = result.data;
          assert.equal(property.media[0].id, reverse[0]);
          assert.equal(property.media[0].cover, true);
          result = await call(
            `/api/properties/${property.id}/media/${reverse[0]}`,
            "PATCH",
            cookieA,
            { description: "Verified front elevation", roomId },
          );
          property = result.data;
          assert.equal(
            property.media[0].description,
            "Verified front elevation",
          );
          assert.equal(property.media[0].roomId, roomId);
          assert.equal(
            (
              await call(
                `/api/properties/${property.id}/media/${reverse[0]}`,
                "DELETE",
                cookieB,
              )
            ).response.status,
            404,
          );
        },
      );
      await suite.test(
        "document references stay private and preserve permissions",
        async () => {
          const result = await call(
            `/api/properties/${property.id}/documents`,
            "POST",
            cookieA,
            {
              title: "Inspection reference",
              kind: "Inspection",
              reference: "private/inspection-2026.pdf",
              access: "Private",
            },
          );
          property = result.data;
          assert.equal(property.documents[0].access, "Private");
          assert.equal(
            (await getProperty(users[0], property.id)).documents[0].reference,
            "private/inspection-2026.pdf",
          );
          assert.equal(
            (await call(`/api/properties/${property.id}`, "GET", cookieB))
              .response.status,
            404,
          );
        },
      );
      await suite.test(
        "private document metadata can be edited without exposing its storage reference",
        async () => {
          const doc = property.documents[0];
          let result = await call(
            `/api/properties/${property.id}/documents/${doc.id}`,
            "PATCH",
            cookieB,
            {
              title: "Unauthorized",
              kind: "Other",
              reference: "bad",
              access: "Private",
            },
          );
          assert.equal(result.response.status, 404);
          result = await call(
            `/api/properties/${property.id}/documents/${doc.id}`,
            "PATCH",
            cookieA,
            {
              title: "Updated inspection",
              kind: "Inspection",
              reference: "private/inspection-2026.pdf",
              access: "Realtor-approved",
            },
          );
          assert.equal(result.response.status, 200);
          property = result.data;
          assert.equal(property.documents.length, 1);
          assert.equal(property.documents[0].access, "Realtor-approved");
        },
      );
      await suite.test(
        "verification changes, zero/false facts, and optional NA completeness are preserved",
        async () => {
          const result = await call(
            `/api/properties/${property.id}`,
            "PATCH",
            cookieA,
            {
              revision: property.revision,
              facts: {
                fireplace: provided(false),
                parking_spaces: {
                  value: 0,
                  verification: "Verified",
                  source: "Realtor inspection notes",
                },
                pet_rules: {
                  value: null,
                  verification: "Not applicable",
                  source: "",
                },
              },
            },
          );
          property = result.data;
          assert.equal(property.facts.fireplace.value, false);
          assert.equal(property.facts.parking_spaces.value, 0);
          assert.equal(property.facts.parking_spaces.verification, "Verified");
          assert.equal(property.facts.pet_rules.verification, "Not applicable");
          assert.equal(
            property.completeness.Essential.total,
            FIELDS.filter((f) => f.category === "Essential").length - 1,
          );
        },
      );
      await suite.test(
        "repeatable amenities enforce ownership, verification, and CRUD",
        async () => {
          let result = await call(
            `/api/properties/${property.id}/amenities`,
            "POST",
            cookieA,
            { name: "Gym", description: "Shared fitness room" },
          );
          assert.equal(result.response.status, 201);
          property = result.data;
          const amenity = property.amenities[0];
          assert.equal(amenity.verification, "Realtor-provided");
          assert.equal(
            (
              await call(
                `/api/properties/${property.id}/amenities/${amenity.id}`,
                "PATCH",
                cookieB,
                { name: "Tampered" },
              )
            ).response.status,
            404,
          );
          result = await call(
            `/api/properties/${property.id}/amenities/${amenity.id}`,
            "PATCH",
            cookieA,
            {
              name: "Gym",
              description: "Shared fitness room",
              verification: "Verified",
              source: "Building amenity schedule",
            },
          );
          property = result.data;
          assert.equal(property.amenities[0].verification, "Verified");
        },
      );
      await suite.test(
        "application restart preserves sessions, properties, rooms, photos, and private documents",
        async () => {
          const exited = new Promise<void>((resolve) =>
            server.once("exit", () => resolve()),
          );
          server.kill("SIGTERM");
          await exited;
          server = startServer();
          server.stdout?.on("data", (data) => {
            output += data;
          });
          server.stderr?.on("data", (data) => {
            output += data;
          });
          let ready = false;
          for (let i = 0; i < 100; i++) {
            try {
              const response = await fetch(origin + "/api/auth/me");
              if (response.status === 200) {
                ready = true;
                break;
              }
            } catch {}
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
          assert.ok(ready, output);
          const result = await call(
            `/api/properties/${property.id}`,
            "GET",
            cookieA,
          );
          assert.equal(result.response.status, 200);
          property = result.data;
          assert.equal(property.status, "Ready");
          assert.equal(property.rooms.length, 1);
          assert.equal(property.media.length, 2);
          assert.equal(property.documents.length, 1);
          assert.equal(property.amenities[0].verification, "Verified");
          assert.equal(
            (
              await fetch(origin + property.media[0].url, {
                headers: { Cookie: cookieA },
              })
            ).status,
            200,
          );
          const amenityId = property.amenities[0].id;
          property = (
            await call(
              `/api/properties/${property.id}/amenities/${amenityId}`,
              "DELETE",
              cookieA,
            )
          ).data;
          assert.equal(property.amenities.length, 0);
        },
      );
      await suite.test(
        "deleting rooms/media/documents updates persisted readiness and leaves no public access",
        async () => {
          property = (
            await call(
              `/api/properties/${property.id}/rooms/${roomId}`,
              "DELETE",
              cookieA,
            )
          ).data;
          assert.equal(property.rooms.length, 0);
          assert.equal(property.media[0].roomId, null);
          property = (
            await call(
              `/api/properties/${property.id}/documents/${property.documents[0].id}`,
              "DELETE",
              cookieA,
            )
          ).data;
          assert.equal(property.documents.length, 0);
          for (const media of property.media)
            property = (
              await call(
                `/api/properties/${property.id}/media/${media.id}`,
                "DELETE",
                cookieA,
              )
            ).data;
          assert.equal(property.media.length, 0);
          assert.equal(property.status, "Draft");
          assert.ok(
            property.completeness.Core.missing.some((f) => f.key === "photos"),
          );
        },
      );
      await suite.test(
        "property deletion checks ownership and removes its database relationships",
        async () => {
          const extra = (await call("/api/properties", "POST", cookieA, {}))
            .data as ManagedProperty;
          assert.equal(
            (await call(`/api/properties/${extra.id}`, "DELETE", cookieB))
              .response.status,
            404,
          );
          assert.equal(
            (await call(`/api/properties/${extra.id}`, "DELETE", cookieA))
              .response.status,
            200,
          );
          assert.equal(
            (await call(`/api/properties/${extra.id}`, "GET", cookieA)).response
              .status,
            404,
          );
        },
      );
      await suite.test(
        "CSRF, publication state, archive state, and session revocation are enforced",
        async () => {
          const response = await fetch(
            origin + `/api/properties/${property.id}`,
            {
              method: "PATCH",
              headers: {
                Cookie: cookieA,
                Origin: "https://untrusted.example",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ revision: property.revision, facts: {} }),
            },
          );
          assert.equal(response.status, 403);
          await assert.rejects(() =>
            saveProperty(
              users[0],
              { facts: {}, status: "Published" },
              property.id,
            ),
          );
          property = (
            await call(`/api/properties/${property.id}`, "PATCH", cookieA, {
              revision: property.revision,
              facts: {},
              status: "Archived",
            })
          ).data;
          assert.equal(property.status, "Archived");
          assert.equal(
            (await call("/api/auth/logout", "POST", cookieA)).response.status,
            200,
          );
          assert.equal(
            (await call("/api/properties", "GET", cookieA)).response.status,
            401,
          );
        },
      );
    } finally {
      server.kill("SIGTERM");
      await new Promise<void>((resolve) => {
        if (server.exitCode !== null) resolve();
        else {
          server.once("exit", () => resolve());
          setTimeout(() => {
            server.kill("SIGKILL");
            resolve();
          }, 3000).unref();
        }
      });
      const testProperties = await database().query(
        "SELECT id FROM properties WHERE owner_id=ANY($1::uuid[])",
        [users],
      );
      for (const id of users)
        await database().query("DELETE FROM users WHERE id=$1", [id]);
      await database().query(
        "DELETE FROM storage_deletions WHERE split_part(storage_key,'/',1)=ANY($1::text[])",
        [testProperties.rows.map((row) => row.id)],
      );
      await rm(directory, { recursive: true, force: true });
      await database().end();
    }
  },
);
