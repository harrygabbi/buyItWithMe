"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PropertyList } from "./property-list";
import { DashboardFilters, DEFAULT_FILTERS } from "./dashboard-filters";
import { selectProperties, getStatus } from "@/lib/properties/readiness";
import { useProperties } from "@/lib/properties/use-properties";
export function PropertiesWorkspace() {
  const { properties, loading, error, reload } = useProperties();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get("status");
    if (
      status &&
      ["Draft", "Ready to Publish", "Published", "Archived"].includes(status)
    ) {
      const timer = setTimeout(
        () => setFilters((previous) => ({ ...previous, status })),
        0,
      );
      return () => clearTimeout(timer);
    }
  }, []);
  function changeFilters(next: typeof filters) {
    setFilters(next);
    const url = new URL(window.location.href);
    if (next.status === "All statuses") url.searchParams.delete("status");
    else url.searchParams.set("status", next.status);
    window.history.replaceState(
      window.history.state,
      "",
      url.pathname + url.search,
    );
  }
  const filtered = selectProperties(
    properties,
    filters.search,
    filters.status,
    filters.sort,
    filters.propertyType,
  );
  const active = properties.filter(
    (property) => getStatus(property) !== "Archived",
  ).length;
  return (
    <>
      <header className="page-heading">
        <div>
          <h1>My Properties</h1>
          <p>Find, organize, and update every property in your portfolio.</p>
        </div>
        <Button asChild>
          <Link href="/properties/new">
            <Plus aria-hidden="true" />
            Add Property
          </Link>
        </Button>
      </header>
      {loading ? (
        <div className="loading-state" role="status">
          Loading your properties…
        </div>
      ) : error ? (
        <div className="storage-error" role="alert">
          <div>
            <h2>Properties could not be loaded</h2>
            <p>{error}</p>
            <Button variant="outline" onClick={() => void reload()}>
              Try again
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="portfolio-toolbar-caption">
            <span>
              <strong>{properties.length}</strong>{" "}
              {properties.length === 1 ? "property" : "properties"} · {active}{" "}
              active · {properties.length - active} archived
            </span>
            <Link href="/dashboard">
              <ArrowLeft size={14} aria-hidden="true" />
              Workspace overview
            </Link>
          </div>
          <DashboardFilters
            values={filters}
            onChange={changeFilters}
            resultCount={filtered.length}
            totalCount={properties.length}
          />
          <PropertyList
            properties={properties}
            filtered={filtered}
            onResetFilters={() =>
              changeFilters({ ...DEFAULT_FILTERS, sort: filters.sort })
            }
          />
        </>
      )}
    </>
  );
}
