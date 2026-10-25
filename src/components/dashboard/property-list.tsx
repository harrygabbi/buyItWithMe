"use client";
import Link from "next/link";
import {
  BedDouble,
  Bath,
  Ruler,
  Pencil,
  Eye,
  Plus,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PropertyImage,
  Readiness,
  StatusBadge,
  currency,
  formatDate,
} from "@/components/properties/property-ui";
import { PropertyThumbnail } from "@/components/properties/property-thumbnail";
import type { Property } from "@/types/property";
export function PropertyList({
  properties,
  filtered,
  onResetFilters,
}: {
  properties: Property[];
  filtered: Property[];
  onResetFilters: () => void;
}) {
  return (
    <section className="property-section">
      <div className="section-heading">
        <div>
          <div className="flex items-center gap-3">
            <h2>Your properties</h2>
            <span className="count-badge">{properties.length}</span>
          </div>
          <p>A clear view of every home, from first draft to open house.</p>
        </div>
        <span className="demo-label">
          {properties.some((p) => p.isDemo)
            ? "Includes demonstration properties"
            : "Your workspace"}
        </span>
      </div>
      {filtered.length ? (
        <>
          <div className="property-table" role="table" aria-label="Properties">
            <div className="property-table-head" role="row">
              <span role="columnheader">Property</span>
              <span role="columnheader">Status</span>
              <span role="columnheader">Readiness</span>
              <span role="columnheader">Next open house</span>
              <span role="columnheader" className="text-right">
                Actions
              </span>
            </div>
            <div role="rowgroup">
              {filtered.map((property) => (
                <div className="property-row" role="row" key={property.id}>
                  <div className="property-summary" role="cell">
                    <PropertyImage property={property} />
                    <div className="property-copy">
                      <div className="property-kicker">
                        {property.propertyType ?? "Type not added"}
                        {property.isDemo && <span>DEMO</span>}
                      </div>
                      <Link
                        className="property-address"
                        href={`/properties/${property.id}`}
                      >
                        {property.address?.split(",")[0] || "Untitled property"}
                      </Link>
                      <p className="property-location">
                        {property.address
                          ?.split(",")
                          .slice(1)
                          .join(",")
                          .trim() || "Address not added"}
                      </p>
                      <strong className="property-price">
                        {currency(property.askingPrice)}
                      </strong>
                      <div className="property-facts">
                        <span>
                          <BedDouble size={13} aria-hidden="true" />
                          {property.bedrooms ?? "—"}
                          <span className="sr-only"> bedrooms</span>
                        </span>
                        <span>
                          <Bath size={13} aria-hidden="true" />
                          {property.bathrooms ?? "—"}
                          <span className="sr-only"> bathrooms</span>
                        </span>
                        <span>
                          <Ruler size={13} aria-hidden="true" />
                          {property.squareFeet?.toLocaleString() ?? "—"} sq ft
                        </span>
                      </div>
                    </div>
                  </div>
                  <div role="cell">
                    <StatusBadge property={property} />
                  </div>
                  <div role="cell">
                    <Readiness property={property} />
                  </div>
                  <div className="open-house-cell" role="cell">
                    {property.nextOpenHouse ? (
                      <>
                        <span>
                          <CalendarDays size={14} aria-hidden="true" />
                          {formatDate(property.nextOpenHouse)}
                        </span>
                        <small>Demonstration schedule</small>
                      </>
                    ) : (
                      <span className="not-scheduled">Not scheduled</span>
                    )}
                  </div>
                  <div className="row-actions" role="cell">
                    <Button variant="ghost" size="icon" asChild>
                      <Link
                        href={`/properties/${property.id}/edit`}
                        title="Edit property"
                        aria-label={`Edit ${property.address}`}
                      >
                        <Pencil size={16} aria-hidden="true" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link
                        href={`/properties/${property.id}`}
                        title="View property"
                        aria-label={`View ${property.address}`}
                      >
                        <Eye size={17} aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="list-footer">
            <span>
              Showing {filtered.length} of {properties.length} properties
            </span>
            <span>All prices in CAD</span>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <span className="empty-icon">
            <PropertyThumbnail
              property={{
                propertyType: "Detached house",
                id: "empty-properties",
              }}
            />
          </span>
          <h3>
            {properties.length
              ? "No properties match your search"
              : "Your next open house starts here"}
          </h3>
          <p>
            {properties.length
              ? "Try another address, listing number, or status."
              : "Add your first property and bring the details together in one place."}
          </p>
          {properties.length ? (
            <Button variant="outline" onClick={onResetFilters}>
              Clear search and filters
            </Button>
          ) : (
            <Button asChild>
              <Link href="/properties/new">
                <Plus size={16} aria-hidden="true" />
                Add Your First Property
              </Link>
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
