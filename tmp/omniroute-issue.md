## Description

Every combo request — and especially `auto` combos — returns **503 "Maximum combo retry limit reached"** after exhausting all retries. The error appears on every single combo, not just specific ones, which suggests a systemic issue rather than individual provider failures.

The client sees the 503 after the retry loop completes, with messages like:
```
503 Maximum combo retry limit reached · Retrying in 28s · attempt 10/10
```

This happens consistently, not intermittently.

## Related Prior Fixes

- **#8375** — `isInputBoundRequestFailure()` was added to short-circuit deterministic input-bound errors (e.g. `context_length_exceeded`) instead of burning all 30 attempts
- **#8376** — `isProxyUnreachable` override added so ECONNREFUSED on a dead proxy trips the provider circuit breaker instead of retrying 30 times

Both fixes are in the codebase, but the user still hits this on **every** combo, suggesting the root cause may be different from what #8375/#8376 addressed.

## Root Cause Analysis

From `open-sse/services/combo.ts` (lines 1040-1045):
```typescript
if (globalAttempts > MAX_GLOBAL_ATTEMPTS) {
  log.warn("COMBO", `Maximum combo attempts (${MAX_GLOBAL_ATTEMPTS}) exceeded...`);
  return { ok: false, response: errorResponseWithComboDiagnostics(503, "Maximum combo retry limit reached", ...) };
}
```

`MAX_GLOBAL_ATTEMPTS = 30` (from `comboPredicates.ts:87`).

When **all** providers/models in a combo pool return transient errors (429 rate limits, 502, 503, 504), the combo loop tries each one, retries per-target, moves to the next target, and eventually burns through 30 global attempts. For auto combos with large candidate pools, this means the loop tries many providers, each one failing transiently, and hits the ceiling.

## Hypothesis

1. **Transient errors across the board**: If the upstream providers are all returning 429/502/503 (e.g. during high load or an outage), the combo loop correctly retries but eventually exhausts `MAX_GLOBAL_ATTEMPTS=30`. This is "by design" but the UX is terrible — the client gets a 503 after 28+ seconds of retries.

2. **Missing early bail-out for systemic failures**: The loop doesn't detect that *all* candidates are failing with the *same* error class and short-circuit early. It burns through every candidate even when the outcome is predictable.

3. **Auto combos have larger pools**: Auto combos can have 10+ candidates, so they burn through `MAX_GLOBAL_ATTEMPTS` faster than smaller combos.

## Suggested Improvements

1. **Systemic failure detection**: If the first N candidates (e.g. 3) all fail with the same transient error class (e.g. all 429), short-circuit early with a more informative message like "All candidates rate-limited — try again later" instead of burning all 30 attempts.

2. **Exponential backoff across candidates**: Currently the retry delay is fixed (`retryDelayMs`). For systemic failures, the delay should increase with each new candidate failure.

3. **Separate limit for auto combos**: Auto combos with large pools should have a higher `MAX_GLOBAL_ATTEMPTS` or a smarter budget that accounts for pool size.

4. **Better client-facing message**: The 503 body should include which error classes were seen (e.g. "3 × 429, 5 × 502, 2 × 504") so the client knows whether to retry or give up.

## Reproduction

- Use any combo (manual or auto)
- When upstream providers are under load or rate-limited
- Every combo returns 503 after exhausting all retries
- Especially visible on `auto` combos which have more candidates to burn through

## Environment

- OmniRoute latest
- Affecting all combo types, most visible on `auto`
