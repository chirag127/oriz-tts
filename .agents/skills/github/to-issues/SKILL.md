---
name: to-issues
description: Break a plan, spec, or PRD into independently-grabbable issues on the project issue tracker using tracer-bullet vertical slices.
disable-model-invocation: true
license: MIT
---

# To Issues

Break a plan into independently-grabbable issues using vertical slices (tracer bullets).

The issue tracker and triage label vocabulary should have been provided to you — ask the user for tracker URL + triage label if not configured.

## Process

### 1. Gather context

Work from whatever is already in the conversation context. If the user passes an issue reference (issue number, URL, or path) as an argument, fetch it from the issue tracker and read its full body and comments.

### 2. Explore the codebase (optional)

If you have not already explored the codebase, do so to understand the current state of the code. Use project glossary vocabulary. Respect ADRs in touched areas.

Look for opportunities to prefactor the code to make the implementation easier. "Make the change easy, then make the easy change."

### 3. Draft the issues

Break the plan into **tracer bullet** issues, following the **Vertical slice rules**. A **wide refactor** is the exception to that rule — slice it by **expand–contract** instead (see **Wide refactors**).

### 4. Quiz the user

Present the proposed breakdown as a numbered list. For each slice, show:

- **Title**: short descriptive name
- **Blocked by**: which other slices (if any) must complete first
- **User stories covered**: which user stories this addresses (if the source material has them)

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the dependency relationships correct?
- Should any slices be merged or split further?

Iterate until the user approves the breakdown.

### 5. Publish the issues to the issue tracker

For each approved slice, publish a new issue to the issue tracker using the **Issue body template**. These issues are considered ready for [AFK agents](../../../../knowledge/rules/agent/afk-vs-hitl-tasks.md), so publish them with the correct triage label unless instructed otherwise.

Publish issues in dependency order (blockers first) so you can reference real issue identifiers. Where the tracker supports it, link each slice to its parent as a native **sub-issue** and wire each blocker as a native **blocking edge** (mechanics in the issue-tracker doc); the `## Parent` and `## Blocked by` body sections are the fallback otherwise.

Do NOT close or modify any parent issue.

## Reference

### Vertical slice rules

Each issue is a thin vertical slice that cuts through ALL integration layers end-to-end, NOT a horizontal slice of one layer.

- Each slice delivers a narrow but COMPLETE path through every layer (schema, API, UI, tests)
- A completed slice is demoable or verifiable on its own
- Any prefactoring should be done first

### Wide refactors

A **wide refactor** is one mechanical change — rename a column, retype a shared symbol — whose **blast radius** fans across the whole codebase, so a single edit breaks thousands of call sites at once and no vertical slice can land green. Don't force it into a tracer bullet; sequence it as **expand–contract**:

- **Expand**: add the new form beside the old so nothing breaks.
- **Migrate batches**: move call sites over in batches sized by blast radius (per package, per directory). Each batch is its own issue blocked by the expand. Old form still exists, so CI stays green batch to batch.
- **Contract**: delete the old form once no caller remains. Issue blocked by every migrate batch.
- **Fallback**: when batches can't stay green alone, share an integration branch that all block a final integrate-and-verify issue — green promised only there.

### Issue body template

<issue-template>
## Parent

A reference to the parent issue on the issue tracker (if the source was an existing issue, otherwise omit this section).

## What to build

A concise description of this vertical slice. Describe the end-to-end behavior, not layer-by-layer implementation.

Avoid specific file paths or code snippets — they go stale fast. Exception: `/prototype` output encoding a decision (state machine, reducer, schema, type shape) → point to the prototype location instead of inlining.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Blocked by

- A reference to the blocking ticket (if any)

Or "None - can start immediately" if no blockers.
</issue-template>

## Cross-refs

- Rule: [`knowledge/rules/agent/vertical-slices-not-horizontal.md`](../../../../knowledge/rules/agent/vertical-slices-not-horizontal.md)
- Rule: [`knowledge/rules/agent/afk-vs-hitl-tasks.md`](../../../../knowledge/rules/agent/afk-vs-hitl-tasks.md)

---

Adapted for oriz workspace 2026-07-08.
