---
name: ascii-video
description: "ASCII video: convert video/audio to colored ASCII MP4/GIF."
platforms: [linux, macos, windows]
license: MIT
---

# ASCII Video Production Pipeline

*Ported from Hermes-Agent (Nous Research) 2026-07-08. See `README.md`.*

## When to use

ASCII video, text-art video, terminal-style video, character animation, retro text viz, ASCII audio visualizer, video→ASCII, matrix effects.

## Modes

Video-to-ASCII (video→ASCII recreation, `inputs.md` §Video), audio-reactive (audio→generative viz, `inputs.md` §Audio), generative (seed→procedural, `effects.md`), hybrid (video+audio→reactive overlays), lyrics/text (audio+SRT→timed text FX, `inputs.md` §Text), TTS narration (text→ElevenLabs narrated quotes, `inputs.md` §TTS).

## Stack

Single self-contained Python script per project. No GPU. Python 3.10+, NumPy, SciPy (FFT/beats), Pillow (font/I/O), ffmpeg CLI, concurrent.futures, ElevenLabs (optional TTS), OpenCV (optional).

## Creative standard

Visual art. ASCII = medium, cinema = standard. Articulate concept BEFORE code: mood, story, what makes THIS different. First-render excellence — no revision rounds. Generic = wrong.

Catalogs = starting vocabulary. Combine, modify, invent. Include ≥1 visual moment user didn't ask for. Cohesive aesthetic > technical correctness. Unifying language across scenes. Never flat black. Always multi-grid. Always intentional color.

## Pipeline

`INPUT → ANALYZE → SCENE_FN → TONEMAP → SHADE → ENCODE`

INPUT loads source. ANALYZE extracts per-frame features (audio bands, luminance, motion). SCENE_FN renders `uint8 H,W,3` via `_render_vf()` + blend modes (`composition.md`). TONEMAP applies percentile adaptive brightness. SHADE runs `ShaderChain` + `FeedbackBuffer` (`shaders.md`). ENCODE pipes RGB → ffmpeg (H.264/GIF).

## Creative direction

Vary per scene: palette, color strategy (HSV/OKLAB/discrete/harmony), background, effects, particles, shader mood, grid density (xs 8px → xxl 40px), coord space (Cartesian/polar/fisheye/Möbius/warped), feedback, masking, transitions. Never one config for whole video. Invent ≥1 per project (custom palette/effect/color/particle chars/transition).

## Workflow

1. **Vision** — mood, arc, color world, texture, uniqueness.
2. **Design** — mode, resolution (1920x1080 default / 1080x1920 portrait / 1080x1080 square @ 24fps), hardware profile (`optimization.md`), section→scene map, format (MP4/GIF 640x360@15/PNG).
3. **Build** — single Python file: hardware detect, input loader, feature analyzer, multi-density grid+bitmap cache (`architecture.md`), palettes, color system, scene fns (`scenes.md`), tonemap, shader pipeline, scene table, N-worker encoder, main.
4. **Verify** — test frames at key timestamps first. `canvas.mean() > 8`. Coherence. Concept match.

## Critical implementation notes

**Brightness** — #1 issue. Never `canvas * N` (clips). Adaptive tonemap:

```python
def tonemap(canvas, gamma=0.75):
    f = canvas.astype(np.float32)
    lo, hi = np.percentile(f[::4, ::4], [1, 99.5])
    if hi - lo < 10: hi = lo + 10
    f = np.clip((f - lo) / (hi - lo), 0, 1) ** gamma
    return (f * 255).astype(np.uint8)
```

Per-scene gamma: default 0.75, solarize 0.55, posterize 0.50, bright 0.85. `screen` blend (not `overlay`) for dark layers.

**Font cell height** — macOS Pillow `textbbox()` wrong. Use `font.getmetrics()`: `cell_height = ascent + descent`.

**ffmpeg deadlock** — never `stderr=subprocess.PIPE` with long-running ffmpeg (64KB buffer). Redirect to file.

**Font compat** — validate palette chars render at init (not all Unicode in all fonts).

**Per-clip architecture** — segmented videos → separate clip files → parallel + selective re-render (`scenes.md`).

## Performance (per frame)

Feature 1-5ms, effect 2-15ms, character render 80-150ms (bottleneck), shader 5-25ms, total ~100-200ms.

## References

See `references/` — architecture, composition, effects, shaders, scenes, inputs, optimization, troubleshooting.

## Creative divergence (experimental requests)

**Forced Connections** ("organic", "industrial"): pick unrelated domain (weather/microbio/architecture/fluid/textile) → list visual elements (erosion=gradual reveal, mitosis=splitting) → map to chars.

**Conceptual Blending** (user names two): map correspondences (crests=high notes, foam=staccato) → blend selectively → develop emergent properties.

**Oblique Strategies** ("surprise me"): draw one (Honor thy error / Use old idea / Emphasize flaws / Turn upside down / Only a part / Reverse) → apply before code.
