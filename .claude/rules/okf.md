---
name: okf
paths: ["repos/oriz-knowledge-site/**", "repos/oriz-brain/**", "repos/oriz-kt-search/**"]
---

# Open Knowledge Format (OKF) v0.2

## Definition
OKF is a lightweight, human-readable, machine-parseable knowledge representation format. Every concept is a markdown file with YAML frontmatter + markdown body. Designed for AI agent consumption, personal knowledge bases, and structured decision logs.

## Frontmatter Schema (Zod)

```typescript
{
  type: string           // 'concept' | 'decision' | 'rule' | 'runbook' | 'service' | 'person' | 'other'
  title?: string         // Human-readable title
  description?: string   // One-line summary
  resource?: string      // External URL / source
  tags?: string[]        // Searchable keywords
  timestamp?: string     // ISO 8601
  format_version?: string // '0.2'
  status?: string        // 'draft' | 'review' | 'active' | 'superseded' | 'archived'
  confidence?: string    // 'certain' | 'likely' | 'speculative' | 'deprecated'
  durability?: string    // 'permanent' | 'long' | 'medium' | 'short' | 'ephemeral'
  supersedes?: string[]  // Slugs of older concepts this replaces
  superseded_by?: string[] // Slugs of newer concepts that replace this
  related?: string[]     // Related concept slugs
}
```

## Rules
- Every concept file: `src/content/concepts/{slug}.md`
- Frontmatter must validate against `okfSchema` (Zod)
- Body: markdown, no length limit, but prefer concise
- `type` determines rendering template
- `status: superseded` → auto-redirect to `superseded_by[0]`
- `confidence: deprecated` → show warning banner
- Tags drive search and cross-linking
- `resource` links to canonical external source
- Timestamp = creation or last significant update

## Call Number System
- Class letter from `type` (C=concept, D=decision, R=rule, S=service, etc.)
- Shelf number from stable slug hash
- Format: `C-1234` — unique, sortable, human-friendly

## AI Agent Consumption
- OKF bundle export: `llms.txt` — all concepts as structured text
- Feed: `feed.xml` — RSS/Atom of recent updates
- Search: full-text over title + description + tags + body
- Related concepts: automatic cross-linking via `related` array

## Sync Policy
- Source of truth: `chirag127/workspace/knowledge/` (private)
- Public mirror: `repos/oriz-knowledge-site/`
- Manual sync: copy new/modified files, update frontmatter
- Never auto-sync private → public without review
