> Folded from skill `starred-repo-audit` on 2026-07-08 during skill-compact merge.

---
name: starred-repo-audit
description: Ralph-loop preset. Fanout review of my starred GitHub repos, filter dead/hostile, per-repo audit for real defects, auto-file GH issues + FRs (no PRs) with hard bar (first-hand Read cite + repro + versions + dedup). Trigger phrases → "audit my stars", "star audit", "review starred repos", "find issues in my stars".
---

# starred-repo-audit — Ralph loop preset

## What this does

Autonomous fanout audit of `gh api users/<user>/starred`. Filters dead/hostile repos, per-repo subagent review, auto-files GH issues + FRs where the bar clears.

## Invocation

```
Skill(skill='starred-repo-audit', args='user=chirag127; max_filings_per_repo=2; issue_only=true; dedup=true')
```

Args:

- `user=<login>` — starred-list owner. Default: current authenticated `gh` user.
- `max_filings_per_repo=<n>` — cap per-repo issue count. Default: 2 (1 bug + 1 FR).
- `issue_only=<bool>` — if true, no PRs filed. Default: true.
- `dedup=<bool>` — search existing issues per repo. Default: true.
- `since=<ISO>` — only audit repos starred/pushed after this date.

## Loop shape

Follows [`ralph-loop`](../ralph-loop/SKILL.md). Iteration mechanic:

```
Phase 1 (setup):
  - gh api --paginate users/<user>/starred → inventory
  - Filter: skip archived, disabled, pushed_at < 12mo, has_issues=false, forks_count<10+no_recent_PRs
  - Write .loop-state.md with survivor list

Phase 2 (fanout, subagent per iter — cap 16 concurrent):
  Per repo:
    - Read README + manifest + recent commits + open-issues-list
    - Identify highest-value bug or FR with first-hand Read cite
    - gh issue list --search "<keywords>" → skip if dupe
    - Return: file_issue | file_fr | file_both | no_filing

Phase 3 (fire):
  - For each returned filing that clears bar: gh issue create with 3s pace
  - Never file PRs (issue_only=true default)
  - Log all attempts with exit code

Phase 4 (summary):
  - Emit counts: scanned/skipped/filed/errors
```

## Hard publish bar

Every filing MUST have:

1. **First-hand Read cite** — quote exact `file:line` proving the issue
2. **Verbatim repro** — exact steps or exact error string, no paraphrase
3. **Exact versions** — pulled from repo's manifest (package.json / pyproject.toml / Cargo.toml / go.mod)
4. **Dedup checked** — `gh issue list --search "<keywords>" --state all` returned no close match
5. **Thanks line** at end per [`thank-maintainers`](../../rules/agent/thank-maintainers.md)

Default action is `no_filing`. Bar failure = skip.

## Skip triggers

- Repo archived / disabled / has_issues=false
- Fork of another repo (upstream target unclear)
- Repo owned by the invoking user (that's own-repo territory, use `own-repo-health-check` preset)
- README explicitly says "not accepting contributions"
- Repo is a curated list / awesome-* if the finding would be a stylistic preference not a defect
- Cannot find first-hand grounded evidence within budget

## Bounds

- Concurrency cap: 16 (workflow harness default)
- Total-agent cap: 1000 (safety backstop)
- Per-repo review budget: ~5 min wall-clock
- Filing pace: 3s between `gh issue create` calls (avoid abuse-detection)
- Expected filing rate: 5-15% of survivor repos

## Real-run baseline (2026-07-04 session)

Prior manual run of this shape: 973 starred → 357 survivors after filter → 194 recommended filings → 214 GH writes (191 issues + 23 FRs) → all 214 filed successfully with zero errors, zero dupes, zero rate-limit hits. ~41.5M tokens, 5914 tool calls, 52 min review + 11 min filing pipeline.

## Cross-refs

- [`ralph-loop`](../ralph-loop/SKILL.md) — the primitive this invokes
- [`terse-issues-less-hallucination`](../../rules/agent/terse-issues-less-hallucination.md) — issue body caps
- [`thank-maintainers`](../../rules/agent/thank-maintainers.md) — mandatory thanks line
- [`read-the-file-not-just-grep`](../../rules/agent/read-the-file-not-just-grep.md) — file:line cite requirement
