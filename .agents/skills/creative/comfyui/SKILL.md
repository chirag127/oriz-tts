---
name: comfyui
description: "Generate images, video, and audio with ComfyUI — install, launch, manage nodes/models, run workflows with parameter injection. Uses official comfy-cli for lifecycle + direct REST/WebSocket API for execution."
version: 5.1.0
author: [kshitijk4poor, alt-glitch, purzbeats]
license: MIT
platforms: [macos, linux, windows]
tags: [comfyui, image-generation, stable-diffusion, flux, sd3, wan-video, hunyuan-video, video-generation, creative, generative-ai]
---

> Ported from Hermes-Agent (Nous Research) 2026-07-08. Runtime-agnostic. Prereq: `python3`, ComfyUI (local/Desktop/Cloud), comfy-cli (auto-installed via pipx/uvx).

# ComfyUI

Generate images/video/audio/3D via ComfyUI. Two layers: **comfy-cli** (install/launch/stop/node/model mgmt) + **REST/WS API + `scripts/`** (workflow execution, param injection, monitoring — `POST /api/prompt`, `GET /api/view`, `WS /ws`).

## Files

- `references/` — `official-cli.md`, `rest-api.md`, `workflow-format.md`, `template-integrity.md` (load for official templates).
- `scripts/` — `hardware_check.py`, `comfyui_setup.sh`, `extract_schema.py`, `check_deps.py`, `auto_fix_deps.py`, `run_workflow.py`, `run_batch.py`, `ws_monitor.py`, `health_check.py`, `fetch_logs.py`, `_common.py`.
- `workflows/` — SD1.5, SDXL, Flux Dev, img2img, inpaint, ESRGAN upscale, AnimateDiff, Wan T2V.

## When to use

Image gen (SD/SDXL/Flux/SD3), run workflow, chain (txt2img→upscale), ControlNet/inpaint/img2img, queue/model/node mgmt, video/audio/3D.

## Setup — ask Local vs Cloud FIRST

Never install before asking. Cloud = RTX 6000 Pro hosted, API key, paid required to execute (free is read-only). Local = free; ≥6GB VRAM (SD1.5), ≥8GB (SDXL), ≥12GB (Flux/video), or Apple Silicon ≥16GB unified. Then `python3 scripts/hardware_check.py --json` — verdicts `ok`→local, `marginal`→light only, `cloud`→switch. Automated: `bash scripts/comfyui_setup.sh` (check+install+launch+verify; pipx/uvx preferred).

**Paths:** A=Cloud · B=Desktop (Win/Mac, non-technical) · C=Portable (Win) · D=comfy-cli (all, recommended for agents) · E=Manual.

## Core flow

1. **API-format workflow** (each node has `class_type`). Editor format (top-level `nodes`+`links`) not executable — re-export via "Workflow → Export (API)".
2. **Inspect:** `python3 scripts/extract_schema.py workflow_api.json` → params + model deps.
3. **Run:**
   ```bash
   python3 scripts/run_workflow.py --workflow W.json --args '{"prompt":"...","seed":-1,"steps":30}' --output-dir ./outputs
   # Cloud: export COMFY_CLOUD_API_KEY=comfyui-...; add --host https://cloud.comfy.org
   # Live progress: --ws (needs websocket-client). img2img: --input-image image=./photo.png
   # Batch: run_batch.py --count 8 --randomize-seed --parallel 3
   ```
Scripts emit JSON with `prompt_id` + `outputs[]`.

## Decision table

| User says | Command |
|---|---|
| install / start / stop | `bash scripts/comfyui_setup.sh` / `comfy launch --background` / `comfy stop` |
| install node/model | `comfy node install <n>` / `comfy model download --url <u> --relative-path models/checkpoints` |
| ready? / params? / check-fix deps | `scripts/health_check.py` / `scripts/extract_schema.py W.json` / `scripts/{check,auto_fix}_deps.py` |
| generate / variations | `scripts/run_workflow.py --workflow W --args '{...}'` / `scripts/run_batch.py --count N --randomize-seed` |
| live / logs | `scripts/ws_monitor.py --prompt-id <id>` / `scripts/fetch_logs.py <prompt_id>` |
| queue/cancel/free | `curl HOST:8188/queue` / `POST /interrupt` / `POST /free` |

## Cloud specifics

Base `https://cloud.comfy.org`. Auth `X-API-Key` header (`?token=` for WS). `$COMFY_CLOUD_API_KEY` auto-picked. `/api/view` 302→signed URL; scripts strip key before storage fetch. `/history`→`/history_v2`, `/models/<f>`→`/experiment/models/<f>` (scripts route). WS `clientId` ignored — filter by `prompt_id`. Concurrent: Free/Standard 1, Creator 3, Pro 5. Free tier 403 on `/api/prompt`, `/api/view`, `/api/upload/*`, `/api/object_info`.

## Pitfalls

- **API format required** — scripts detect editor format and error; re-export via "Workflow → Export (API)".
- **Server must run** — `curl HOST:8188/system_stats`.
- **Model names exact** — case-sensitive, with extension; `comfy model list` to discover.
- **Missing nodes** — "class_type not found" → `auto_fix_deps.py`.
- **Workspace detection** — `comfy --workspace /path` or `comfy set-default`.
- **Free-tier 403s** — handled by scripts.
- **Video/audio timeout** — auto 300→900s on VHS_VideoCombine/SaveVideo; override `--timeout`.
- **Path traversal** — `safe_path_join` refuses escapes from `--output-dir`.
- **Workflow = arbitrary code** — custom nodes run Python; treat unknown workflows as `eval`.
- **Random seed** — `seed: -1` or `--randomize-seed`; actual logged to stderr.
- **Analytics** — `comfy --skip-prompt tracking disable` (setup.sh does it).

## Docs

Install https://docs.comfy.org/installation · CLI https://docs.comfy.org/comfy-cli/getting-started · Cloud https://docs.comfy.org/get_started/cloud · Cloud API https://docs.comfy.org/development/cloud/overview
