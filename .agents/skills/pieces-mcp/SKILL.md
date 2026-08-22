---
name: pieces-mcp
description: Pieces MCP server tool guide. Use for long-term memory, workstream search, filesystem access, browser history, calendar, and more.
---

# Pieces MCP — Tool Guide

The **Pieces MCP** server connects you to the on-device Pieces long-term memory (LTM), workstream, local filesystem, browser history, and connected services like Google Calendar. All data is local and private.

## Quick Start

| Goal | Tool |
|------|------|
| Ask about past work or decisions | `search_memory` or `ask_pieces_ltm` |
| Save a decision or checkpoint | `create_pieces_memory` |
| Find files on disk | `filesystem_search_paths` → `filesystem_read_chunk` |
| Search file contents | `filesystem_search_text` |
| Check browser history | `browser_lookup` or `browser_activity` |
| View upcoming meetings | `get_gcal_events` |
| Get current time / build date ranges | `time_compute` |
| Get the user's profile context | `get_user_persona` |

## Core Patterns

### Pattern 1: Search → Fetch

Most workstream discovery is a two-step process:

1. **Get identifiers** — use `material_identifiers` (list by type and time), any `*_full_text_search` (keyword), or `*_vector_search` (semantic similarity).
2. **Fetch full details** — pass the returned IDs to the matching `*_batch_snapshot` tool (each accepts 1–100 UUIDs).

Example: `workstream_summaries_full_text_search` → IDs → `workstream_summaries_batch_snapshot`.

### Pattern 2: Time-Aware Queries

1. Call `time_compute` with `operation: "now"` to get the current UTC time.
2. Call `time_compute` with `operation: "calculate"` to derive offsets (e.g. `add_days: -7` for one week ago).
3. Pass the resulting ISO 8601 strings as `created.from` / `created.to` filters on search or listing tools.

### Pattern 3: Memory-First Context

Start with `search_memory` for broad work-history retrieval (it scores and ranks across multiple dimensions), then drill into specifics with targeted search tools.

---

## Tools by Category

### Memory & Context

| Tool | When to Use |
|------|-------------|
| `search_memory` | **Primary retrieval tool.** Multi-dimensional search across persons, hints, sources, and modalities with temporal filtering and cursor-based pagination. Accepts `mode`: `standard` (full detail) or `lean` (lightweight). Start here for any work-history question. |
| `ask_pieces_ltm` | Ask a natural-language question about past context. Required params: `question`, `chat_llm`. Optional: `topics`, `application_sources`, `open_files`, `related_questions`. Best for simple, direct questions. |
| `create_pieces_memory` | Save a checkpoint, decision, or summary to long-term memory. Required: `summary`, `summary_description`. Optional: `project`, `files`, `externalLinks`. Use liberally — memories are the building blocks of LTM. |
| `get_user_persona` | Retrieve the user's AI-generated profile and preferences. No parameters needed. Useful for personalizing responses. |

### Full-Text Search (Keyword Matching)

All accept `query` (required) + optional `created`/`updated` temporal filter objects and `limit`. Use when you know specific keywords.

| Tool | What It Searches |
|------|-----------------|
| `workstream_summaries_full_text_search` | AI-generated work session summaries + related annotations |
| `workstream_events_full_text_search` | Activity captures (clipboard, screenshots, focus events). Extra filters: `application`, `window_title`, `url`, `context_type`, `audio_type` |
| `conversations_full_text_search` | Copilot chat history (conversation names + messages + annotations) |
| `conversation_messages_full_text_search` | Individual chat message content |
| `tags_full_text_search` | User-created labels and categories |
| `hints_full_text_search` | AI-generated follow-up suggestions |
| `annotations_full_text_search` | Notes, summaries, and comments. Optional `annotation_type` filter |
| `persons_full_text_search` | People (searches name, email, username fields) |
| `anchors_full_text_search` | Code location bookmarks + file paths |
| `websites_full_text_search` | URLs and web page names |
| `connectors_full_text_search` | Integration records (Google Calendar, etc.) |
| `wpe_sources_full_text_search` | Application context sources |
| `wpe_source_windows_full_text_search` | Window title contexts |

### Vector Search (Semantic Similarity)

All accept `query`, optional `threshold` (0–1), `limit`, and temporal filters. Use when the exact wording is unknown.

| Tool | Scope |
|------|-------|
| `materials_vector_search` | Generic — requires `material_type` (`WORKSTREAM_SUMMARIES`, `WORKSTREAM_EVENTS`, `HINTS`, `TAGS`) |
| `workstream_summaries_vector_search` | Summaries only |
| `workstream_events_vector_search` | Events only |
| `hints_vector_search` | Hints only |
| `tags_vector_search` | Tags only |

