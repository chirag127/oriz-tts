---
name: mcp-fleet-manager
description: Discover, classify, validate, fork, convert, deploy, publish, monitor, and upgrade MCP servers across the fleet. Invoke when managing the MCP registry (.Codex/mcp.json), converting local MCPs to remote Streamable-HTTP endpoints, or running Smithery publish pipelines.
---

# MCP Fleet Manager

Single capability for the full MCP lifecycle across the workspace fleet. Canonical registry: `C:/g/ws/.Codex/mcp.json`. Sync to globals: `node scripts/sync-mcp-to-agents.mjs`.

## Responsibilities

1. **Discover** — enumerate servers in `.Codex/mcp.json`; cross-check installed vs referenced.
2. **Classify** — tag each server KEEP / REMOVE / DISABLE / FORK / REMOTE_HOST / SMITHERY_PUBLISH via `_classification`.
3. **Validate** — `smithery mcp list`, `mcp-doctor`, startup smoke per server.
4. **Fork** — for upstream MCPs needing local patches: fork into `repos/frk/<name>-mcp/` per `mcp-fork-pattern-in-frk`.
5. **Convert** — wrap a local stdio MCP as a remote Streamable-HTTP server (CF Worker). Template: `scripts/mcp-fleet/remote-template/`.
6. **Deploy** — `wrangler deploy` the remote MCP Worker. **Requires CF auth → external-auth blocker.**
7. **Publish** — `smithery publish` under `chirag127` namespace. **Approval-gated per standing-auth.**
8. **Monitor** — health checks via `mcp-doctor` + Worker `/health` endpoint.
9. **Upgrade** — bump pinned versions, re-validate, re-sync.

## Classification rubric

| Signal                                                                                  | → Classification    |
| --------------------------------------------------------------------------------------- | ------------------- |
| Duplicates a Codex built-in (WebFetch/WebSearch/git)                              | REMOVE or DISABLE   |
| Two servers cover the same category, one strictly broader                               | REMOVE the narrower |
| Useful, upstream needs a patch we carry                                                 | FORK                |
| Useful, remotable, no filesystem/private-data dependency                                | REMOTE_HOST         |
| Remote + generally useful to others                                                     | SMITHERY_PUBLISH    |
| Filesystem/private-data local dependency (codebase-memory, foam, screenpipe, file-drop) | KEEP local stdio    |

## Remote-MCP target end-state

Zero _production_ local MCP servers. Local stdio permitted only for dev/migration/testing/fallback, or where filesystem/private-data access is intrinsic. Every remote MCP supports: auth, authz, timeouts, health checks, structured schemas, logging, rate limiting, input/output validation, cancellation. Transport: Streamable HTTP.

## Pipeline scripts

- `scripts/mcp-fleet/classify.mjs` — read registry, emit classification table.
- `scripts/mcp-fleet/validate.mjs` — smoke-test each active server.
- `scripts/mcp-fleet/smithery-pipeline.mjs` — build / validate / publish / rollback / health-check (dry-run by default; `--publish` gated).

## Hard stops (never auto-execute)

- `wrangler deploy` (CF auth) → surface as external-auth blocker.
- `smithery publish` → approval-gated; MCQ first.
- Removing a server another agent/app depends on without inlining first.

## Cross-refs

- `mcp-config-canonical-in-private` · `agent-fleet-parity` · `mcp-fork-pattern-in-frk` · `fleet-mcp-community-only-sync-both-agents` · `Codex/mcp-tool-count-ceiling`
