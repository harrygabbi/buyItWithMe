# OpenHouse AI design direction

The audience is a realtor preparing property information before an open house. The daily decision is: which property needs attention, and which visit is next? This is a web application; Apple foundations guide clarity and interaction, while the implementation preserves web keyboard and browser conventions.

## Review and direction

The earlier dashboard repeated status information in a pipeline chart, used small square controls, and gave generic photos more attention than readiness. The redesign removes that duplicate chart, decorative eyebrows, and the sidebar promotion. The defining element is now a readiness ring beside actionable, real missing-field hints.

Regular layout: sidebar | sticky context bar → title/action → four metrics → next open house → filters → property table.

Compact layout: navigation bar → title/action → 2×2 metrics → next open house → search/segmented filter → property cards. The navigation opens as a native modal dialog with a backdrop and focus containment.

## Tokens and measured contrast

| Role                       | Color                  | Contrast             |
| -------------------------- | ---------------------- | -------------------- |
| Workspace                  | `#F5F5F7`              | Background           |
| Surface                    | `#FFFFFF`              | Background           |
| Main text                  | `#1D1D1F`              | 15.46:1 on workspace |
| Secondary text             | `#6E6E73`              | 5.07:1 on white      |
| Primary action / published | `#087F5B`              | 5.00:1 with white    |
| Draft                      | `#68686D` on `#F0F0F2` | 4.87:1               |
| Ready                      | `#946315` on `#FBF2DF` | 4.65:1               |

The brief's brighter emerald would not support white, small button text at WCAG AA. The deeper action token preserves the emerald identity while meeting contrast. Tertiary gray is reserved for decoration; meaningful captions use the secondary token.

Cards use 24px radii, controls 12px, and pills full rounding. Surface borders and layered shadows are quiet. Frosted materials are confined to navigation and sticky action surfaces. All colors, including architectural illustration palettes, have named CSS tokens. Light appearance is complete; dark appearance is deferred.

Typography uses the requested Apple/system stack. Inter is loaded and self-hosted by `next/font/google` as the non-Apple fallback. Page titles are 30–32px equivalent, section titles 17–18px, body text 14–15px, and data captions 11–12px. The SVG ring and muted pills use numerical/text alternatives to color. Prices, percentages, counts, and dates use tabular numerals.

CSS supplies brief card arrivals, ring drawing, segmented selection movement, and gentle button presses. Reduced motion removes these; reduced transparency removes blur. No animation library was added.

## Guidance applied

- `accessibility.md › Vision`: “Convey information with more than color alone.” Readiness has a percentage, a completed check, and missing-field text; statuses have readable names.
- `materials.md › Liquid Glass`: “Don’t use Liquid Glass in the content layer.” Property cards and forms are opaque; only navigation and sticky actions use blur.
- `motion.md › Best practices`: “Make motion optional.” Nonessential motion is disabled with `prefers-reduced-motion`.
- `layout.md › Best practices`: “Use progressive disclosure to make layouts cleaner and easier to interact with.” The duplicate pipeline and sidebar promotion were removed.
- `text-fields.md › Best practices`: “Ensure that tabbing between multiple fields flows as people expect.” DOM order matches the form, labels persist, errors identify the first invalid field.

Dashboard-designer informed the four original real-data metrics, top-level summary and property drill-down. No historical comparisons or targets were fabricated. Frontend-dashboard's clarity and low-dependency guidance applies; its embedded Go-specific repository constraints do not apply to this Next.js project.

## Verification and limits

Browser checks cover the requested 375, 768, 1024, and 1440px breakpoints (including no horizontal overflow), segmented control click/arrow-key behavior, modal drawer Escape dismissal, required-field errors, and live form readiness reaching 100%. An isolated production preview on port 3100 also verified creating a valid draft, success feedback, persistence after refresh, and editing the asking price; the main port-3000 workspace was unchanged. Automated property tests cover persistence, validation, empty storage, malformed storage, readiness, filters, and sorting. Full VoiceOver and physical-device testing remain manual checks.
