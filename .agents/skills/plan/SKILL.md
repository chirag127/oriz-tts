---
name: plan
description: "Task breakdown and implementation planning. Write a concrete, actionable markdown plan for a zero-context junior implementer. Every task: exact files, exact code, exact commands, testable deliverable. Bite-sized steps (2-5 min each). No execution — plan only. Use when you have a spec for a multi-step task, before touching code."
version: 3.0.0
author: Hermes Agent (writing-craft adapted from obra/superpowers); oriz workspace merge 2026-07-11
license: MIT
platforms: [linux, macos, windows]
metadata:
  version: 3.0.0
  tags: [planning, plan-mode, implementation, workflow, design, documentation]
  related_skills: [subagent-driven-development, tdd, code-review, verify]
  hermes:
    tags: [planning, plan-mode, implementation, workflow, design, documentation]
    related_skills: [subagent-driven-development, test-driven-development, requesting-code-review]
disable-model-invocation: false
---

# plan — Zero-context implementation planning

## Core behavior

For this turn, you are **planning only**.

- Do not implement code.
- Do not edit project files except the plan markdown file.
- Do not run mutating terminal commands, commit, push, or perform external actions.
- You may inspect the repo or other context with read-only commands/tools when needed.
- Your deliverable is a markdown plan saved to the location specified below.

Announce at start: "I'm using the plan skill."

## Trigger

