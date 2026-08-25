# AGENTS.md — C:/g/ws (oriz umbrella repository)

> Canonical per-repo agent rules. Source of truth for this workspace. Manual sync with memory files.

## Fleet rules (canonical — apply on every task in this repo)

### Prose + output
- **Caveman/terse.** Drop articles, filler, pleasantries, hedging. Fragments > sentences. Answer in word 1 — no preamble, no restatement. Code/data BEFORE prose. Explanation ≤3 lines trivial, ≤10 complex. Concrete not abstract (file:line, exact command, next action). Same terseness for commit messages, PR/issue bodies, code comments. Full sentences ONLY for irreversible-action confirmations (`rm -rf`, force-push, `DROP TABLE`, prod deploy).
- **Terse GitHub issues.** Bug ≤150 words, feature ≤100, comment ≤50. Use repo's template. No speculation/unverified versions/API names. Shorter = fewer hallucinations.

### Code
- **Minimum everything.** Smallest unit that works. LOC/tool-calls/files/imports = what the task needs, not one more. Zero comments unless the line is non-obvious. Trivial fix ≤3 tool calls, routine ≤10, multi-step ≤30 (else delegate).
- **The ladder** (stop at first rung): does it need to exist? → native platform/OS/browser? → already in codebase (reuse)? → stdlib? → one line? → only then minimal own code. Trace the problem end-to-end before coding.
- **No speculative scaffolding, no defensive code for impossible cases, no premature optimization.** `// shouldn't happen` → delete the code. **Edit > Write** (Write only for new files / full replacement). Reuse existing patterns/style even if suboptimal. Don't re-read unchanged files.
- **MAXIMIZE community packages, MINIMIZE own code.** Reach for a well-kept package before writing logic; every line not written is a line not maintained. Own code only where no package fits. Shared own-code = the atomic `@chirag127/*` set — reuse mechanism, theme each site's OWN look.
- **Build COMPLETE, not MVP.** Full feature set, latest dep versions (beta/alpha ok when newest), unit + integration tests everywhere. Ship same session.

### Code intelligence — codebase-memory-mcp FIRST
- On ANY code question use a **cbm** tool BEFORE Grep/Glob/Read: `search_graph` (find symbol), `trace_path` (callers/callees/blast-radius), `get_code_snippet` (exact source), `get_architecture` (overview), `query_graph` (openCypher), `search_code` (grep over indexed), `detect_changes` (diff impact). If the repo isn't indexed → `index_repository` first. Grep/Read only for non-code files or a file you're about to edit. **Use cbm VERY frequently** — 120× fewer tokens than grep/read; many calls per task is good.

### Git
- **main only.** Direct commit on own repos (`chirag127/*`), push by default, never force-push main. Conventional commits (they ARE the changelog). Branches only for upstream PRs. Identity = chirag127 noreply. Scan for secrets before push (no hardcoded secrets; sops+age vault).

### Web + facts
- **Search the web ≥2× before any non-trivial decision** on tools/pricing/library-status/URLs (two phrasings, cross-check). No memory-only answers on externally-knowable, mutable facts.

### Product + security posture
- **No auth on FREE surfaces** — free features 100% public; auth ONLY gates paid goods. Clerk = shared `*.oriz.in` SSO; `PUBLIC_CLERK_PUBLISHABLE_KEY` client-side, secret key server/deploy only, never `PUBLIC_*_SECRET`.
- **No card-on-file for own tooling** (donations via BMC/GH-Sponsors/UPI); customers may pay any method. Never hit free-tier quotas.
- **Every site its OWN distinct visual identity** — reuse `@chirag127/*` for mechanism/a11y/token-contract; never reuse another site's palette/type/layout/motion/signature. Run the frontend-design process per site.

### Interaction (STT-friendly)
- User uses speech-to-text: infer intent from typos/homophones, pick the most-likely reading, STATE it, proceed. Don't ask the user to re-type. Ask only when truly blocked.

## Project-specific (this repo — oriz umbrella / API ecosystem)

### Architecture
- Umbrella repo = orchestration layer. Individual APIs = independent repositories referenced via Git submodules in `repos/`.
- Every API repository MUST end with `-api` suffix.
- Every API repository MUST be a real Git submodule (not copied directory).
- Umbrella must maintain `API_REGISTRY.json` and `API_REGISTRY.md`.
- Preferred hosting: GitHub Pages (per-repo), GitHub Actions (scheduled updates), zero paid infrastructure.

### API Ecosystem Rules
- See `.claude/rules/api-ecosystem.md` for full specification.
- Key principles: atomic APIs, official structured sources preferred, last-known-good data mandatory, no mass repository creation, one at a time unless explicitly approved.
- Before creating new API: research → design → implement → test → deploy → verify → register.

### Open Knowledge Format (OKF)
- See `.claude/rules/okf.md` for OKF v0.2 specification.
- Applies to: `repos/oriz-knowledge-site/`, `repos/oriz-brain/`, `repos/oriz-kt-search/`.
- OKF = markdown files with YAML frontmatter + body, designed for AI agent consumption.

### Submodules
- 251 submodules in `repos/`. Only ~85 are API candidates (see `scripts/api-catalog.json`).
- Non-API projects (oriz-finance, oriz-blog, browser extensions, MCP servers, etc.) stay as-is.
- Dataset-only repos (india-states, periodic-table, iso-codes, etc.) should become `-api` repos with full spec.
- Rename in place where safe; do not mass-create.

### Scripts
- `scripts/api-catalog.json` — canonical API catalog (85 entries)
- `scripts/api-repo-factory.mjs` — generates API repo from template
- `scripts/check-submodules.mjs` — validates submodule integrity
- `scripts/repo-audit.mjs` — audits all repos for compliance
- `scripts/playwright-discover.mjs` — reverse-engineers sources
- `scripts/refresh-static-api.mjs` — refreshes API data
- `scripts/publish-api-repos.mjs` — publishes API repos

### Build
- Astro umbrella site at root. `npm run build` (NOT pnpm — Windows esbuild binary issue).
- Per-repo API websites: Astro (shared design system), static, no backend.
- Deploy: `astro build && wrangler pages deploy` or GitHub Pages.

### Claude Code Configuration
- Project-scoped settings in `.claude/settings.json` (this file's sibling).
- Global settings remain at `~/.claude/settings.json`.
- Rules: `.claude/rules/okf.md`, `.claude/rules/api-ecosystem.md`.
- CBM project: `C-g-ws` (indexed).
