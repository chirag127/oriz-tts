---
name: github-pr-workflow
description: "GitHub PR lifecycle: branch, commit, open, CI, merge. gh-first with git+curl fallback."
version: 1.2.0
license: MIT
platforms: [linux, macos, windows]
---

<!-- Ported from Hermes-Agent (Nous Research) 2026-07-08. -->

# GitHub PR Workflow

`gh` first, `git`+`curl` fallback. Auth setup: `github-auth`. Shared boilerplate (detection, `OWNER`/`REPO`, curl shape, rate limits, error codes): see [gh CLI basics](../.system/gh-cli-basics.md).

## 1. Branch

```bash
git fetch origin && git checkout main && git pull origin main
git checkout -b feat/description   # prefixes: feat/ fix/ refactor/ docs/ ci/
```

## 2. Commit

Conventional Commits — `type(scope): description`. Types: `feat fix refactor docs test ci chore perf`. Body wrap 72. See `references/conventional-commits.md`.

## 3. Push + open PR

```bash
git push -u origin HEAD
gh pr create --title "..." --body "..."   # flags: --draft --reviewer --label --base
# curl:
curl -s -X POST -H "Authorization: token $GITHUB_TOKEN" -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/$OWNER/$REPO/pulls \
  -d "{\"title\":\"...\",\"body\":\"...\",\"head\":\"$(git branch --show-current)\",\"base\":\"main\"}"
```
`"draft": true` for draft. Response `number` = PR id. Bodies: `templates/pr-body-{feature,bugfix}.md`.

## 4. Monitor CI

```bash
gh pr checks --watch
# curl:
SHA=$(git rev-parse HEAD)
curl -s -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO/commits/$SHA/{status,check-runs}
```
Poll 30s until `state` = `success`/`failure`/`error`, cap 10min.

## 5. Auto-fix CI

```bash
gh run list --branch $(git branch --show-current) --limit 5
gh run view <RUN_ID> --log-failed
# curl: GET /repos/$O/$R/actions/runs?branch=$B ; then /runs/$ID/logs (zip)
```
Loop: status → logs → patch → `git commit -m "fix: ..."` → push → re-check. Cap 3, then escalate. Patterns: `references/ci-troubleshooting.md`. Original used `read_file`/`patch`/`write_file` — swap for host agent's edit tools.

## 6. Merge

```bash
gh pr merge --squash --delete-branch          # or --auto
# curl:
curl -s -X PUT -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO/pulls/$PR_NUMBER/merge -d '{"merge_method":"squash"}'
git push origin --delete $BRANCH && git checkout main && git pull && git branch -d $BRANCH
```
Auto-merge via REST unsupported — GraphQL `enablePullRequestAutoMerge` with `node_id`.

## Cheat
- List: `gh pr list --author @me` / `GET /pulls?state=open`
- Diff: `gh pr diff` / `git diff main...HEAD`
- Comment: `gh pr comment N -b "..."` / `POST /issues/N/comments`
- Reviewer: `gh pr edit N --add-reviewer u` / `POST /pulls/N/requested_reviewers`
- Close: `gh pr close N` / `PATCH /pulls/N '{"state":"closed"}'`
- Checkout: `gh pr checkout N` / `git fetch origin pull/N/head:pr-N`
