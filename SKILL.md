---
name: inmotus-design-system
description: Apply InMotus theme, icons, components and animated interaction feedback to an app while honoring its stack and requested exclusions.
---

# InMotus Design System

Use this skill when the user asks to apply InMotus Design System or selected parts of it to a project. The files in this repository are the source. Read only the layers relevant to the request:

- Visual theme: [`tokens/inmotus.css`](tokens/inmotus.css). `tokens/inmotus.tokens.json` is a generated color export for tools that accept DTCG tokens.
- Optional dependency-free CSS components: [`components/inmotus.css`](components/inmotus.css).
- Navigation, overlays, motion and responsive behavior: [`patterns/interface.md`](patterns/interface.md).
- Animated feedback for buttons, navigation capsules, segments, switches and popups: [`patterns/feedback.md`](patterns/feedback.md), with reusable CSS and JS in `motion/`. Read when applying the full system, components or interaction patterns. Preserve the measured elastic edges, inflation and grow-on-press behavior instead of substituting generic shrink or slide animations.
- Icon set, semantic choices, sizes and accessibility: [`patterns/iconography.md`](patterns/iconography.md). Read when the user selects InMotus icons or asks for a close visual match; Hugeicons Free Stroke Rounded is preferred for that match, but remains optional.
- Setup and versioning: [`README.md`](README.md).

Before editing the destination, inspect its framework, styling system, dependencies, existing visual conventions, and the user's explicit selections. A request to use InMotus without layer exclusions includes its standard animated feedback on applicable controls. Explicit selections and exclusions override this default; a palette-only request does not add behaviors. If the user wants another visual design, do not import InMotus theme tokens or component styles; interface patterns and feedback can still be adapted. If the user rejects a library, implement the selected behavior with acceptable existing tools or native platform primitives. Do not add product features, routes, or branding that the destination does not need.

Treat the destination project's requirements and the user's choices as authoritative. Choose the smallest integration that fits its architecture. For a web project, CSS tokens can be imported directly or mapped to its theme system; for another platform, translate the values and patterns into native constructs. Preserve accessibility, keyboard behavior and safe areas. Feedback uses the documented full profile by default; honor a project's system/off choice. Keep route and decorative motion responsive to reduced-motion preferences. Use the feedback preview to verify initial state, rapid reversal, resize and popup exit behavior.

Record the design-system version used by the destination (for example, `v0.4.0`) and summarize which layers were adopted, changed, or skipped. If the user specifies a tag, use files from that tag. Do not update an existing app to a newer version unless requested.
