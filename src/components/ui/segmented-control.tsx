"use client";
import { useRef } from "react";
export function SegmentedControl({
  options,
  value,
  onChange,
  label,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  return (
    <div
      className="segmented-control"
      role="radiogroup"
      aria-label={label}
      style={{ gridTemplateColumns: `repeat(${options.length},minmax(0,1fr))` }}
    >
      <span
        className="segmented-indicator"
        aria-hidden="true"
        style={{
          transform: `translateX(${index * 100}%)`,
          width: `calc((100% - 8px) / ${options.length})`,
        }}
      />
      {options.map((option, i) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          tabIndex={i === index ? 0 : -1}
          ref={(node) => {
            refs.current[i] = node;
          }}
          onClick={() => onChange(option.value)}
          onKeyDown={(event) => {
            let next = i;
            if (event.key === "ArrowRight" || event.key === "ArrowDown")
              next = (i + 1) % options.length;
            else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
              next = (i - 1 + options.length) % options.length;
            else if (event.key === "Home") next = 0;
            else if (event.key === "End") next = options.length - 1;
            else return;
            event.preventDefault();
            onChange(options[next].value);
            refs.current[next]?.focus();
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
