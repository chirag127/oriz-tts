> Folded from skill `finishing-a-development-branch` on 2026-07-08 during skill-compact merge.

---
name: finishing-a-development-branch
description: Use when implementation is complete, all tests pass, and you need to decide how to integrate the work - guides completion of development work by presenting structured options for merge, PR, or cleanup
---

# Finishing a Development Branch

## Overview

Guide completion of development work by presenting clear options and handling chosen workflow.

**Core principle:** Verify tests → Detect environment → Present options → Execute choice → Clean up.

**Announce at start:** "I'm using the finishing-a-development-branch skill to complete this work."

## The Process

### Step 1: Verify Tests

**Before presenting options, verify tests pass:**

```bash
# Run project's test suite
npm test / cargo test / pytest / go test ./...
```

**If tests fail:**

```
Tests failing (<N> failures). Must fix before completing:

[Show failures]

Cannot proceed with merge/PR until tests pass.
```

Stop. Don't proceed to Step 2.

**If tests pass:** Continue to Step 2.

### Step 2: Detect Environment

**Determine workspace state before presenting options:**

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
```

This determines which menu to show and how cleanup works:

| State                                  | Menu                         | Cleanup                                  |
| -------------------------------------- | ---------------------------- | ---------------------------------------- |
| `GIT_DIR == GIT_COMMON` (normal repo)  | Standard 4 options           | No worktree to clean up                  |
| `GIT_DIR != GIT_COMMON`, named branch  | Standard 4 options           | Provenance-based (see execute reference) |
| `GIT_DIR != GIT_COMMON`, detached HEAD | Reduced 3 options (no merge) | No cleanup (externally managed)          |

### Step 3: Determine Base Branch

```bash
# Try common base branches
git merge-base HEAD main 2>/dev/null || git merge-base HEAD master 2>/dev/null
```

Or ask: "This branch split from main - is that correct?"

### Step 4: Present Options

**Normal repo and named-branch worktree — present exactly these 4 options:**

```
Implementation complete. What would you like to do?

1. Merge back to <base-branch> locally
2. Push and create a Pull Request
3. Keep the branch as-is (I'll handle it later)
4. Discard this work

Which option?
```

**Detached HEAD — present exactly these 3 options:**

```
Implementation complete. You're on a detached HEAD (externally managed workspace).

1. Push as new branch and create a Pull Request
2. Keep as-is (I'll handle it later)
3. Discard this work

Which option?
```

**Don't add explanation** - keep options concise.

### Step 5 & 6: Execute Choice + Cleanup

Full command sequences for each option (merge, push, keep, discard) plus the worktree cleanup rules live in [`from-finishing-a-development-branch-refs/execute.md`](from-finishing-a-development-branch-refs/execute.md).

## Quick Reference

| Option           | Merge | Push | Keep Worktree | Cleanup Branch |
| ---------------- | ----- | ---- | ------------- | -------------- |
| 1. Merge locally | yes   | -    | -             | yes            |
| 2. Create PR     | -     | yes  | yes           | -              |
| 3. Keep as-is    | -     | -    | yes           | -              |
| 4. Discard       | -     | -    | -             | yes (force)    |

## Reference Index

| File                                                                                                           | Covers                                                               |
| -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| [`from-finishing-a-development-branch-refs/execute.md`](from-finishing-a-development-branch-refs/execute.md)   | Detailed command sequences for each option + Step 6 worktree cleanup |
| [`from-finishing-a-development-branch-refs/mistakes.md`](from-finishing-a-development-branch-refs/mistakes.md) | Common mistakes, red flags (always/never lists)                      |
