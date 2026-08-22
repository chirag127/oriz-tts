---
name: pretext
description: "Use when building creative browser demos with @chenglou/pretext — DOM-free text layout for ASCII art, typographic flow around obstacles, text-as-geometry games, kinetic typography, and text-powered generative art. Produces single-file HTML demos by default."
version: 1.0.0
author: Hermes Agent (ported)
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [creative-coding, typography, pretext, ascii-art, canvas, generative, text-layout, kinetic-typography]
    related_skills: [Codex-design, excalidraw, ascii-art]
---

# Pretext Creative Demos

> Ported from Hermes-Agent (Nous Research) 2026-07-08.

## Overview
[`@chenglou/pretext`](https://github.com/chenglou/pretext) — 15KB zero-dep TS by Cheng Lou. DOM-free multiline measure: `(text, font, width)` → line breaks, per-line widths, per-grapheme positions, height. Canvas measure, no reflow. Creative primitive: reflow paragraphs around moving sprite @60fps, word-brick games, ASCII logos through prose, per-glyph shatter, shrink-wrap UI. Corpus: `pretext.cool`, `chenglou.me/pretext`.

## When to Use
Text-as-X, text around moving shape, ASCII with real words (not monospace), games with text bricks, kinetic typography per-glyph, shrink-wrap UI. Not for: static CSS pages; rich text editors; image→text (use `ascii-art`/`ascii-video`); pure canvas art (use p5js).

## Creative Standard
Templates = starting point. Dark bg + warm cores + committed palette (amber-on-black / cold-white-on-charcoal / desaturated pastels). Proportional fonts (Iowan Old Style, Inter, JetBrains Mono, variable — never default sans). Real corpus, no lorem. First-paint excellence.

## Stack
Single self-contained HTML. Canvas 2D + `Intl.Segmenter` + raw DOM events. Import via `esm.sh` pinned (`unpkg` serves raw TS):
```html
<script type="module">
import { prepare, layout, prepareWithSegments, layoutWithLines,
  layoutNextLineRange, materializeLineRange, measureLineStats, walkLineRanges }
  from "https://esm.sh/@chenglou/pretext@0.0.6";
</script>
```

## Two Use Cases
**1. Measure, CSS/DOM renders.** `prepare(text,"16px Inter")` → `layout(p,320,20)` → `{height,lineCount}`. Virtualized lists, masonry, fit checks. `ctx.font` MUST match CSS exactly.
**2. Measure + render yourself.** `prepareWithSegments` → `layoutWithLines` → own drawing (canvas/SVG/WebGL, per-glyph transforms). Variable-width-per-line (text around shape/donut/non-rect) — the viral pattern:
```js
let cursor = { segmentIndex: 0, graphemeIndex: 0 };
while (true) {
  const range = layoutNextLineRange(prepared, cursor, widthAtY(y));
  if (!range) break;
  const line = materializeLineRange(prepared, range);
  ctx.fillText(line.text, leftEdgeAtY(y), y);
  cursor = range.end; y += lineHeight;
}
```
Helpers: `measureLineStats` (shrink-wrap width), `walkLineRanges` (no-alloc iter), `@chenglou/pretext/rich-inline` (mixed fonts/chips).

## Patterns
- **Reflow around obstacle / ASCII typography / multi-column** — `layoutNextLineRange` + per-row width fn (or measured spans, or shared cursor).
- **Text-as-geometry game** — `layoutWithLines` + collision rects.
- **Kinetic type** — `layoutWithLines` + per-line time transform.
- **Shatter/particles** — `walkLineRanges` → (x,y) → physics.
- **Shrink-wrap** — `measureLineStats`.

Templates: `hello-orb-flow.html` (reflow-around-obstacle starter), `donut-orbit.html` (ASCII logo obstacles, draggable wire sphere/cube, morphing shapes). Deep-dive: `references/patterns.md`.

## Workflow & Performance
Pick pattern → template → swap real prose (10-100 sentences) → tune font/palette/composition/interaction (THIS is the work) → verify `python3 -m http.server 8765` → show file path.

`prepare*` expensive — module-scope cache, once per text+font. Resize → `layout*` only. `layoutNextLineRange` tight loop is 60fps-safe. ASCII masks: `Uint8Array` cell buffer → derive spans → merge → feed. Couple visual + layout animation (same tween value) or demo looks painted-on. Fades: layer opacity (sprite on own canvas + CSS opacity), not glyph intensity — else geometry appears to shrink. `ctx.font` once per frame.

## Pitfalls
1. CSS/canvas font drift — web font 404 → 5-20% drift. Preload.
2. Re-preparing in loop kills perf.
3. Missing `Intl.Segmenter` — `"é".split("")`=2. Use `granularity:"grapheme"`.
4. `break:'never'` chips need `extraWidth` else chip chrome overflows.
5. `unpkg` raw TS — use `esm.sh`.
6. Monospace fallback silently kills the point — verify in DevTools.
7. Skip rows vs shrink width — too-narrow corridor → `y += lineHeight; continue;`, not tiny maxWidth (broken one-grapheme lines).
8. Cold demo — add vignette, scanline, idle motion, one interactive response.

## Verify
Single `.html`; `esm.sh` pinned; real prose; canvas font = CSS; `prepare*` once; dark bg + palette; interactive OR idle motion; zero console errors; 60fps; one unasked-for detail.

## Community Demos
[pretext.cool](https://www.pretext.cool/) — Pretext Breaker, Tetris×Pretext, Dragon animation, Somnai editorial engine, Bad Apple!! ASCII, drag-sprite reflow, Alarmy clock. Playground: [chenglou.me/pretext](https://chenglou.me/pretext/).
