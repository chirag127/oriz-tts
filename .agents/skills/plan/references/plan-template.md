# Plan document template

Reference for [`plan/SKILL.md`](./SKILL.md). Copy this as the starting shape.

## Header (required)

Every plan starts with this block.

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

## Task structure

```markdown
### Task N: [Component Name]

**Files:**
- Create: `exact/path/to/file.py`
- Modify: `exact/path/to/existing.py:123-145`
- Test: `tests/exact/path/to/test.py`

**Interfaces:**
- Consumes: [what this task uses from earlier tasks — exact signatures]
- Produces: [what later tasks rely on — exact function names, parameter and
  return types. A task's implementer sees only their own task; this block is
  how they learn the names + types neighboring tasks use.]

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
```

Every step includes: exact command, exact code (if code-changing), expected output.
