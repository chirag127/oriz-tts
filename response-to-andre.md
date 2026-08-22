# Response to Andre — Hyperspace AI Pro Plan Request

**To:** Andre Spura
**CC:** Joerg Stahr, Bernadett Persicke-Nagy
**From:** Chirag Singhal (C5420321)
**Subject:** Re: IT for You [Action Required]: Manager Approval Required for Purchase of Hyperspace AI Pro Plan

---

Hi Andre,

Thanks for the follow-up. Quick context on the request:

## My Role

I'm an **engineer on the SAP CP L2C Quote / Public Cloud Order Management – L2** team (under Joerg's org, your cost center). My day-to-day is engineering and root-cause work:

- **CPQ ticket resolution** — pricing/quote failures, partner discount logic, renewal/reactivation bugs (e.g. INC33308800, INC32808868)
- **Knowledge-transfer engineering** — I've built my own local semantic-search stack over 100+ hours of CPQ onboarding videos/PPTX/PDFs so I can trace answers to cited anchors instead of guessing
- **Deal-execution engineering** — AACV reconciliation, YYPAR/CHP partner-level verification, quote re-open automation (ZCALLIDUS_CART_ACTION_TRIGGER), ABAP message tracing via SE91

---

## Why I Need Pro (€500/month)

I hit the Basic-plan ceiling every few days because my workflow isn't "chat with AI" — it's **orchestrating multiple local tools** in long, multi-step sessions:

| Workflow | Tools chained | Why it's token-heavy |
|---|---|---|
| CPQ ticket root-cause | `kt-search` MCP (local) + browser MCP (live SNOW/prod reads) + code search + frame extraction | Video frame + slide + ABAP trace + ticket history in one context |
| KT onboarding | `kt-search` MCP over 145 files, iterative concept → cite → frame-read → explain | Long "teach-me-CPQ" loops |
| Deal execution (AACV) | Live data reads + KT search + reconciliation calc + writeup | Multi-step reasoning, not single-shot |

Pro gives me the headroom to run these workflows without daily throttle, which directly maps to ticket throughput and KT onboarding velocity — i.e. deal execution and renewal numbers.

---

## Tools I've Built (Engineer's Own Stack)

These are my own engineering artifacts — I built them to do my work better, then open-sourced them.

### `oriz-kt-search` — local semantic search over CPQ KT material
**Repo:** `github.com/chirag127/oriz-kt-search`
**Why I built it:** vanilla search across 105+ KT videos + 40 docs was unusable; I needed cited answers with **video timestamps / slide numbers / page numbers**.
**Stack:** Python 3.14, Chroma, BM25 + cross-encoder rerank (hybrid RAG).. Optional MCP server (`kt_search` tool). 4,443 cited chunks indexed. 23 tests, Whisper mocked.
**Daily use:** integrated as MCP server in Claude Code — instant KT lookup while solving tickets.

---

---

## TL;DR

I'm an engineer. I built my own local AI stack because the off-the-shelf workflow didn't scale to 100+ hours of KT material and live production tickets. The Hyperspace AI Pro plan unblocks the orchestration layer (Claude Code with MCP servers, browser MCP, long-context reasoning) that ties everything together — and directly maps to ticket throughput, KT onboarding velocity, and deal-execution/renewal numbers for the team.

Happy to walk through any of the tools live, or run through a real ticket workflow with you.

Best,
**Chirag Singhal (C5420321)**
Engineer — SAP IT CP L2C Quote / Public Cloud Order Management L2
