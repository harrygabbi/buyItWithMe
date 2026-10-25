"use client";
import Link from "next/link";
import { CalendarDays, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PropertyImage, formatDate } from "@/components/properties/property-ui";
import type { Property } from "@/types/property";
export function NextOpenHouse({ properties }: { properties: Property[] }) {
  const now = new Date();
  const property = properties
    .filter((p) => p.nextOpenHouse && new Date(p.nextOpenHouse) >= now)
    .sort((a, b) => a.nextOpenHouse!.localeCompare(b.nextOpenHouse!))[0];
  if (!property?.nextOpenHouse)
    return (
      <section
        className="next-open-house next-house-empty"
        aria-label="Next open house"
      >
        <PropertyImage
          property={{ propertyType: "Detached house", id: "empty-open-house" }}
        />
        <div>
          <h2>A little space in your calendar.</h2>
          <p>
            No upcoming open houses in this view. Scheduling will be available
            in a later milestone.
          </p>
        </div>
      </section>
    );
  const date = new Date(property.nextOpenHouse);
  const days = Math.round(
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) /
      86400000,
  );
  const relative =
    days === 0 ? "Today" : days === 1 ? "Tomorrow" : `In ${days} days`;
  return (
    <section className="next-open-house" aria-labelledby="next-house-title">
      <PropertyImage property={property} />
      <div className="next-house-content">
        <div className="next-house-label">
          NEXT OPEN HOUSE<span className="relative-pill">{relative}</span>
        </div>
        <h2 id="next-house-title">
          {property.address?.split(",")[0] || "Untitled property"}
        </h2>
        <p>{property.address?.split(",").slice(1).join(",").trim()}</p>
        <div className="next-house-time">
          <CalendarDays size={15} aria-hidden="true" />
          <time dateTime={property.nextOpenHouse}>
            {date.toLocaleDateString("en-CA", { weekday: "long" })},{" "}
            {formatDate(property.nextOpenHouse)} ·{" "}
            {date.toLocaleTimeString("en-CA", {
              hour: "numeric",
              minute: "2-digit",
              timeZoneName: "short",
            })}
          </time>
        </div>
      </div>
      <div className="next-house-action">
        <Button variant="ghost" asChild>
          <Link href={`/properties/${property.id}`}>
            View property
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </Button>
        <span>
          {property.isDemo ? "Demonstration schedule" : "Scheduled open house"}
        </span>
      </div>
    </section>
  );
}
