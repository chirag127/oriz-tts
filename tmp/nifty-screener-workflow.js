export const meta = {
  name: 'nifty-screener-build',
  description: 'Build the all-India MTF return-potential stock screener in oriz-nifty-signal: parallel data fetch shards, scoring, Astro screener site (frontend-design), AI analysis, daily auto-deploy — one orchestrated pipeline',
  phases: [
    { title: 'Data' },
    { title: 'Score+Wire' },
    { title: 'Site' },
    { title: 'Verify' },
  ],
}

const REPO = 'C:/g/ws/repos/own/oriz-nifty-signal'
const SPEC = `${REPO}/SCREENER-SPEC.md`

const OK = { type:'object', additionalProperties:false, properties:{ ok:{type:'boolean'}, detail:{type:'string'} }, required:['ok','detail'] }

// PHASE 1 — Data pipeline: build/finish the fetch+metrics modules. Single agent owns Python (avoid file races);
// it internally uses async concurrency + sharding for the ~5000-stock fetch (concurrency, NOT more agents).
const data = await agent(
`Build the DATA + FETCH pipeline for the all-India stock screener in ${REPO}. READ ${SPEC} (authoritative spec) + the existing src/nifty_signal/ (value_score.py, nifty_pe.py, sources/financials.py [built+tested, REUSE], sources/metrics.py [partial — a prior run left _enrich + started _enrich_analyst; finish/repair it], pipeline.py, notify/channels.py, scrape.yml). Match patterns.
Scope: fetch ALL Indian listed stocks (~5000, NSE EQUITY_L.csv + BSE), gather max keyless fields per SPEC (valuation, quality+Piotroski via financials.py, growth, health, ownership/FII-DII, momentum/beta, MTF-eligibility via NSE F&O-list proxy, ANALYST ratings+target+upside, meta). Verify field names vs RELIANCE/HDFCBANK before trusting; omit+note missing; never fabricate.
SPEED: async httpx (16-32 concurrent) + shard + per-symbol cache for resume + tiering (full data for F&O/Nifty500/liquid, lighter for micro-cap tail). Resilient: partial results still write.
Write data/nifty_all_metrics.json — one lean row/stock incl. per-factor z-scores. Document the JSON schema in the spec file (append a "## JSON schema (data contract)" section) so the site phase consumes it.
Tests: py -m pytest -q green (scoring + fetch-merge with synthetic data).
Return {ok, detail: schema summary + fields gathered + sources + row count + how long a run takes}.`,
  { label:'data-pipeline', phase:'Data', schema:OK, effort:'high' }
)

// PHASE 2 — Scoring + cron wiring (depends on data schema)
const score = await agent(
`Add SCORING + CRON WIRING in ${REPO} (Python). READ ${SPEC} incl. the JSON schema section the data phase appended, + the data phase result: ${JSON.stringify(data).slice(0,800)}.
Implement per SPEC: per-factor z-scores → VALUE composite (equal-weight, loss-makers excluded) → QUALITY sub-score+flag → RETURN-POTENTIAL flagship score (value+growth+quality+momentum+analyst-upside, tax-adjusted after LTCG 12.5% + ~12% MTF interest). Expose sub-scores (value/growth/quality/momentum) in the JSON.
Wire the full pipeline into scrape.yml so the DAILY cron: fetch→score→write JSON→commit (git-as-DB, rebase-before-push)→notify. Notify (Telegram/ntfy) sends the return-potential top picks ONLY when the market verdict == "STRONG BUY" (the gate already added to pipeline.py — preserve it), at 12:30 IST Mon-Fri (cron already set).
Add keyless AI analysis at cron time (fleet keyless LLM — check how oz-ai / kilo->pollinations is called elsewhere; degrade gracefully): daily commentary + per-top-stock "why cheap + key risk" summary, committed into the JSON for the site to render. Label "AI-generated, not advice."
Tests green. Return {ok, detail: scoring formulas + weights + AI wiring + confirm cron does fetch→score→JSON→notify(STRONG BUY only)→commit}.`,
  { label:'score-wire', phase:'Score+Wire', schema:OK, effort:'high' }
)