- Multi-step task with spec/requirements
- Before touching code
- Task crosses 3+ files
- AFK-mode per [[afk-vs-hitl-tasks]]
- Implementing multi-step features
- Breaking down complex requirements
- Delegating to subagents via subagent-driven-development
- Feature seems simple (assumptions cause bugs — don't skip)
- Working alone (documentation matters)

## Save location

**Default (oriz workspace / Codex):** `docs/plans/YYYY-MM-DD-<slug>.md` unless repo overrides.
In a git worktree per [[using-git-worktrees]], the plan lives in that worktree.

**Default (Hermes agent):** `.hermes/plans/YYYY-MM-DD_HHMMSS-<slug>.md` — relative to the active workspace (local, docker, ssh, modal, daytona backends all resolve this correctly).

If the runtime provides a specific target path, use that exact path.
If not, create a sensible timestamped filename under the applicable location above.

## Scope check first

Spec covers multiple independent subsystems? Break into sub-project specs — one plan per subsystem. Each plan produces working testable software on its own.

## Writing process

### Step 1: Understand requirements

Read and understand:

- Feature requirements / PRD / issues
- Design documents or user description
- Acceptance criteria
- Constraints

### Step 2: Explore the codebase

Use read-only tools to understand the project structure, similar features, existing tests, key files, and established patterns. Do not modify anything.

### Step 3: File structure — decide upfront

Before task decomposition, map which files are created or modified and what each is responsible for. See `references/file-structure.md` for depth guidance.

- Deep modules per [[deep-modules-over-shallow]]: narrow interface, thick impl
- Files that change together live together
- Follow established codebase patterns

The file structure block goes in the plan header, before Task 1:

```markdown
## File Structure

- `src/auth/session.ts` — session lifecycle: create, refresh, revoke
- `src/auth/token.ts` — JWT sign/verify (isolated from session state)
- `src/auth/index.ts` — public API surface
- `tests/auth/session.test.ts`
- `tests/auth/token.test.ts`
```

### Step 4: Design approach

Decide:

- Architecture pattern
- File organization
- Dependencies needed
- Testing strategy

### Step 5: Write tasks

Create tasks in order:

1. Setup/infrastructure
2. Core functionality (TDD for each)
3. Edge cases
4. Integration
5. Cleanup/documentation

### Step 6: Add complete details

For each task, include:

- **Exact file paths** (not "the config file" but `src/config/settings.py`)
- **Complete code examples** (not "add validation" but the actual code)
- **Exact commands** with expected output
- **Verification steps** that prove the task works

### Step 7: Self-review

After writing, review with fresh eyes:

1. **Spec coverage** — every requirement points to a task? List gaps.
2. **Placeholder scan** — find any red flag (see "No placeholders" below). Fix.
3. **Interface consistency** — every "Consumes" in Task N+1 has matching "Produces" in Task N. Identical names + types.
4. **Bite-size** — every step is 2-5 min. Reads longer? Split.
5. **Testable deliverables** — every task ends with a verify step.

Checklist:

- [ ] Tasks are sequential and logical
- [ ] Each task is bite-sized (2-5 min)
- [ ] File paths are exact
- [ ] Code examples are complete (copy-pasteable)
- [ ] Commands are exact with expected output
- [ ] No missing context
- [ ] DRY, YAGNI, TDD principles applied

## Task right-sizing

A task = smallest unit that carries its own test cycle and is worth a fresh reviewer's gate. Fold setup/config/scaffolding/docs into the task whose deliverable needs them. Split only where a reviewer could reject one task while approving its neighbor. Each task ends in an **independently testable deliverable**.

**Each task = 2-5 minutes of focused work.**

Too big:

```markdown
### Task 1: Build authentication system

[50 lines of code across 5 files]
```

Right size:

```markdown
### Task 1: Create User model with email field

[10 lines, 1 file]

### Task 2: Add password hash field to User

[8 lines, 1 file]

### Task 3: Create password hashing utility

[15 lines, 1 file]
```

## Bite-sized steps — 2-5 min each

- "Write the failing test" — step
- "Run it to make sure it fails" — step
- "Implement minimal code to pass" — step
- "Run tests to confirm pass" — step
- "Commit" — step

## Required plan structure

See `references/plan-template.md` for the full template with example task, header spec, and interface block shape. Copy it as a starting point.

### Header (required)

Every plan MUST start with:

```markdown
# [Feature Name] Implementation Plan

> **For agentic workers:** Use the `plan` skill's subagent-driven execution or
> [`subagent-driven-development`](../subagent-driven-development/SKILL.md) to
> implement task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** [One sentence describing what this builds]

**Architecture:** [2-3 sentences about approach]

**Tech Stack:** [Key technologies/libraries]

## Global Constraints

[Project-wide requirements — version floors, dependency limits, naming/copy
rules, platform requirements. One line each. Exact values verbatim from the
spec. Every task's requirements implicitly include this section.]

---
```

### Task structure

Each task follows this format (use checkbox steps for tracking):

````markdown
### Task N: [Descriptive Name]

**Objective:** What this task accomplishes (one sentence)

**Files:**

- Create: `exact/path/to/new_file.py`
- Modify: `exact/path/to/existing.py:45-67` (line numbers if known)
- Test: `tests/path/to/test_file.py`

**Interfaces:**

- Consumes: [what this task uses from earlier tasks — exact signatures]
- Produces: [what later tasks rely on — exact function names, parameter and
  return types]

- [ ] **Step 1: Write the failing test**

  ```python
  def test_specific_behavior():
      result = function(input)
      assert result == expected
  ```

- [ ] **Step 2: Run test to verify it fails**

  Run: `pytest tests/path/test.py::test_name -v`
  Expected: FAIL with "function not defined"

- [ ] **Step 3: Write minimal implementation**

  ```python
  def function(input):
      return expected
  ```

- [ ] **Step 4: Run test to verify it passes**

  Run: `pytest tests/path/test.py::test_name -v`
  Expected: PASS

- [ ] **Step 5: Commit**

  ```bash
  git add tests/path/test.py src/path/file.py
  git commit -m "feat: add specific feature"
  ```
````

## No placeholders — plan failures

Never write:

- "TBD" · "TODO" · "implement later" · "fill in details"
- "Add appropriate error handling" · "add validation" · "handle edge cases"
- "Write tests for the above" (without actual test code)
- "Similar to Task N" (repeat the code — engineer may read out of order)
- Steps describing _what_ without showing _how_
- References to types/functions/methods not defined in any task
- Vague tasks: "Add authentication" → "Create User model with email and password_hash fields"
- Incomplete code: "Step 1: Add validation function" without the actual code
- Missing verification: "Step 3: Test it works" → "Run `pytest tests/test_auth.py -v`, expected: 3 passed"
- Missing file paths: "Create the model file" → "Create: `src/models/user.py`"

## Principles

### DRY (Don't Repeat Yourself)

Bad: Copy-paste validation in 3 places
Good: Extract validation function, use everywhere

### YAGNI (You Aren't Gonna Need It)

Bad: Add "flexibility" for future requirements
Good: Implement only what's needed now

```python
# Bad — YAGNI violation
class User:
    def __init__(self, name, email):
        self.name = name
        self.email = email
        self.preferences = {}  # Not needed yet!
        self.metadata = {}     # Not needed yet!

# Good — YAGNI
class User:
    def __init__(self, name, email):
        self.name = name
        self.email = email
```

### TDD (Test-Driven Development)

Every task that produces code includes the full TDD cycle:

1. Write failing test
2. Run to verify failure
3. Write minimal code
4. Run to verify pass

See `tdd` skill for details.

### Frequent Commits

Commit after every task:

```bash
git add [files]
git commit -m "type: description"
```

## Execution handoff

After saving the plan, offer the execution approach:

**"Plan complete and saved. Ready to execute using subagent-driven-development — I'll dispatch a fresh subagent per task with two-stage review (spec compliance then code quality). Shall I proceed?"**

When executing, use the `subagent-driven-development` skill:

- Fresh subagent per task with full context
- Spec compliance review after each task
- Code quality review after spec passes
- Proceed only when both reviews approve

## Summary

```
Bite-sized tasks (2-5 min each)
Exact file paths
Complete code (copy-pasteable)
Exact commands with expected output
Verification steps
DRY, YAGNI, TDD
Frequent commits
```

**A good plan makes implementation obvious.**

## Cross-refs

- [tdd](../tdd/SKILL.md) — for each step's test/impl cycle
- [subagent-driven-development](../subagent-driven-development/SKILL.md) — execution of the plan
- [deep-modules-over-shallow](../../../../knowledge/rules/development/deep-modules-over-shallow.md)
- [afk-vs-hitl-tasks](../../../../knowledge/rules/agent/afk-vs-hitl-tasks.md)
- `references/file-structure.md` — file decomposition depth
- `references/plan-template.md` — full task/step template
- `references/cc-plan-mode.md` — CC-native `<system-reminder>` plan-mode metadata (auto-injected when CC enters plan mode; do NOT edit)

## Attribution / Sources

- Source: [obra/superpowers writing-plans](https://github.com/obra/superpowers/blob/main/skills/writing-plans/SKILL.md) merged 2026-07-04
- Matt Pocock 2026-07-04 (skill checklist)
- Hermes Agent `software-development/plan` v2.0.0 (save-location, interaction style, writing-process sections) merged 2026-07-11
- oriz workspace `agent-workflow/plan` v3.0.0 (canonical base) merged 2026-07-11

## See Also

Folded skills (2026-07-08 skill-compact merge):

- `references/from-executing-plans.md` — original triggers: "written implementation plan to execute in a separate session with review checkpoints"
- `references/from-implement.md` — original triggers: "Implement a piece of work based on a PRD or set of issues"
