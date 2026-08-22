---
name: github-issues
description: "Create, triage, label, assign GitHub issues via gh or REST."
version: 1.2.0
author: Hermes Agent (ported)
license: MIT
platforms: [linux, macos, windows]
metadata:
  tags: [GitHub, Issues, Triage, Bug-Tracking]
  related_skills: [github-auth, github-pr-workflow]
---

# GitHub Issues

> Ported from Hermes-Agent (Nous Research) 2026-07-08. `gh` first; curl fallback when unavailable.

Auth detection, `OWNER`/`REPO` derivation, `GITHUB_TOKEN` sources, curl shape, error handling: see [gh CLI basics](../.system/gh-cli-basics.md).

## Common ops (gh)

```bash
gh issue list --state open --label bug
gh issue list --assignee @me
gh issue list --search "auth error" --state all
gh issue view 42
gh issue create --title "..." --body "..." --label "bug,backend" --assignee username
gh issue edit 42 --add-label "priority:high" --remove-label "needs-triage"
gh issue edit 42 --add-assignee @me
gh issue comment 42 --body "Root cause in auth middleware."
gh issue close 42 --reason "not planned"    # or: completed
gh issue reopen 42
gh issue develop 42 --checkout               # branch from issue
```

Auto-close from PR body: `Closes #42` / `Fixes #42` / `Resolves #42`.

## curl fallback — REST endpoints

| Action | Method + endpoint |
|--------|-------------------|
| List | `GET /repos/$OWNER/$REPO/issues?state=open&labels=bug` |
| View | `GET /repos/$OWNER/$REPO/issues/N` |
| Create | `POST /repos/$OWNER/$REPO/issues` — `{title,body,labels[],assignees[]}` |
| Add labels | `POST /repos/$OWNER/$REPO/issues/N/labels` — `{labels[]}` |
| Remove label | `DELETE /repos/$OWNER/$REPO/issues/N/labels/<name>` |
| List labels | `GET /repos/$OWNER/$REPO/labels` |
| Assign | `POST /repos/$OWNER/$REPO/issues/N/assignees` — `{assignees[]}` |
| Comment | `POST /repos/$OWNER/$REPO/issues/N/comments` — `{body}` |
| Close | `PATCH /repos/$OWNER/$REPO/issues/N` — `{state:"closed",state_reason:"completed"\|"not_planned"}` |
| Reopen | `PATCH /repos/$OWNER/$REPO/issues/N` — `{state:"open"}` |
| Search | `GET /search/issues?q=<query>+repo:$OWNER/$REPO` |

`/issues` returns PRs too — filter `'pull_request' not in item`.

## Triage

List `needs-triage` open → view → apply priority/type labels + remove `needs-triage` → assign → comment notes.

## Bulk close

```bash
gh issue list --label wontfix --json number --jq '.[].number' \
  | xargs -I {} gh issue close {} --reason "not planned"
```

Templates: `templates/bug-report.md`, `templates/feature-request.md`.
