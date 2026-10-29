import {
  Building2,
  ClipboardList,
  CircleCheck,
  ChartNoAxesCombined,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { getOverview, getStatus } from "@/lib/properties/readiness";
import type { Property } from "@/types/property";

export function Overview({
  properties,
  filtered = false,
}: {
  properties: Property[];
  filtered?: boolean;
}) {
  const values = getOverview(properties);
  const cards = [
    {
      label: filtered ? "Matching properties" : "Total properties",
      value: values.total,
      detail: "Across your portfolio",
      icon: Building2,
    },
    {
      label: "In preparation",
      value: properties.filter((p) => getStatus(p) === "Draft").length,
      detail: "Draft profiles to complete",
      icon: ClipboardList,
    },
    {
      label: "Ready for review",
      value: properties.filter((p) => getStatus(p) === "Ready to Publish").length,
      detail: "Core information complete",
      icon: CircleCheck,
    },
    {
      label: "Average completeness",
      value: `${values.readiness}%`,
      detail: "Required property information",
      icon: ChartNoAxesCombined,
    },
  ];
  return (
    <section className="overview-grid" aria-label="Property overview">
      {cards.map(({ label, value, detail, icon: Icon }) => (
        <Card className="stat-card" key={label}>
          <div className="stat-top">
            <span>{label}</span>
            <Icon size={17} aria-hidden="true" />
          </div>
          <strong className="stat-value">{value}</strong>
          <span className="stat-detail">{detail}</span>
        </Card>
      ))}
    </section>
  );
}
