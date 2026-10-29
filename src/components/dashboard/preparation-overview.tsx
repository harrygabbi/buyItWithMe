import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardList, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getReadiness, getStatus } from "@/lib/properties/readiness";
import {
  PropertyImage,
  Readiness,
} from "@/components/properties/property-ui";
import type { Property } from "@/types/property";
export function PreparationOverview({
  properties,
}: {
  properties: Property[];
}) {
  const active = properties.filter(
    (property) => getStatus(property) !== "Archived",
  );
  const incomplete = active
    .filter((property) => !getReadiness(property).isReady)
    .sort(
      (a, b) =>
        getReadiness(b).percentage - getReadiness(a).percentage ||
        b.updatedAt.localeCompare(a.updatedAt),
    );
  const ready = active.filter(
    (property) => getStatus(property) === "Ready to Publish",
  );
  return (
    <>
      <div className="preparation-grid">
        <Card className="attention-panel">
          <div className="preparation-heading">
            <div>
              <span className="eyebrow">PROPERTY PREPARATION</span>
              <h2>Needs your attention</h2>
            </div>
            <span className="count-badge">{incomplete.length}</span>
          </div>
          <p className="preparation-description">
            {incomplete.length
              ? "Finish the profiles closest to being ready. Missing details come from each property’s Core requirements."
              : "Core completeness is calculated from your saved property information."}
          </p>
          {incomplete.length ? (
            <div className="attention-list">
              {incomplete.slice(0, 3).map((property) => {
                const readiness = getReadiness(property);
                return (
                  <div className="attention-item" key={property.id}>
                    <PropertyImage property={property} />
                    <div className="attention-property">
                      <Link href={`/properties/${property.id}/edit`}>
                        {property.address?.split(",")[0] || "Untitled property"}
                      </Link>
                      <p>
                        {readiness.missing
                          .slice(0, 2)
                          .map((field) => field.label)
                          .join(" · ")}
                        {readiness.missing.length > 2
                          ? ` · +${readiness.missing.length - 2} more`
                          : ""}
                      </p>
                    </div>
                    <Readiness property={property} />
                    <Button variant="ghost" size="icon" asChild>
                      <Link
                        href={`/properties/${property.id}/edit`}
                        aria-label={`Continue editing ${property.address}`}
                        title="Continue editing"
                      >
                        <ArrowRight aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="preparation-empty">
              <CheckCircle2 size={28} aria-hidden="true" />
              <h3>
                {active.length
                  ? "Your Core details are in place."
                  : "Start with your first property."}
              </h3>
              <p>
                {active.length
                  ? "No active property is missing required information."
                  : "Create a draft and build its profile at your own pace."}
              </p>
              {!active.length && (
                <Button asChild>
                  <Link href="/properties/new">
                    <Plus aria-hidden="true" />
                    Add Property
                  </Link>
                </Button>
              )}
            </div>
          )}
          {incomplete.length > 3 && (
            <Link className="panel-link" href="/properties?status=Draft">
              Review all {incomplete.length} drafts
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          )}
        </Card>
        <Card className="ready-panel">
          <span className="ready-panel-icon">
            <ClipboardList size={24} aria-hidden="true" />
          </span>
          <span className="eyebrow">CORE INFORMATION COMPLETE</span>
          <h2>
            {ready.length}{" "}
            {ready.length === 1 ? "property is" : "properties are"} ready
          </h2>
          <p>
            {ready.length
              ? "These profiles have their required details and a saved photo. Review their information and sources to prepare for your next open house."
              : "Complete the Core details and add a photo to move a draft into Ready."}
          </p>
          <div className="ready-preview">
            {ready.slice(0, 2).map((property) => (
              <Link href={`/properties/${property.id}`} key={property.id}>
                <span>
                  {property.address?.split(",")[0] || "Untitled property"}
                </span>
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            ))}
          </div>
          <Button variant="outline" asChild>
            <Link
              href={
                ready.length
                  ? "/properties?status=Ready%20to%20Publish"
                  : "/properties"
              }
            >
              {ready.length ? "Review ready properties" : "Browse properties"}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <small>
            Ready does not mean published. Visitor access is coming later.
          </small>
        </Card>
      </div>
    </>
  );
}
