---
name: github-code-review
description: "Review PRs: diffs, inline comments via gh or REST."
version: 1.2.0
license: MIT
platforms: [linux, macos, windows]
---
# GitHub Code Review

> Ported from Hermes-Agent (Nous Research) 2026-07-08.

Local pre-push review or open PRs. Plain `git` for most; `gh`/`curl` split matters only for PR-level interactions.

Auth + `OWNER`/`REPO` + curl shape + rate limits: see [gh CLI basics](../.system/gh-cli-basics.md).

## 1. Local pre-push

```bash
git diff main...HEAD --stat                          # scope
git log main..HEAD --oneline
git diff main...HEAD -- <path>
git diff main...HEAD | grep -n "print(\|console\.log\|TODO\|FIXME\|debugger"
git diff main...HEAD | grep -in "password\|secret\|api_key\|token.*=\|private_key"
git diff main...HEAD | grep -n "<<<<<<\|>>>>>>\|======="
```

## 2. PR review

```bash
gh pr view 123 && gh pr diff 123 --name-only && gh pr checks 123
gh pr checkout 123    # plain: git fetch origin pull/123/head:pr-123 && git checkout pr-123
gh pr comment 123 --body "..."
```

**Inline comment (gh):**
```bash
HEAD_SHA=$(gh pr view 123 --json headRefOid --jq '.headRefOid')
gh api repos/$OWNER/$REPO/pulls/123/comments --method POST \
  -f body="..." -f path="src/x.py" -f commit_id="$HEAD_SHA" -f line=45 -f side="RIGHT"
```

**Atomic multi-comment review (curl):**
```bash
HEAD_SHA=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO/pulls/$PR | python3 -c "import sys,json;print(json.load(sys.stdin)['head']['sha'])")
curl -s -X POST -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO/pulls/$PR/reviews \
  -d "{\"commit_id\":\"$HEAD_SHA\",\"event\":\"REQUEST_CHANGES\",\"body\":\"...\",
       \"comments\":[{\"path\":\"src/a.py\",\"line\":45,\"body\":\"...\"}]}"
```
Events: `APPROVE` / `REQUEST_CHANGES` / `COMMENT`. `line` = new-file line; deleted → `"side":"LEFT"`.
Formal: `gh pr review 123 --approve --body "LGTM"` | `--request-changes` | `--comment`

## 3. Checklist
Correctness (edge/error) · Security (secrets/injection/XSS/authz) · Quality (naming/DRY/SRP) · Testing (happy+error) · Perf (N+1, async block, caching) · Docs (public APIs, "why", README).

## 4. Output format

```
## Code Review Summary
**Verdict: Approved ✅ | Changes Requested 🔴 | Reviewed 💬** (N issues, N suggestions)
### 🔴 Critical    - **file.py:45** — desc. Fix: ...
### ⚠️ Warnings    - **file.py:23** — desc.
### 💡 Suggestions - **file.py:8**  — desc.
### ✅ Looks Good  - aspect done well
```
Full template + severity guide → `references/review-output-template.md`.

## 5. Recipe
1. `gh pr view N` + `--name-only` + `gh pr checks N`
2. `gh pr checkout N` — read files, run tests
3. Diff file-by-file with surrounding context
4. Tests + linter local; apply checklist
5. Post atomic review (inline + summary comment)
6. `git checkout main && git branch -D pr-N`

Verdict: Approve = zero critical/warning. Request Changes = any critical/warning. Comment = observations only.
