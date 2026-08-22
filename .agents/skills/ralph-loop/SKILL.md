---
name: ralph-loop
description: Autonomous execution loop pattern for agent-driven tasks. Use when a task can be attacked iteratively with a stop condition — implementation, audit, research fan-out, refactor sweep. Runs a hybrid main-thread → subagent loop with a checkpointed memory file. Stops on task-done predicate OR time budget. Trigger phrases → "ralph loop", "auto loop", "run this until done", "keep working until X".
license: MIT
---

# Ralph loop — autonomous execution primitive

## What this is

A pattern for delegating an iteratively-refinable task to a self-directed agent loop. Named after "Ralph loop" (Ralph Wiggum: same prompt, over and over, until done). One initial context feed; the loop drives itself until it hits a stop condition.

Not a framework. Not a library. A skill file that captures the pattern the agent runs when invoked.

## When to fire

- Task decomposes into repeatable iterations (find-fix-verify, draft-review-refine, enumerate-check-file)
- Task-done predicate is expressible (a test passes, a checklist empties, a search returns empty)
- Bounded time budget acceptable (loop won't run forever)
- Failure mode is bounded (each iteration is cheap; retries safe)

## When NOT to fire

- One-shot task with no natural iteration (single edit, one file read)
- Task-done predicate is fuzzy (user judgement of "good enough")
- Iteration cost is high or has external side effects that aren't reversible (paying API, filing PRs that can't be closed, sending emails)
- User wants to steer every step

## The invocation contract

The invoker (parent agent or user) provides:

1. **Task statement** — one-line goal ("File issue for every open bug in repo X", "Post SOFA Qs from durable-uncertainty inventory until exhausted", "Refactor every function that hits the linear-scan-in-loop signal")
2. **Task-done predicate** — expressible check ("no unfiled candidates remain in inventory", "cargo test passes", "search returns zero new candidates for 2 consecutive iterations")
3. **Time budget** — wall-clock cap (default: 60 minutes)
4. **Iteration budget** — max iters (default: 30, hard stop even if time not exhausted)
5. **Memory file path** — where checkpoint lives (default: `.loop-state.md` at invocation cwd)

## The loop shape

```
Iter 0 (setup):
  - Read task statement into memory file
  - Enumerate initial work list (search, grep, or fetch — whatever produces the candidate set)
  - Write initial state: {task, budget, iters_used=0, work_list, done_list=[], deadend_list=[]}

Iter N (main-thread for N in [1..3], subagent for N ≥ 4):
  - Read memory file
  - Pick next candidate from work_list
  - Attempt the iteration
  - Update memory file: move candidate to done_list or deadend_list with reason
  - Check task-done predicate → if TRUE, exit
  - Check time budget → if exhausted, exit
  - Check iteration budget → if exhausted, exit
  - Loop

Exit:
  - Emit summary: iters_used, done_count, deadend_count, remaining_count
  - Preserve memory file for post-mortem
```

### Why hybrid main-thread → subagent

- **First 3 iterations**: cache is warm, context is small, main-thread is faster (~5s per iter overhead vs ~30s subagent spawn).
- **Iteration 4+**: context has grown past the smart zone; each new iter would pay a cache-miss on the accumulated state. Subagent gets a fresh context per iter, reads only the memory file + candidate, returns the outcome.

Cutover happens at iter 4 by default; tune per invocation if iterations are unusually heavy or light.

## Memory file (`.loop-state.md`)

Single markdown file. Human-readable. Git-trackable. Format:

```markdown
# Ralph loop state — <task slug>

## Task

<one-line goal>

## Stop condition

- time_budget_min: 60
- iter_budget: 30
- task_done_predicate: <check description>

## Progress

- started_at: <ISO timestamp passed in via args, not clock read>
- iters_used: 0
- current_state: running | done | timeout | iter_exhausted

## Work list (remaining)

- [ ] candidate-1
- [ ] candidate-2
- ...

## Done list (completed successfully)

- [x] candidate-A — outcome: <short>

## Dead-end list (attempted, skipped, dupe, or failed)

- [~] candidate-B — reason: <short>

## Iteration log (append-only)

### Iter 1 — 2026-07-04T15:00:00Z — main-thread

picked: candidate-A
action: <what happened>
outcome: done | deadend | continue
notes: <detail>

### Iter 2 — 2026-07-04T15:03:00Z — main-thread

...
```

## Autonomy rules

- **Fully autonomous by default.** No mid-run human gate.
- **External-facing writes** (gh issue create, SOFA post, git push, npm publish, paid API call) inherit the invoker's authorization. If the invoker didn't gate them, they fire.
- **Standing-auth exceptions still apply**: paid API calls, repo deletions/transfers, mass deletions ≥50 LOC — halt loop and surface for MCQ.
- **Failure of one iteration does NOT stop the loop.** Failed candidate lands in deadend_list with reason; loop advances.

## Stop conditions (any one triggers exit)

1. **Task-done predicate returns true** — the natural finish
2. **Time budget exhausted** — wall-clock check against started_at (timestamps in via args; do not call `Date.now()` mid-loop)
3. **Iteration budget exhausted** — safety cap
4. **N consecutive dead-ends** — configurable, default 3; prevents infinite loop on all-candidates-fail
5. **Work list empty** — natural inventory exhaustion

## Presets

Preset skills invoke this loop with pre-filled task shapes:

- `sofa-q-fanout` — enumerate durable-uncertainty inventory → search-dedup → post novel Qs → checkpoint per iter → stop on inventory-empty or time
- `starred-repo-audit` — this session's 357-repo fanout was a Ralph loop in-workflow shape

## What this ISN'T

- A daemon. The loop exits when done; if you want it to keep running across sessions, wrap it in a Windows Scheduled Task.
- A CronCreate replacement. Cron fires on a schedule; Ralph runs once per invocation until its stop condition.
- Prompt engineering. This is loop engineering — the invoker feeds context ONCE; the loop drives itself. See Peter Steinberger 2025 quote: "You shouldn't be prompting your coding agents anymore. You should be designing loops that prompt your agent."

## Cross-refs

- [`sofa-workflow`](../../rules/agent/sofa-workflow.md) — SOFA is a natural Ralph-loop target
- [`delegate-to-subagents-by-default`](../../rules/agent/delegate-to-subagents-by-default.md) — subagent iters from iter 4+ follow this rule
- [`no-deferral-until-complete`](../../rules/agent/no-deferral-until-complete.md) — loop must complete its inventory in the invocation; no cross-session queuing
- [`ticketing-primitive`](../../rules/agent/ticketing-primitive.md) — every external-facing action inside the loop should go through the task system for auditability

## Attribution

Concept from Peter Steinberger + Anthropic Codex team ("I don't prompt Codex anymore. I have loops running the prompts"). Ralph name from the "same prompt over and over" Simpsons-adjacent joke.

## See Also

Folded presets (see `references/`):

- **own-repo-health-check** — API-only audit of chirag127/* repos. Triggers: "health check my repos", "audit my own repos", "check my chirag127 repos". See `references/from-own-repo-health-check.md`.
- **own-repos-audit-loop** — Filesystem-side audit of submodules under repos/{own,frk}/*. Triggers: "audit all my submodules", "audit oriz repos", "check every repo under repos/". See `references/from-own-repos-audit-loop.md`.
- **starred-repo-audit** — Fanout review of starred GH repos with hard publish bar. Triggers: "audit my stars", "star audit", "review starred repos", "find issues in my stars". See `references/from-starred-repo-audit.md`.
