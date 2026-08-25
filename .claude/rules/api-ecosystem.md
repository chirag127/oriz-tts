---
name: api-ecosystem
paths: ["repos/*-api/**", "scripts/**", "API_REGISTRY*"]
---

# API Ecosystem Rules (Oriz Free Public APIs)

## Absolute Requirements
1. Every API repository MUST end with suffix `-api`
2. Every API repository MUST exist as a Git submodule inside `repos/`
3. Umbrella repository must contain `API_REGISTRY.json` and `API_REGISTRY.md`
4. Every API must be atomic — one clearly defined primary data domain
5. Do not create duplicate APIs — search registry first
6. Do not create hundreds of repositories automatically — one at a time unless explicitly approved
7. Only implement APIs with meaningful public demand

## Zero Cost Architecture
- Preferred: Source → GitHub Actions → Scraper/Importer → Normalizer → Validator → JSON generation → Git commit → GitHub Pages → Public static API
- Do NOT introduce: AWS, Azure, GCP, paid VPS, paid databases, paid serverless, paid API gateways
- If free alternative exists, prefer it

## API Delivery Model
- Primary: static JSON files served by GitHub Pages
- Endpoints: `GET /api/v1/resource`, `GET /api/v1/resource/{id}`, `GET /api/v1/search?q=`, `GET /api/v1/meta`
- No traditional backend server unless genuinely required

## Domain Architecture
- Do NOT create one subdomain per API
- Preferred: `api.oriz.in/<api-name>/`
- Website: `oriz.in/apis/<api-name>/`

## Repository Structure
```
{api-name}-api/
  data/
  schemas/
  api/
  scraper/
  fixtures/
  tests/
  examples/
  website/
  scripts/
  docs/
  .github/workflows/
  README.md
  CHANGELOG.md
  LICENSE
  SECURITY.md
  openapi.yaml
```

## Data Pipeline
```
SOURCE → FETCH → PARSE → NORMALIZE → VALIDATE → QUALITY CHECK → COMPARE → PUBLISH
```

## Source Selection Priority
1. Official API
2. Official downloadable dataset
3. Official machine-readable endpoint
4. Official webpage
5. Public browser-rendered webpage
6. Other legally usable public source

## Playwright Usage
- Use for: JavaScript-rendered data, public search interfaces, public tables, public pagination, public dynamic content
- Do NOT use to bypass: CAPTCHA, authentication, paywalls, access controls, security controls, robots restrictions, rate limits, anti-bot systems

## GitHub Actions
- Schedule + manual trigger + timeout + concurrency control + failure handling + logging + validation + last-known-good protection

## Last Known Good (Mandatory)
- If scraping fails: preserve last-known-good data, mark source as stale, record failure, generate diagnostic artifacts, create GitHub Issue, allow manual retry
- Never publish invalid data

## Data Validation
- Schema, required fields, data types, duplicates, null rates, record count, unexpected deletion/growth, identifier uniqueness, date validity, referential integrity
- Anomaly detection: if yesterday 1,000,000 records and today 17 → flag, do not publish

## Source Attribution
- Document: source, source URL, source owner, retrieval date, update cadence, license, terms, attribution requirements, data limitations
- Never claim ownership of third-party data

## Legal and Ethical Scraping
- Do not scrape: private data, auth-protected data, personal sensitive data, financial credentials, passwords, tokens, session cookies, private APIs, restricted databases
- Do not bypass technical protections
- Minimize personal data
- If source contains personal data, STOP and ask

## Fixtures
- Sanitized public fixtures: request.json, response.json, page.html, expected.json
- Small, sanitized, stable, sufficient for tests, legally appropriate
- Never commit credentials, API keys, cookies, tokens, passwords, session identifiers

## Secrets
- If auth required: use GitHub Actions Secrets
- Never hardcode, never commit, never print in logs

## OpenAPI
- Every API must provide OpenAPI specification with endpoint docs, request/response/error examples, schema definitions
- Validate OpenAPI automatically

## Schemas
- JSON Schema for every API: field name, type, required status, description, format, allowed values

## TypeScript
- Generate TypeScript types from schema where practical

