> Folded from skill `own-repo-health-check` on 2026-07-08 during skill-compact merge.

---
name: own-repo-health-check
description: Ralph-loop preset. Audits my own GitHub repos (chirag127/*) for stale PRs, upstream drift, broken builds, dep vulns, missing docs. Files issues on my own repos (safe territory). Trigger phrases → "health check my repos", "audit my own repos", "check my chirag127 repos".
---

# own-repo-health-check — Ralph loop preset

## What this does

Fanout audit of every repo owned by the invoking user (`chirag127`) for actionable maintenance debt. Files issues on the user's own repos — no external reputation risk.

## Invocation

```
Skill(skill='own-repo-health-check', args='user=chirag127; deep=false')
```

Args:

- `user=<login>` — owner. Default: authenticated `gh` user.
- `deep=<bool>` — if true, clones each repo and runs local checks (dep audit, test suite). If false, API-only. Default: false.
- `min_size_kb=<n>` — skip repos smaller than N KB. Default: 10.

## Loop shape

Follows [`ralph-loop`](../ralph-loop/SKILL.md).

```
Phase 1: gh repo list <user> --limit 1000 → inventory
  Filter: skip archived, empty repos, forks (those go through fork-thin-upstream-tracking flow)

Phase 2 (fanout subagents):
  Per repo, check for:
    - Stale open PRs (>90 days since last commit on PR branch)
    - Failing CI on default branch (last N runs)
    - README missing star badge (per readme-star-badge-required rule)
    - package.json / pyproject.toml dep-audit findings
    - LOC-drift (repo grown past repo-code-size-ceiling threshold per rule)
    - Missing .github/workflows/ (no CI configured)
    - Missing LICENSE

Phase 3: File 1 issue per finding (own repo, safe to auto-file)
  Title prefix by category: [MAINT] [CI] [DEP] [DOCS] etc.
  Body cites which rule / which check surfaced the finding.

Phase 4: Summary
```

## Filing bar

Own repos → looser than external. Any concrete finding qualifies, but:

- Still needs first-hand cite (file path, run URL, dep name+version)
- Dedup against existing issues (skip if same title fingerprint already open)
- No self-thanks line (it's my own repo)

## Skip triggers

- Repo is a fork (handled by fork-thin-upstream-tracking loop separately)
- Repo is archived
- Repo has an open issue with matching title from a prior run

## Cross-refs

- [`ralph-loop`](../ralph-loop/SKILL.md)
- [`readme-star-badge-required`](../../rules/development/readme-star-badge-required.md)
- [`repo-code-size-ceiling`](../../rules/development/repo-code-size-ceiling.md)
- [`no-fork-divergence`](../../rules/agent/no-fork-divergence.md)
