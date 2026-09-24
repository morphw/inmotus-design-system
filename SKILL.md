---
name: inmotus-design-system
description: Apply selected InMotus theme, iconography, components or interface patterns to an app while honoring its stack and any requested exclusions.
---

# InMotus Design System

Use this skill when the user asks to apply InMotus Design System or selected parts of it to a project. The files in this repository are the source. Read only the layers relevant to the request:

- Visual theme: [`tokens/inmotus.css`](tokens/inmotus.css). `tokens/inmotus.tokens.json` is a generated color export for tools that accept DTCG tokens.
- Optional dependency-free CSS components: [`components/inmotus.css`](components/inmotus.css).
- Navigation, overlays, motion and responsive behavior: [`patterns/interface.md`](patterns/interface.md).
- Icon set, semantic choices, sizes and accessibility: [`patterns/iconography.md`](patterns/iconography.md). Read when the user selects InMotus icons or asks for a close visual match; Hugeicons Free Stroke Rounded is preferred for that match, but remains optional.
- Setup and versioning: [`README.md`](README.md).

Before editing the destination, inspect its framework, styling system, dependencies, existing visual conventions, and the user's explicit selections. Apply only requested layers. If the user wants another visual design, do not import InMotus theme tokens or component styles; interface patterns can still be adapted. If the user rejects a library, implement the selected behavior with acceptable existing tools or native platform primitives. Do not add product features, routes, or branding that the destination does not need.

Treat the destination project's requirements and the user's choices as authoritative. Choose the smallest integration that fits its architecture. For a web project, CSS tokens can be imported directly or mapped to its theme system; for another platform, translate the values and patterns into native constructs. Preserve accessibility, keyboard behavior, safe areas, and reduced-motion preferences.

Record the design-system version used by the destination (for example, `v0.3.0`) and summarize which layers were adopted, changed, or skipped. If the user specifies a tag, use files from that tag. Do not update an existing app to a newer version unless requested.
