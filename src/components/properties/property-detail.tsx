"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  BedDouble,
  Bath,
  Ruler,
  CalendarDays,
  Info,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProperties } from "@/lib/properties/use-properties";
import { browserRepository } from "@/lib/properties/repository";
import { getReadiness } from "@/lib/properties/readiness";
import {
  PropertyImage,
  StatusBadge,
  Readiness,
  currency,
  formatDate,
} from "./property-ui";
import { BaselineFacts } from "./baseline-facts";
import { PropertyForm } from "./property-form";
import { StorageError } from "./storage-error";
export function PropertyDetail({
  id,
  edit = false,
}: {
  id: string;
  edit?: boolean;
}) {
  const { properties, loading, error, reload } = useProperties();
  const [confirm, setConfirm] = useState(false);
  const [failure, setFailure] = useState("");
  const router = useRouter();
  if (loading)
    return (
      <div className="loading-state" role="status">
        Loading property…
      </div>
    );
  if (error) return <StorageError message={error} onReset={reload} />;
  const property = properties.find((p) => p.id === id);
  if (!property)
    return (
      <div className="empty-state">
        <h1>Property not found</h1>
        <p>This property may have been removed from this browser.</p>
        <Button asChild>
          <Link href="/dashboard">Return to dashboard</Link>
        </Button>
      </div>
    );
  if (edit) return <PropertyForm property={property} />;
  const readiness = getReadiness(property);
  return (
    <>
      <Link className="back-link" href="/dashboard">
        <ArrowLeft size={16} aria-hidden="true" />
        Back to dashboard
      </Link>
      <header className="page-heading">
        <div>
          <span className="eyebrow">
            PROPERTY PROFILE {property.isDemo && "· DEMONSTRATION"}
          </span>
          <h1 className="detail-title">
            {property.address || "Untitled property"}
          </h1>
          <p>
            {property.propertyType || "Property type not added"} · Updated{" "}
            {formatDate(property.updatedAt)}
          </p>
        </div>
        <Button asChild>
          <Link href={`/properties/${id}/edit`}>
            <Pencil aria-hidden="true" />
            Edit property
          </Link>
        </Button>
      </header>
      <div className="detail-layout">
        <Card className="detail-main">
          <PropertyImage property={property} large />
          <div className="detail-content">
            <StatusBadge property={property} />
            <h2 className="detail-price">{currency(property.askingPrice)}</h2>
            <div className="detail-facts">
              <span>
                <BedDouble aria-hidden="true" />
                {property.bedrooms ?? "—"} bedrooms
              </span>
              <span>
                <Bath aria-hidden="true" />
                {property.bathrooms ?? "—"} bathrooms
              </span>
              <span>
                <Ruler aria-hidden="true" />
                {property.squareFeet?.toLocaleString() ?? "—"} sq ft
              </span>
            </div>
            <h3>About this property</h3>
            <p>{property.description || "No description added yet."}</p>
            <dl className="detail-data">
              <div>
                <dt>MLS / listing number</dt>
                <dd>{property.listingNumber || "Not added"}</dd>
              </div>
              <div>
                <dt>Lot size</dt>
                <dd>
                  {property.lotSize
                    ? `${property.lotSize.toLocaleString()} sq ft`
                    : "Not added"}
                </dd>
              </div>
              <div>
                <dt>Year built</dt>
                <dd>{property.yearBuilt || "Not added"}</dd>
              </div>
            </dl>
            <BaselineFacts answers={property.baselineAnswers} />
          </div>
        </Card>
        <div>
          <Card className="detail-side">
            <h2>Property readiness</h2>
            <Readiness property={property} />
            <p>
              {readiness.isReady
                ? "All six Core fields are complete. This profile has a strong foundation."
                : `Complete the missing Core fields: ${readiness.missing.map((f) => f.label).join(", ")}.`}
            </p>
            <div className="aside-note">
              Publishing and visitor access are coming in a later milestone.
              Published demo labels are illustrative.
            </div>
          </Card>
          <Card className="detail-side">
            <h2>
              <CalendarDays size={18} aria-hidden="true" />
              Next open house
            </h2>
            <p>
              {property.nextOpenHouse
                ? formatDate(property.nextOpenHouse)
                : "No open house scheduled."}
            </p>
            <small>
              Scheduling is coming later. Existing dates are demonstration data.
            </small>
          </Card>
          <div className="form-storage-note">
            <Info size={17} aria-hidden="true" />
            <p>
              This profile is stored only in this browser. Avoid sensitive
              information.
            </p>
          </div>
          <div className="delete-section">
            {confirm ? (
              <>
                <p>
                  Delete this property from this browser? This cannot be undone.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setConfirm(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      try {
                        browserRepository().remove(id);
                        router.push("/dashboard");
                        router.refresh();
                      } catch (e) {
                        setFailure(
                          e instanceof Error
                            ? e.message
                            : "Could not delete property.",
                        );
                      }
                    }}
                  >
                    Delete property
                  </Button>
                </div>
              </>
            ) : (
              <Button variant="ghost" onClick={() => setConfirm(true)}>
                <Trash2 aria-hidden="true" />
                Delete property
              </Button>
            )}
            {failure && <p role="alert">{failure}</p>}
          </div>
        </div>
      </div>
    </>
  );
}
