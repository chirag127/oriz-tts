---
name: p5js
description: "p5.js sketches: gen art, shaders, interactive, 3D."
version: 1.0.0
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [creative-coding, generative-art, p5js, canvas, interactive, visualization, webgl, shaders, animation]
    related_skills: [ascii-video, manim-video, excalidraw]
license: MIT
---

> Ported from Hermes-Agent (Nous Research) 2026-07-08.

# p5.js Production Pipeline

## When to use
p5.js sketches, creative coding, gen art, interactive viz, canvas animation, shader effects, data viz.

## Creative Standard
Canvas = medium, algorithm = brush. Articulate concept before code. First-render must be striking — no tutorial defaults. Combine/layer/invent beyond references. Deliver more than asked: emergent behavior, trailing echoes, palette-shifted depth. Dense, layered, cohesive — never flat backgrounds, always compositional hierarchy, intentional color, micro-detail.

## Modes → References
| Mode | Reference |
|---|---|
| Generative art / Image proc | `references/visual-effects.md` |
| Data viz / Interactive / Audio-reactive | `references/interaction.md` |
| Animation | `references/animation.md` |
| 3D scene | `references/webgl-and-3d.md` |

## Stack
Single self-contained HTML. p5.js 1.11.3 default. 2.x for `async setup()`, OKLCH, `splineVertex()`, shader `.modify()`, p5.brush. Optional: p5.sound, p5.js-svg, CCapture.js, Puppeteer, p5.grain.

## Pipeline
`CONCEPT → DESIGN → CODE → PREVIEW → EXPORT → VERIFY`. Code structure: globals → `preload` → `setup` → `draw` → helpers → classes → events.

## Per-Project Rules
Never defaults. Custom palette (3-7 colors), custom stroke weight vocabulary (0.5/1-2/3-5), textured/gradient/layered bg, motion variety (primary 1x, secondary 0.3x, ambient 0.1x), one invented element.

Parameters expose algorithm character: quantities, scales, rates, thresholds, ratios. Every parameter changes how algorithm *thinks*, not just looks.

## Critical Implementation
- **Disable FES** — `p5.disableFriendlyErrors = true;` before setup. 10x speedup. `pixelDensity(1)`. Hot loops: `Math.sin/sqrt/random/min` faster than p5 wrappers. Never `console.log()` or DOM in `draw()`.
- **Seeded randomness always** — `randomSeed(CONFIG.seed); noiseSeed(CONFIG.seed);` Never `Math.random()` for visuals.
- **fxhash/Art Blocks** — replace PRNG with `$fx.hash`, `$fx.rand`. See `references/export-pipeline.md` § Platform.
- **HSB color** — `colorMode(HSB, 360, 100, 100, 100);` Never hardcode RGB.
- **Multi-octave noise (fbm)** — raw noise = blobs. Layer 4 octaves. Domain warping for organic flow.
- **createGraphics() layers** — bg + fg + trails offscreen buffers.
- **Vectorize** — `ellipse()` slow; `beginShape(POINTS)` fast; `loadPixels/updatePixels` fastest for 50K+ particles.
- **WebGL** — origin center; Y inverted; `translate(-width/2,-height/2)` for P2D coords; `push/pop` every transform; `texture()` before `rect/plane`.
- **Keys** — `s`=PNG, `g`=GIF, `r`=reseed, space=pause.
- **Headless export** — `noLoop()` + `window._p5Ready = true`. `scripts/export-frames.js` calls `redraw()` per capture. Multi-scene: one HTML per scene, `ffmpeg -f concat`.

## Export
| Format | Method |
|---|---|
| PNG | `saveCanvas('output','png')` |
| High-res PNG | `node scripts/export-frames.js sketch.html --width 3840 --height 2160 --frames 1` |
| GIF | `saveGif('output', 5)` |
| MP4 | `bash scripts/render.sh sketch.html output.mp4 --duration 30 --fps 30` |
| SVG | `createCanvas(w,h,SVG)` + p5.js-svg |

## Templates
Interactive gen art with seed nav/sliders/download: start from `templates/viewer.html`. Simple sketches/video export: bare HTML. Instance mode required for multi-sketch pages or framework embed.

## Performance Targets
60fps interactive, 30fps export, 5-10K particles (shapes), 50-100K (pixel buffer), up to 3840x2160, <100KB HTML, <2s first frame.

## Creative Divergence (only when user requests experimental)
- **Conceptual Blending** — two visual systems, map correspondences, unify
- **SCAMPER** — substitute/combine/adapt/modify/purpose/eliminate/reverse a known pattern
- **Distance Association** — close/medium/far associations from concept; develop medium

## References (load on demand)
`core-api.md`, `shapes-and-geometry.md`, `visual-effects.md`, `animation.md`, `typography.md`, `color-systems.md`, `webgl-and-3d.md`, `interaction.md`, `export-pipeline.md`, `troubleshooting.md`.

Note: original Hermes doc used `skill_view(name="p5js", file_path=...)` — Hermes-runtime-only tool. Outside Hermes, Read reference files directly.
