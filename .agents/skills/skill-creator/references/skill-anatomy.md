# SKILL.md anatomy + progressive disclosure

Reference for [`skill-creator/SKILL.md`](../SKILL.md).

## Directory layout

```
skills/
  skill-name/
    SKILL.md            # main entry (required, <150 lines)
    references/         # loaded on-demand, one file per branch
      supporting.md
    scripts/            # executable, doesn't consume context
    assets/             # templates, icons — used in output
```

Flat namespace — all skills at same depth in one searchable dir.

## Three-tier loading

1. **Metadata** (name + description) — always in context, ~100 words
2. **SKILL.md body** — in context when skill triggers, <500 lines ideal (target <150 per Pocock)
3. **Bundled resources** — as needed, unlimited (scripts execute without loading)

## Body sections — the shape

```markdown
# Skill Name

## The core (1-2 sentences)
What is this?

## Trigger
- Bullet list with SYMPTOMS and use cases
- When NOT to use

## Process / Core pattern (for techniques)
Steps or before/after code comparison

## Quick reference
Table for scanning common operations

## Implementation
Inline for simple. Link to reference/ for heavy.

## Common mistakes
What goes wrong + fix

## Cross-refs
Skills this builds on + source
```

## Progressive disclosure — Pocock's rule

If a chunk is only used in ONE branch of the skill, move it to `references/<branch>.md` behind a context pointer.

Example — `plan/` skill has 3 references because it has 3 branches:
- `references/plan-template.md` — only needed when writing a new plan
- `references/file-structure.md` — only needed for complex decomposition
- `references/cc-plan-mode.md` — only needed when debugging plan-mode metadata

Each reference gets loaded only when the branch fires.

## Domain organization

When a skill supports multiple domains/frameworks:

```
cloud-deploy/
  SKILL.md              # workflow + selection
  references/
    aws.md
    gcp.md
    azure.md
```

Skill body picks the domain; only that reference file loads.

## Size guidelines

- SKILL.md: target <150 lines. Approaching 500 → add hierarchy.
- Reference files: no cap, but table of contents required if >300 lines.
- Frontmatter: 1024 chars total (name + description).

## Bundle scripts, don't inline

If skill-runs consistently write the same helper (e.g. every eval writes `create_docx.py`), bundle it in `scripts/`. Point the skill at it. Every future invocation reuses instead of reinventing.
