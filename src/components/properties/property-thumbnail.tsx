import { useId } from "react";
import type { Property } from "@/types/property";
// Architectural illustrations, not photos of the listing. Type and ID determine a stable appearance.
export function PropertyThumbnail({
  property,
}: {
  property: Partial<Property>;
}) {
  const id = useId().replace(/:/g, "");
  const type = property.propertyType || "Other";
  const seed =
    Array.from(property.id || property.address || type).reduce(
      (sum, c) => sum + c.charCodeAt(0),
      0,
    ) % 3;
  const sky = "var(--illustration-sky)";
  const wall = "var(--illustration-wall)";
  const side = "var(--illustration-side)";
  const windowColor = "var(--illustration-light)";
  const windows = (xs: number[], ys: number[]) =>
    xs.flatMap((x) =>
      ys.map((y) => (
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width="9"
          height="13"
          rx="1"
          fill={windowColor}
          opacity=".8"
        />
      )),
    );
  return (
    <svg
      className={`architectural-illustration tone-${seed}`}
      viewBox="0 0 160 140"
      role="img"
      aria-label={`${type} architectural illustration`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`sky-${id}`} x2="0" y2="1">
          <stop stopColor={sky} />
          <stop offset="1" stopColor="var(--illustration-floor)" />
        </linearGradient>
        <linearGradient id={`wall-${id}`} x2="1" y2="1">
          <stop stopColor={wall} />
          <stop offset="1" stopColor={side} />
        </linearGradient>
      </defs>
      <rect width="160" height="140" fill={`url(#sky-${id})`} />
      <circle
        cx="125"
        cy="31"
        r="14"
        fill="var(--illustration-light)"
        opacity=".5"
      />
      <ellipse cx="80" cy="120" rx="63" ry="8" fill={side} opacity=".14" />
      {type === "Condo" ? (
        <>
          <path d="M49 33h46v84H49z" fill={`url(#wall-${id})`} />
          <path d="m95 33 19 11v73H95z" fill={side} />
          <path d="m45 32 46-10 25 13-21 4z" fill={side} />
          {windows([58, 77], [45, 67, 89])}
          <path d="M72 104h12v13H72" fill={side} />
        </>
      ) : type === "Townhouse" ? (
        <>
          {[29, 65, 101].map((x, i) => (
            <g key={x}>
              <path d={`M${x} 64h32v52h-32z`} fill={i === 1 ? side : wall} />
              <path
                d={`m${x - 3} 64 19-24 19 24z`}
                fill={i === 1 ? wall : side}
              />
              {windows([x + 6, x + 19], [75])}
              <rect
                x={x + 11}
                y="97"
                width="11"
                height="19"
                rx="1"
                fill="var(--illustration-light)"
                opacity=".7"
              />
            </g>
          ))}
        </>
      ) : type === "Duplex" ? (
        <>
          <path d="M32 64h96v52H32z" fill={`url(#wall-${id})`} />
          <path d="m24 65 32-30 24 25 24-25 32 30z" fill={side} />
          {windows([43, 64, 86, 107], [76])}
          <path
            d="M55 97h13v19H55zm39 0h13v19H94"
            fill="var(--illustration-light)"
            opacity=".7"
          />
          <path d="M80 66v50" stroke="var(--illustration-light)" opacity=".5" />
        </>
      ) : type === "Detached house" ? (
        <>
          <path d="M35 68h65v48H35z" fill={`url(#wall-${id})`} />
          <path d="m100 68 23 11v37h-23z" fill={side} />
          <path d="m26 69 40-35 43 35z" fill={side} />
          <path d="m65 34 43 9 24 36-23-10z" fill={wall} />
          {windows([45, 78], [80])}
          <rect
            x="61"
            y="93"
            width="13"
            height="23"
            rx="1"
            fill="var(--illustration-light)"
            opacity=".8"
          />
          <rect x="85" y="37" width="9" height="20" rx="1" fill={side} />
        </>
      ) : (
        <>
          <path d="M31 71h59v45H31z" fill={`url(#wall-${id})`} />
          <path d="M90 53h37v63H90z" fill={side} />
          <path d="M27 65h67v7H27zm58-18h46v7H85z" fill={wall} />
          {windows([42, 64], [82])}
          {windows([100, 114], [64, 86])}
          <path
            d="M69 101h12v15H69"
            fill="var(--illustration-light)"
            opacity=".7"
          />
        </>
      )}
      <path d="M22 117h116" stroke={side} strokeWidth="1" opacity=".6" />
      <path
        d="M22 116v-19m-7 10 7-16 7 16"
        stroke={side}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        opacity=".55"
      />
    </svg>
  );
}
