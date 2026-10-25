"use client";
import Image from "next/image";
import { useUnsavedResource } from "./use-unsaved-resource";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ManagedProperty, Room, Media } from "@/lib/managed/fields";
import { roomSchema, documentSchema } from "@/lib/managed/validation";
import { api } from "@/lib/managed/client";
type Props = {
  property: ManagedProperty;
  onSaved: (property: ManagedProperty) => void;
};
function SelectedPreview({ file }: { file: File }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const src = URL.createObjectURL(file);
    const timer = setTimeout(() => setUrl(src), 0);
    return () => {
      clearTimeout(timer);
      URL.revokeObjectURL(src);
    };
  }, [file]);
  return url ? (
    <div className="selected-preview">
      <Image
        src={url}
        width={96}
        height={72}
        alt={`Selected photo: ${file.name}`}
        unoptimized
      />
      <span>{file.name}</span>
    </div>
  ) : null;
}
function ErrorMessage({ error }: { error: string }) {
  return error ? (
    <div className="form-failure" role="alert">
      {error}
    </div>
  ) : null;
}
const emptyRoom = {
  verification: "Realtor-provided" as Room["verification"],
  source: "",
  name: "",
  type: "",
  floor: "",
  length: null,
  width: null,
  unit: "ft" as const,
  description: "",
  features: [] as string[],
  ceilingHeight: null,
  orientation: "",
  naturalLight: "",
  windowCount: null,
  closet: "",
};
export function RoomManager({ property, onSaved }: Props) {
  const [draft, setDraft] = useState<Omit<Room, "id">>(emptyRoom);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [feature, setFeature] = useState("");
  useUnsavedResource(
    JSON.stringify(draft) !==
      JSON.stringify(
        editing
          ? (() => {
              const { id, ...room } = property.rooms.find(
                (room) => room.id === editing,
              )!;
              void id;
              return room;
            })()
          : emptyRoom,
      ) || !!feature.trim(),
  );
  async function save() {
    setError("");
    const result = roomSchema.safeParse(draft);
    if (!result.success) {
      setError(result.error.issues.map((i) => i.message).join(" "));
      return;
    }
    setBusy(true);
    try {
      onSaved(
        await api<ManagedProperty>(
          `/api/properties/${property.id}/rooms${editing ? `/${editing}` : ""}`,
          {
            method: editing ? "PATCH" : "POST",
            body: JSON.stringify(result.data),
          },
        ),
      );
      setDraft(emptyRoom);
      setEditing(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <ErrorMessage error={error} />
      <Card className="form-card">
        <h2>{editing ? "Edit room" : "Add a room"}</h2>
        <p className="editor-help">
          Record room-level information. Use Add room or Save room to persist
          these details. Dimensions use the measurement unit selected below.
        </p>
        <div className="form-grid">
          {[
            ["name", "Room name"],
            ["type", "Room type"],
            ["floor", "Floor / level"],
            ["orientation", "Orientation"],
            ["naturalLight", "Natural light"],
            ["closet", "Closet information"],
            ["source", "Room verification source"],
          ].map(([key, label]) => (
            <div className="form-field" key={key}>
              <label htmlFor={`room-${key}`}>{label}</label>
              <input
                className="field"
                id={`room-${key}`}
                disabled={busy}
                value={String(draft[key as keyof typeof draft] ?? "")}
                onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
              />
            </div>
          ))}
          {[
            ["length", "Length"],
            ["width", "Width"],
            ["ceilingHeight", "Ceiling height"],
            ["windowCount", "Window count"],
          ].map(([key, label]) => (
            <div className="form-field" key={key}>
              <label htmlFor={`room-${key}`}>{label}</label>
              <input
                className="field"
                type="number"
                min={key === "windowCount" ? 0 : 0.01}
                step={key === "windowCount" ? 1 : "any"}
                id={`room-${key}`}
                disabled={busy}
                value={(draft[key as keyof typeof draft] as number) ?? ""}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    [key]:
                      e.target.value === "" ? null : Number(e.target.value),
                  })
                }
              />
            </div>
          ))}
          <div className="form-field">
            <label htmlFor="room-verification">
              Room information verification
            </label>
            <select
              className="field"
              id="room-verification"
              disabled={busy}
              value={draft.verification}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  verification: e.target.value as Room["verification"],
                })
              }
            >
              {[
                "Unknown",
                "Realtor-provided",
                "Verified",
                "Not applicable",
              ].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="room-unit">Measurement unit</label>
            <select
              className="field"
              id="room-unit"
              value={draft.unit}
              disabled={busy}
              onChange={(e) =>
                setDraft({ ...draft, unit: e.target.value as "ft" | "m" })
              }
            >
              <option value="ft">Feet</option>
              <option value="m">Metres</option>
            </select>
          </div>
          <div className="form-field wide">
            <label htmlFor="room-description">Description</label>
            <textarea
              className="field"
              id="room-description"
              value={draft.description}
              disabled={busy}
              onChange={(e) =>
                setDraft({ ...draft, description: e.target.value })
              }
            />
          </div>
          <div className="form-field wide">
            <label htmlFor="room-feature">Additional room features</label>
            <div className="flex gap-2">
              <input
                className="field"
                id="room-feature"
                value={feature}
                maxLength={120}
                disabled={busy}
                onChange={(e) => setFeature(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                disabled={
                  busy || !feature.trim() || draft.features.length >= 30
                }
                onClick={() => {
                  setDraft({
                    ...draft,
                    features: [...draft.features, feature.trim()],
                  });
                  setFeature("");
                }}
              >
                Add feature
              </Button>
            </div>
            <ul className="feature-list">
              {draft.features.map((name, index) => (
                <li key={`${name}-${index}`}>
                  {name}
                  <Button
                    type="button"
                    variant="ghost"
                    aria-label={`Remove ${name}`}
                    onClick={() =>
                      setDraft({
                        ...draft,
                        features: draft.features.filter((_, i) => i !== index),
                      })
                    }
                  >
                    ×
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="resource-actions">
          <Button type="button" disabled={busy} onClick={() => void save()}>
            {busy ? "Saving…" : editing ? "Save room" : "Add room"}
          </Button>
          {editing && (
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() => {
                setDraft(emptyRoom);
                setEditing(null);
              }}
            >
              Cancel edit
            </Button>
          )}
        </div>
      </Card>
      <div className="resource-list">
        {property.rooms.length ? (
          property.rooms.map((room) => (
            <Card className="resource-row" key={room.id}>
              <div>
                <h3>{room.name}</h3>
                <p>
                  {room.floor || "Level not added"} · {room.length ?? "—"} ×{" "}
                  {room.width ?? "—"} {room.unit}
                </p>
                <p>{room.description}</p>
                <small>
                  {room.verification}
                  {room.source ? ` · ${room.source}` : ""}
                </small>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => {
                    const { id, ...data } = room;
                    setDraft(data);
                    setEditing(id);
                  }}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={busy}
                  onClick={async () => {
                    if (
                      !confirm(
                        `Remove ${room.name}? Room photos will remain in Photos.`,
                      )
                    )
                      return;
                    setBusy(true);
                    try {
                      onSaved(
                        await api<ManagedProperty>(
                          `/api/properties/${property.id}/rooms/${room.id}`,
                          { method: "DELETE" },
                        ),
                      );
                      if (editing === room.id) {
                        setEditing(null);
                        setDraft(emptyRoom);
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
            </Card>
          ))
        ) : (
          <p className="editor-help">No rooms yet. Add the first room above.</p>
        )}
      </div>
    </div>
  );
}
function PhotoItem({
  media,
  property,
  busy,
  run,
}: {
  media: Media;
  property: ManagedProperty;
  busy: boolean;
  run: (work: () => Promise<ManagedProperty>) => Promise<void>;
}) {
  const [description, setDescription] = useState(media.description);
  const [roomId, setRoomId] = useState(media.roomId || "");
  useUnsavedResource(
    description !== media.description || roomId !== (media.roomId || ""),
  );
  const index = property.media.findIndex((m) => m.id === media.id);
  async function move(direction: number) {
    const order = property.media.map((m) => m.id);
    [order[index], order[index + direction]] = [
      order[index + direction],
      order[index],
    ];
    await run(() =>
      api(`/api/properties/${property.id}/media`, {
        method: "PATCH",
        body: JSON.stringify({ order }),
      }),
    );
  }
  return (
    <Card className="photo-tile">
      <div className="uploaded-photo">
        <Image
          src={media.url}
          alt={media.description || "Property photo"}
          fill
          sizes="300px"
          unoptimized
        />
        {media.cover && <span className="photo-cover-label">Cover</span>}
      </div>
      <label htmlFor={`photo-description-${media.id}`}>Photo description</label>
      <input
        className="field"
        id={`photo-description-${media.id}`}
        maxLength={500}
        value={description}
        disabled={busy}
        onChange={(e) => setDescription(e.target.value)}
      />
      <label htmlFor={`photo-room-${media.id}`}>Attach to a room</label>
      <select
        className="field"
        id={`photo-room-${media.id}`}
        disabled={busy}
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      >
        <option value="">No room</option>
        {property.rooms.map((room) => (
          <option key={room.id} value={room.id}>
            {room.name}
          </option>
        ))}
      </select>
      <Button
        type="button"
        variant="outline"
        disabled={busy}
        onClick={() =>
          void run(() =>
            api(`/api/properties/${property.id}/media/${media.id}`, {
              method: "PATCH",
              body: JSON.stringify({ description, roomId: roomId || null }),
            }),
          )
        }
      >
        Save photo details
      </Button>
      <div className="photo-actions">
        <Button
          type="button"
          variant="ghost"
          disabled={busy || media.cover}
          onClick={() =>
            void run(() =>
              api(`/api/properties/${property.id}/media`, {
                method: "PATCH",
                body: JSON.stringify({ coverId: media.id }),
              }),
            )
          }
        >
          Set cover
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={busy || index === 0}
          onClick={() => void move(-1)}
          aria-label={`Move photo ${index + 1} earlier`}
        >
          ↑
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={busy || index === property.media.length - 1}
          onClick={() => void move(1)}
          aria-label={`Move photo ${index + 1} later`}
        >
          ↓
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={busy}
          onClick={() => {
            if (confirm("Delete this photo? This cannot be undone."))
              void run(() =>
                api(`/api/properties/${property.id}/media/${media.id}`, {
                  method: "DELETE",
                }),
              );
          }}
        >
          Delete
        </Button>
      </div>
    </Card>
  );
}
export function PhotoManager({ property, onSaved }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [inputKey, setInputKey] = useState(0);
  useUnsavedResource(files.length > 0);
  async function run(work: () => Promise<ManagedProperty>) {
    setBusy(true);
    setError("");
    try {
      onSaved(await work());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Card className="form-card">
        <h2>Property photos</h2>
        <p className="editor-help">
          JPEG, PNG, WebP, or AVIF. Up to 10 MB per image, 30 MB per batch, and
          100 photos per property. Images are decoded, resized, stripped of
          metadata, and stored privately.
        </p>
        <label htmlFor="property-photos">Choose multiple photos</label>
        <input
          key={inputKey}
          className="field"
          id="property-photos"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          disabled={busy}
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
        />
        {files.length > 0 && (
          <p className="editor-help">
            {files.length} selected: {files.map((f) => f.name).join(", ")}
          </p>
        )}
        <div className="selected-previews">
          {files.map((file, index) => (
            <SelectedPreview key={`${file.name}-${index}`} file={file} />
          ))}
        </div>
        <Button
          type="button"
          className="mt-4"
          disabled={busy || !files.length}
          onClick={() =>
            void run(async () => {
              const body = new FormData();
              files.forEach((file) => body.append("photos", file));
              const saved = await api<ManagedProperty>(
                `/api/properties/${property.id}/media`,
                { method: "POST", body },
              );
              setFiles([]);
              setInputKey((key) => key + 1);
              return saved;
            })
          }
        >
          {busy ? "Processing photos…" : "Upload photos"}
        </Button>
      </Card>
      <ErrorMessage error={error} />
      <div className="photo-grid">
        {property.media.map((media) => (
          <PhotoItem
            key={media.id}
            media={media}
            property={property}
            busy={busy}
            run={run}
          />
        ))}
      </div>
      {!property.media.length && (
        <p className="editor-help">
          No photos yet. Add at least one usable photo to meet Core readiness.
        </p>
      )}
    </>
  );
}
export function DocumentManager({ property, onSaved }: Props) {
  const [editingDocument, setEditingDocument] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("Floor plan");
  const [reference, setReference] = useState("");
  const [access, setAccess] = useState<"Private" | "Realtor-approved">(
    "Private",
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useUnsavedResource(!!title.trim() || !!reference.trim());
  return (
    <>
      <Card className="form-card">
        <h2>Document references</h2>
        <p className="editor-help">
          Store private document metadata and storage references for future
          document delivery. No public document links are created.
          “Realtor-approved” records remain owner-only in Milestone 2.
        </p>
        <div className="form-grid">
          {[
            ["document-title", "Title", title, setTitle],
            [
              "document-reference",
              "Private storage reference",
              reference,
              setReference,
            ],
          ].map(([id, label, value, setter]) => (
            <div className="form-field wide" key={id as string}>
              <label htmlFor={id as string}>{label as string}</label>
              <input
                className="field"
                id={id as string}
                value={value as string}
                disabled={busy}
                onChange={(e) =>
                  (setter as (value: string) => void)(e.target.value)
                }
              />
            </div>
          ))}
          <div className="form-field">
            <label htmlFor="document-kind">Document type</label>
            <select
              className="field"
              id="document-kind"
              value={kind}
              disabled={busy}
              onChange={(e) => setKind(e.target.value)}
            >
              {[
                "Floor plan",
                "Disclosure",
                "Inspection",
                "Strata",
                "Appliance manual",
                "Other",
              ].map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="document-access">Access permission</label>
            <select
              className="field"
              id="document-access"
              value={access}
              disabled={busy}
              onChange={(e) => setAccess(e.target.value as typeof access)}
            >
              <option>Private</option>
              <option>Realtor-approved</option>
            </select>
          </div>
        </div>
        <Button
          type="button"
          className="mt-4"
          disabled={busy}
          onClick={async () => {
            setError("");
            const result = documentSchema.safeParse({
              title,
              kind,
              reference,
              access,
            });
            if (!result.success) {
              setError("Enter a document title and private storage reference.");
              return;
            }
            setBusy(true);
            try {
              onSaved(
                await api(
                  `/api/properties/${property.id}/documents${editingDocument ? `/${editingDocument}` : ""}`,
                  {
                    method: editingDocument ? "PATCH" : "POST",
                    body: JSON.stringify(result.data),
                  },
                ),
              );
              setTitle("");
              setReference("");
              setEditingDocument(null);
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          {editingDocument ? "Save reference changes" : "Save reference"}
        </Button>
      </Card>
      <ErrorMessage error={error} />
      {property.documents.length ? (
        property.documents.map((document) => (
          <Card className="resource-row" key={document.id}>
            <div>
              <h3>{document.title}</h3>
              <p>
                {document.kind} · {document.access}
              </p>
              <p className="private-reference">{document.reference}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() => {
                setEditingDocument(document.id);
                setTitle(document.title);
                setKind(document.kind);
                setReference(document.reference);
                setAccess(document.access);
              }}
            >
              Edit reference
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={async () => {
                if (
                  !confirm(
                    "Remove this document reference? The source file is not deleted.",
                  )
                )
                  return;
                setBusy(true);
                try {
                  onSaved(
                    await api(
                      `/api/properties/${property.id}/documents/${document.id}`,
                      { method: "DELETE" },
                    ),
                  );
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              Remove
            </Button>
          </Card>
        ))
      ) : (
        <p className="editor-help">No document references added yet.</p>
      )}
    </>
  );
}
