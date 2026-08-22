---
name: own-repos-audit-loop
description: Ralph-loop preset. Audits every submodule under repos/{own,frk}/* for dep audit / LOC drift / missing docs / CI config / secrets in git-log / stale README badges. Files issues on the owning repo. Trigger phrases → "audit all my submodules", "audit oriz repos", "check every repo under repos/".
---

# own-repos-audit-loop — Ralph loop preset

## What this does

Fanout audit of every submodule under `repos/{own,frk}/` of the current workspace. Deeper than [`own-repo-health-check`](../own-repo-health-check/SKILL.md) because it has filesystem access to the actual code, not just the GH API.

## Invocation

```
Skill(skill='own-repos-audit-loop', args='root=C:/d/oriz; scope=own; checks=all')
```

Args:

- `root=<path>` — workspace root. Default: cwd.
- `scope=own|frk|both` — which subtree. Default: own. Forks go through fork-thin-upstream-tracking flow.
- `checks=all|deps|docs|ci|secrets|loc` — subset. Default: all.

## Checks performed per repo

| Check             | Signal                                                                                                                                        | Action                               |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| **deps**          | `npm audit --json` / `pip-audit --json` / `cargo audit --json` → any CVE not already tracked                                                  | Open issue in owning repo            |
| **loc**           | Repo size vs `repo-code-size-ceiling` threshold (100K tokens per rule)                                                                        | Open issue if over                   |
| **docs**          | README star badge present per `readme-star-badge-required`                                                                                    | Open issue if missing                |
| **ci**            | `.github/workflows/` has a CI file that ran within last 30 days                                                                               | Open issue if stale/missing          |
| **secrets**       | `git log --all -p` grep for common secret patterns (API keys, private key headers) — false positive rate acceptable, secret rotation is cheap | Open PRIVATE security issue if match |
| **loc-drift**     | Compare current LOC to LOC at last release tag; flag >30% growth                                                                              | Open issue for review                |
| **dep-freshness** | Compare declared deps to latest available versions; flag any behind by >2 minor versions                                                      | Open issue with upgrade candidates   |

## Loop shape

Follows [`ralph-loop`](../ralph-loop/SKILL.md). Concurrency: 16 (workflow harness default).

```
Phase 1: git submodule status | grep repos/own/ (or repos/frk/ per scope)
Phase 2 (fanout): per submodule, subagent runs the checks list
Phase 3: for each finding, gh issue create on owning repo
Phase 4: summary + push any workspace-side changes (e.g. bump submodule pointers if audits made auto-fixable commits)
```

## Skip triggers

- Submodule directory doesn't exist locally (not checked out yet)
- Submodule has no `.git` (points at nowhere)
- Submodule is a fork under `repos/frk/` and scope=own

## Bar

Owned repos → looser bar than external. But every filing still needs:

- Concrete cite (dep name+version, file:line, run URL)
- Dedup against open issues in that repo

## Cross-refs

- [`ralph-loop`](../ralph-loop/SKILL.md)
- [`own-repo-health-check`](../own-repo-health-check/SKILL.md) — sibling; API-only, no filesystem
- [`repo-code-size-ceiling`](../../rules/development/repo-code-size-ceiling.md)
- [`no-hardcoded-secrets`](../../rules/security/no-hardcoded-secrets.md)
- [`readme-star-badge-required`](../../rules/development/readme-star-badge-required.md)