### Identifiers & Batch Snapshots

| Tool | Purpose |
|------|---------|
| `material_identifiers` | List UUIDs by `material_type` and time range — **no search query**. Use for "all X from the last week" rather than "X matching Y". Supported types: `WORKSTREAM_SUMMARIES`, `WORKSTREAM_EVENTS`, `TAGS`, `HINTS`, `ANNOTATIONS`, `PERSONS`, `ANCHORS`, `ANCHOR_POINTS`, `CONVERSATIONS`, `CONVERSATION_MESSAGES`, `WEBSITES`, `RANGES`, `CONNECTORS`, `WPE_SOURCES`. |
| `*_batch_snapshot` | Fetch full details for 1–100 items by UUID. Available for: `workstream_summaries`, `workstream_events`, `hints`, `tags`, `annotations`, `persons`, `anchors`, `anchor_points`, `conversations`, `conversation_messages`, `websites`, `connectors`, `ranges`, `wpe_sources`, `wpe_source_windows`. |

### Time Utilities

| Tool | Purpose |
|------|---------|
| `time_compute` | Deterministic time operations — no AI guessing. Operations: **`now`** (current UTC time), **`parse`** (parse a date string), **`calculate`** (add/subtract durations via `base_time` + `add_days`, `add_hours`, etc.), **`difference`** (between `from` and `to`). Use to build reliable `created`/`updated` filter values. |

### Filesystem (Local Files)

| Tool | When to Use |
|------|-------------|
| `filesystem_search_paths` | Find files or directories by name. Fuzzy matching handles typos, partial paths, and OCR artifacts. Params: `query` (required), optional `roots` (directories to scope), `threshold` (similarity 0–1), `max_results`, `from_ms`/`to_ms` (modification time). |
| `filesystem_search_text` | Search file contents (grep-like). Params: `pattern` (required), optional `roots`, `regex` (bool), `include_globs`, `context_before`/`context_after` (surrounding lines), `case_insensitive`. Respects `.gitignore`. |
| `filesystem_read_chunk` | Read file contents with byte-offset pagination (max 1 MB per chunk). Params: `path` (required), optional `offset`, `limit`. Use `filesystem_search_paths` first to resolve the path. |

### Browser History

| Tool | When to Use |
|------|-------------|
| `browser_lookup` | Look up a URL, partial URL, keyword, or topic. Fans out to history, bookmarks, search terms, annotations, and favicons in parallel. Fuzzy matching on by default. Params: `query` (required), optional `fuzzy_threshold`, `limit`, `time_range` or `time_preset`, `browsers`. |
| `browser_activity` | Explore what the user has been doing in the browser over a time range. Optional `include` array to narrow scope: `history`, `annotations`, `search_terms`, `downloads`, `bookmarks`. Use for temporal exploration ("what did I browse this morning?"). |

### Google Calendar

| Tool | When to Use |
|------|-------------|
| `list_gcal_connectors` | List connected Google Calendar accounts/connectors. Call first to discover available calendars. |
| `get_gcal_events` | Fetch events in a time range. Required: `time_min`, `time_max` (ISO 8601). Optional: `query`, `calendar_id`, `connector_id`, `max_results`, `time_zone`. |
| `create_gcal_event` | Create a new event. Key params: `summary`, `start_date_time`/`start_date`, `end_date_time`/`end_date`, optional `attendee_emails`, `add_google_meet_link`, `description`, `location`. |
| `get_gcal_event` | Get a single event by ID. |
| `patch_gcal_event` | Update fields on an existing event. |
| `delete_gcal_event` | Delete an event. |

---

## Temporal Filtering

Most search and listing tools accept optional `created` and/or `updated` filter objects with ISO 8601 `from`/`to` boundaries. Example shape: `{ "created": { "from": "2025-06-01T00:00:00Z", "to": "2025-06-08T00:00:00Z" } }`. Omit to search across all time.

## Tips

- **Start with `search_memory`** for broad context retrieval — it handles multi-dimensional queries with scoring, ranking, and pagination.
- **Always use batch snapshots after search** — search tools return identifiers and scores, not full details.
- **`material_identifiers` is not a search tool** — it lists by type and time only. Use `*_full_text_search` or `*_vector_search` for query-based discovery.
- **Use `time_compute` to build date ranges** — don't guess ISO timestamps.
- **Filesystem tools require a path first** — call `filesystem_search_paths` before `filesystem_read_chunk` unless you already have an exact path.
- **Browser tools complement memory** — `browser_lookup` for targeted queries, `browser_activity` for temporal exploration.
- Prefer these MCP tools over manual HTTP requests to the Pieces server.
