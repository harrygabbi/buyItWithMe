"use client";

import { Search, ArrowDownUp, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { PROPERTY_TYPES } from "@/types/property";

export interface DashboardFilterValues {
  search: string;
  status: string;
  propertyType: string;
  sort: string;
}
export const DEFAULT_FILTERS: DashboardFilterValues = {
  search: "",
  status: "All statuses",
  propertyType: "All types",
  sort: "recent",
};
export function DashboardFilters({
  values,
  onChange,
  resultCount,
  totalCount,
}: {
  values: DashboardFilterValues;
  onChange: (values: DashboardFilterValues) => void;
  resultCount: number;
  totalCount: number;
}) {
  const active =
    !!values.search.trim() ||
    values.status !== "All statuses" ||
    values.propertyType !== "All types";
  return (
    <section className="dashboard-filter-panel" aria-label="Filter properties">
      <div className="dashboard-filter-controls">
        <div className="search-wrap">
          <Search size={17} aria-hidden="true" />
          <Input
            type="search"
            aria-label="Search properties"
            placeholder="Search address or listing number…"
            value={values.search}
            onChange={(e) => onChange({ ...values, search: e.target.value })}
          />
        </div>
        <select
          className="type-filter"
          aria-label="Filter by property type"
          value={values.propertyType}
          onChange={(e) =>
            onChange({ ...values, propertyType: e.target.value })
          }
        >
          {["All types", ...PROPERTY_TYPES].map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>
        <div className="sort-wrap">
          <ArrowDownUp size={15} aria-hidden="true" />
          <select
            aria-label="Sort properties"
            value={values.sort}
            onChange={(e) => onChange({ ...values, sort: e.target.value })}
          >
            <option value="recent">Recently updated</option>
            <option value="oldest">Oldest updated</option>
            <option value="price-desc">Price: high to low</option>
            <option value="price-asc">Price: low to high</option>
            <option value="readiness">Readiness: lowest first</option>
          </select>
        </div>
      </div>
      <div className="filter-bottom">
        <SegmentedControl
          label="Filter by property status"
          value={values.status}
          onChange={(status) => onChange({ ...values, status })}
          options={[
            { label: "All", value: "All statuses" },
            { label: "Draft", value: "Draft" },
            { label: "Ready", value: "Ready to Publish" },
            { label: "Published", value: "Published" },
            { label: "Archived", value: "Archived" },
          ]}
        />
        <div className="filter-summary">
          <p role="status" aria-live="polite" aria-atomic="true">
            <strong>{resultCount}</strong> of {totalCount} properties
            {active ? " match your filters" : " in your workspace"}
          </p>
          {active && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                onChange({ ...DEFAULT_FILTERS, sort: values.sort })
              }
            >
              <X aria-hidden="true" />
              Clear filters
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
