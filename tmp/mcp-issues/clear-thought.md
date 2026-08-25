## Goal
Make this server MCP 2.0 **Streamable HTTP** capable. It currently cannot be, because of the SDK it uses.

## Current state (verified)
- Node/TS, uses the **experimental split SDK** `@modelcontextprotocol/server@^2.0.0` + `@modelcontextprotocol/client@^2.0.0`.
- Transport: **stdio only** — `src/index.ts:3` `import { StdioServerTransport } from "@modelcontextprotocol/server/stdio"`, `src/index.ts:1214` connects over stdio. Uses string-literal `server.setRequestHandler('tools/list' ...)`.
- **Blocker:** the installed `@modelcontextprotocol/server@2.0.0` exports only `./stdio` (+ `validators/ajv`, `validators/cf-worker`) — **there is NO HTTP/streamable transport export in the v2 package yet.** So HTTP is impossible without changing SDK.

## Recommended change
Migrate to the mainstream `@modelcontextprotocol/sdk` (>=1.29), which has the Streamable HTTP transport today:
- Swap `@modelcontextprotocol/server|client@2.0.0` -> `@modelcontextprotocol/sdk@^1.29`.
- Port the `setRequestHandler` handlers to `McpServer` + `server.registerTool(name, {title,description,inputSchema}, handler)`.
- Add a Streamable HTTP entry (`StreamableHTTPServerTransport` for Node, or `WebStandardStreamableHTTPServerTransport` for a CF Worker), `/mcp`, gated behind `HTTP_TRANSPORT=1`; keep stdio default.
- (Alternative: wait for the v2 SDK to ship an HTTP transport — not available now.)

## Reference
`envpact-mcp-server` root (stdio, `registerTool` shape) + `worker/src/index.ts` (Streamable HTTP) — same repo, both patterns, mainstream SDK.

## Acceptance
- Runs on mainstream `@modelcontextprotocol/sdk`; all 12 thinking tools intact.
- stdio default + `HTTP_TRANSPORT=1` serves `/mcp` over Streamable HTTP; MCP Inspector connects both ways.
