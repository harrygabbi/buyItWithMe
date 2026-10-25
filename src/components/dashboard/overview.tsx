import {
  Building2,
  CalendarDays,
  CircleCheck,
  ChartNoAxesCombined,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { ReadinessRing } from "@/components/properties/readiness-ring";
import { getOverview, getReadiness } from "@/lib/properties/readiness";
import type { Property } from "@/types/property";
export function Overview({
  properties,
  filtered = false,
}: {
  properties: Property[];
  filtered?: boolean;
}) {
  const values = getOverview(properties);
  const complete =
    properties.length > 0 && properties.every((p) => getReadiness(p).isReady);
  const cards = [
    {
      label: filtered ? "Matching Properties" : "Total Properties",
      value: values.total,
      detail: filtered ? "In this filtered view" : "In your workspace",
      icon: Building2,
    },
    {
      label: "Upcoming Open Houses",
      value: values.upcoming,
      detail: "Scheduled ahead",
      icon: CalendarDays,
    },
    {
      label: "Published Properties",
      value: values.published,
      detail: properties.some((p) => p.isDemo)
        ? "Includes demo listings"
        : "Published profiles",
      icon: CircleCheck,
    },
    {
      label: "Average Property Readiness",
      value: `${values.readiness}%`,
      detail: "Applicable Core requirements",
      icon: ChartNoAxesCombined,
    },
  ];
  return (
    <section className="overview-grid" aria-label="Property overview">
      {cards.map(({ label, value, detail, icon: Icon }, i) => (
        <Card className="stat-card" key={i}>
          <div className="stat-top">
            <span className="stat-icon">
              <Icon size={17} aria-hidden="true" />
            </span>
            <span>{label}</span>
          </div>
          {i === 3 ? (
            <div className="stat-readiness">
              <ReadinessRing
                percentage={values.readiness}
                complete={complete}
                state={
                  complete
                    ? "published"
                    : values.readiness > 0
                      ? "ready"
                      : "draft"
                }
                size={72}
                label="Average property readiness"
              />
            </div>
          ) : (
            <strong className="stat-value">{value}</strong>
          )}
          <span className="stat-detail">{detail}</span>
        </Card>
      ))}
    </section>
  );
}
