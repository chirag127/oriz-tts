---
name: grill-me
description: Interview the user relentlessly about a plan or design until reaching shared understanding, resolving every branch of the decision tree. Use when the user wants to stress-test a plan, get grilled on their design, or explicitly says "grill me."
license: MIT
---

# Grill Me

Interview the user relentlessly about every aspect of their plan until you
reach a shared, unambiguous understanding. Walk the design tree branch by
branch, resolving dependencies between decisions one at a time before moving
to the next.

## Process

1. **Facts from codebase, decisions from user.** Before asking anything,
   check whether the answer is a _fact_ discoverable in the codebase
   (config, existing patterns, prior decisions, `knowledge/` OKF files).
   Look those up — don't ask. Only _decisions_ that are genuinely the
   user's to make get put to them. Don't over-read; follow OKF specs and
   `okf-prompt-lookup` before broad grepping.
   _(Fact/decision split borrowed from Matt Pocock 2026-07-08.)_

2. **Always recommend an answer.** For every question, form your own
   recommended answer first. Put it as option 1 with `(Recommended)`
   appended, e.g. `"PostgreSQL (Recommended)"`. Use options to teach —
   give info in the labels.

3. **Ask via `AskUserQuestion` MCQ, never free text.**

4. **Batch related questions.** Up to 4 per `AskUserQuestion` call. Group
   independent questions into one batch; if a later question depends on
   an earlier answer, ask it in a follow-up batch.

5. **Walk the tree depth-first.** Resolve a branch's dependencies before
   moving to the next. If an answer reshapes downstream decisions,
   re-derive the next batch based on it.
   _(Design-tree framing per Brooks, via Matt Pocock 2026-07-08.)_

6. **Confirmation gate before enacting.** Do NOT start implementing the
   plan until the user explicitly confirms shared understanding. Every
   locked answer lands in `knowledge/` per `self-update-rule` +
   `grill-to-knowledge` — same turn.
   _(Confirmation gate borrowed from Matt Pocock 2026-07-08.)_

7. **Stop when every branch is resolved.** Don't stop after one round
   just because the user answered — keep going until the tree is closed.

## Cross-refs

- `knowledge/rules/agent/grill-to-knowledge.md` — capture every locked answer
- `knowledge/rules/agent/self-update-rule.md` — same-turn write discipline
- `knowledge/rules/agent/auto-grill-on-architectural-decisions.md` — when to fire

## See Also

- `references/from-grill-with-docs.md` — folded skill: relentless interview + ADR/glossary docs creation via `/grilling` + `/domain-modeling`. Triggers: sharpen plan/design, create ADRs, build glossary as we go.
