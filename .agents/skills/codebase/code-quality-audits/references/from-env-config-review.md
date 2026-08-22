> Folded from skill `env-config-review` on 2026-07-08 during skill-compact merge.

---
name: env-config-review
description: Review .env, .env.example, docker-compose.yml, Kubernetes manifests, config files for secrets leakage, missing defaults, unsafe values, multi-env drift. Use when user says "audit env config", "review .env", "check my compose file". Enforces [[env-example-mirrors-env-with-steps]] + [[no-hardcoded-secrets]].
---

# env-config-review — Env / secrets / Docker config auditor

## Trigger

Fire when the user says: "audit env config", "review .env", "check my compose file". Or invoke explicitly via `/env-config-review`.

## Task-oriented — see [[task-oriented-execution-model]]

## Phase 1 — inventory (TASK-1.x)

- TASK-1.1: list config files (`.env*`, `docker-compose*.yml`, `Dockerfile`, `k8s/*.yaml`, `terraform/*.tf`)
- TASK-1.2: identify environments (dev / staging / prod)
- TASK-1.3: check gitignore covers actual `.env` (not `.env.example`)

## Phase 2 — secrets safety (TASK-2.x)

- TASK-2.1: grep for API keys, tokens, passwords in committed files
- TASK-2.2: check `git log --all -p` for historical secret leaks
- TASK-2.3: verify secrets manager wiring (sops+age, Doppler, Vault, cloud KMS)
- TASK-2.4: flag any `.env` in a Docker `COPY` line
- TASK-2.5: verify per [[no-hardcoded-secrets]]

## Phase 3 — env.example parity (TASK-3.x)

- TASK-3.1: diff `.env.example` vs `.env` — every var in `.env` must have example
- TASK-3.2: for each var, is there a "how to obtain" comment? per [[env-example-mirrors-env-with-steps]]
- TASK-3.3: flag any missing keys, extra keys, mismatched shapes

## Phase 4 — Docker sanity (TASK-4.x)

- TASK-4.1: base image pinned (not `:latest`)
- TASK-4.2: multi-stage build to strip build-time deps
- TASK-4.3: non-root user for runtime
- TASK-4.4: healthcheck defined
- TASK-4.5: no `.env` copied — mount at runtime
- TASK-4.6: `.dockerignore` covers `.git`, `node_modules`, `.env*`

## Phase 5 — Compose / k8s (TASK-5.x)

- TASK-5.1: version pinned per service
- TASK-5.2: named volumes for state (not bind mounts to random paths)
- TASK-5.3: network isolation between services
- TASK-5.4: resource limits set (mem, cpu)
- TASK-5.5: restart policy explicit
- TASK-5.6: secrets via env file, not inline

## Phase 6 — multi-env drift (TASK-6.x)

- TASK-6.1: for each var, does it differ meaningfully between dev/staging/prod?
- TASK-6.2: identify "prod-only" vars (feature flags, real API keys) — should NEVER appear in dev
- TASK-6.3: identify shared vars — should live in a base file with per-env overlay

## Output shape

```
CRITICAL:
  - <file:line> — <what leaks>. Fix: <exact command>
HIGH:
  - ...
MEDIUM:
  - ...
env.example parity:
  - Missing in .env.example: <var> (add with "# how to obtain: <steps>")
  - Missing in .env: <var>
```

## Anti-patterns

- ❌ Committing `.env` (even to "private" repos)
- ❌ `.env.example` with real values as "examples"
- ❌ Copying `.env` into image at build time
- ❌ Base image `:latest` in prod
- ❌ Missing "how to obtain" per env var

## Cross-refs

- [no-hardcoded-secrets](../../../../knowledge/rules/security/no-hardcoded-secrets.md)
- [env-example-mirrors-env-with-steps](../../../../knowledge/rules/development/env-example-mirrors-env-with-steps.md)
- [submodule-env-files-three-file-pattern](../../../../knowledge/rules/security/submodule-env-files-three-file-pattern.md)


## Provenance

- **Source:** prompts.chat: Environment Configuration Agent Role, harvested 2026-07-03
- **Repository:** [f/awesome-chatgpt-prompts](https://github.com/f/awesome-chatgpt-prompts)
- **License:** CC0 1.0 (prompts.chat)
