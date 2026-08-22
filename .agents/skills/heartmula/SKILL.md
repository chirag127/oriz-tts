---
name: heartmula
description: "HeartMuLa: Suno-like open-source song generation from lyrics + tags."
version: 1.0.0
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [music, audio, generation, ai, heartmula, heartcodec, lyrics, songs]
    related_skills: [audiocraft]
license: MIT
---

# HeartMuLa — Open-Source Music Generation

Ported from Hermes-Agent (Nous Research) 2026-07-08. Apache-2.0 music foundation models. HeartMuLa is a family of open-source music foundation models that generates music conditioned on lyrics and tags, with multilingual support. Generates full songs from lyrics + tags. Open-source Suno alternative. Parts:

- **HeartMuLa** — Music language model (3B/7B) for generation from lyrics + tags
- **HeartCodec** — 12.5Hz music codec for high-fidelity audio reconstruction
- **HeartTranscriptor** — Whisper-based lyrics transcription
- **HeartCLAP** — Audio-text alignment model

## When to Use

- User wants to generate music/songs from text descriptions (text→music)
- User wants an open-source Suno alternative
- User wants local/offline music generation
- User asks about HeartMuLa, heartlib, or AI music generation

## Hardware Requirements

- **Minimum**: 8GB VRAM with `--lazy_load true` (loads/unloads models sequentially); 3B model peaks at ~6.2GB VRAM
- **Recommended**: 16GB+ VRAM for comfortable single-GPU usage
- **Multi-GPU**: `--mula_device cuda:0 --codec_device cuda:1` to split across GPUs
- **CPU**: `--mula_device cpu --codec_device cpu` — 30–60+ min/song vs ~4 min on GPU, ~12GB RAM required
- **No GPU**: Use Google Colab free T4, Lambda Labs, or the online demo at https://heartmula.github.io/

## Installation

### 1. Clone and set up environment

```bash
git clone https://github.com/HeartMuLa/heartlib.git && cd heartlib
uv venv --python 3.10 .venv && . .venv/bin/activate
uv pip install -e .
uv pip install --upgrade datasets transformers   # Feb 2026 dep fix
```

**Note**: As of Feb 2026, pinned dependencies conflict with newer packages. The `--upgrade` commands above fix incompatibilities with current pyarrow and huggingface-hub 1.x.

### 2. Patch source code (required for transformers 5.x)

**Patch 1 — RoPE cache fix** in `src/heartlib/heartmula/modeling_heartmula.py`:

In the `setup_caches` method of the `HeartMuLa` class, add RoPE reinitialization after the `reset_caches` try/except block and before the `with device:` block:

```python
# Re-initialize RoPE caches that were skipped during meta-device loading
from torchtune.models.llama3_1._position_embeddings import Llama3ScaledRoPE
for module in self.modules():
    if isinstance(module, Llama3ScaledRoPE) and not module.is_cache_built:
        module.rope_init()
        module.to(device)
```

Why: `from_pretrained` loads on meta device; `Llama3ScaledRoPE.rope_init()` skips cache on meta tensors, then never rebuilds after weights are loaded to real device.

**Patch 2 — HeartCodec loading fix** in `src/heartlib/pipelines/music_generation.py`:

Add `ignore_mismatched_sizes=True` to ALL `HeartCodec.from_pretrained()` calls (there are 2: the eager load in `__init__` and the lazy load in the `codec` property).

Why: VQ codebook `initted` buffers have shape `[1]` in checkpoint vs `[]` in model — same data, just scalar vs 0-d tensor. Safe to ignore.

### 3. Download model checkpoints (parallel-safe, several GB)

```bash
hf download --local-dir './ckpt' 'HeartMuLa/HeartMuLaGen'
hf download --local-dir './ckpt/HeartMuLa-oss-3B' 'HeartMuLa/HeartMuLa-oss-3B-happy-new-year'
hf download --local-dir './ckpt/HeartCodec-oss' 'HeartMuLa/HeartCodec-oss-20260123'
```

## GPU / CUDA

HeartMuLa uses CUDA by default (`--mula_device cuda --codec_device cuda`). No extra setup needed with an NVIDIA GPU and PyTorch CUDA support.

- `torch==2.4.1` ships with CUDA 12.1 support out of the box
- `torchtune` may report version `0.4.0+cpu` — just package metadata; still uses CUDA via PyTorch
- Verify GPU usage: look for "CUDA memory" lines in output (e.g. `"CUDA memory before unloading: 6.20 GB"`)
- RTX 5080 incompatibility reported upstream

## Usage

### Basic generation

```bash
cd heartlib && . .venv/bin/activate
python ./examples/run_music_generation.py \
  --model_path=./ckpt \
  --version="3B" \
  --lyrics="./assets/lyrics.txt" \
  --tags="./assets/tags.txt" \
  --save_path="./assets/output.mp3" \
  --lazy_load true
```

### Input formatting

**Tags** (comma-separated, no spaces):

```
piano,happy,wedding,synthesizer,romantic
rock,energetic,guitar,drums,male-vocal
```

**Lyrics** (use bracketed structural tags):

```
[Intro]

[Verse]
Your lyrics here...

[Chorus]
Chorus lyrics...

[Bridge]
Bridge lyrics...

[Outro]
```

### Key parameters

| Parameter               | Default  | Description                                         |
| ----------------------- | -------- | --------------------------------------------------- |
| `--max_audio_length_ms` | 240000   | Max length in ms (240s = 4 min)                     |
| `--topk`                | 50       | Top-k sampling                                      |
| `--temperature`         | 1.0      | Sampling temperature                                |
| `--cfg_scale`           | 1.5      | Classifier-free guidance scale                      |
| `--lazy_load`           | false    | Load/unload models on demand (saves VRAM)           |
| `--mula_dtype`          | bfloat16 | Dtype for HeartMuLa (bf16 recommended)              |
| `--codec_dtype`         | float32  | Dtype for HeartCodec (fp32 recommended for quality) |

### Performance

- RTF (Real-Time Factor) ≈ 1.0 — a 4-minute song takes ~4 minutes to generate on GPU
- Output: MP3, 48kHz stereo, 128kbps

## Pitfalls

1. **Never bf16 for HeartCodec** — degrades audio quality. fp32 only (default).
2. **Tags may be ignored** — known issue (#90). Lyrics dominate; experiment with tag ordering.
3. **Triton not on macOS** — Linux/CUDA only for GPU acceleration.
4. **RTX 5080 incompatibility** reported in upstream issues.
5. Dependency pin conflicts require the manual upgrades and patches described in Installation.

## Links

- Repo: https://github.com/HeartMuLa/heartlib
- Models: https://huggingface.co/HeartMuLa
- Paper: https://arxiv.org/abs/2601.10547
- License: Apache-2.0
