---
name: diagnosing-bugs
description: Diagnosis loop for hard bugs and performance regressions. Use when the user says "diagnose"/"debug this", or reports something broken/throwing/failing/slow.
license: MIT
---

# Diagnosing Bugs

> Adapted from mattpocock/skills for oriz workspace 2026-07-08. Principle: [`feedback-loops-are-the-ceiling`](../../../../../knowledge/rules/agent/feedback-loops-are-the-ceiling.md). Loop-shape >3 iters → [`ralph-loop-when-loopshaped`](../../../../../knowledge/rules/agent/ralph-loop-when-loopshaped.md). Finish in-session per [`no-deferral-until-complete`](../../../../../knowledge/rules/agent/no-deferral-until-complete.md). Post TIL/Question per [`sofa-workflow`](../../../../../knowledge/rules/agent/sofa-workflow.md).

Discipline for hard bugs. Skip phases only when explicitly justified. Explore codebase via `knowledge/index.md` + relevant `knowledge/decisions/`.

## Phase 1 — Build a feedback loop
**The skill.** Tight pass/fail signal that goes red on _this_ bug → cause falls out. Bisection, hypothesis-testing, instrumentation just consume it. Loop right = bug 90% fixed. Construction ladder (try in order):

| # | Loop type |
|---|---|
| 1 | Failing test at nearest seam (unit/integration/e2e) |
| 2 | Curl/HTTP script against dev server |
| 3 | CLI + fixture, diff stdout vs snapshot |
| 4 | Headless browser (Playwright/Puppeteer) — DOM/console/network asserts |
| 5 | Replay captured trace (HAR/payload/event log) through code path |
| 6 | Throwaway harness — minimal subset, mocked deps, single fn call |
| 7 | Property/fuzz loop — 1000 random inputs |
| 8 | Bisection harness → `git bisect run` |
| 9 | Differential loop — old vs new, diff outputs |
| 10 | HITL harness — human clicks driven by PS/bash script, output feeds back |

**Tighten.** Faster (cache setup, skip init, narrow scope). Sharper (assert exact symptom, not "no crash"). Deterministic (pin time, seed RNG, isolate FS, freeze network). 30s flaky ≈ no loop; 2s deterministic = tight.
**Non-deterministic.** Goal = higher repro rate, not clean repro. Loop 100×, parallelise, stress, narrow timing, inject sleeps. 50%-flake debuggable; 1% not.
**Cannot build a loop?** Stop. State it. List attempts. Ask user for: (a) repro env access, (b) captured artifact (HAR/log/core dump/timestamped recording), or (c) permission for temp prod instrumentation. Do NOT hypothesise loopless.

**Done — tight + red-capable.** One command (script/test/curl), already run once (paste invocation + output):
- [ ] Red-capable — drives actual bug path, asserts user's exact symptom
- [ ] Deterministic — same verdict every run (flaky: pinned high repro rate)
- [ ] Fast — seconds, not minutes
- [ ] Agent-runnable — unattended; humans via HITL harness only

Reading code to build a theory before this command exists → **stop.** Jumping to hypothesis is the failure this skill prevents.

## Phase 2 — Reproduce + minimise
Run loop. Watch it go red. Confirm:
- [ ] Failure mode = **user's** described symptom (wrong bug = wrong fix)
- [ ] Reproducible across runs (or high-enough rate for flaky)
- [ ] Exact symptom captured (error string, wrong output, slow timing)

**Minimise.** Shrink to smallest scenario still red. Cut inputs/callers/config/data/steps one at a time, re-run after each cut. Keep only load-bearing → shrinks Phase 3 hypothesis space, becomes Phase 5 regression test. Done when every remaining element is load-bearing. Do not proceed until reproduced AND minimised.

## Phase 3 — Hypothesise
Generate **3–5 ranked, falsifiable hypotheses** before testing any. Single-hypothesis anchors on first plausible idea.

> "If \<X\> is cause, then \<changing Y\> makes bug disappear / \<changing Z\> makes it worse."

No prediction = vibe; discard or sharpen. Show ranked list to user — domain knowledge re-ranks instantly ("just deployed #3") or rules some out. Don't block; proceed if AFK.

## Phase 4 — Instrument
Each probe maps to a specific Phase 3 prediction. Change one variable at a time.
1. Debugger/REPL if env supports — one breakpoint beats ten logs
2. Targeted logs at hypothesis-distinguishing boundaries
3. Never "log everything and grep"

**Tag debug logs** with unique prefix `[DEBUG-a4f2]` → cleanup = one grep.

**Perf branch.** Logs usually wrong for perf regressions. Baseline measurement (timing harness, `performance.now()`, profiler, query plan), then bisect. Measure first, fix second.

## Phase 5 — Fix + regression test
Write regression test **before fix** — only if a **correct seam** exists. Correct seam = test exercises real bug pattern at call site. Too-shallow seam (single-caller test when bug needs multiple, unit test that can't replicate trigger chain) = false confidence.

**No correct seam = the finding.** Architecture prevents lockdown. Flag for Phase 6.

Correct seam exists: minimised repro → failing test at that seam → watch fail → apply fix → watch pass → re-run Phase 1 loop against original un-minimised scenario.

## Phase 6 — Cleanup + post-mortem
- [ ] Original repro no longer reproduces (re-run Phase 1)
- [ ] Regression test passes (or seam-absence documented)
- [ ] All `[DEBUG-...]` removed (Grep the prefix)
- [ ] Throwaway prototypes deleted or marked debug
- [ ] Correct hypothesis stated in commit/PR — next debugger learns

**Then: what would have prevented this?** Architectural answer (no seam, tangled callers, hidden coupling) → flag architecture-review pass with specifics. Recommend **after** fix lands. Non-obvious fix → post SOFA TIL per [`sofa-workflow`](../../../../../knowledge/rules/agent/sofa-workflow.md).

## See Also

Folded skills preserved in `references/`:

- [`references/from-systematic-debugging.md`](references/from-systematic-debugging.md) — root-cause-first four-phase discipline (Iron Law: no fixes without RCA). Triggers: any bug, test failure, unexpected behavior, before proposing fixes.
- [`references/from-rca.md`](references/from-rca.md) — structured incident postmortem with stable task IDs (scope, symptoms, hypotheses, timeline, corrective actions). Triggers: "rca this", "investigate this incident", "root cause of X", "postmortem".
- [`references/from-triage.md`](references/from-triage.md) — issue/PR triage state machine with agent-brief authoring + `.out-of-scope/` KB. Triggers: `/triage`, moving issues through categorise/verify/grill workflow.
