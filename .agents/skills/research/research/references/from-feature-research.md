> Folded from skill `feature-research` on 2026-07-08 during skill-compact merge.

---
name: feature-research
description: Research existing architecture before implementing a complex feature. Use when the new feature spans multiple modules/services, when you need to find existing patterns to reuse (routes, state, DB, jobs, UI), when identifying integration points + API boundaries + data models + tests to mirror, or when a request would otherwise land as a greenfield implementation ignoring existing conventions.
metadata:
  author: morph
  version: "0.1.0"
  argument-hint: <feature>
---

# Feature Research

Before implementing a complex feature, use codebase_search to avoid duplicating patterns and to match existing conventions.

## When To Use

- New feature spans multiple modules/services.
- You need to find existing patterns for similar features.
- You need to identify API boundaries, data models, and tests.

## Steps

1. Identify the likely "shape" of the feature (routes, state, DB, background jobs, UI).
2. Run `codebase_search` with a natural language question or description that asks for similar features and relevant files.
3. Extract:
   - Existing patterns to reuse
   - Integration points
   - Config/feature-flag conventions
   - Tests to mirror
4. Propose an implementation plan that matches the repo.
5. Implement.

## Query Template

"Find existing implementations similar to <feature>. Include endpoints, data models, background tasks, and tests."
