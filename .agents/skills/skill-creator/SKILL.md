---
name: skill-creator
description: Create, edit, evaluate, and benchmark skills. Writing skills IS TDD applied to process documentation — pressure-scenario tests, watch agents fail, write the skill, verify compliance. Use when creating a new skill, improving an existing skill, optimizing description triggering, or planning reusable bundled resources (scripts, references, assets) for a new skill domain.
license: MIT
metadata:
  short-description: Create or update a skill
---

# skill-creator — TDD for skill authoring

## The core

**Writing skills IS TDD applied to process documentation.**

- Test case = pressure scenario with subagent
- Production code = SKILL.md
- RED = agent violates rule without skill (baseline)
- GREEN = agent complies with skill present
- REFACTOR = close loopholes while maintaining compliance

Understand [`tdd`](../tdd/SKILL.md) before using this skill. RED-GREEN-REFACTOR is the foundation.

## Trigger

- Create a new skill
- Improve/optimize an existing skill
- Run evals / benchmark skill performance
- Optimize a description for better triggering
- Plan bundled resources (scripts, references, assets) for a skill domain

## What is a skill?

Reference guide for proven techniques, patterns, or tools. **Skills ARE:** reusable techniques, patterns, tools. **Skills are NOT:** narratives about how you solved a problem once.

Skills are modular, self-contained folders that extend agent capabilities by providing specialized knowledge, workflows, and tools — like "onboarding guides" for specific domains. They transform a general-purpose agent into a specialized agent equipped with procedural knowledge no model can fully possess.

### What skills provide

1. Specialized workflows — multi-step procedures for specific domains
2. Tool integrations — instructions for working with specific file formats or APIs
3. Domain expertise — company-specific knowledge, schemas, business logic
4. Bundled resources — scripts, references, and assets for complex and repetitive tasks

## When to create — and when NOT to

**Create when:** technique wasn't intuitively obvious · you'd reference across projects · pattern is broad · others would benefit.

**Don't create when:** one-off solution · standard practice well-documented elsewhere · project-specific convention (put in AGENTS.md) · mechanical constraint enforceable with regex/validation.

## Skill anatomy

Every skill consists of a required SKILL.md and optional bundled resources:

```
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter (required): name, description
│   └── Markdown instructions (required)
├── agents/ (recommended)
│   └── openai.yaml — UI metadata for skill lists and chips
└── Bundled Resources (optional)
    ├── scripts/     — Executable code (Python/Bash/etc.)
    ├── references/  — Documentation loaded into context as needed
    └── assets/      — Files used in output (templates, icons, fonts, etc.)
```

Do NOT create extraneous documentation files (README.md, INSTALLATION_GUIDE.md, CHANGELOG.md, etc.). The skill should contain only information needed for an AI agent to do the job.

Full anatomy details: `references/skill-anatomy.md`.

## Frontmatter

Required: `name` (letters/numbers/hyphens only) and `description`.

**CC-native (this repo):** description max 1024 chars total, describes ONLY triggering conditions — NOT the workflow.

**Codex/OpenAI style:** description includes both what the skill does AND specific triggers/contexts. "When to Use" goes in description since the body loads only after triggering.

**CRITICAL — description ≠ workflow summary.** Testing shows an agent following a workflow-summarizing description takes the shortcut instead of reading the full skill body. See `references/description-trap.md`.

Optional frontmatter: `license`, `metadata.short-description`. Do not add other fields.

## SKILL.md structure — Pocock's checklist

Every skill passes these gates before shipping (Matt Pocock 2026-07-04):

1. **Trigger** — user-invoked (`disable-model-invocation: true`) or model-invoked? Both have cost. Model-invoked = context load on every request + unpredictability. User-invoked = cognitive load on human.
2. **Structure** — steps + reference. Main SKILL.md **small** (target <150 lines, hard cap ~500 lines). Branching reference material behind context pointers into a `references/` subdir.
3. **Steering** — leading words that pack meaning densely (e.g. "vertical slice", "iron law", "zero-context implementer"). Repeat them; watch the agent adopt them in reasoning traces.
4. **Pruning** — no dupes, no sediment (contributors adding without editing existing text), no no-ops (paragraphs the agent would produce without them anyway). Deletion test: remove a paragraph, verify behavior didn't change, keep it deleted.

