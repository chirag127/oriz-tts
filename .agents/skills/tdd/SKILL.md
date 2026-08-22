---
name: tdd
description: Red-Green-Refactor TDD. NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST. Blocks AI test-cheating (writing tests AFTER implementation). Use when implementing any feature or bugfix.
license: MIT
---

# tdd — Red-Green-Refactor

## The Iron Law

**NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST.**

Wrote code before the test? **Delete it. Start over.** No exceptions — don't keep it as "reference", don't "adapt" it while writing tests, don't look at it. Implement fresh from tests.

Violating the letter of the rules is violating the spirit.

## Trigger

Fire on: "TDD this" · "red-green-refactor" · "test-first" · new feature · bug fix · refactor · behavior change. In AFK-mode task per [[afk-vs-hitl-tasks]] with test infra present, fire silently.

**Exceptions (ask first):** throwaway prototypes, generated code, config files.

Thinking "skip TDD just this once"? Stop. That's rationalization — see `references/rationalizations.md` if you're wavering.

## Precondition

Test loop <60s per [[feedback-loops-are-the-ceiling]]. Slow loop → fix loop FIRST, never skip TDD to dodge slow tests.

Read `CONTEXT.md` + area ADRs first — test names and interface vocab match project domain language. (Domain-vocab step from Matt Pocock 2026-07-08.)

## Seams — agree first

**Seam** = public boundary you observe behavior at, without reaching inside. Tests live at seams, never against internals. Code changes; seam-anchored tests survive.

**Confirm seams with user before writing any test.** No test written at unconfirmed seam. Effort lands on critical paths + complex logic, not every edge case. Ask: "Which seams should we test?" (Seam framing from Matt Pocock 2026-07-08.)

## The cycle — strict order

| Step         | Action                                                                                                                                    | Must verify                                                                                                                                                    |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RED**      | ONE failing test at an agreed seam. Smallest observable behavior. Real code, no mocks unless unavoidable. Clear name, no "and".           | Test FAILS with the _expected_ error. Passed immediately? You're testing existing behavior — fix the test. Errors? Fix error, re-run until it fails correctly. |
| **GREEN**    | Minimum code to pass. No YAGNI options. No untested error handling.                                                                       | Test PASSES. Other tests still pass. Output pristine. Failing? Fix code, never the test.                                                                       |
| **REFACTOR** | Extract deep modules per [[deep-modules-over-shallow]]. Rename for clarity. **Never add behavior in refactor.**                           | Stays green.                                                                                                                                                   |
| **LOOP**     | Next failing test. Vertical slice — one test → one impl → repeat, each a tracer bullet responding to what last cycle taught. Back to RED. | —                                                                                                                                                              |

## Anti-patterns — locked

- **Implementation-coupled** — mocks internal collaborators, tests private methods, asserts through side channels (DB query vs interface). Tell: breaks on refactor when behavior unchanged.
- **Tautological** — assertion recomputes expected value the way code does (`expect(add(a,b)).toBe(a+b)`, hand-derived snapshot, constant-equals-itself). Passes by construction. Expected values from independent source: known-good literal, worked example, spec. (Tautological framing from Matt Pocock 2026-07-08.)
- **Horizontal slicing** — all tests first, then all impl. Verifies imagined behavior; tests go insensitive to real changes. Work vertical slices only. (Horizontal-vs-vertical framing from Matt Pocock 2026-07-08.)

## Anti-cheat — locked

- **MUST see failing test output before writing production code.**
- **MUST NOT write multiple tests before first passes.**
- **MUST NOT skip refactor.**
- **MUST NOT rewrite test to match implementation after the fact.**

Test written AFTER code = code-shaped, not spec-shaped. Rejects the point.

## Output shape per cycle

```
SEAM:     <public interface under test>
RED:      <test name> → <expected fail message>
GREEN:    <files changed, LOC delta>
REFACTOR: <what got extracted/renamed>
```

## Cross-refs

- [feedback-loops-are-the-ceiling](../../../../knowledge/rules/agent/feedback-loops-are-the-ceiling.md)
- [deep-modules-over-shallow](../../../../knowledge/rules/development/deep-modules-over-shallow.md)
- [afk-vs-hitl-tasks](../../../../knowledge/rules/agent/afk-vs-hitl-tasks.md)
- `references/rationalizations.md` — every "TDD-is-dogmatic" comeback + the counter
- Source: Kent Beck 1999 · [obra/superpowers test-driven-development](https://github.com/obra/superpowers/blob/main/skills/test-driven-development/SKILL.md) merged 2026-07-04 · Matt Pocock 2026-07-04 (skill checklist) + 2026-07-08 (seams, tautological, vertical slicing, CONTEXT.md)
