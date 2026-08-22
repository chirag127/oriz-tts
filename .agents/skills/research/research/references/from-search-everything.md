> Folded from skill `search-everything` on 2026-07-08 during skill-compact merge.

---
name: search-everything
description: Comprehensive multi-source research on any topic. Use when the user says "search everything about X", "find all issues about X", "what exists for X", or before filing any issue/PR to ensure no dupes exist. Fans out to GitHub, web, knowledge/, npm/registry, and URL-reads in parallel.
---

# Search Everything

Fan-out research across every available source. Run ALL searches in parallel. Deduplicate. Report findings with citations.

## Step 1: Parse the query

Extract from the user's message:
- **Topic**: what to search (e.g. "lyrics translation", "SMTC Windows")
- **Repos**: any GitHub repos mentioned or implied (e.g. if user is talking about SimpMusic → `maxrave-dev/SimpMusic`)
- **Context**: is this for filing an issue? checking if feature exists? researching an API?

## Step 2: Fan out (ALL in parallel)

### 2a. GitHub — issues + PRs
For each relevant repo, run simultaneously:
```bash
gh issue list --repo <owner>/<repo> --search "<topic>" --state all --limit 20 --json number,title,state,labels
gh pr list --repo <owner>/<repo> --search "<topic>" --state all --limit 10 --json number,title,state
```
Also search across all of GitHub:
```bash
gh search issues "<topic>" --limit 20 --json repository,title,number,state,url
gh search repos "<topic>" --limit 10 --json fullName,description,stargazerCount,url
```

### 2b. Web search (minimum 2 independent queries)
Query 1 — general: `mcp__chirag127__keenable-web-search_search_web_pages`
Query 2 — specific/technical: `mcp__chirag127__oevortex-ddg-search_web-search`
Query 3 (if needed) — news/recent: `mcp__chirag127__linkupplatform-linkup-mcp-server_linkup-search`

Use different phrasings. Never rely on a single web search.

### 2c. Workspace knowledge
```bash
npx tsx C:/D/oriz/scripts/okf-prompt-lookup.ts "<topic>" --limit 5
```
Read each returned file.

### 2d. Package registries (if topic is a library/tool)
```bash
npm view <package> description homepage repository
```
Or check PyPI, pub.dev, crates.io as appropriate.

### 2e. URL reads
For any specific URL surfaced in 2a-2d that looks authoritative, fetch with `mcp__fetch__fetch`.

## Step 3: Deduplicate + synthesise

Group findings by:
- **Already exists** (closed issue, merged PR, shipped feature) → cite link
- **Open / in-progress** (open issue, open PR) → cite link
- **Not found** → confirm absence across all sources searched

## Step 4: Report

```
## Search: <topic>

### Already exists
- [<title>](<url>) — <one-line summary>

### Open / in-progress  
- [<title>](<url>) — <one-line summary>

### Not found
- <what was searched, what came back empty>

### Sources checked
- GitHub: <repos searched>
- Web: <queries run>
- Knowledge: <files matched>
```

## Rules

- **Minimum 2 web searches** with different phrasings. One search = insufficient.
- **Always check knowledge/** — workspace decisions may already answer the question.
- **Cite every claim** with a URL or file path. No assertions without sources.
- **Parallel where possible** — don't serialise if sources are independent.
- **Short report** — bullets only. No prose paragraphs.
- **No hallucinations** — if you didn't find it, say "not found in sources searched", not "it probably doesn't exist".

## Trigger phrases

- "search everything about X"
- "find all issues about X"
- "what exists for X"
- "is there already a X"
- "check if X is filed"
- "research X before filing"
