import type { CSSProperties } from "react";
import { Check } from "lucide-react";
export function ReadinessRing({
  percentage,
  complete = false,
  state = "draft",
  size = 48,
  label = "Core readiness",
}: {
  percentage: number;
  complete?: boolean;
  state?: "draft" | "ready" | "published";
  size?: number;
  label?: string;
}) {
  const value = Math.max(0, Math.min(100, percentage));
  return (
    <span
      className={`readiness-ring ${state} ${size > 60 ? "ring-large" : ""}`}
      style={
        { width: size, height: size, "--ring-progress": value } as CSSProperties
      }
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-valuetext={`${value}%${complete ? ", all required Core fields complete" : ""}`}
    >
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle className="ring-track" cx="24" cy="24" r="21" />
        <circle
          className="ring-value"
          cx="24"
          cy="24"
          r="21"
          pathLength="100"
          strokeDasharray={`${value} 100`}
        />
      </svg>
      <span className="ring-center" aria-hidden="true">
        {value}%{complete && <Check className="ring-check" strokeWidth={2.5} />}
      </span>
    </span>
  );
}
