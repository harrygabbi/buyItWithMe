import Image from "next/image";
import { Check } from "lucide-react";
import type { Property, PropertyStatus } from "@/types/property";
import {
  CORE_FIELDS,
  getReadiness,
  getStatus,
} from "@/lib/properties/readiness";
import { ReadinessRing } from "./readiness-ring";
import { PropertyThumbnail } from "./property-thumbnail";
export const currency = (amount?: number) =>
  amount === undefined
    ? "Price not added"
    : new Intl.NumberFormat("en-CA", {
        style: "currency",
        currency: "CAD",
        maximumFractionDigits: 0,
      }).format(amount);
export const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
export function StatusPill({ status }: { status: PropertyStatus }) {
  return (
    <span
      className={`status-badge ${status === "Published" ? "published" : status === "Draft" || status === "Archived" ? "draft" : "ready"}`}
    >
      {status === "Published" ? (
        <Check size={11} aria-hidden="true" />
      ) : (
        <span className="status-dot" />
      )}
      {status}
    </span>
  );
}
export function StatusBadge({ property }: { property: Property }) {
  return <StatusPill status={getStatus(property)} />;
}
export function Readiness({ property }: { property: Property }) {
  const { percentage, isReady, missing } = getReadiness(property);
  const status = getStatus(property);
  return (
    <div className="readiness">
      <ReadinessRing
        percentage={percentage}
        complete={isReady}
        state={
          status === "Published"
            ? "published"
            : status === "Draft" || status === "Archived"
              ? "draft"
              : "ready"
        }
        label={`Property readiness for ${property.address || "Untitled property"}`}
      />
      <div className="readiness-copy">
        <span>
          {isReady
            ? "Core complete"
            : `${property.managedCompletion?.completed ?? CORE_FIELDS.length - missing.length} of ${property.managedCompletion?.total ?? CORE_FIELDS.length} fields`}
        </span>
        {missing.length > 0 && (
          <small className="missing-hint">
            Missing:{" "}
            {missing.map((field) => field.label.toLowerCase()).join(", ")}
          </small>
        )}
      </div>
    </div>
  );
}
export function PropertyImage({
  property,
  large = false,
}: {
  property: Partial<Property>;
  large?: boolean;
}) {
  return (
    <div className={`property-image ${large ? "large" : ""}`}>
      {property.image ? (
        <Image
          src={property.image}
          alt={`${property.propertyType || "Property"} photo`}
          fill
          sizes={
            large
              ? "(max-width: 800px) 100vw, 760px"
              : "(max-width: 600px) 72px, 120px"
          }
          className="object-cover"
          unoptimized
        />
      ) : (
        <PropertyThumbnail property={property} />
      )}
      {large && property.isDemo && property.image && (
        <span className="demo-photo-caption">
          Demonstration photo · not the listed property
        </span>
      )}
    </div>
  );
}
