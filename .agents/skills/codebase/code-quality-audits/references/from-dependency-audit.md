> Folded from skill `dependency-audit` on 2026-07-08 during skill-compact merge.

---
name: dependency-audit
description: Audit package manifests for vulnerabilities, outdated deps, license conflicts, unused imports, supply-chain risks. Use when user says "audit dependencies", "check supply chain", "review package.json". Reports must-update / should-update / consider lists with fix commands.
---

# dependency-audit — Dependency + supply-chain auditor

## Trigger

Fire when the user says: "audit dependencies", "supply chain check", "review package.json". Or invoke explicitly via `/dependency-audit`.

## Task-oriented — see [[task-oriented-execution-model]]

## Phase 1 — inventory (TASK-1.x)

- TASK-1.1: list all manifests (package.json, requirements.txt, Cargo.toml, go.mod, pyproject.toml)
- TASK-1.2: separate runtime vs dev deps
- TASK-1.3: identify direct vs transitive
- TASK-1.4: note lockfile presence + integrity

## Phase 2 — vulnerabilities (TASK-2.x)

- TASK-2.1: run `pnpm audit` / `pip-audit` / `cargo audit` / `govulncheck`
- TASK-2.2: classify: critical / high / medium / low
- TASK-2.3: for each: is fix a version bump, or does it need code change?
- TASK-2.4: check GHSA + OSV.dev for recent advisories not in tool output

## Phase 3 — freshness (TASK-3.x)

- TASK-3.1: latest-vs-installed diff per dep (`pnpm outdated`, `pip list --outdated`)
- TASK-3.2: classify update: patch / minor / major
- TASK-3.3: for major bumps, check CHANGELOG / migration guide

## Phase 4 — license (TASK-4.x)

- TASK-4.1: enumerate license SPDX per dep
- TASK-4.2: flag copyleft (GPL, AGPL) if project ships as SaaS or is proprietary
- TASK-4.3: flag missing license fields
- TASK-4.4: verify license compatibility with project's own license

## Phase 5 — supply chain (TASK-5.x)

- TASK-5.1: check for typosquats (Levenshtein-1 from known packages)
- TASK-5.2: check publisher reputation + last release date (dormant → risk)
- TASK-5.3: check package install-scripts for suspicious behavior
- TASK-5.4: check for postinstall network calls
- TASK-5.5: pin versions where lockfile absent
- TASK-5.6: enable Dependabot / Renovate

## Phase 6 — hygiene (TASK-6.x)

- TASK-6.1: unused deps (`depcheck`, manual grep)
- TASK-6.2: duplicate versions in tree
- TASK-6.3: peer-dep conflicts
- TASK-6.4: bundle-size impact of top-10 deps

## Output shape

```
MUST UPDATE (security):
  - <pkg>@<current> → <target>. CVE-XXXX-YYYY. Command: pnpm up <pkg>@<target>
SHOULD UPDATE (fresh):
  - ...
CONSIDER (license/supply chain):
  - ...
UNUSED (safe remove):
  - ...
```

## Anti-patterns

- ❌ "Everything is fine" without running the audit tools
- ❌ Recommending major-bump without CHANGELOG diff
- ❌ Suggesting unpinned versions
- ❌ Ignoring transitives

## Cross-refs

- [always-latest-deps](../../../../knowledge/rules/development/always-latest-deps.md)
- [community-packages-first](../../../../knowledge/rules/development/community-packages-first.md)


## Provenance

- **Source:** prompts.chat: Dependency Manager Agent Role, harvested 2026-07-03
- **Repository:** [f/awesome-chatgpt-prompts](https://github.com/f/awesome-chatgpt-prompts)
- **License:** CC0 1.0 (prompts.chat)
