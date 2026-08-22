---
name: research
description: Investigate a question against high-trust primary sources and capture the findings as a Markdown file in the repo. Use when the user wants a topic researched, docs or API facts gathered, or reading legwork delegated to a background agent.
license: MIT
---

Background agent researches; you keep working.

Its job:

1. Investigate against primary sources — official docs, source, specs, first-party APIs. Cite source per claim.
2. Write findings to a single Markdown file, citing each claim's source.
3. Durable findings → `knowledge/<area>/<slug>.md` with OKF frontmatter per `self-update-rule`. Ephemeral notes → repo's existing notes dir; say where.

<!-- Adapted for oriz workspace 2026-07-08. -->

## See Also

Folded skills preserved in `references/`:

- `from-code-research.md` — external repo research via `github_codebase_search`; parallel angles. Triggers: how does <lib> implement X, understand external dep internals, compare public repos, find usage examples.
- `from-feature-research.md` — existing-architecture research before implementing a feature; find reusable patterns. Triggers: feature spans modules, find existing patterns, match conventions, avoid greenfield.
- `from-search-everything.md` — multi-source fan-out (GitHub + web + knowledge/ + npm + URLs). Triggers: search everything about X, find all issues about X, what exists for X, before filing issue/PR.
