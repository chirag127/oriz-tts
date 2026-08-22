---
name: github-repo-management
description: "Clone/create/fork repos; manage remotes, releases, secrets, workflows via gh or curl fallback."
version: 1.2.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [GitHub, Repositories, Git, Releases, Secrets, Configuration]
    related_skills: [github-auth, github-pr-workflow, github-issues]
---

> Ported from Hermes-Agent (Nous Research) 2026-07-08.

# GitHub Repository Management

Create, clone, fork, configure GitHub repos. Each op: `gh` first, `git`+`curl` fallback. Full API cheatsheet: `references/github-api-cheatsheet.md`.

Auth detection, `OWNER`/`REPO`/`GH_USER` derivation, curl shape, rate limits, error codes: see [gh CLI basics](../.system/gh-cli-basics.md). Auth setup itself: `github-auth`.

## Quick reference

| Action | gh | git + curl |
|---|---|---|
| Clone | `gh repo clone o/r` | `git clone https://github.com/o/r.git` |
| Shallow / branch | `gh repo clone o/r -- --depth 1` | `git clone --depth 1 --branch develop URL` |
| Create repo | `gh repo create name --public --clone` | `curl POST /user/repos` (org: `/orgs/O/repos`) |
| From template | `gh repo create N --template o/t --clone` | `curl POST /repos/o/t/generate` |
| From local dir | `gh repo create N --source . --public --push` | `git init; remote add; push -u origin main` |
| Fork | `gh repo fork o/r --clone` | `curl POST /repos/o/r/forks`, sleep, clone, add upstream |
| Sync fork | `gh repo sync $GH_USER/r` | `git fetch upstream; merge upstream/main; push` |
| Repo info | `gh repo view o/r` | `curl GET /repos/o/r` |
| List/search | `gh repo list`, `gh search repos …` | `curl /user/repos`, `/search/repositories?q=…` |
| Edit settings | `gh repo edit --description … --add-topic …` | `curl PATCH /repos/o/r` + PUT `/topics` |
| Branch protect | (via API only) | `curl PUT /repos/o/r/branches/main/protection` |
| Set secret | `gh secret set KEY --body V` | `curl PUT /actions/secrets/K` (requires PyNaCl encrypt) |
| List secrets | `gh secret list` | `curl GET /actions/secrets` |
| Create release | `gh release create v1 --generate-notes` | `curl POST /releases` |
| Upload asset | `gh release create v1 ./binary` | `curl POST uploads.github.com/…/releases/ID/assets?name=…` |
| List workflows | `gh workflow list` | `curl GET /actions/workflows` |
| Trigger run | `gh workflow run ci.yml -f env=stg` | `curl POST /workflows/ID/dispatches` |
| Rerun | `gh run rerun ID [--failed]` | `curl POST /actions/runs/ID/rerun[-failed-jobs]` |
| Failed logs | `gh run view ID --log-failed` | `curl -L /actions/runs/ID/logs -o logs.zip` |
| Gist | `gh gist create f.py --public` | `curl POST /gists` |

## Notes

- **Secrets via curl:** fetch repo public key (`/actions/secrets/public-key`) + PyNaCl `SealedBox` encrypt before PUT. `gh secret set` simpler — recommend installing gh if only for this.
- **Fork after `curl POST /forks`:** sleep 3s before cloning; GitHub creates async.
- **New fork:** always `git remote add upstream https://github.com/OWNER/REPO.git` after clone.
- **Topics API:** needs `Accept: application/vnd.github.mercy-preview+json`.

See `references/github-api-cheatsheet.md` for full curl bodies + response parsing snippets.
