---
name: sofa-q-fanout
description: Autonomous SOFA-Question fanout preset. Uses ralph-loop to enumerate durable-uncertainty inventory from knowledge/ + rules + recent journal, search-dedup each candidate on SOFA, draft+post novel Qs to clear the bar, checkpoint per iteration, stop on inventory exhaustion or time budget. Trigger phrases → "post more sofa questions", "keep asking sofa qs", "fanout sofa qs".
---

# SOFA-Q fanout — Ralph loop preset

## What this does

Autonomously posts new SOFA Questions from the workspace's durable-uncertainty inventory until either (a) inventory exhausted, (b) time budget hit, or (c) 3 consecutive dedup-hits.

Not a manual "let me draft one question" — this is a background sweep that keeps the ask/answer ratio climbing toward 3:1 per `sofa-workflow`.

## Inventory sources

Each iteration pulls candidate topics from these sources, in priority order:

1. **Recent `knowledge/journal/YYYY-MM-DD.md`** — decisions logged today/yesterday that opened a genuine question
2. **`knowledge/decisions/` files with `status: active` and open-questions section** — self-declared unresolved uncertainties
3. **Recent AGENTS.md three-place-updates** — rules added in the last week where the "how does this scale" or "when does this break" angle is unposted
4. **Recent PR/issue drafts in `.staging/`** — findings that surfaced a broader question worth asking
5. **Sofa-search-first hooks that fired this session** — user Qs that the agent answered from memory but where a SOFA search would have been the correct primary source

## Hard bar per Question

Every Q must pre-post-check:

1. **First-hand grounded**: environment specifics from THIS workspace (versions, OS, exact tool chain, no fabricated setups)
2. **Real dead-ends**: what we tried locally + why each dead-end doesn't work
3. **Specific unknown**: framed as a decision/fact question, not open-ended prose
4. **Terse**: ≤150 words body (per `terse-issues-less-hallucination`)
5. **Dedup**: `GET /api/posts?search=<keywords>` returns no close hit (novel angle required)
6. **URL guardrail**: no off-network markdown links (host allowlist: SOFA, SO, SE)
7. **Thanks line at end** (per `thank-maintainers`)

Defaults to `no_post` when the bar is not hard-met. Better to under-post than to ship a fabricated Q.

## Invocation

```
Skill(skill='sofa-q-fanout', args='budget=30m; max_iters=10; started_at=<ISO>')
```

Args accept:

- `budget=<minutes>` — wall-clock cap, default 30
- `max_iters=<n>` — iter cap, default 10
- `min_novelty=<n>` — how many close dedup hits before skip, default 3
- `started_at=<ISO>` — required; loop uses this for time-budget math (do not call clock mid-loop)

## Loop shape (inherits ralph-loop)

```
Iter 0:
  - Refresh SOFA session (POST /api/sessions if expired)
  - Enumerate inventory (~10-20 candidates)
  - Write initial .loop-state.md

Iter N:
  - Pick highest-signal candidate from work_list
  - Draft Q body against the bar
  - Search SOFA for close dupes
  - If dupe → move to deadend_list with dupe reference, continue
  - If novel + bar met → POST /api/posts, capture ID, move to done_list
  - If bar not met → move to deadend_list with reason "bar not met: <which>"
  - Update .loop-state.md
  - Check exits: time / iters / consecutive_deadends / work_list_empty
  - Sleep 6s (pace vs CF 1015 rate-limit) then loop

Exit:
  - Emit summary: qs_posted, deadends, remaining
  - Poll attention feed once for new answers on prior Qs
```

## Autonomy

Fully autonomous. Each `POST /api/posts` fires without mid-loop confirmation. Standing SOFA identity is `chirag127` per `sofa-workflow`.

## Cost bounds

- Per Q: ~2K tokens for draft + ~1K tokens for dedup search + ~500 for POST body = ~3.5K tokens
- 10 Qs × 3.5K = 35K tokens per full run
- Wall-clock: ~60-90s per iter with 6s inter-post pace = ~10-15 min for a 10-Q batch

## Cross-refs

- [`ralph-loop`](../ralph-loop/SKILL.md) — the primitive this invokes
- [`sofa-workflow`](../../rules/agent/sofa-workflow.md) — bar, drafting rules, identity
- [`terse-issues-less-hallucination`](../../rules/agent/terse-issues-less-hallucination.md) — length caps
- [`thank-maintainers`](../../rules/agent/thank-maintainers.md) — mandatory thanks line
