---
name: sketch
description: "Throwaway HTML mockups: 2-3 design variants to compare."
version: 1.0.0
author: Hermes Agent (adapted from gsd-build/get-shit-done)
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [sketch, mockup, design, ui, prototype, html, variants, exploration, wireframe, comparison]
    related_skills: [spike, Codex-design, popular-web-designs, excalidraw]
---

# Sketch

Ported from Hermes-Agent (Nous Research) 2026-07-08.

Use when user wants to see a direction before committing. Generate 2-3 disposable HTML variants for side-by-side comparison. Not shippable code. Triggers: "sketch this screen", "show me what X could look like", "compare A vs B", "2-3 takes", "mockup before I build".

**Don't use for:** production component or polished one-off (`Codex-design`), diagram (`excalidraw`, `architecture-diagram`), locked design (just build). If `gsd-sketch` sibling installed, prefer it — full state/MANIFEST/audits.

## Method: `intake → variants → head-to-head → pick`

### 1. Intake (skip if given)

One question at a time: **Feel** (adjectives, "*calm, editorial, like Linear*" > "minimal"), **References** (real apps/sites), **Core action** (single most important thing on screen).

### 2. Variants (2-3, never 1, rarely 4+)

Each = complete standalone HTML. Different **stance**, not pixel tweaks. Axes: density (compact/airy/dense), emphasis (content/action/tool-first), aesthetic (editorial/utilitarian/playful), layout (single-col/sidebar/split), grounding (card/bare/document). Pick one axis, pull apart. Accent-color-only variants = wasted.

Naming by stance: `sketches/001-calm-editorial/`, `001-utilitarian-dense/`, `001-playful-split/` — each has `index.html` + `README.md`.

### 3. Real HTML

Single self-contained file: inline `<style>`, system fonts or one Google Font, Tailwind CDN OK. Realistic fake content (real sentences/names, no Lorem ipsum). **Interactive**: clickable, hover states, ≥1 transition. Frozen static < sloppy animated.

**Verify visually.** Hermes tools `browser_navigate` / `browser_vision` — outside Hermes, use Playwright, Chrome DevTools MCP, or manual open. Catches silent failures (font import, collapsed flex).

Default reset:

```html
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    -webkit-font-smoothing: antialiased; color: #1a1a1a; background: #fafafa; line-height: 1.5; }
</style>
```

### 4. Variant README + head-to-head

Per variant: stance name, one-sentence principle, key choices (layout/type/color/interaction), trade-offs, best for.

Then comparison table (density, primary-action visibility, scan-ability, feel). **Opinionate** — name the take, call the weakest. User picks / hybridizes / another round.

## Theming

Shared identity? `sketches/themes/tokens.css`, `@import` in each variant. Three colors + one font. Don't over-tokenize throwaways.

## Interactivity bar

Enough when user can: click primary action → visible change, see one state transition (filter/toggle/panel), hover affordances. More = over-engineering. Less = screenshot.

## Frontier mode

Sketches exist + "what next?": propose 2-4 named candidates from consistency gaps, unsketched screens, uncovered states (empty/loading/error/1000-items), responsive gaps, interaction patterns.

## Output

Dir `sketches/` (or `.planning/sketches/` for GSD). Open: `open` (mac), `xdg-open` (linux), `start` (win). Disposable — worth preserving = promote to real code. Tool names differ per host: `terminal`→Bash, `write_file`→Write, `browser_navigate`→Playwright/DevTools MCP.

## Attribution

GSD `/gsd-sketch` — MIT © 2025 Lex Christopherson ([gsd-build/get-shit-done](https://github.com/gsd-build/get-shit-done)). Full: `npx get-shit-done-cc --hermes --global`.
