"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowLeft, Circle, Info, LoaderCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { PROPERTY_TYPES, type Property } from "@/types/property";
import { propertySchema } from "@/lib/validation/property";
import { getReadiness } from "@/lib/properties/readiness";
import { ReadinessRing } from "./readiness-ring";
import { BaselineQuestionnaire } from "./baseline-questionnaire";
import { browserRepository } from "@/lib/properties/repository";
type Values = Record<string, string>;
const requiredFields = [
  {
    name: "address",
    label: "Property address",
    placeholder: "e.g. 2847 Cedar Crescent, Vancouver, BC",
    type: "text",
    wide: true,
  },
  {
    name: "propertyType",
    label: "Property type",
    placeholder: "Choose a property type",
    type: "select",
  },
  {
    name: "askingPrice",
    label: "Asking price",
    placeholder: "e.g. 1250000",
    type: "number",
    unit: "CAD",
    min: 1,
    step: "any",
  },
  {
    name: "bedrooms",
    label: "Bedrooms",
    placeholder: "e.g. 3",
    type: "number",
    min: 0,
    step: "1",
  },
  {
    name: "bathrooms",
    label: "Bathrooms",
    placeholder: "e.g. 2.5",
    type: "number",
    min: 0,
    step: "0.5",
  },
  {
    name: "squareFeet",
    label: "Finished interior square footage",
    placeholder: "e.g. 1850",
    type: "number",
    unit: "sq ft",
    min: 1,
    step: "any",
    wide: true,
  },
];
const optionalFields = [
  {
    name: "listingNumber",
    label: "MLS / listing number",
    placeholder: "e.g. R2948721",
    type: "text",
  },
  {
    name: "lotSize",
    label: "Lot size",
    placeholder: "e.g. 6100",
    type: "number",
    unit: "sq ft",
    min: 1,
    step: "any",
  },
  {
    name: "yearBuilt",
    label: "Year built",
    placeholder: "e.g. 2018",
    type: "number",
    min: 1600,
    step: "1",
  },
  {
    name: "description",
    label: "Short description",
    placeholder: "What makes this property feel like home?",
    type: "textarea",
    wide: true,
  },
];
export function PropertyForm({ property }: { property?: Property }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<Values>(() =>
    Object.fromEntries(
      [...requiredFields, ...optionalFields].map((f) => [
        f.name,
        String(property?.[f.name as keyof Property] ?? ""),
      ]),
    ),
  );
  const [baselineAnswers, setBaselineAnswers] = useState<
    Record<string, string>
  >(property?.baselineAnswers || {});
  const [baselineErrors, setBaselineErrors] = useState<Record<string, string>>(
    {},
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState("");
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [dirty, setDirty] = useState(false);
  const parsed = propertySchema.partial().safeParse(values);
  const draft = Object.fromEntries(
    Object.entries(values).map(([key, value]) => [
      key,
      ["askingPrice", "bedrooms", "bathrooms", "squareFeet"].includes(key)
        ? value === ""
          ? undefined
          : Number(value)
        : value,
    ]),
  );
  const readiness = getReadiness(
    parsed.success ? parsed.data : (draft as Partial<Property>),
  );
  function validateField(name: string, value: string) {
    const key = name as keyof typeof propertySchema.shape;
    const result = propertySchema.shape[key].safeParse(value);
    setErrors((previous) => ({
      ...previous,
      [name]: result.success ? "" : result.error.issues[0].message,
    }));
  }
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (saving) return;
    setFailure("");
    const result = propertySchema.safeParse({
      ...values,
      baselineAnswers: Object.fromEntries(
        Object.entries(baselineAnswers).filter(([, value]) => value.trim()),
      ),
    });
    if (!result.success) {
      const nextErrors: Record<string, string> = {};
      const nextBaselineErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0] === "baselineAnswers") {
          nextBaselineErrors[String(issue.path[1])] = issue.message;
          return;
        }
        const key = String(issue.path[0]);
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      });
      setErrors(nextErrors);
      setBaselineErrors(nextBaselineErrors);
      setTimeout(() => {
        const first = formRef.current?.querySelector<HTMLElement>(
          '[aria-invalid="true"]',
        );
        let details = first?.closest("details");
        while (details) {
          details.open = true;
          details = details.parentElement?.closest("details") || null;
        }
        first?.focus();
      }, 0);
      return;
    }
    setSaving(true);
    try {
      const now = new Date().toISOString();
      browserRepository().save({
        ...property,
        ...result.data,
        id: property?.id ?? crypto.randomUUID(),
        createdAt: property?.createdAt ?? now,
        updatedAt: now,
        published: false,
        isDemo: property?.isDemo ?? false,
      });
      try {
        sessionStorage.setItem(
          "openhouse-ai.notice",
          property
            ? "Property changes saved as a draft."
            : "Property draft saved. You’re one step closer.",
        );
      } catch {
        /* Saving properties does not depend on transient feedback storage. */
      }
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setFailure(
        e instanceof Error
          ? e.message
          : "Your property could not be saved. Try again.",
      );
      setSaving(false);
    }
  }
  function field(
    field: (typeof requiredFields)[number] | (typeof optionalFields)[number],
    required = false,
  ) {
    const { name, label, placeholder, type } = field;
    const error = errors[name];
    const attrs = {
      id: name,
      name,
      value: values[name],
      disabled: saving,
      "aria-invalid": !!error,
      "aria-describedby": error
        ? `${name}-error`
        : name === "askingPrice"
          ? "price-hint"
          : undefined,
      onChange: (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
      ) => {
        setValues((v) => ({ ...v, [name]: e.target.value }));
        setDirty(true);
        if (errors[name]) validateField(name, e.target.value);
      },
      onBlur: () => validateField(name, values[name]),
    };
    return (
      <div
        key={name}
        className={`form-field ${"wide" in field && field.wide ? "wide" : ""}`}
      >
        <label htmlFor={name}>
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
        {type === "select" ? (
          <select className="field" {...attrs} aria-required={required}>
            <option value="">{placeholder}</option>
            {PROPERTY_TYPES.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        ) : type === "textarea" ? (
          <textarea
            className="field"
            rows={4}
            maxLength={1500}
            placeholder={placeholder}
            {...attrs}
          />
        ) : (
          <div className="input-unit">
            {name === "askingPrice" && (
              <span className="currency-prefix" aria-hidden="true">
                $
              </span>
            )}
            <Input
              type={type}
              inputMode={type === "number" ? "decimal" : undefined}
              min={"min" in field ? field.min : undefined}
              step={"step" in field ? field.step : undefined}
              placeholder={placeholder}
              {...attrs}
              aria-required={required}
            />
            {"unit" in field && <span>{field.unit}</span>}
          </div>
        )}
        {name === "askingPrice" && (
          <small id="price-hint">Enter the price in Canadian dollars.</small>
        )}
        {error && (
          <p className="field-error" id={`${name}-error`}>
            {error}
          </p>
        )}
      </div>
    );
  }
  return (
    <div className="form-page">
      <Link className="back-link" href="/dashboard">
        <ArrowLeft size={16} aria-hidden="true" />
        Back to dashboard
      </Link>
      <header className="page-heading form-heading">
        <div>
          <h1>{property ? "Edit property" : "Add a property"}</h1>
          <p>Start with the essentials. You can come back to the details.</p>
        </div>
        <span className="draft-indicator">
          <Circle size={8} fill="currentColor" aria-hidden="true" />
          Draft property
        </span>
      </header>
      <div className="form-layout">
        <form ref={formRef} noValidate onSubmit={save}>
          <Card className="form-card">
            <div className="form-section-title">
              <div>
                <h2>Required basics</h2>
                <p>These six Core fields are required to save this property.</p>
              </div>
              <span className="required-label">* Required</span>
            </div>
            <div className="form-grid">
              {requiredFields.map((f) => field(f, true))}
            </div>
          </Card>
          <Card className="form-card">
            <div className="form-section-title">
              <div>
                <h2>Listing details (optional)</h2>
                <p>Optional details that help tell the property’s story.</p>
              </div>
            </div>
            <div className="form-grid">
              {optionalFields.map((f) => field(f))}
            </div>
          </Card>
          <BaselineQuestionnaire
            answers={baselineAnswers}
            onChange={(answers) => {
              setBaselineAnswers(answers);
              setDirty(true);
            }}
            errors={baselineErrors}
            onError={(key, error) =>
              setBaselineErrors((previous) => ({ ...previous, [key]: error }))
            }
            disabled={saving}
          />
          {failure && (
            <div className="form-failure toast toast-error" role="alert">
              {failure} Your input is still here.
            </div>
          )}
          <div className="form-actions">
            {cancelConfirm ? (
              <div className="cancel-confirm">
                <p>Discard your unsaved changes?</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCancelConfirm(false)}
                >
                  Keep editing
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                >
                  Discard changes
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="ghost"
                disabled={saving}
                onClick={() =>
                  dirty ? setCancelConfirm(true) : router.push("/dashboard")
                }
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={saving}>
              {saving ? (
                <LoaderCircle className="animate-spin" aria-hidden="true" />
              ) : (
                <Save aria-hidden="true" />
              )}
              {saving ? "Saving draft…" : "Save Draft"}
            </Button>
          </div>
        </form>
        <aside className="form-aside" aria-label="Property preparation">
          <Card className="readiness-card">
            <ReadinessRing
              percentage={readiness.percentage}
              complete={readiness.isReady}
              state={readiness.isReady ? "ready" : "draft"}
              size={64}
              label="Form Core readiness"
            />
            <div className="form-readiness-copy">
              <h2>
                {readiness.isReady
                  ? "Your Core details are complete"
                  : "A strong foundation, one detail at a time."}
              </h2>
              <p>
                {readiness.missing.length
                  ? `Missing: ${readiness.missing.map((f) => f.label.toLowerCase()).join(", ")}.`
                  : "Save your draft when you’re ready."}{" "}
                Readiness tracks the six required fields above. Additional
                baseline answers are optional. Publishing comes in a later
                milestone.
              </p>
            </div>
          </Card>
          <div className="form-storage-note">
            <Info size={17} aria-hidden="true" />
            <p>
              Saved only in this browser. Prototype storage is not secure or
              shared across devices. Don’t enter sensitive information.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