Full TDD mapping: `references/tdd-for-skills.md`.

## Context efficiency

The context window is a public good. Skills share it with system prompt, conversation history, other skill metadata, and the user request.

**Default assumption: the agent is already smart.** Only add context it doesn't already have. Challenge each piece: "Does it really need this?" and "Does this paragraph justify its token cost?" Prefer concise examples over verbose explanations.

### Progressive disclosure — three loading levels

1. **Metadata (name + description)** — always in context (~100 words)
2. **SKILL.md body** — when skill triggers (<5k words recommended)
3. **Bundled resources** — as needed (unlimited because scripts can execute without loading into context)

Keep SKILL.md body under 500 lines. Split content into `references/` files as it grows. Reference files must be explicitly linked from SKILL.md with clear "when to read" guidance.

**Avoid deeply nested references** — keep references one level deep. For files longer than 100 lines, include a table of contents at the top.

### Degrees of freedom

Match specificity to task fragility:

- **High freedom (text instructions):** multiple valid approaches, context-dependent decisions
- **Medium freedom (pseudocode or parameterized scripts):** preferred pattern with acceptable variation
- **Low freedom (specific scripts, few parameters):** fragile, error-prone operations requiring exact sequence

## Skill naming

- Lowercase letters, digits, and hyphens only; normalize to hyphen-case ("Plan Mode" → `plan-mode`).
- Under 64 characters. Prefer short verb-led phrases.
- Namespace by tool when clarity helps (e.g. `gh-address-comments`).
- Folder name = skill name exactly.

## Creation process (6 steps)

### Step 1: Understand with concrete examples

Understand how the skill will be used. Ask:

- "What functionality should this skill support?"
- "Can you give examples of how this would be used?"
- "What would a user say that should trigger this skill?"
- "Where should the skill be created?" (default: `~/.codex/skills` or `$CODEX_HOME/skills` for Codex; `~/.Codex/skills` for CC)

Avoid overwhelming with too many questions at once.

### Step 2: Plan reusable skill contents

Analyze each concrete example to identify reusable resources:

- Repetitive code → `scripts/`
- Schema/domain knowledge looked up repeatedly → `references/`
- Templates/assets copied into output → `assets/`

### Step 3: Initialize the skill

For a new skill, run the init script:

```bash
scripts/init_skill.py <skill-name> --path <output-directory> [--resources scripts,references,assets] [--examples]
```

Generate `display_name`, `short_description`, and `default_prompt`, then pass via `--interface key=value`. See `references/openai_yaml.md` for field definitions.

For an existing skill, skip to Step 4.

### Step 4: Edit the skill

Write for another agent instance — include procedural knowledge, domain-specific details, reusable assets that would be non-obvious.

**Start with bundled resources** (scripts, references, assets) before writing SKILL.md. Test scripts by actually running them. For many similar scripts, test a representative sample.

**Writing guidelines:** imperative/infinitive form. Explain WHY things matter, not heavy-handed MUSTs. Use theory of mind. All-caps ALWAYS/NEVER is a yellow flag — reframe with reasoning.

After substantial revisions, use subagents to forward-test on realistic artifacts without leaking your diagnosis.

### Step 5: Validate

```bash
scripts/quick_validate.py <path/to/skill-folder>
```

Checks YAML frontmatter format, required fields, and naming rules.

### Step 6: Iterate

Forward-test with subagents as stress-test with minimal context. Subagents should NOT know they're testing a skill — treat them as users performing a real task.

**Prompt shape:** `Use $skill-x at /path/to/skill-x to solve problem y`
**Not:** `Review the skill at /path/to/skill-x; pretend a user asks...`

**Forward-test guidelines:**

