"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FIELDS, type ManagedProperty } from "@/lib/managed/fields";
import { api } from "@/lib/managed/client";
export function PropertyView({ id }: { id: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [property, setProperty] = useState<ManagedProperty | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api<ManagedProperty>(`/api/properties/${id}`)
      .then(setProperty)
      .catch((e) => setError(e.message));
  }, [id]);
  if (error)
    return (
      <div className="storage-error" role="alert">
        {error}
        <Link href="/dashboard">Back to dashboard</Link>
      </div>
    );
  if (!property) return <p className="loading-state">Loading property…</p>;
  return (
    <>
      <Link className="back-link" href="/dashboard">
        ← Back to dashboard
      </Link>
      <header className="page-heading">
        <div>
          <h1>{String(property.facts.title?.value || "Untitled property")}</h1>
          <p>{property.status} · Private property profile</p>
        </div>
        <Button asChild>
          <Link href={`/properties/${id}/edit`}>Edit property</Link>
        </Button>
      </header>
      <div className="photo-grid">
        {property.media.map((media) => (
          <Card className="photo-tile" key={media.id}>
            <div className="uploaded-photo">
              <Image
                src={media.url}
                alt={media.description || "Property photo"}
                fill
                sizes="400px"
                unoptimized
              />
            </div>
            <p>
              {media.description}
              {media.cover ? " · Cover" : ""}
            </p>
          </Card>
        ))}
      </div>
      {(["Core", "Essential", "Enrichment"] as const).map((category) => (
        <Card className="form-card" key={category}>
          <h2>
            {category} · {property.completeness[category].completed} /{" "}
            {property.completeness[category].total}
          </h2>
          <dl className="property-facts-list">
            {FIELDS.filter((field) => field.category === category).map(
              (field) => {
                const fact = property.facts[field.key];
                return (
                  <div key={field.key}>
                    <dt>{field.label}</dt>
                    <dd>
                      {fact.verification === "Not applicable"
                        ? "Not applicable"
                        : fact.value === null
                          ? "Unknown"
                          : typeof fact.value === "boolean"
                            ? fact.value
                              ? "Yes"
                              : "No"
                            : String(fact.value)}
                      <small>
                        {fact.verification}
                        {fact.source ? ` · Source: ${fact.source}` : ""}
                        {fact.updatedAt
                          ? ` · Updated ${new Date(fact.updatedAt).toLocaleDateString()}`
                          : ""}
                      </small>
                    </dd>
                  </div>
                );
              },
            )}
          </dl>
        </Card>
      ))}
      <Card className="form-card">
        <h2>Rooms</h2>
        {property.rooms.length ? (
          property.rooms.map((room) => (
            <div className="resource-row" key={room.id}>
              <div>
                <h3>{room.name}</h3>
                <p>
                  {room.floor} · {room.length ?? "—"} × {room.width ?? "—"}{" "}
                  {room.unit}
                </p>
                <p>{room.description}</p>
                <small>
                  {room.verification}
                  {room.source ? ` · ${room.source}` : ""}
                </small>
              </div>
            </div>
          ))
        ) : (
          <p>No rooms recorded.</p>
        )}
      </Card>
      <Card className="form-card">
        <h2>Private document references</h2>
        {property.documents.length ? (
          property.documents.map((document) => (
            <div className="resource-row" key={document.id}>
              <div>
                <h3>{document.title}</h3>
                <p>
                  {document.kind} · {document.access}
                </p>
                <p className="private-reference">{document.reference}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No document references recorded.</p>
        )}
      </Card>
      <Button
        type="button"
        variant="ghost"
        disabled={deleting}
        onClick={async () => {
          if (
            !confirm(
              "Delete this property, rooms, photos, and document references? This cannot be undone.",
            )
          )
            return;
          setDeleting(true);
          try {
            await api(`/api/properties/${id}`, { method: "DELETE" });
            router.push("/dashboard");
            router.refresh();
          } catch (e) {
            setError((e as Error).message);
            setDeleting(false);
          }
        }}
      >
        Delete property
      </Button>
    </>
  );
}
