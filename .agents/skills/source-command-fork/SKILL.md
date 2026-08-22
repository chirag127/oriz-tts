---
name: "source-command-fork"
description: "Fork current session — copy transcript to new UUID, print resume command"
---

# source-command-fork

Use this skill when the user asks to run the migrated source command `fork`.

## Command Template

Run `powershell -NoProfile -ExecutionPolicy Bypass -File C:\d\ws\scripts\cc-hooks\session-fork.ps1` and show its output to the user. The script prints a `Codex --resume <uuid>` line — the user relaunches with that command to continue on the forked branch while the original session stays intact.

Do not modify the transcript. Do not spawn subagents. Just run the script and echo the result.
