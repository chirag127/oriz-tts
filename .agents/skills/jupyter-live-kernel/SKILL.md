---
name: jupyter-live-kernel
description: "Iterative Python via live Jupyter kernel (hamelnb). Stateful REPL — variables persist across executions. Use for data science, ML, DataFrame inspection, API exploration."
version: 1.0.0
author: Hermes Agent (Nous Research)
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [jupyter, notebook, repl, data-science, exploration, iterative]
    category: data-science
---

# Jupyter Live Kernel (hamelnb)

Ported from Hermes-Agent (Nous Research) 2026-07-08. Stateful Python REPL via live Jupyter
kernel — variables persist across executions. Use this instead of `execute_code` when you need
to build up state incrementally, explore APIs, inspect DataFrames, or iterate on complex code.

**Rule of thumb:** If you'd want a Jupyter notebook for the task, use this skill.

## Tool Selection

| Tool                              | Use When                                                                                        |
| --------------------------------- | ----------------------------------------------------------------------------------------------- |
| **This skill**                    | Iterative exploration, state across steps, data science, ML, DataFrame inspect, API exploration |
| `execute_code` (Hermes-only tool) | One-shot scripts needing hermes tool access (web_search, file ops). Stateless.                  |
| `terminal`                        | Shell commands, builds, installs, git, process management                                       |

## Prerequisites

1. **uv** must be installed (check: `which uv`)
2. **JupyterLab** must be installed: `uv tool install jupyterlab`
3. A Jupyter server must be running (see Setup below)

## Setup

Script path (Hermes default — outside Hermes, adjust to wherever hamelnb is cloned):

```
SCRIPT="$HOME/.agent-skills/hamelnb/skills/jupyter-live-kernel/scripts/jupyter_live_kernel.py"
```

Clone if missing:

```
git clone https://github.com/hamelsmu/hamelnb.git ~/.agent-skills/hamelnb
```

### Starting JupyterLab

Check if a server is already running:

```
uv run "$SCRIPT" servers
```

If no servers found, start one:

```
jupyter-lab --no-browser --port=8888 --notebook-dir=$HOME/notebooks \
  --IdentityProvider.token='' --ServerApp.password='' > /tmp/jupyter.log 2>&1 &
sleep 3
```

Token/password disabled for local agent access. The server runs headless.

### Creating a Kernel Session (needed before `execute`)

```
mkdir -p ~/notebooks
curl -s -X POST http://127.0.0.1:8888/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"path":"scratch.ipynb","type":"notebook","name":"scratch.ipynb","kernel":{"name":"python3"}}'
```

## Core Commands

All commands return structured JSON. Always use `--compact` to save tokens.

```
uv run "$SCRIPT" servers --compact
uv run "$SCRIPT" notebooks --compact
uv run "$SCRIPT" execute --path <nb.ipynb> --code '<python>' --compact
uv run "$SCRIPT" variables --path <nb.ipynb> list --compact
uv run "$SCRIPT" variables --path <nb.ipynb> preview --name <var> --compact
uv run "$SCRIPT" contents --path <nb.ipynb> --compact
uv run "$SCRIPT" edit --path <nb.ipynb> insert --at-index <N> --cell-type code --source '<code>' --compact
uv run "$SCRIPT" edit --path <nb.ipynb> replace-source --cell-id <id> --source '<code>' --compact
uv run "$SCRIPT" edit --path <nb.ipynb> delete --cell-id <id> --compact
uv run "$SCRIPT" restart-run-all --path <nb.ipynb> --save-outputs --compact
```

Multi-line code works with `$'...'` quoting:

```
uv run "$SCRIPT" execute --path scratch.ipynb --code $'import os\nfiles = os.listdir(".")\nprint(f"Found {len(files)} files")' --compact
```

State persists across `execute` calls. Variables, imports, and objects all survive.

## Verification

`restart-run-all` only when user asks for a clean top-to-bottom run or you must confirm
reproducibility. Avoid otherwise.

## Practical Tips

1. **Argument order matters** — subcommand flags (`--path`) go BEFORE the sub-subcommand.
   E.g.: `variables --path nb.ipynb list`, not `variables list --path nb.ipynb`.
2. **First execute after server start may timeout** — the kernel needs a moment to initialize.
   If you get a timeout, just retry.
3. **Kernel Python = JupyterLab's env** — packages must be installed in that tool environment.
4. **Pure REPL use** — create a scratch.ipynb and use `execute` repeatedly; skip cell editing.
5. **No session = no execute.** Start a session via the REST API (see Setup).
6. **Errors are returned as JSON** with traceback — read the `ename` and `evalue` fields.
7. **Occasional websocket timeouts** after kernel restart. Retry once before escalating.
8. **Timeout** default is 30 seconds per execution. Long-running ops: `--timeout 120`.
   Use generous timeouts (60+) for initial setup or heavy computation.
