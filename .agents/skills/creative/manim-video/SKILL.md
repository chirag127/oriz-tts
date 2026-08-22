---
name: manim-video
description: "Manim CE animations: 3Blue1Brown-style math/algo/concept videos with full pipeline (plan → code → render → stitch → audio)."
version: 1.0.0
platforms: [linux, macos, windows]
license: MIT
---

<!-- Ported from Hermes-Agent (Nous Research) 2026-07-08. Compacted from 270 lines. -->

# Manim Video Pipeline

## When to use
Animated explainers, math animations, concept viz, algo walkthroughs, 3B1B-style videos, equation derivations, architecture diagrams, data stories, paper explainers, 3D viz.

## Creative standard
Educational cinema. Every frame teaches.
- Narrative arc BEFORE code: misconception → aha moment.
- Geometry before algebra. Shape first, equation second.
- First-render clean — no "AI slides" look.
- Opacity layers: primary 1.0, contextual 0.4, structural (axes/grid) 0.15.
- `self.wait()` after every animation. 2s pause after key reveal never wasted.
- Cohesive palette + typography across scenes.

## Prerequisites
`scripts/setup.sh` verifies. Needs: Python 3.10+, Manim CE v0.20+ (`pip install manim`), LaTeX (`texlive-full`/`mactex`), ffmpeg.

## Pipeline
`PLAN → CODE → RENDER → STITCH → AUDIO (opt) → REVIEW`

1. **PLAN** — `plan.md`: narrative arc, scene list, palette, voiceover.
2. **CODE** — `script.py`: one class per scene, independently renderable.
3. **RENDER** — `manim -ql script.py Scene1 …` draft; `-qh` production.
4. **STITCH** — ffmpeg concat → `final.mp4`.
5. **AUDIO** — voiceover/music via ffmpeg. See `references/rendering.md`.
6. **REVIEW** — preview stills, verify vs plan.

## Palettes (BG / primary / secondary / accent)
- Classic 3B1B: `#1C1C1C` / `#58C4DD` / `#83C167` / `#FFFF00`
- Warm academic: `#2D2B55` / `#FF6B6B` / `#FFD93D` / `#6BCB77`
- Neon tech: `#0A0A0A` / `#00F5FF` / `#FF00FF` / `#39FF14`
- Monochrome: `#1A1A2E` / `#EAEAEA` / `#888888` / `#FFFFFF`

## Timing + typography
Title 1.5s+wait 1.0s. Equation 2.0s+2.0s. Transform 1.5s+1.5s. Label 0.8s+0.5s. Aha 2.5s+3.0s.
Fonts: Title 48 / Heading 36 / Body 30 / Label 24 / Caption 20. Min 18.
**Monospace only** — Pango kerning breaks with proportional. Define `MONO = "Menlo"` once. `MathTex` for math (LaTeX).

## Per-scene variation
Different dominant color, layout, animation entry (Write/FadeIn/GrowFromCenter/Create), visual density. Never identical.

## Code pattern
```python
from manim import *
BG, PRIMARY, MONO = "#1C1C1C", "#58C4DD", "Menlo"

class Scene1_Intro(Scene):
    def construct(self):
        self.camera.background_color = BG
        title = Text("Why?", font_size=48, color=PRIMARY, weight=BOLD, font=MONO)
        self.add_subcaption("Why?", duration=2)
        self.play(Write(title), run_time=1.5); self.wait(1.0)
        self.play(FadeOut(title), run_time=0.5)
```
Every scene: subtitles via `add_subcaption`, set `background_color`, FadeOut all at end (`FadeOut(Group(*self.mobjects))`).

## Gotchas
- Raw strings for LaTeX: `MathTex(r"\frac{1}{2}")`.
- `.to_edge(DOWN, buff=0.5)` — never < 0.5.
- Text swap: `ReplacementTransform(a, b)`, not `Write(b)` on top.
- `Create`/`Write` adds; then use `.animate` on it.

## Render quality
`-ql` 854x480@15 (iterate). `-qm` 1280x720@30. `-qh` 1920x1080@60 (final only).

## References
`animations.md` `mobjects.md` `visual-design.md` `equations.md` `graphs-and-data.md` `camera-and-3d.md` `scene-planning.md` `rendering.md` `troubleshooting.md` `animation-design-thinking.md` `updaters-and-trackers.md` `paper-explainer.md` `decorations.md` `production-quality.md`.
Modes → reference map: concept/paper → `scene-planning.md`+`paper-explainer.md`; equation → `equations.md`; algo/data → `graphs-and-data.md`; architecture → `mobjects.md`; 3D → `camera-and-3d.md`.

## Creative divergence (only on explicit request)
**SCAMPER**: Substitute metaphor / Combine approaches / Reverse (derive backward) / Modify (10x a param) / Eliminate notation. **Assumption Reversal**: list standard assumptions (left-right, 2D, discrete, formal), pick fundamental, reverse, explore what it reveals.
