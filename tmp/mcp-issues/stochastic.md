## Goal
Add the MCP 2.0 **Streamable HTTP** transport alongside stdio.

## Current state (verified)
- Node ESM, SDK `@modelcontextprotocol/sdk@^1.11.4` (mainstream — good).
- Transport: **stdio only** — `index.js:3` imports `StdioServerTransport`, `index.js:186` `new StdioServerTransport()` + `server.connect(transport)`.
- Deploy: Dockerfile + Smithery (`type: stdio`). Tool: `stochasticalgorithm`.

## Change
The SDK already ships the transport — bump to latest `@modelcontextprotocol/sdk` (>=1.29) and add a Streamable HTTP entry:
- Add an HTTP entry (e.g. `http.js`) using `StreamableHTTPServerTransport` (Node) — session-managed, `/mcp` POST/GET/DELETE, CORS. Or `WebStandardStreamableHTTPServerTransport` if deploying to a Worker.
- Gate behind `HTTP_TRANSPORT=1` / `HTTP_PORT` so stdio stays default.
- Fix the stale `bin` path while here (`bin` points at `dist/cli.js` but esbuild emits `dist/stochastic-thinking-mcp-server.js`).

## Reference
`envpact-mcp-server/worker/src/index.ts` (stateless Streamable HTTP, `/mcp`, server-card) and `mdv-mcp/src/http.mjs` (stateful session Streamable HTTP over Node) are the two in-fleet patterns to copy.

## Acceptance
- stdio default unchanged; `HTTP_TRANSPORT=1` serves `/mcp` over Streamable HTTP.
- MCP Inspector connects over HTTP; `stochasticalgorithm` works.
- `bin` path corrected; README documents `{type:"http",url:".../mcp"}` registration.
