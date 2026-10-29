import Link from "next/link";
import { ArrowRight, Bath, BedDouble, Pencil, Plus, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  currency,
  PropertyImage,
  StatusBadge,
} from "@/components/properties/property-ui";
import { getStatus } from "@/lib/properties/readiness";
import type { Property } from "@/types/property";

export function PortfolioPreview({ properties }: { properties: Property[] }) {
  const recent = properties
    .filter((property) => getStatus(property) !== "Archived")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 3);

  return (
    <section className="portfolio-preview" aria-labelledby="portfolio-title">
      <div className="portfolio-preview-heading">
        <div>
          <h2 id="portfolio-title">Your properties</h2>
          <p>Your most recently updated properties, all in one place.</p>
        </div>
        <Link className="portfolio-preview-link" href="/properties">
          View all <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
      {recent.length ? (
        <div className="portfolio-preview-grid">
          {recent.map((property) => {
            const addressParts = property.address?.split(",") || [];
            const address = addressParts[0]?.trim() || "Untitled property";
            const location = addressParts.slice(1).join(",").trim();
            return (
              <article className="portfolio-card" key={property.id}>
                <Link
                  className="portfolio-card-media"
                  href={`/properties/${property.id}`}
                  aria-label={`View ${address}`}
                >
                  <PropertyImage property={property} large />
                  <span className="portfolio-card-status">
                    <StatusBadge property={property} />
                  </span>
                </Link>
                <div className="portfolio-card-body">
                  <p className="portfolio-card-type">
                    {property.propertyType || "Draft property"}
                  </p>
                  <h3 className="portfolio-card-address">
                    <Link href={`/properties/${property.id}`}>{address}</Link>
                  </h3>
                  <p className="portfolio-card-location">
                    {location || "Location not added"}
                  </p>
                  <div className="portfolio-card-facts">
                    <span>
                      <BedDouble size={15} aria-hidden="true" />
                      {property.bedrooms ?? "—"} beds
                    </span>
                    <span>
                      <Bath size={15} aria-hidden="true" />
                      {property.bathrooms ?? "—"} baths
                    </span>
                    <span>
                      <Ruler size={15} aria-hidden="true" />
                      {property.squareFeet?.toLocaleString() ?? "—"} sq ft
                    </span>
                  </div>
                  <div className="portfolio-card-footer">
                    <strong className="portfolio-card-price">
                      {currency(property.askingPrice)}
                    </strong>
                    <Link
                      className="portfolio-card-edit"
                      href={`/properties/${property.id}/edit`}
                      aria-label={`Edit ${address}`}
                    >
                      <Pencil size={14} aria-hidden="true" /> Edit
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="portfolio-preview-empty">
          <div className="portfolio-preview-intro">
            <h3>Your portfolio starts here</h3>
            <p>
              Add your first property and build a complete profile at your own
              pace. You can save a draft at any time.
            </p>
            <Button asChild>
              <Link href="/properties/new">
                <Plus size={16} aria-hidden="true" /> Add property
              </Link>
            </Button>
          </div>
          <ol className="portfolio-preview-steps">
            <li>
              <strong>Add the essentials</strong>
              <p>Start with the address, price, and key property details.</p>
            </li>
            <li>
              <strong>Bring the home to life</strong>
              <p>Add photos, rooms, and the features that make it distinctive.</p>
            </li>
            <li>
              <strong>Review before sharing</strong>
              <p>Check your information and sources before the open house.</p>
            </li>
          </ol>
        </div>
      )}
    </section>
  );
}
