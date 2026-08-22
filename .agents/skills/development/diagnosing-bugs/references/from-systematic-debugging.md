> Folded from skill `systematic-debugging` on 2026-07-08 during skill-compact merge.

---
name: systematic-debugging
description: Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
---

# Systematic Debugging

## Overview

Random fixes waste time and create new bugs. Quick patches mask underlying issues.

**Core principle:** ALWAYS find root cause before attempting fixes. Symptom fixes are failure.

**Violating the letter of this process is violating the spirit of debugging.**

## The Iron Law

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

If you haven't completed Phase 1, you cannot propose fixes.

## When to Use

Use for ANY technical issue:
- Test failures
- Bugs in production
- Unexpected behavior
- Performance problems
- Build failures
- Integration issues

**Use this ESPECIALLY when:**
- Under time pressure (emergencies make guessing tempting)
- "Just one quick fix" seems obvious
- You've already tried multiple fixes
- Previous fix didn't work
- You don't fully understand the issue

**Don't skip when:**
- Issue seems simple (simple bugs have root causes too)
- You're in a hurry (rushing guarantees rework)
- Manager wants it fixed NOW (systematic is faster than thrashing)

## The Four Phases (Quick Reference)

| Phase | Key Activities | Success Criteria |
|-------|---------------|------------------|
| **1. Root Cause** | Read errors, reproduce, check changes, gather evidence at each component boundary, trace data flow | Understand WHAT and WHY |
| **2. Pattern** | Find working examples, compare against references, identify differences, understand dependencies | Identify differences |
| **3. Hypothesis** | Form single hypothesis, test minimally, verify before continuing | Confirmed or new hypothesis |
| **4. Implementation** | Create failing test, single fix, verify — after 3+ failures, question architecture | Bug resolved, tests pass |

Full step-by-step for each phase: [`from-systematic-debugging-refs/phases.md`](from-systematic-debugging-refs/phases.md).

## Reference Index

| File | Covers |
|------|--------|
| [`from-systematic-debugging-refs/phases.md`](from-systematic-debugging-refs/phases.md) | Detailed steps for each of Phase 1-4 (root cause, pattern, hypothesis, implementation, architecture escape hatch) |
| [`from-systematic-debugging-refs/red-flags.md`](from-systematic-debugging-refs/red-flags.md) | Red-flag thoughts, partner-signal redirections, rationalizations table, "no root cause" gate, real-world impact |

## Supporting Techniques

These techniques are part of systematic debugging and available in this directory:

- **`root-cause-tracing.md`** - Trace bugs backward through call stack to find original trigger
- **`defense-in-depth.md`** - Add validation at multiple layers after finding root cause
- **`condition-based-waiting.md`** - Replace arbitrary timeouts with condition polling

**Related skills:**
- **superpowers:test-driven-development** - For creating failing test case (Phase 4, Step 1)
- **superpowers:verification-before-completion** - Verify fix worked before claiming success
