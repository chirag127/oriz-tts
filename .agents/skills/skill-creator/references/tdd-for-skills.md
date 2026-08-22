# TDD mapping for skill authoring

Reference for [`skill-creator/SKILL.md`](../SKILL.md).

| TDD concept | Skill creation |
|---|---|
| Test case | Pressure scenario with subagent |
| Production code | SKILL.md |
| Test fails (RED) | Agent violates rule without skill (baseline) |
| Test passes (GREEN) | Agent complies with skill present |
| Refactor | Close loopholes while maintaining compliance |
| Write test first | Run baseline scenario BEFORE writing skill |
| Watch it fail | Document exact rationalizations agent uses |
| Minimal code | Write skill addressing those specific violations |
| Watch it pass | Verify agent now complies |
| Refactor cycle | Find new rationalizations → plug → re-verify |

## Why this mapping matters

TDD's "write the test, watch it fail" step maps directly to "run the baseline scenario before writing the skill". This is the moment you learn **what the agent actually does wrong** — not what you imagined it would do.

Without the baseline: you write a skill for an imagined failure. The agent may have been doing fine already; the skill is a no-op.

With the baseline: you document the exact rationalizations, exact violations, exact context. The skill addresses those specifically.

## In practice

1. **Baseline run.** Give a subagent the task WITHOUT the skill. Watch what it does. Log the rationalizations verbatim.
2. **Write the skill.** Address the specific rationalizations you saw. Use leading words that name the concept.
3. **With-skill run.** Same task, WITH the skill. Compliance?
4. **Refactor.** New rationalizations that show up? Add counters. Old sections that never fired? Delete.

## Anti-pattern

Skipping the baseline and writing the skill from imagined failures. You'll ship no-ops (the agent would have done the right thing anyway) and miss real gaps.
