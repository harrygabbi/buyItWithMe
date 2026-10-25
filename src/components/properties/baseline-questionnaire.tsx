"use client";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  BASELINE_SECTIONS,
  BASELINE_ROADMAP,
  type BaselineField,
} from "@/lib/properties/baseline-fields";
import { validateBaselineAnswer } from "@/lib/validation/baseline";
export function BaselineQuestionnaire({
  answers,
  onChange,
  errors,
  onError,
  disabled,
}: {
  answers: Record<string, string>;
  onChange: (answers: Record<string, string>) => void;
  errors: Record<string, string>;
  onError: (key: string, error: string) => void;
  disabled: boolean;
}) {
  function renderField(field: BaselineField) {
    const value = answers[field.key] || "";
    const id = `baseline-${field.key}`;
    const error = errors[field.key];
    const attrs = {
      id,
      name: `baselineAnswers.${field.key}`,
      value,
      disabled,
      "aria-invalid": !!error,
      "aria-describedby":
        [field.hint ? `${id}-hint` : "", error ? `${id}-error` : ""]
          .filter(Boolean)
          .join(" ") || undefined,
      onBlur: () =>
        onError(field.key, validateBaselineAnswer(field.key, value) || ""),
      onChange: (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
      ) => {
        onChange({ ...answers, [field.key]: e.target.value });
        if (error)
          onError(
            field.key,
            validateBaselineAnswer(field.key, e.target.value) || "",
          );
      },
    };
    return (
      <div
        className={`form-field ${field.kind === "textarea" ? "wide" : ""}`}
        key={field.key}
      >
        <label htmlFor={id}>{field.label}</label>
        {field.kind === "select" ? (
          <select className="field" {...attrs}>
            <option value="">Not added</option>
            {field.options?.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        ) : field.kind === "textarea" ? (
          <textarea className="field" rows={3} maxLength={3000} {...attrs} />
        ) : (
          <Input
            type={field.kind}
            min={field.min}
            step={field.step}
            maxLength={field.kind === "text" ? 3000 : undefined}
            {...attrs}
          />
        )}
        {field.hint && <small id={`${id}-hint`}>{field.hint}</small>}
        {error && (
          <p className="field-error" id={`${id}-error`}>
            {error}
          </p>
        )}
      </div>
    );
  }
  return (
    <>
      {(["Core", "Essential", "Enrichment"] as const).map((category) => {
        const sections = BASELINE_SECTIONS.filter(
          (section) => section.category === category,
        );
        const count = sections.reduce(
          (sum, section) =>
            sum + section.fields.filter((f) => answers[f.key]?.trim()).length,
          0,
        );
        return (
          <Card className="baseline-category" key={category}>
            <details open={category === "Core" ? true : undefined}>
              <summary className="baseline-category-summary">
                <div>
                  <span className="eyebrow">
                    {category === "Enrichment"
                      ? "NEIGHBORHOOD CONTEXT"
                      : `${category.toUpperCase()} INFORMATION`}
                  </span>
                  <h2>
                    {category === "Core"
                      ? "More about the property"
                      : category === "Essential"
                        ? "The details behind the home"
                        : "Beyond the front door"}
                  </h2>
                  <p>
                    {category === "Core"
                      ? "Optional facts from your Core baseline questions."
                      : category === "Essential"
                        ? "Room-by-room details, systems, condition, and costs."
                        : "Manually verified neighborhood information. No live lookup or maps."}
                  </p>
                </div>
                <span className="baseline-count">
                  {count} added
                  <ChevronDown size={16} aria-hidden="true" />
                </span>
              </summary>
              <div className="baseline-groups">
                {sections.map((section) => (
                  <details className="baseline-section" key={section.id}>
                    <summary>
                      <span>{section.title}</span>
                      <span className="baseline-count">
                        {
                          section.fields.filter((f) => answers[f.key]?.trim())
                            .length
                        }{" "}
                        / {section.fields.length}
                        <ChevronDown size={15} aria-hidden="true" />
                      </span>
                    </summary>
                    <div className="baseline-section-body">
                      <div className="form-grid">
                        {section.fields.map(renderField)}
                      </div>
                      {section.planned.length > 0 && (
                        <div className="baseline-planned">
                          {section.planned.map((item) => (
                            <p key={item.label}>
                              <strong>{item.label}</strong>
                              <span>{item.description}</span>
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            </details>
          </Card>
        );
      })}
      <Card className="baseline-category">
        <details>
          <summary className="baseline-category-summary">
            <div>
              <span className="eyebrow">LATER MILESTONES</span>
              <h2>Visitor experience and automation</h2>
              <p>
                Planned capabilities from the Enrichment baseline. These
                features are not available yet.
              </p>
            </div>
            <ChevronDown size={16} aria-hidden="true" />
          </summary>
          <div className="baseline-roadmap">
            {BASELINE_ROADMAP.map((group) => (
              <div key={group.title}>
                <h3>{group.title}</h3>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>
      </Card>
    </>
  );
}
