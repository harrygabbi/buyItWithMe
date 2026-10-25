"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ManagedProperty, Amenity } from "@/lib/managed/fields";
import { amenitySchema } from "@/lib/managed/validation";
import { api } from "@/lib/managed/client";
import { useUnsavedResource } from "./use-unsaved-resource";
const empty = {
  name: "",
  description: "",
  verification: "Realtor-provided" as Amenity["verification"],
  source: "",
};
export function AmenityManager({
  property,
  onSaved,
  disabled = false,
}: {
  property: ManagedProperty;
  disabled?: boolean;
  onSaved: (property: ManagedProperty) => void;
}) {
  const [draft, setDraft] = useState(empty);
  const [id, setId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useUnsavedResource(
    id
      ? JSON.stringify(draft) !==
          JSON.stringify(
            (() => {
              const item = property.amenities.find((item) => item.id === id);
              return item
                ? {
                    name: item.name,
                    description: item.description,
                    verification: item.verification,
                    source: item.source,
                  }
                : empty;
            })(),
          )
      : !!draft.name || !!draft.description || !!draft.source,
  );
  return (
    <Card className="form-card">
      <h2>Additional amenities</h2>
      <p className="editor-help">
        Add repeatable property or building amenities. Entered information is
        realtor-provided unless a verification source is recorded.
      </p>
      <div className="form-grid">
        {(["name", "description", "source"] as const).map((key) => (
          <div className="form-field wide" key={key}>
            <label htmlFor={`amenity-${key}`}>
              {key === "name"
                ? "Amenity name"
                : key === "description"
                  ? "Description"
                  : "Verification source"}
            </label>
            <input
              className="field"
              id={`amenity-${key}`}
              value={draft[key]}
              disabled={busy || disabled}
              onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
            />
          </div>
        ))}
        <div className="form-field">
          <label htmlFor="amenity-verification">Verification status</label>
          <select
            className="field"
            id="amenity-verification"
            value={draft.verification}
            disabled={busy || disabled}
            onChange={(e) =>
              setDraft({
                ...draft,
                verification: e.target.value as Amenity["verification"],
              })
            }
          >
            {["Unknown", "Realtor-provided", "Verified", "Not applicable"].map(
              (status) => (
                <option key={status}>{status}</option>
              ),
            )}
          </select>
        </div>
      </div>
      {error && (
        <div className="form-failure" role="alert">
          {error}
        </div>
      )}
      <div className="resource-actions">
        <Button
          type="button"
          disabled={busy || disabled}
          onClick={async () => {
            setError("");
            const parsed = amenitySchema.safeParse(draft);
            if (!parsed.success) {
              setError(parsed.error.issues.map((i) => i.message).join(" "));
              return;
            }
            setBusy(true);
            try {
              onSaved(
                await api(
                  `/api/properties/${property.id}/amenities${id ? `/${id}` : ""}`,
                  {
                    method: id ? "PATCH" : "POST",
                    body: JSON.stringify(parsed.data),
                  },
                ),
              );
              setDraft(empty);
              setId(null);
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Saving…" : id ? "Save amenity" : "Add amenity"}
        </Button>
        {id && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setDraft(empty);
              setId(null);
            }}
          >
            Cancel edit
          </Button>
        )}
      </div>
      {property.amenities.map((amenity) => (
        <div className="resource-row" key={amenity.id}>
          <div>
            <h3>{amenity.name}</h3>
            <p>{amenity.description}</p>
            <small>
              {amenity.verification}
              {amenity.source ? ` · ${amenity.source}` : ""}
            </small>
          </div>
          <div>
            <Button
              type="button"
              variant="ghost"
              disabled={busy || disabled}
              onClick={() => {
                setId(amenity.id);
                setDraft({
                  name: amenity.name,
                  description: amenity.description,
                  verification: amenity.verification,
                  source: amenity.source,
                });
              }}
            >
              Edit
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={busy || disabled}
              onClick={async () => {
                if (!confirm("Remove this amenity?")) return;
                setBusy(true);
                try {
                  onSaved(
                    await api(
                      `/api/properties/${property.id}/amenities/${amenity.id}`,
                      { method: "DELETE" },
                    ),
                  );
                  if (id === amenity.id) {
                    setDraft(empty);
                    setId(null);
                  }
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              Remove
            </Button>
          </div>
        </div>
      ))}
    </Card>
  );
}