- Use fresh threads for independent passes
- Pass raw artifacts (prompts, outputs, diffs, logs), not your conclusions
- Avoid showing expected answers or intended fixes
- Clean up artifacts between iterations to avoid contamination
- Ask for approval if forward-testing would take long, need extra approvals, or modify live systems

Decision: err on the side of forward-testing.

## The TDD loop — create/improve (CC-native workflow)

1. **Capture intent** — what should this enable? When trigger? Output format? Test cases?
2. **Interview + research** — edge cases, input/output shapes, MCPs to use in research
3. **Write draft SKILL.md** — use structure above
4. **Test cases** — 2-3 realistic prompts. Save to `evals/evals.json`. Assertions come later.
5. **Run + evaluate** — see `references/eval-workflow.md` for the full 5-step benchmark loop with parallel subagent spawning
6. **Read feedback** — `feedback.json`. Focus improvements on cases with specific complaints.
7. **Iterate** — apply improvements, rerun into `iteration-<N+1>/`, launch reviewer with `--previous-workspace <iteration-N>`
8. **Stop when** — user happy · feedback all empty · not making meaningful progress
9. **Optional: description optimization** — see `references/description-optimizer.md` for the 5-iteration eval-loop shape

## Protecting validation integrity

When using subagents for validation, treat that as an evaluation surface. The goal is to learn whether the skill generalizes, not whether another agent can reconstruct the answer from leaked context.

Pass the minimum task-local context. Avoid passing the intended answer, suspected bug, intended fix, or prior conclusions unless the validation explicitly requires them.

## Anti-patterns

- Description summarizes workflow → agent skips SKILL.md body
- Massive SKILL.md (sediment from many contributors)
- Duplication across sections (single source of truth per fact)
- No leading words → agent doesn't internalize the pattern
- No-op paragraphs → agent would have done that anyway; deletion test them
- Auxiliary documentation files (README, CHANGELOG, etc.) cluttering the skill folder

## Folded skills — absorbed triggers (2026-07-08)

Reference material in `references/from-*.md`:

- **skill-repair** (`references/from-skill-repair.md`) — fix and re-install failed skills, update `manifest.json` after fix applied.
- **find-skills** (`references/from-find-skills.md`) — discover/install skills from ecosystem via `npx skills`. Triggers: "how do I do X", "find a skill for X", "is there a skill that can...", extend agent capabilities.
- **setup-matt-pocock-skills** (`references/from-setup-matt-pocock-skills.md` + `from-setup-matt-pocock-skills-refs/`) — per-repo config scaffold for engineering skills (issue tracker, triage labels, domain docs).
- **teach** (`references/from-teach.md` + `from-teach-refs/`) — stateful teaching workspace (MISSION.md, lessons/, learning-records/, RESOURCES.md).
- **writing-great-skills** — migrated to `knowledge/rules/agent/writing-great-skills.md` (reference for writing/editing skills — predictability, invocation, information hierarchy, leading words, pruning).

## Cross-refs

- [tdd](../tdd/SKILL.md) — foundation
- `references/skill-anatomy.md` — SKILL.md structure + progressive disclosure
- `references/tdd-for-skills.md` — TDD mapping for skill authoring
- `references/eval-workflow.md` — running + evaluating test cases
- `references/description-trap.md` — why description = when-to-use, not what-it-does
- `references/description-optimizer.md` — automated description eval loop
- `references/openai_yaml.md` — agents/openai.yaml field definitions (from Codex ecosystem)
- `scripts/init_skill.py` — scaffold a new skill directory
- `scripts/quick_validate.py` — validate frontmatter and naming
- `scripts/generate_openai_yaml.py` — regenerate agents/openai.yaml
- Source: CC-native skill-creator v1 · [obra/superpowers writing-skills](https://github.com/obra/superpowers/blob/main/skills/writing-skills/SKILL.md) merged 2026-07-04 · Matt Pocock 2026-07-04 (skill checklist) · Codex skill-creator (OpenAI Codex ecosystem) merged 2026-07-11
- [agentskills.io/specification](https://agentskills.io/specification) — canonical spec
