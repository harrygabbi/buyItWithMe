import { z } from "zod";
import { BASELINE_FIELDS } from "@/lib/properties/baseline-fields";
const fields = new Map(BASELINE_FIELDS.map((field) => [field.key, field]));
export function validateBaselineAnswer(
  key: string,
  value: string,
): string | undefined {
  const field = fields.get(key);
  if (!field) return "This question is not recognized.";
  if (value.length > 3000) return "Use 3,000 characters or fewer.";
  if (!value.trim()) return;
  if (field.kind === "select" && !field.options?.includes(value))
    return "Choose an option from the list.";
  if (field.kind === "number") {
    const number = Number(value);
    if (!Number.isFinite(number) || number < 0 || number > 1_000_000_000)
      return "Enter a number between 0 and 1 billion.";
    if (field.step === "1" && !Number.isInteger(number))
      return "Use a whole number.";
  }
  if (field.kind === "date" && !z.iso.date().safeParse(value).success)
    return "Enter a valid date.";
}
export const baselineAnswersSchema = z
  .record(
    z.string(),
    z.string().trim().max(3000, "Use 3,000 characters or fewer."),
  )
  .superRefine((answers, ctx) => {
    for (const [key, value] of Object.entries(answers)) {
      const error = validateBaselineAnswer(key, value);
      if (error) ctx.addIssue({ code: "custom", message: error, path: [key] });
    }
  });
