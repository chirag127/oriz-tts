> Folded from skill `git-guardrails-claude-code` on 2026-07-08 during skill-compact merge.

---
name: git-guardrails-claude-code
description: Set up Claude Code hooks to block dangerous git commands (reset --hard, clean, branch -D, etc.) before they execute. Use when user wants to prevent destructive git operations, add git safety hooks, or block git reset/clean in Claude Code.
---

# Setup Git Guardrails

Sets up a PreToolUse hook that intercepts and blocks dangerous git commands before Claude executes them.

> Adapted for oriz workspace 2026-07-08. `git push` variants removed from the blocklist to reconcile with `knowledge/rules/development/push-by-default.md` (standing-auth to push to `main` on `chirag127/*`). Force-push guardrail lives separately in `no-force-push-to-main`.

## What Gets Blocked

- `git reset --hard`
- `git clean -f` / `git clean -fd`
- `git branch -D`
- `git checkout .` / `git restore .`

When blocked, Claude sees a message telling it that workspace policy blocks this locally-destructive command.

## Steps

### 1. Ask scope

Ask the user: install for **this project only** (`.claude/settings.json`) or **all projects** (`~/.claude/settings.json`)?

### 2. Copy the hook script

The bundled script is at: [from-git-guardrails-claude-code-refs/scripts/block-dangerous-git.sh](from-git-guardrails-claude-code-refs/scripts/block-dangerous-git.sh)

Prereqs: Git Bash + jq on PATH. On Windows, script runs via Git Bash bundled with Git for Windows; verify `jq --version`.

Copy it to the target location based on scope:

- **Project**: `.claude/hooks/block-dangerous-git.sh`
- **Global**: `$HOME/.claude/hooks/block-dangerous-git.sh`

Make it executable with `chmod +x` (no-op on Windows/NTFS; safe to skip).

### 3. Add hook to settings

Add to the appropriate settings file:

**Project** (`.claude/settings.json`):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/block-dangerous-git.sh"
          }
        ]
      }
    ]
  }
}
```

**Global** (`~/.claude/settings.json`):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "$HOME/.claude/hooks/block-dangerous-git.sh"
          }
        ]
      }
    ]
  }
}
```

If the settings file already exists, merge the hook into existing `hooks.PreToolUse` array — don't overwrite other settings.

### 4. Ask about customization

Ask if user wants to add or remove any patterns from the blocked list. Edit the copied script accordingly.

### 5. Verify

Run a quick test (Git Bash on Windows, or any POSIX shell):

```bash
echo '{"tool_input":{"command":"git reset --hard HEAD~1"}}' | <path-to-script>
```

Should exit with code 2 and print a BLOCKED message to stderr.
