## Goal
Bring the (already HTTP-reachable) Worker to spec-compliant MCP 2.0 **Streamable HTTP** by using the SDK transport instead of the hand-rolled handler.

## Current state (verified)
- Node/TS Cloudflare Worker at `knowledge-mcp.oriz.in` (wrangler.toml, custom domain, `nodejs_compat`).
- `@modelcontextprotocol/sdk@^1.0.0` is a declared dep but **UNUSED** — the protocol is hand-implemented: `src/index.ts:248` fetch handler; `POST /mcp` raw JSON-RPC (`:260`); `GET /mcp` returns a **static SSE stub** (`:269-272`). `initialize` advertises `protocolVersion: '2026-03-26'`.
- So: HTTP-shaped, but **no SDK transport, no session handling, GET is a stub** — not true Streamable HTTP.

## Change
- Bump `@modelcontextprotocol/sdk` to >=1.29 and use **`WebStandardStreamableHTTPServerTransport`** (Workers-compatible, Web-standard Request/Response), stateless: `sessionIdGenerator: undefined, enableJsonResponse: true`.
- Route `/mcp` (POST + GET) through `transport.handleRequest(request)`; build a fresh `McpServer` per request; register the 4 tools (`search`, `read`, `list`, `related`) via `server.registerTool`.
- Add `/.well-known/mcp/server-card.json` + `/healthz`.

## Reference
`envpact-mcp-server/worker/src/index.ts:50,802` — the exact stateless `WebStandardStreamableHTTPServerTransport` + `/mcp` + server-card pattern. Copy it.

## Acceptance
- `/mcp` served via the SDK transport (not hand-rolled); MCP Inspector connects over Streamable HTTP; all 4 tools work.
- `knowledge-mcp.oriz.in/mcp` reachable; server-card + healthz present.
