## Goal
This server already contains a spec-correct SDK **Streamable HTTP** transport — but it is opt-in and local-only. Promote it to a first-class, documented (and optionally hosted) MCP 2.0 path.

## Current state (verified)
- Node ESM, `@modelcontextprotocol/sdk@^1.0.0`, published as `@chirag127/mdv-mcp`.
- Default transport: **stdio** — `src/index.mjs:47` `new StdioServerTransport()`.
- **Already present:** `src/http.mjs:3` `StreamableHTTPServerTransport` with full session management (`mcp-session-id`, `isInitializeRequest`, GET/POST/DELETE at `/mcp`, CORS) — but gated behind `HTTP_TRANSPORT=1`/`HTTP_PORT` (default `localhost:3777`), no remote deploy.

## Change
- Bump `@modelcontextprotocol/sdk` to >=1.29.
- Document the HTTP transport in the README as a supported mode (`HTTP_TRANSPORT=1 HTTP_PORT=... mdv-mcp`) with the `{ "type":"http", "url":"http://localhost:<port>/mcp" }` registration shape.
- Optional: a hostable variant. Since it needs the local markdown vault, either keep it local-HTTP, or (like the envpact worker) add a remote build that reads the vault over an API. Note this trade-off.
- Keep stdio the default.

## Reference
Your own `src/http.mjs` is already the correct pattern; `envpact-mcp-server/worker` is the remote-hosting reference if a Worker build is wanted.

## Acceptance
- HTTP mode documented + working (`/mcp` Streamable HTTP, sessions); MCP Inspector connects.
- README shows both stdio + http registration; stdio remains default.
