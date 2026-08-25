# 503 on `mimo/mimo-v2.5` — model not in any combo, no credentials for xiaomi-mimo provider

## Description

When a client requests `mimo/mimo-v2.5` and the model is not configured in any combo, OmniRoute attempts to route it directly to the `xiaomi-mimo` provider. If no credentials are configured for that provider, all retry attempts fail and the client receives:

```
503 Maximum combo retry limit reached · Retrying in 28s · attempt 10/10
```

## Steps to Reproduce

1. Configure OmniRoute with only `fusion` and `Kimi Coding` combos (no `xiaomi-mimo` credentials)
2. Send a request with `model: "mimo/mimo-v2.5"`
3. OmniRoute tries to route directly to `xiaomi-mimo` provider
4. All retry attempts fail (no credentials)
5. Client receives 503 after exhausting `MAX_GLOBAL_ATTEMPTS`

## Expected Behavior

OmniRoute should either:
1. **Detect "no credentials" immediately** and return a clear error (e.g., `400 "Model mimo/mimo-v2.5 not available — no credentials configured for xiaomi-mimo"`)
2. **Fall back to an auto combo** that includes the model family (e.g., `auto/mimo`)
3. **Return a 404/400** instead of burning through 30 retry attempts

## Actual Behavior

OmniRoute burns through all retry attempts (`MAX_GLOBAL_ATTEMPTS = 30`) before returning 503, wasting time and resources.

## Root Cause

- `mimo/mimo-v2.5` is not in any configured combo
- The `xiaomi-mimo` provider has no credentials/API key configured
- OmniRoute's direct routing path doesn't check for credentials before attempting retries
- The error classification doesn't treat "missing credentials" as a terminal failure

## Suggested Fix

1. **Credential pre-check**: Before routing a direct (non-combo) request, verify that the target provider has valid credentials configured. If not, return `400` immediately.
2. **Auto-combo fallback**: When a model isn't in any combo, try routing through `auto/mimo` (which already exists as a virtual combo) instead of direct routing.
3. **Better error messages**: Instead of generic "Maximum combo retry limit reached", include the provider name and reason (e.g., "no credentials for xiaomi-mimo").

## Environment

- OmniRoute version: v3.8.x (latest)
- Client: Freebuff/Codebuff desktop app
- Model requested: `mimo/mimo-v2.5`
- Configured combos: `fusion`, `Kimi Coding`
- `xiaomi-mimo` credentials: Not configured

## Related Issues

- #39 — 503 "Maximum combo retry limit reached" on every combo (similar symptom, different root cause)

## Labels

`bug`, `routing`, `resilience`
