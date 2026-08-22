---
name: baoyu-infographic
description: "Infographics: 21 layouts x 21 styles (信息图, 可视化)."
version: 1.56.1
author: 宝玉 (JimLiu)
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [infographic, visual-summary, creative, image-generation]
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-infographic
---

# Infographic Generator

Ported from Hermes-Agent (Nous Research) 2026-07-08. Upstream: [baoyu-skills](https://github.com/JimLiu/baoyu-skills) v1.56.1. Two dimensions: **layout** (structure) × **style** (aesthetics). Any layout × any style.

## Trigger
User asks for infographic, visual summary, "信息图", "可视化", "高密度信息大图". Input: content (text/file/URL/topic), optional layout/style/aspect/language.

## Options
| Option | Values |
|---|---|
| Layout | 21 (default: `bento-grid`) |
| Style | 21 (default: `craft-handmade`) |
| Aspect | landscape (16:9), portrait (9:16), square (1:1), or custom W:H |
| Language | en, zh, ja, ... |

## Layouts (21)
`linear-progression` (timelines/steps), `binary-comparison` (A vs B), `comparison-matrix` (multi-factor), `hierarchical-layers` (pyramids), `tree-branching` (taxonomies), `hub-spoke` (central concept), `structural-breakdown` (exploded views), `bento-grid` (overview, default), `iceberg` (surface/hidden), `bridge` (problem/solution), `funnel` (conversion), `isometric-map` (spatial), `dashboard` (KPIs), `periodic-table` (collections), `comic-strip` (narratives), `story-mountain` (arcs), `jigsaw` (interconnected), `venn-diagram` (overlap), `winding-roadmap` (journey), `circular-flow` (cycles), `dense-modules` (high-density). Defs: `references/layouts/<layout>.md`.

## Styles (21)
`craft-handmade` (default, paper craft), `claymation` (3D clay), `kawaii` (pastels), `storybook-watercolor`, `chalkboard`, `cyberpunk-neon`, `bold-graphic` (halftone), `aged-academia` (sepia), `corporate-memphis` (flat vector), `technical-schematic` (blueprint), `origami`, `pixel-art`, `ui-wireframe`, `subway-map`, `ikea-manual`, `knolling`, `lego-brick`, `pop-laboratory` (grid+coords), `morandi-journal` (doodle+Morandi), `retro-pop-grid` (70s Swiss), `hand-drawn-edu` (macaron+stick). Defs: `references/styles/<style>.md`.

## Recommended combos
Timeline→`linear-progression`+`craft-handmade`. Steps→`linear-progression`+`ikea-manual`. A vs B→`binary-comparison`+`corporate-memphis`. Hierarchy→`hierarchical-layers`+`craft-handmade`. Overlap→`venn-diagram`+`craft-handmade`. Conversion→`funnel`+`corporate-memphis`. Cycles→`circular-flow`+`craft-handmade`. Technical→`structural-breakdown`+`technical-schematic`. Metrics→`dashboard`+`corporate-memphis`. Educational→`bento-grid`+`chalkboard`. Journey→`winding-roadmap`+`storybook-watercolor`. Categories→`periodic-table`+`bold-graphic`. Product guide→`dense-modules`+`morandi-journal`. Tech guide→`dense-modules`+`pop-laboratory`. Trendy guide→`dense-modules`+`retro-pop-grid`. Edu diagram→`hub-spoke`+`hand-drawn-edu`. Process tutorial→`linear-progression`+`hand-drawn-edu`.

## Keyword shortcuts
Auto-select layout on match; skip content-based inference. Append Prompt Notes to Step 5.
| Keyword | Layout | Styles (rec) | Aspect | Prompt Notes |
|---|---|---|---|---|
| 高密度信息大图 / high-density-info | `dense-modules` | `morandi-journal`, `pop-laboratory`, `retro-pop-grid` | portrait | — |
| 信息图 / infographic | `bento-grid` | `craft-handmade` | landscape | Minimalist: clean canvas, whitespace, no complex textures. Simple cartoon icons only. |

## Output
```
infographic/{slug}/
├── source-{slug}.{ext}
├── analysis.md
├── structured-content.md
├── prompts/infographic.md
└── infographic.png
```
Slug: 2-4 kebab words. Conflict → append `-YYYYMMDD-HHMMSS`. Same backup rule for `source.md`, `analysis.md`, `prompts/infographic.md`.

## Core principles
Preserve source data verbatim — no summarization. Strip credentials/keys/tokens before any output. Define learning objectives first. One concept per section.

## Workflow
**1. Analyze** — Load `references/analysis-framework.md`. Save source→`source.md`. Extract topic/type/complexity/tone/audience, detect languages, capture user design instructions. Save→`analysis.md`.
**2. Structure** — Save `structured-content.md`: title, objectives, sections (concept + verbatim content + visual + labels), data points exact, design instructions. Markdown only. No new info.
**3. Recommend** — Match keyword shortcut first. Else infer 3-5 layout×style combos from data structure, tone, audience, user instructions.
**4. Confirm** — Use `clarify` (one Q at a time). Q1: combo. Q2: aspect. Q3: language (only if source ≠ user lang).
**5. Prompt** — Load `references/layouts/<layout>.md`, `references/styles/<style>.md`, `references/base-prompt.md`. Assemble with structured content. `{{ASPECT_RATIO}}`: landscape→`16:9`, portrait→`9:16`, square→`1:1`, custom→as-is. Save→`prompts/infographic.md`.
**6. Image** — `image_generate` tool with assembled prompt. Map: `16:9`→landscape, `9:16`→portrait, `1:1`→square, custom→nearest named. Retry once on failure.
**7. Report** — topic, layout, style, aspect, language, output path, files.

> Hermes-runtime tools: `clarify`, `image_generate`, `write_file`, `read_file`. Outside Hermes, substitute equivalents (e.g. AskUserQuestion for `clarify`; any image-gen MCP for `image_generate`; Read/Write for file ops).

## References
`references/analysis-framework.md`, `references/structured-content-template.md`, `references/base-prompt.md`, `references/layouts/<layout>.md` (21), `references/styles/<style>.md` (21).

## Pitfalls
Data integrity absolute — "73% increase" stays "73% increase". Strip secrets always. One concept per section. Style consistent across whole image. Custom aspect ratios map to nearest named preset for `image_generate`.
