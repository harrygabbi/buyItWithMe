"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, LoaderCircle, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  FIELDS,
  applicable,
  type ManagedProperty,
  type Fact,
  type Category,
  type Verification,
} from "@/lib/managed/fields";
import { draftSchema, completeness } from "@/lib/managed/validation";
import { api } from "@/lib/managed/client";
import { AmenityManager } from "./amenity-manager";
import { ReadinessRing } from "@/components/properties/readiness-ring";
import {
  RoomManager,
  PhotoManager,
  DocumentManager,
} from "./resource-managers";
const tabs = [
  "Core",
  "Essential",
  "Enrichment",
  "Rooms",
  "Photos",
  "Documents",
] as const;
export function PropertyEditor({ id }: { id?: string }) {
  const router = useRouter();
  const [property, setProperty] = useState<ManagedProperty | null>(null);
  const [facts, setFacts] = useState<Record<string, Fact>>({});
  const [tab, setTab] = useState<(typeof tabs)[number]>("Core");
  const [loading, setLoading] = useState(!!id);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const form = useRef<HTMLFormElement>(null);
  const load = useCallback(async () => {
    if (!id) return;
    try {
      const data = await api<ManagedProperty>(`/api/properties/${id}`);
      setProperty(data);
      setFacts(data.facts);
      setDirty(false);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [id]);
  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load]);
  useEffect(() => {
    if (!dirty) return;
    const before = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    const click = (event: MouseEvent) => {
      const link = (event.target as Element).closest("a");
      if (
        link &&
        link.origin === location.origin &&
        link.href !== location.href &&
        !window.confirm("Leave this page and discard unsaved property changes?")
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    const leave = (event: Event) => {
      if (!confirm("Discard unsaved property changes?")) event.preventDefault();
    };
    window.addEventListener("openhouse:before-leave", leave);
    window.addEventListener("beforeunload", before);
    document.addEventListener("click", click, true);
    return () => {
      window.removeEventListener("openhouse:before-leave", leave);
      window.removeEventListener("beforeunload", before);
      document.removeEventListener("click", click, true);
    };
  }, [dirty]);
  const counts = completeness(
    facts,
    property?.media.length || 0,
    property?.rooms.length || 0,
    property?.amenities.filter(
      (a) =>
        a.verification !== "Unknown" && a.verification !== "Not applicable",
    ).length || 0,
  );
  function selectTab(next: typeof tab) {
    if (
      next === tab ||
      window.dispatchEvent(
        new Event("openhouse:before-section", { cancelable: true }),
      )
    )
      setTab(next);
  }
  function change(key: string, value: Fact["value"]) {
    setDirty(true);
    setMessage("");
    setFacts((previous) => ({
      ...previous,
      [key]: {
        value,
        verification: value === null ? "Unknown" : "Realtor-provided",
        source: "",
        updatedAt: previous[key]?.updatedAt,
      },
    }));
    setErrors((previous) => ({ ...previous, [key]: "" }));
  }
  function metadata(key: string, patch: Partial<Fact>) {
    setDirty(true);
    setMessage("");
    setFacts((previous) => {
      const current = previous[key] || {
        value: null,
        verification: "Unknown",
        source: "",
      };
      return {
        ...previous,
        [key]: {
          ...current,
          ...patch,
          ...(patch.verification === "Unknown" ||
          patch.verification === "Not applicable"
            ? { value: null, source: "" }
            : {}),
        },
      };
    });
  }
  async function save(event?: React.FormEvent) {
    event?.preventDefault();
    if (saving) return;
    setError("");
    setMessage("");
    const payload = { facts, revision: property?.revision };
    const result = draftSchema.safeParse(payload);
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues)
        errors[String(issue.path[1])] = issue.message;
      setErrors(errors);
      const field = FIELDS.find((f) => errors[f.key]);
      if (field) setTab(field.category);
      setError(
        "Correct the invalid values. Missing fields may be left blank for a draft.",
      );
      setTimeout(
        () =>
          form.current
            ?.querySelector<HTMLElement>('[aria-invalid="true"]')
            ?.focus(),
        0,
      );
      return;
    }
    setSaving(true);
    try {
      const saved = await api<ManagedProperty>(
        property ? `/api/properties/${property.id}` : "/api/properties",
        { method: property ? "PATCH" : "POST", body: JSON.stringify(payload) },
      );
      setProperty(saved);
      setFacts(saved.facts);
      setDirty(false);
      setMessage("Saved to the database.");
      if (!id) router.replace(`/properties/${saved.id}/edit`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }
  async function archive() {
    if (!property || dirty) return;
    setSaving(true);
    try {
      const saved = await api<ManagedProperty>(
        `/api/properties/${property.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            revision: property.revision,
            facts: {},
            status: property.status === "Archived" ? "Draft" : "Archived",
          }),
        },
      );
      setProperty(saved);
      setMessage(
        saved.status === "Archived"
          ? "Property archived."
          : "Property restored.",
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }
  function resourceSaved(saved: ManagedProperty) {
    setProperty(saved);
    setMessage("Saved to the database.");
  }
  if (loading)
    return (
      <div className="loading-state" role="status">
        Loading your property…
      </div>
    );
  if (id && !property)
    return (
      <div className="storage-error" role="alert">
        <div>
          <h2>Property unavailable</h2>
          <p>{error}</p>
          <Button onClick={() => void load()} variant="outline">
            Try again
          </Button>
          <Link className="back-link" href="/dashboard">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  return (
    <>
      <Link className="back-link" href="/dashboard">
        <ArrowLeft size={16} />
        Back to dashboard
      </Link>
      <header className="page-heading">
        <div>
          <h1>{property ? "Edit property" : "Create property"}</h1>
          <p>Build a reliable property profile, one section at a time.</p>
        </div>
        <span className="draft-indicator">
          {property?.status || "Unsaved draft"}
        </span>
      </header>
      <section className="completion-grid" aria-label="Property completeness">
        {(["Core", "Essential", "Enrichment"] as Category[]).map((category) => (
          <Card className="completion-card" key={category}>
            <ReadinessRing
              percentage={counts[category].percentage}
              complete={counts[category].missing.length === 0}
              state={
                category === "Core" && counts.Core.missing.length === 0
                  ? "published"
                  : "draft"
              }
              size={56}
              label={`${category} completeness`}
            />
            <div>
              <strong>{category}</strong>
              <p>
                {counts[category].completed} / {counts[category].total}{" "}
                completed
              </p>
              <small>
                {category === "Core"
                  ? "Controls readiness"
                  : "Optional information"}
              </small>
            </div>
          </Card>
        ))}
      </section>
      <div
        className="editor-tabs"
        role="tablist"
        aria-label="Property editor sections"
      >
        {tabs.map((name) => (
          <button
            id={`tab-${name}`}
            aria-controls={`panel-${name}`}
            role="tab"
            aria-selected={tab === name}
            tabIndex={tab === name ? 0 : -1}
            key={name}
            onClick={() => selectTab(name)}
            onKeyDown={(event) => {
              const index = tabs.indexOf(name);
              let next = index;
              if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
              else if (event.key === "ArrowLeft")
                next = (index + tabs.length - 1) % tabs.length;
              else return;
              event.preventDefault();
              selectTab(tabs[next]);
              document.getElementById(`tab-${tabs[next]}`)?.focus();
            }}
          >
            {name}
            {name === "Photos" && property ? ` (${property.media.length})` : ""}
          </button>
        ))}
      </div>
      {error && (
        <div className="form-failure" role="alert">
          {error}
          {error.includes("another session") && (
            <Button
              variant="outline"
              onClick={() => {
                if (
                  !dirty ||
                  confirm(
                    "Discard unsaved changes and reload the latest saved property?",
                  )
                )
                  void load();
              }}
            >
              Reload latest
            </Button>
          )}
        </div>
      )}
      {message && (
        <div className="success-notice" role="status">
          <Check size={18} />
          {message}
        </div>
      )}
      <form ref={form} onSubmit={save} noValidate>
        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          {(["Core", "Essential", "Enrichment"] as string[]).includes(tab) ? (
            <>
              <div className="editor-category-note">
                <Info size={16} />
                <p>
                  {tab === "Core"
                    ? "Save a draft with any amount of information. Missing Core fields block readiness, not saving. Lot size is required for detached houses and duplexes."
                    : "These fields add context and do not block readiness. Not-applicable optional fields are excluded from completeness."}{" "}
                  Values start as realtor-provided. Mark Verified only when you
                  have a source.
                </p>
              </div>
              {Array.from(
                new Set(
                  FIELDS.filter((field) => field.category === tab).map(
                    (field) => field.group,
                  ),
                ),
              ).map((group) => (
                <Card className="form-card" key={group}>
                  <div className="form-section-title">
                    <h2>{group}</h2>
                  </div>
                  <div className="form-grid">
                    {FIELDS.filter(
                      (field) =>
                        field.category === tab &&
                        field.group === group &&
                        applicable(field, facts),
                    ).map((field) => {
                      const fact = facts[field.key] || {
                        value: null,
                        verification: "Unknown",
                        source: "",
                      };
                      const blank = fact.value === null;
                      const attrs = {
                        id: field.key,
                        name: field.key,
                        disabled: saving,
                        "aria-invalid": !!errors[field.key],
                        "aria-describedby": errors[field.key]
                          ? `error-${field.key}`
                          : undefined,
                      };
                      return (
                        <div
                          className={`form-field managed-field ${field.kind === "textarea" ? "wide" : ""}`}
                          key={field.key}
                        >
                          <label htmlFor={field.key}>
                            {field.label}
                            {field.required ? <span> *</span> : null}
                          </label>
                          {field.kind === "boolean" ? (
                            <select
                              className="field"
                              {...attrs}
                              value={blank ? "" : String(fact.value)}
                              onChange={(event) =>
                                change(
                                  field.key,
                                  event.target.value === ""
                                    ? null
                                    : event.target.value === "true",
                                )
                              }
                            >
                              <option value="">Unknown</option>
                              <option value="true">Yes</option>
                              <option value="false">No</option>
                            </select>
                          ) : field.kind === "select" ? (
                            <select
                              className="field"
                              {...attrs}
                              value={String(fact.value ?? "")}
                              onChange={(event) =>
                                change(field.key, event.target.value || null)
                              }
                            >
                              <option value="">Unknown / not added</option>
                              {field.options?.map((option) => (
                                <option key={option}>{option}</option>
                              ))}
                            </select>
                          ) : field.kind === "textarea" ? (
                            <textarea
                              className="field"
                              {...attrs}
                              rows={3}
                              maxLength={10000}
                              value={String(fact.value ?? "")}
                              onChange={(event) =>
                                change(field.key, event.target.value || null)
                              }
                            />
                          ) : (
                            <input
                              className="field"
                              {...attrs}
                              type={field.kind}
                              min={field.min}
                              max={field.max}
                              step={field.integer ? "1" : "any"}
                              maxLength={
                                field.kind === "text" ? 10000 : undefined
                              }
                              value={String(fact.value ?? "")}
                              onChange={(event) =>
                                change(
                                  field.key,
                                  event.target.value === ""
                                    ? null
                                    : field.kind === "number"
                                      ? Number(event.target.value)
                                      : event.target.value,
                                )
                              }
                            />
                          )}
                          {errors[field.key] && (
                            <p
                              className="field-error"
                              id={`error-${field.key}`}
                            >
                              {errors[field.key]}
                            </p>
                          )}
                          <details className="fact-metadata">
                            <summary>
                              {fact.verification}
                              {fact.updatedAt
                                ? ` · Updated ${new Date(fact.updatedAt).toLocaleDateString()}`
                                : ""}
                            </summary>
                            <label htmlFor={`verification-${field.key}`}>
                              Verification for {field.label}
                            </label>
                            <select
                              className="field"
                              id={`verification-${field.key}`}
                              value={fact.verification}
                              disabled={saving}
                              onChange={(event) =>
                                metadata(field.key, {
                                  verification: event.target
                                    .value as Verification,
                                })
                              }
                            >
                              {[
                                "Unknown",
                                "Realtor-provided",
                                "Verified",
                                ...(field.required ? [] : ["Not applicable"]),
                              ].map((state) => (
                                <option key={state}>{state}</option>
                              ))}
                            </select>
                            <label htmlFor={`source-${field.key}`}>
                              Source reference for {field.label}
                            </label>
                            <input
                              className="field"
                              id={`source-${field.key}`}
                              value={fact.source}
                              maxLength={1000}
                              disabled={saving}
                              onChange={(event) =>
                                metadata(field.key, {
                                  source: event.target.value,
                                })
                              }
                            />
                            <small>
                              Verified requires a source. Enter public
                              references, not sensitive information.
                            </small>
                          </details>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </>
          ) : !property ? (
            <Card className="empty-state">
              <h2>Save your draft first</h2>
              <p>
                Photos, rooms, and document references need a saved property.
                You can save an empty draft.
              </p>
              <Button type="button" onClick={() => void save()}>
                Save empty draft
              </Button>
            </Card>
          ) : dirty ? (
            <Card className="empty-state">
              <h2>Save your field changes first</h2>
              <p>
                Save the property before managing {tab.toLowerCase()} so your
                changes stay in sync.
              </p>
              <Button type="button" onClick={() => void save()}>
                Save changes
              </Button>
            </Card>
          ) : tab === "Rooms" ? (
            <RoomManager property={property} onSaved={resourceSaved} />
          ) : tab === "Photos" ? (
            <PhotoManager property={property} onSaved={resourceSaved} />
          ) : (
            <DocumentManager property={property} onSaved={resourceSaved} />
          )}
        </div>
        {tab === "Enrichment" && property && (
          <AmenityManager
            property={property}
            onSaved={resourceSaved}
            disabled={dirty}
          />
        )}
        <div className="form-actions">
          <div>
            <span className="save-status" role="status">
              {saving
                ? "Saving…"
                : dirty
                  ? "Unsaved changes"
                  : property
                    ? "Property fields saved"
                    : "Not yet saved"}
            </span>
            {property && (
              <small className="saved-date">
                Last saved {new Date(property.updatedAt).toLocaleString()}
              </small>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                if (!dirty || confirm("Discard unsaved changes?"))
                  router.push("/dashboard");
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <LoaderCircle className="animate-spin" /> : <Save />}
              {saving ? "Saving…" : "Save Draft"}
            </Button>
          </div>
        </div>
      </form>
      <Card className="required-summary">
        <h2>
          {counts.Core.missing.length
            ? "Missing Core requirements"
            : "Core requirements complete"}
        </h2>
        {counts.Core.missing.length ? (
          <ul>
            {counts.Core.missing.map((field) => (
              <li key={field.key}>
                <button
                  type="button"
                  onClick={() => {
                    if (field.key === "photos") setTab("Photos");
                    else {
                      setTab("Core");
                      setTimeout(
                        () => document.getElementById(field.key)?.focus(),
                        0,
                      );
                    }
                  }}
                >
                  {field.label}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>
            Ready for future publication. Saving never publishes a property.
          </p>
        )}
        {property && (
          <Button
            type="button"
            variant="ghost"
            disabled={dirty || saving}
            onClick={() => void archive()}
          >
            {property.status === "Archived"
              ? "Restore property"
              : "Archive property"}
          </Button>
        )}
      </Card>
    </>
  );
}
