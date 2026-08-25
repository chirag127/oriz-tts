## Goal
Adopt the MCP 2.0 **Streamable HTTP** transport so this server can run as a remote/shared MCP, not just local stdio.

## Current state (verified)
- Python FastMCP: `src/kt_search/mcp_server.py` — `mcp = FastMCP("kt-search")` (~line 22), started via `mcp.run()` (~line 43), which defaults to **stdio**.
- SDK: `mcp>=1.2.0` (Python). Deploy: local only, launched via `kt-search mcp` CLI subcommand.

## Change (smallest of the fleet)
FastMCP supports Streamable HTTP directly:

    mcp.run(transport="streamable-http")   # serves POST/GET at /mcp

- Gate behind an env/flag (e.g. `KT_SEARCH_HTTP=1` or a `--http` arg on the `mcp` subcommand) so stdio stays the default for local editors.
- Expose host/port via env (default `127.0.0.1:PORT`).
- Document the registration shape: `{ "type": "http", "url": "http://127.0.0.1:<port>/mcp" }`.

## Reference
The fleet's golden Streamable-HTTP template is the envpact worker (`envpact-mcp-server/worker/src/index.ts`, stateless `WebStandardStreamableHTTPServerTransport` at `/mcp`). For Python, FastMCP's `streamable-http` is the equivalent.

## Acceptance
- `kt-search mcp --http` serves `/mcp` (Streamable HTTP); stdio path unchanged by default.
- MCP Inspector connects over Streamable HTTP; `kt_search` tool call works.
- README documents both transports + the `{type:"http",url}` registration.
