"use client";
import { useCallback, useEffect, useState } from "react";
import type { Property } from "@/types/property";
import type { ManagedProperty } from "@/lib/managed/fields";
import { api } from "@/lib/managed/client";
import { dashboardProperty } from "@/lib/managed/adapter";
export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    try {
      setProperties(
        (await api<ManagedProperty[]>("/api/properties")).map(
          dashboardProperty,
        ),
      );
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => void reload(), 0);
    const focus = () => void reload();
    window.addEventListener("focus", focus);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("focus", focus);
    };
  }, [reload]);
  return { properties, loading, error, reload };
}
