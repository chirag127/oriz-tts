# README template + rules (for the fleet README fan-out)

**Author:** Chirag Singhal · **Public contact:** chirag@oriz.in (NOT the gmail) · **License:** MIT (unless repo says otherwise)

## EXCLUDED repos — do NOT enable public GH Pages, do NOT add star-CTA, minimal PRIVATE readme only:
i2i-portfolio-data (151 borrowers' PII), personal-vault, life-cli-secrets, envpact-secrets,
me-site-private-data, credit-disputes, me-site-private-data, and ALL sap-* repos
(sap-se, sap-ms-teams-meetings, sap-docs, sap-kt-*, sap-ticket-playbooks, sap-tickets,
sap-cpq-automation, sap-meetings), NassCom-* notebooks if they hold client data.
For these: a short private README (what it is + "PRIVATE — not for publication") and NOTHING else.

## For every OTHER (public/safe) repo — analyze the repo, then write a README with:

### Core
- Title + one-line tagline
- Badge row: license, GitHub stars, last-commit, build/CI status (if a workflow exists), primary-tech badge
- "What it is / why it exists" — the real problem it solves, 2-3 lines (READ the repo to get this right — package.json/pyproject, src/, existing README)
- Links: **live site** (its `*.oriz.in` from CNAME, if a website) · **GHP landing** (`https://chirag127.github.io/<repo>/`) · repo
- **⭐ Star CTA**: "If this is useful, please ⭐ star the repo — it helps others find it."

### Structure & understanding
- **Mermaid diagram(s)** — architecture / data-flow / request-lifecycle, tailored to what the repo actually does (GitHub renders mermaid natively)
- Features — honest bullets (what it does; note what it doesn't if relevant)
- Tech stack — real languages/frameworks/key deps (from manifests)
- Repo structure — annotated tree of the KEY dirs/files (not exhaustive)
- (UI/website repos) a Screenshots section placeholder if no image exists

### Usage
- Quick start / install — the ACTUAL commands (npm i / pnpm i / docker compose up / uvx — read scripts)
- Configuration — env-vars TABLE (names + purpose only, NEVER values)
- API / CLI reference — endpoints/flags/subcommands with examples (if applicable)
- Copy-paste examples

### Fleet
- "Part of the oriz family" — link blog.oriz.in + note it's one of ~80 oriz sites
- Cost/hosting note — "$0 on Cloudflare free tier" where true
- "How it's built" — link the relevant blog post if one exists (e.g. run-80-sites-solo, or the MCP orchestration post)

### Meta / trust
- Contributing (brief) · License (MIT) · Author (Chirag Singhal, chirag@oriz.in)
- Status/roadmap (WIP vs stable — judge from the repo)
- Security note where data-adjacent: "No secrets in repo; sops+age vault; PUBLIC_* client-only"
- Changelog: "Conventional commits are the changelog"
- Disclaimer for FINANCE repos: "General information, not investment advice."

### Nice-to-have (include when it fits)
- Table of contents (if README is long) · FAQ · Acknowledgements · Related projects (cross-link sibling repos)

## Per-repo actions (public/safe repos only)
1. READ the repo (manifests, src, existing README) to write ACCURATE content — do not template blindly.
2. Write/replace README.md with the above (keep any genuinely-good existing content; improve, don't regress).
3. Enable GitHub Pages serving a README-driven landing page:
   - Website repos WITH a build/mirror: leave their existing site deploy; enable Pages at github.io if a mirror workflow exists.
   - Non-website repos: enable Pages from the repo (e.g. a docs/ or a simple index.html generated from the README, or GitHub's "publish README" — use `gh api -X POST repos/OWNER/REPO/pages` with a source, or add a tiny `.github/workflows/pages.yml` that publishes the README as an index). The GHP page "tells about the repo".
4. Set GitHub topics/tags via `gh repo edit chirag127/<repo> --add-topic <t1> --add-topic <t2> ...` (5-8 relevant topics: language, framework, domain, "oriz", etc.).
5. Commit conventional ("docs: comprehensive README + GH Pages landing + topics"), push. NEVER commit secrets — scan first.

## HARD RULES
- NEVER publish PII/secrets/employer data (the excluded list above).
- Env tables: names + purpose only, never values.
- Verify links resolve where possible; github.io links only claimed after Pages is enabled.