## Website
- Every API repo must contain polished static website
- Explain: what, why, source, endpoints, examples, schema, update frequency, freshness, license, attribution, GitHub repo, OpenAPI, download options, status
- Include interactive API explorer where practical
- No backend required for documentation

## API Website Design
- Use common design system: shared typography, navigation, API cards, endpoint components, status components, code examples, footer, documentation components
- Allow API-specific branding/content
- Preferred framework: Astro (matches umbrella)

## Search
- High-value APIs: static search indexes (precomputed JSON, prefix, trigram)
- No server-side search engine
- Choose indexing strategy based on dataset size

## Performance
- Optimize: JSON size, compression, file partitioning, cacheability, lookup speed, initial page load, number of requests
- Large datasets: partition by state/district/bank/year/month/category/country/prefix
- Do not create millions of tiny files without reason

## API Versioning
- Use `/v1/`
- Breaking changes → new version
- Document in CHANGELOG.md

## Freshness
- Expose metadata: lastUpdated, sourceUpdatedAt, retrievedAt, recordCount, version, status, dataAge

## API Health
- Static hosting: health via `/meta.json`
- Expose: dataset status, last successful update, last failed update, source status, record count, schema version
- No fake server health endpoint

## Registry
- Umbrella must maintain `API_REGISTRY.json`
- Entry: name, repository, scope, status, version, website, API path, source, license, update cadence, last update, record count, documentation, OpenAPI URL
- Statuses: planned, researching, building, testing, active, stale, blocked, deprecated

## API Completion States
Complete means ALL of:
- Repository exists, ends in -api, is submodule
- README, source documented, scraper works, data exists
- Schema, validation, tests, OpenAPI, examples
- Website, Pages deployment, scheduled update
- Last-known-good mechanism, failure handling, freshness metadata
- Attribution, API registry entry, correct submodule commit

## Submodule Validation
Umbrella CI must fail if:
- Repo inside repos/ is not submodule
- Submodule URL is wrong
- Submodule detached incorrectly
- Repository missing -api
- Registry entry missing
- Submodule not initialized correctly

## No Mass Repository Creation
- Work one API at a time unless explicitly approved
- For each API: research → design → implement → test → deploy → verify → register → next

## Question Gate
STOP and ask if ambiguity affects: data source, legal status, API scope, repository naming, architecture, hosting, domain, credentials, scraping method, data licensing, data publication, privacy, API behavior

## Grilling / Design Review
Before starting new API, answer:
- What is exact atomic entity?
- Who is user? What is search demand?
- What source? Is it structured? Does official API exist? Is scraping necessary?
- What is legal/public availability? How frequently does it change? How large will dataset become?
- Can GitHub Pages serve it? Should it be partitioned?
- What is primary identifier? What are search keys? What fields required/optional?
- What historical data needed? What happens when source fails? When schema changes? When 90% of records disappear?
- What should be cached? Indexed? What should website show? What should OpenAPI expose?

## High Search Demand Policy
Prioritize: Google search demand, developer demand, Stack Overflow relevance, GitHub ecosystem demand, common lookup behavior, frequency of data usage, uniqueness, availability of stable source
Do not prioritize because it is easy to scrape

## Atomicity Test
An API should be explainable as: "This API provides X."
If explanation becomes: "This API provides X, Y, Z, and B." → scope is too broad → split

## Free Hosting Policy
- Preferred: GitHub Pages, GitHub Actions, GitHub repository, GitHub releases, Cloudflare DNS/CDN (free tier only)
- Do not introduce paid infrastructure
- Do not require credit card unless explicitly approved

## Domain Policy
- Primary: oriz.in
- Preferred API host: api.oriz.in
- Avoid hundreds of subdomains
- Prefer path-based APIs: api.oriz.in/ifsc/, api.oriz.in/pincode/, api.oriz.in/mf/

## GitHub Pages Limits
- Design around limits: storage, bandwidth, builds, requests
- If dataset approaches limits: STOP → propose partitioning/compression/GitHub Releases/alternative free storage/CDN
- Do not silently move to paid infrastructure

## Failure Alerts
- At minimum: GitHub Actions failure, GitHub Issue or workflow summary, last-known-good dataset retained
- If email/webhook/notification configured, use it
- Do not require paid notification infrastructure

