import { BASELINE_SECTIONS } from "@/lib/properties/baseline-fields";
export function BaselineFacts({
  answers,
}: {
  answers?: Record<string, string>;
}) {
  if (!answers) return null;
  const sections = BASELINE_SECTIONS.map((section) => ({
    ...section,
    answered: section.fields.filter((field) => answers[field.key]?.trim()),
  })).filter((section) => section.answered.length);
  if (!sections.length) return null;
  return (
    <div className="baseline-facts">
      <h3>Additional property information</h3>
      <p>
        Realtor-entered baseline answers. Verify facts before any future public
        use.
      </p>
      {sections.map((section) => (
        <details className="baseline-section" key={section.id}>
          <summary>
            {section.title}
            <span className="baseline-count">{section.category}</span>
          </summary>
          <dl>
            {section.answered.map((field) => (
              <div key={field.key}>
                <dt>{field.label}</dt>
                <dd>{answers[field.key]}</dd>
              </div>
            ))}
          </dl>
        </details>
      ))}
    </div>
  );
}
