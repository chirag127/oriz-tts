> Folded from skill `api-design-review` on 2026-07-08 during skill-compact merge.

---
name: api-design-review
description: Design or review RESTful / GraphQL / gRPC / OpenAPI APIs. Covers versioning, error envelopes, auth patterns, pagination, idempotency, DX. Use when user says "review this API", "design an API for X", "audit endpoints".
---

# api-design-review — API design expert — review + propose

## Trigger

Fire when the user says: "review api design", "design api for", "audit endpoints". Or invoke explicitly via `/api-design-review`.

## Task-oriented — see [[task-oriented-execution-model]]

## Phase 1 — surface inventory (TASK-1.x)

- TASK-1.1: enumerate resources / operations
- TASK-1.2: identify collections vs singletons
- TASK-1.3: list clients (browsers, mobile, other services)
- TASK-1.4: identify write vs read heavy paths

## Phase 2 — protocol pick (TASK-2.x)

- TASK-2.1: REST vs GraphQL vs gRPC — pick with reason
- TASK-2.2: OpenAPI 3.1 spec (REST) / SDL (GraphQL) / .proto (gRPC)
- TASK-2.3: content-type + encoding decision
- TASK-2.4: streaming needs? (SSE / WebSocket / gRPC streams)

## Phase 3 — resource design (TASK-3.x)

- TASK-3.1: URL shape (kebab-plural for REST collections)
- TASK-3.2: method semantics (GET idempotent + safe, PUT idempotent, POST not)
- TASK-3.3: status codes — no 200 for errors
- TASK-3.4: error envelope shape — RFC 7807 or custom-with-justification
- TASK-3.5: pagination shape (cursor > offset for large collections)
- TASK-3.6: filtering + sorting query params
- TASK-3.7: field selection / sparse fieldsets

## Phase 4 — versioning + evolution (TASK-4.x)

- TASK-4.1: versioning strategy (URL, header, media-type)
- TASK-4.2: breaking-change policy
- TASK-4.3: deprecation timeline + Sunset header
- TASK-4.4: additive-only change patterns

## Phase 5 — cross-cutting (TASK-5.x)

- TASK-5.1: auth pattern (or no-auth per [[no-auth-in-apps-or-apis]])
- TASK-5.2: rate limiting shape
- TASK-5.3: idempotency keys for POST
- TASK-5.4: request/response IDs for tracing
- TASK-5.5: caching strategy (ETag, Cache-Control)
- TASK-5.6: CORS policy

## Phase 6 — DX (TASK-6.x)

- TASK-6.1: examples in each endpoint doc
- TASK-6.2: SDK generation friendliness (OpenAPI / .proto)
- TASK-6.3: sandbox / test tokens
- TASK-6.4: error messages that name the fix, not the failure

## Anti-patterns

- ❌ Verbs in URLs for REST (/getUsers instead of GET /users)
- ❌ 200 OK with error body inside
- ❌ Chatty endpoints requiring N calls for one screen
- ❌ Silent breaking changes on same version
- ❌ Reinventing pagination or auth when a standard applies

## Cross-refs

- [openai-compat-for-all-ai-providers](../../../../knowledge/rules/interaction/openai-compat-for-all-ai-providers.md)
- [no-auth-in-apps-or-apis-2026-06-25](../../../../knowledge/decisions/architecture/security/no-auth-in-apps-or-apis-2026-06-25.md)


## Provenance

- **Source:** prompts.chat: API Design Expert Agent Role, harvested 2026-07-03
- **Repository:** [f/awesome-chatgpt-prompts](https://github.com/f/awesome-chatgpt-prompts)
- **License:** CC0 1.0 (prompts.chat)