## Source Change Detection
- Detect: HTML changes, JSON structure changes, field disappearance, field type changes, unexpected record-count changes, pagination changes, HTTP errors, empty responses, bot-blocking, schema changes
- Fail safely

## Scraper Design
- Modular: source.py, browser.py, parser.py, normalizer.py, validator.py
- Do not mix: browser automation, business logic, normalization, publishing

## Testing
- Unit tests, parser tests, schema tests, fixture tests, data validation tests, API path tests, website build tests
- Playwright: deterministic fixtures for CI, limited live scraping tests

## Live Source Testing
- Live scraping tests limited
- Do not hammer source
- Fixtures for most CI tests, scheduled live tests for actual source validation

## Data Format Policy
- Primary: JSON
- Optional: JSONL, CSV
- Large analytical datasets: Parquet as optional download artifact
- Do not force every format on every API

## Security
- Run secret scanning, dependency scanning
- Do not commit secrets, do not publish sensitive information, do not store browser session data

## Dependency Policy
- Small dependency footprint, well-maintained packages, reproducible versions, automated dependency updates
- Avoid unnecessarily large frameworks

## Website Policy
- Website must be static
- Preferred: Astro (matches umbrella), Vite, plain HTML/CSS/JS
- Choose one common framework for ecosystem
- Do not use different framework per API

## Monorepo vs Submodule Policy
- Umbrella is orchestration layer
- Individual APIs are independent repositories
- Umbrella references them via Git submodules
- Do not duplicate source code in umbrella

## Automated Discovery
- Scripts capable of: discovering submodules, reading repo metadata, checking API completion, README, OpenAPI, schemas, workflows, Pages config, registry consistency

## Dashboard
- Umbrella website should display: total APIs, active APIs, planned APIs, stale APIs, blocked APIs, last update, data records, source, documentation, API URL, repository, status

## Build Order
Phase 0: Architecture audit
Phase 1: Umbrella repair
Phase 2: Shared tooling
Phase 3: First reference API
Phase 4: Second reference API
Phase 5: Reusable API template
Phase 6: High-demand API expansion
Phase 7: Registry/dashboard
Phase 8: Automated quality control
Phase 9: Scale carefully

## Current Repository Audit
Before creating anything: inspect workspace, find existing repos, incorrect names, missing -api, broken submodules, duplicates, incomplete APIs, missing Pages/workflows/websites/OpenAPI/schemas/data/scrapers

## Repair Policy
- Reuse existing work where good
- Do not delete working repos merely because they don't perfectly match architecture
- Wrong name → propose rename
- Should be submodule → convert correctly
- Duplicated → identify canonical repo first
- Incomplete → complete before creating overlapping repo

## Wrong Repository Name Policy
Every API repository must end in `-api`
- WRONG: india-ifsc, ifsc-data, ifsc-service
- CORRECT: india-ifsc-api
- Do not silently create new repo just to fix naming
- Prefer migration/rename where safe

## Stop Conditions
STOP and ask if: source license unclear, source requires authentication, source prohibits automated access, source contains sensitive personal data, API scope overlaps another API, repository naming ambiguous, domain architecture unclear, data too large for Pages, GitHub limits may be exceeded, paid service appears necessary, source requires bypassing technical controls, major breaking architectural decision required

## Output After Each API
Report: API name, repository, scope, source, source method, scraping method, data format, record count, schema, OpenAPI, website, Pages URL, API URL, update cadence, last successful update, tests, GitHub Actions, submodule status, registry status, known limitations

## Never Claim Success Without Verification
Do not say "done" unless API was: built, tested, published, verified, registered
Repository existing is not completion

## Final Principle
- Build fewer, better, atomic APIs
- Prefer: 50 excellent APIs over 500 incomplete APIs
- Prefer: stable static APIs over fragile backend servers
- Prefer: official structured sources over unnecessary scraping
- Prefer: last-known-good data over empty or corrupted production data
- Prefer: one shared architecture over 50 different architectures
- Prefer: zero hosting cost over unnecessary infrastructure
- Prefer: asking Chirag over guessing
