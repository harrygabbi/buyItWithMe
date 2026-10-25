"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, CheckCircle2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Overview } from "./overview";
import { PreparationOverview } from "./preparation-overview";
import { NextOpenHouse } from "./portfolio-insights";
import { useProperties } from "@/lib/properties/use-properties";

export function Dashboard({ title = "Dashboard" }: { title?: string }) {
  const { properties, loading, error, reload } = useProperties();
  const [notice, setNotice] = useState("");
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const value = sessionStorage.getItem("openhouse-ai.notice");
      if (value) {
        timer = setTimeout(() => {
          setNotice(value);
          try {
            sessionStorage.removeItem("openhouse-ai.notice");
          } catch {
            /* Optional feedback storage. */
          }
        }, 0);
      }
    } catch {
      /* A restricted browser must still render the workspace. */
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);
  return (
    <>
      <header className="page-heading">
        <div>
          <h1>{title}</h1>
          <p>Manage your properties and prepare for your next open house.</p>
        </div>
        <Button asChild>
          <Link href="/properties/new">
            <Plus aria-hidden="true" />
            Add Property
          </Link>
        </Button>
      </header>
      {notice && (
        <div className="success-notice toast" role="status">
          <CheckCircle2 size={18} aria-hidden="true" />
          {notice}
          <button
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            ×
          </button>
        </div>
      )}
      {loading ? (
        <div className="loading-state" role="status">
          Loading your workspace…
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
          <Overview properties={properties} />
          {properties.some(
            (property) =>
              property.nextOpenHouse &&
              new Date(property.nextOpenHouse) >= new Date(),
          ) && <NextOpenHouse properties={properties} />}
          <PreparationOverview properties={properties} />
          <div className="prototype-notice">
            <Info size={16} aria-hidden="true" />
            <p>
              <strong>Your private property workspace.</strong> Changes are
              stored in PostgreSQL. Photos and document references are
              accessible only to your signed-in account. Visitor access and
              publishing come later.
            </p>
          </div>
        </>
      )}
    </>
  );
}
