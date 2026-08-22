---
name: github-auth
description: "GitHub auth setup: HTTPS tokens, SSH keys, gh CLI login."
version: 1.2.0
license: MIT
platforms: [linux, macos, windows]
tags: [github, auth, git, gh-cli, ssh, setup]
related_skills: [github-pr-workflow, github-code-review, github-issues, github-repo-management]
---

# GitHub Authentication Setup

Ported from Hermes-Agent (Nous Research) 2026-07-08. Sets up auth for GitHub repos, PRs, issues, CI. Two paths: `git` (always available) or `gh` CLI.

Shared boilerplate (detection, curl shape, error handling, rate limits): see [gh CLI basics](../.system/gh-cli-basics.md).

## Detection

```bash
git --version; gh --version 2>/dev/null || echo "no gh"
gh auth status 2>/dev/null || echo "not authed"
```

`gh auth status` OK → done. Installed but not authed → Method 2. No `gh` → Method 1.

## Method 1: Git-Only (no gh, no sudo)

### Option A: HTTPS + PAT (recommended, most portable)

1. Create token at **https://github.com/settings/tokens** → "Generate new token (classic)". Scopes: `repo`, `workflow`, `read:org`. 90d default. Copy — shown once.
2. Store:
   ```bash
   git config --global credential.helper store
   git ls-remote https://github.com/<user>/<repo>.git  # prompts: username + token (NOT password)
   ```
   Alt: `credential.helper 'cache --timeout=28800'` (memory 8h) or per-repo: `git remote set-url origin https://<user>:<token>@github.com/<owner>/<repo>.git`.
3. Identity: `git config --global user.name "Name"; git config --global user.email "e@x.com"`.

### Option B: SSH keys

```bash
ls -la ~/.ssh/id_*.pub 2>/dev/null || echo "none"
ssh-keygen -t ed25519 -C "e@x.com" -f ~/.ssh/id_ed25519 -N ""
cat ~/.ssh/id_ed25519.pub  # add at https://github.com/settings/keys
ssh -T git@github.com      # expect: "Hi <user>! ..."
git config --global url."git@github.com:".insteadOf "https://github.com/"
```

## Method 2: gh CLI

Interactive: `gh auth login` → GitHub.com → HTTPS → browser.
Headless: `echo "<TOKEN>" | gh auth login --with-token && gh auth setup-git`.
Verify: `gh auth status`.

## Auth-method detection helper

Source `scripts/gh-env.sh` — sets `GH_AUTH_METHOD` (gh/curl/none), `GITHUB_TOKEN`, `GH_USER`, `GH_OWNER`, `GH_REPO`, `GH_OWNER_REPO`. Reads from: gh CLI, `$GITHUB_TOKEN`, `$HERMES_HOME/.env` (Hermes-runtime fallback — inert outside), `~/.git-credentials`.

## Troubleshooting

| Problem | Fix |
|---|---|
| `git push` asks for password | Password auth disabled — use PAT as password, or SSH |
| `Permission to X denied` | Token lacks `repo` scope — regenerate |
| `Authentication failed` | Stale cache — `git credential reject` + re-auth |
| SSH port 22 refused | `~/.ssh/config`: `Host github.com` / `Port 443` / `Hostname ssh.github.com` |
| Credentials not persisting | `credential.helper` must be `store` or `cache` |
| Multi-account | SSH per-host alias in `~/.ssh/config`, or per-repo credential URLs |
| `gh: not found` + no sudo | Use Method 1 |