// PHASE 3 — Site (depends on JSON contract; owns web/ only, no Python race since Python phases done)
const site = await agent(
`Build the client-side SCREENER SITE in ${REPO}/web (Astro). READ ${SPEC} (incl. JSON schema) + existing web/. INVOKE the frontend-design skill for a bespoke nifty.oriz.in identity (its OWN look, not a clone; return-potential ranking as visual hero, legible score viz — bars/rank badges not bare numbers).

DESIGN QUALITY BAR (user reviewed the demo + said "the website doesn't look good" — current UI reads as unstyled/prototype). Do NOT ship the first rough pass:
- Genuinely polished bespoke identity: strong visual hierarchy, refined typography + spacing + color system unique to nifty.oriz.in.
- The return-potential / composite RANK is the visual HERO — rank badges / score bars / heat, NOT a plain grid of numbers.
- Polished filter panel, preset chips, weight sliders, and an INTENTIONAL-looking demo/empty state (not broken) with the "demo data until pipeline publishes" banner kept but styled.
- Screenshot desktop 1440 + mobile 390, ITERATE until it genuinely looks good (not just renders). WCAG AA.

FACTOR-WEIGHT UX (user: "add the weightage to the factors properly" — sliders currently all bare 1.0):
- Show each factor's weight as a normalized PROPORTION summing to 100% (not raw 1.0s) so relative influence is visible.
- Ship sensible WEIGHTING PROFILES the user picks: "Deep Value" (E/P+B/P heavy), "Return Potential" (growth+momentum+analyst-upside heavier), "Balanced" (equal) — weights aren't just 1.0 across the board.
- Live-recompute ranking from per-factor z-scores; show which factors drive a stock's score. Document each profile's emphasis on-site.

STACK: Astro static shell + ONE Preact island + TanStack Table + TanStack Virtual for the ~5000-row grid. Backend-free, client-side filter/sort/re-rank over data/nifty_all_metrics.json.
FEATURES per SPEC: filter builder (any metric, sector/mcap/MTF-eligible/index filters), sort by COMBINED score (default; the Screener.in differentiator) + return-potential + quality, custom-weight sliders (per above), presets (flagship "MTF Buy-and-Hold 1yr" + Deep Value/Quality Value/etc), URL-encoded shareable screens, watchlist+compare, sparklines (if price series present), sector view + peer comparison, CSV export, AI-analysis cards, and full ON-SITE methodology+TAX docs (LTCG vs STCG, exemption, dividend drag, MTF interest, churn-after-12mo, not-advice disclaimer).
DAILY DEPLOY: ensure the site redeploys when data updates — add a deploy step to scrape.yml (after data commit) OR a deploy.yml on data/** push, using secrets.CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID + the correct CF project for nifty.oriz.in (check wrangler pages project list).
Build: npm/pnpm per repo → build exit 0, screener+docs render in dist/. Commit+rebase+push. Do NOT run the python cron.
Return {ok, detail: design direction + 1440/390 validation + weight-profile UX + stack + features shipped/deferred + deploy wiring}.`,
  { label:'screener-site', phase:'Site', schema:OK, effort:'high' }
)

// PHASE 4 — Verify (read-only-ish): run the cron test, check site renders 1440+390, confirm end-to-end
const verify = await agent(
`Final VERIFY of the ${REPO} screener build.
1. Trigger a test cron run: export GH_TOKEN=$(gh auth token) && gh workflow run scrape.yml --repo chirag127/oriz-nifty-signal ; wait ~60s; confirm it succeeded + data/nifty_all_metrics.json produced with real rows + AI text.
2. Confirm the site build renders the screener + docs (check dist/ or the deployed nifty.oriz.in returns 200 + the screener island loads). Validate desktop 1440 + mobile 390 (playwright screenshot or DOM check — no overflow at 390, WCAG AA).
3. Confirm the daily loop is wired: cron → fetch → score → JSON → notify(STRONG BUY only) → commit → site redeploy.
4. Run py -m pytest -q + the site build once more; both green.
Return {ok, detail: cron-run status + row count + site render 1440/390 result + end-to-end loop confirmation + any remaining issue}.`,
  { label:'verify', phase:'Verify', schema:OK, effort:'medium' }
)

return {
  data: data?.detail, score: score?.detail, site: site?.detail, verify: verify?.detail,
  allOk: [data,score,site,verify].every(x => x?.ok),
}
