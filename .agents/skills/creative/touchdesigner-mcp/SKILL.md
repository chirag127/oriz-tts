---
name: touchdesigner-mcp
description: "Control running TouchDesigner via twozero MCP — create operators, set parameters, wire connections, execute Python, build real-time visuals. 36 native tools."
version: 1.1.0
author: kshitijk4poor
license: MIT
platforms: [linux, macos, windows]
---

# TouchDesigner (twozero MCP)

> Ported from Hermes-Agent (Nous Research) 2026-07-08. `${HERMES_HOME}` setup path adapted; `scripts/setup.sh` may need host tweaks.

## CRITICAL RULES

1. Never guess params — `td_get_par_info` FIRST. Training data wrong for TD 2025.32.
2. On `tdAttributeError` STOP → `td_get_operator_info` on failing node.
3. No hardcoded paths in callbacks. Use `me.parent()` / `scriptOp.parent()`.
4. Native tools > `td_execute_python`. Python only for complex multi-step.
5. `td_get_hints` before building.

## Architecture & Setup

`Agent → MCP (Streamable HTTP) → twozero.tox (port 40404) → TD Python`. 36 tools. Free plugin (April 2026). Context-aware. Health: `GET localhost:40404/mcp`.

`scripts/setup.sh` — checks TD, downloads twozero.tox, registers MCP, tests 40404. Manual: drag `~/Downloads/twozero.tox` into TD → Install; twozero → Settings → mcp → "auto start" Yes; restart agent. Verify: `nc -z 127.0.0.1 40404`. Non-Commercial caps 1280×1280 (`outputresolution='custom'`). Codecs: `prores` (macOS) or `mjpa`; H.264/H.265/AV1 need Commercial.

## Workflow

**Discover:** `td_get_par_info` per op type → `td_get_hints` → `td_get_focus` → `td_get_network`.
**Build:** SEPARATE calls for cleanup + creation (same-name recreate in one python → "Invalid OP object"). `td_create_operator` per node.
**Params:** `td_set_operator_pars`. Expressions: `op(p).par.X.expr`.
**Wire:** python only: `op(a).outputConnectors[0].connect(op(b).inputConnectors[0])`.
**Verify:** `td_get_errors(recursive=true)`, `td_get_perf`.

## Tools (36; full schemas `references/mcp-tools.md`)

**Core:** execute_python, create_operator, set_operator_pars, get_operator(s)_info, get_network, get_errors, get_par_info, get_hints, get_focus. **R/W:** read/write_dat, read_chop, read_textport. **Visual:** get_screenshot(s), get_screen_screenshot, navigate_to. **Search:** find_op, search. **System:** get_perf, list_instances, get_docs, agents_md, reinit_extension, clear_textport. **Input:** input_execute/status/clear, op_screen_rect, click_screen_point, screen_point_to_global.

## Key Rules

- **GLSL time:** no `uTDCurrentTime`. Values page: `value0name='uTime'`, expr `absTime.seconds`. Fallback: Constant TOP `rgba32float`.
- **Feedback TOP:** `top` param reference, not direct wire. "Cook dependency loop" expected.
- **Large shaders:** write `/tmp/file.glsl` → `td_write_dat`.
- **Point access (2025.32):** `point.P[0/1/2]` NOT `.x/.y/.z`.
- **Extensions:** `ext0object = "op('./dat').module.ClassName(me)"` CONSTANT mode. Reload: `td_reinit_extension`.
- **Cleanup:** `list(root.children)` + `child.valid` check.

## Recording

MovieFileOut TOP: `type='movie'`, `videocodec='prores'`/`'mjpa'`. `record=True` starts. `TOP.save()` useless — same texture. Frames: `ffmpeg -i out.mov -vframes N frames/%06d.png`. Pre-record: FPS>0, non-black, audio cued first + record +3 frames, path set before start.

## Audio-Reactive GLSL (verified April 2026)

Chain: `AudioFileIn → AudioSpectrum (FFT=512, outputmenu=setmanually, outlength=256, timeslice=ON) → Math (gain=10) → CHOP to TOP (dataformat=r, layout=rowscropped) → GLSL input 1 (256x2)`. Time: Constant TOP `rgba32float` → input 0.

1. TimeSlice ON for AudioSpectrum. OFF → 24000+ samples → overflow.
2. outlength=256 manually. Default 22050.
3. No Lag CHOP — expands 256→2400+, averages to ~1e-06. #1 audio sync failure.
4. No Filter CHOP — same timeslice expansion.
5. Smooth in shader: `mix(prev, new, 0.3)` via feedback. Frame-perfect.
6. CHOP to TOP: rowscropped, stereo 256x2, sample y=0.25 for ch1.
7. Math gain=10 (raw bass ~0.19 → ~5.0). No Resample CHOP.

Build scripts + shaders: `references/network-patterns.md`.

## Operator Families

TOP (purple, suffix TOP): noise/glsl/composite/level/blur/text/null. CHOP (green): audiofilein/audiospectrum/math/lfo/constant. SOP (blue): grid/sphere/transform/noise. DAT (white): text/table/script/webserver. MAT (yellow): phong/pbr/glsl/const. COMP (gray): geometry/container/camera/light/window.

## Security & References

MCP localhost-only. No auth. `td_execute_python` = unrestricted Python + FS as TD user. Setup downloads twozero.tox from 404zero.com. No off-localhost traffic.

`references/`: pitfalls, operators, network-patterns, mcp-tools, python-api, troubleshooting, glsl, postfx, layout-compositor, operator-tips, geometry-comp, audio-reactive, animation, midi-osc, particles, projection-mapping, external-data, panel-ui, replicator, dat-scripting, 3d-scene. `scripts/setup.sh`.

> You're not writing code. You're conducting light.
