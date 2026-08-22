# Description trap — why description ≠ workflow summary

Reference for [`skill-creator/SKILL.md`](../SKILL.md).

## The trap

Description that summarizes the skill's workflow causes agents to follow the description **instead of** reading the full skill.

## Real-world case (obra/superpowers)

A skill's description said "Use when reviewing code between tasks — checks spec compliance then code quality" (2 stages).

The skill body had a flowchart showing **two** separate reviews.

Agents did **one** review. Every time.

Why: the description was cheaper. The agent read "reviews code between tasks", felt it understood, and skipped the SKILL.md body.

## The fix

Changed to: "Use when executing implementation plans with independent tasks."

Zero workflow summary. Zero shortcut for the agent to take. Agents now read the flowchart and do both reviews.

## Rule

- **Description = triggering conditions only.** Symptoms, contexts, use cases.
- **NEVER summarize the workflow.** That's what SKILL.md is for.
- Start with "Use when..." to focus on triggering.
- Under 500 chars if possible.

## Examples

```yaml
# ❌ BAD — summarizes workflow
description: Review code between tasks, checking spec compliance then code quality

# ✅ GOOD — triggering only
description: Use when executing implementation plans with independent tasks
```

```yaml
# ❌ BAD
description: Runs the RED-GREEN-REFACTOR cycle, writing the test first then minimal implementation

# ✅ GOOD
description: NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST. Use when implementing any feature or bugfix
```

## Why it works

The description is the model's decision-making context. Give it enough to route correctly, not enough to feel like it can answer without reading further.

Think of it as an index entry, not a summary.

## When "pushy" is OK

Claude tends to under-trigger skills. Being a little pushy in the description is fine — include phrases like "even if they don't explicitly ask for X" when appropriate. But never at the cost of summarizing the workflow.
