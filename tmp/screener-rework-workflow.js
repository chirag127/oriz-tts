export const meta = {
  name: 'screener-value-presets-rework',
  description: 'Rework nifty-screener: percentile-normalized 5-factor value score + correct presets (Value/Value-Growth/Quality-Value/MTF/Graham/Magic Formula/Piotroski) + on-site docs',
  phases: [{ title: 'Scoring' }, { title: 'Site' }, { title: 'Data+' }, { title: 'Backtest' }, { title: 'Tracker' }, { title: 'Verify' }],
}
const REPO = 'C:/g/ws/repos/own/oriz-nifty-signal'
const OK = { type:'object', additionalProperties:false, properties:{ ok:{type:'boolean'}, detail:{type:'string'} }, required:['ok','detail'] }

const scoring = await agent(
`Rework the VALUE scoring in the Python pipeline ${REPO}/src/nifty_signal/sources/metrics.py. READ it first (it has _zscores, _yield_of, value composite, quality/growth/momentum/analyst sub-scores, rp_score, per-row 'z' object). Keep the existing sub-score architecture; change the VALUE factor treatment + add preset-backing fields.

1. VALUE score = classic 5 factors, PERCENTILE-NORMALIZED 0-100 across the investable universe (not raw z), equal-weighted: E/P (1/PE), B/P (1/PB), S/P (1/PS), EBITDA/EV (1/(EV/EBITDA)), FCF-yield (1/(P/FCF)). Each factor: rank stocks with a valid positive value into a 0-100 percentile (higher=cheaper); value_score = mean of present factor percentiles. Missing-factor-tolerant (avg over present, need >=2). Loss-makers/negative already filtered out (the investable filter drops PE<=0, PB<=0, mcap<500Cr — keep that). Store each factor's percentile in the row's 'z' object (rename/augment so the site can re-weight) AND keep the composite. Div-yield stays display-only (not in value).
2. Add preset-backing computed fields per stock so the site presets are exact + correct:
   - graham_ok: PE < 15 AND PB < 1.5 AND PE*PB < 22.5 AND D/E < 1 (classic Graham). Also a graham_score.
   - magic_formula: Greenblatt = combined rank of earnings-yield (EBIT/EV) + ROCE; store magic_rank (lower=better) + the two component ranks.
   - piotroski high flag already have f_score; ensure it's exposed.
3. Keep quality/growth/momentum/analyst sub-scores as-is (z-based is fine for those); only VALUE moves to percentile. Return-potential + MTF scores keep working.
Tests: py -m pytest -q green (add tests for percentile value + graham + magic-formula math with synthetic rows). Update the JSON schema section in SCREENER-SPEC.md. Commit+rebase+push. Report the new value formula, the preset-backing fields added, and confirm data/nifty_all_metrics.json regenerates with them.
ALSO: the AI analysis (llm/analysis.py) should annotate which scans each top stock passes (e.g. graham_ok, magic top-quartile, f_score>=7, GARP) so the AI can say "passes Graham + Magic Formula + Piotroski 8". Emit a per-stock scan-membership list in the JSON so the site + AI both use it. The AI should focus on the flagship top-30 shortlist.`,
  { label:'scoring', phase:'Scoring', schema:OK, effort:'high' }
)

const site = await agent(
`Rework the screener PRESETS + docs in ${REPO}/web. READ web/src/lib/scoring.ts (PROFILES, SUBS, normalise, composite) + Screener.tsx + methodology.astro + the scoring-phase result: ${JSON.stringify(scoring).slice(0,600)}. The Python phase now emits percentile-normalized value + graham/magic-formula/piotroski backing fields.

Do NOT touch the slider mechanics (they work). Rework the PRESETS to be correct + add scans:
- Keep sub-score weighting profiles but FIX/verify their weights are sensible value-investing defaults that sum to 100 and set clean state when picked (Value, Value-Growth/GARP, Quality-Value, MTF-Buy-Hold-1yr flagship).
- ADD preset SCANS that apply FILTERS + a sort, not just weights (these use the new backing fields):
  * "Graham" — filter graham_ok=true, sort by value.
  * "Magic Formula" — sort by magic_rank asc.
  * "Piotroski (F>=7)" — filter f_score>=7, sort by value.
  * "Value" — pure value_score sort. "Value+Growth" — value+growth weighted. "Quality Value" — value+quality. "MTF Buy-Hold 1yr" — MTF-eligible + beta<1.2, sort by MTF/return-potential.
  ALSO ADD these preset scans (data supports them — div_yield, off_52wl/off_52wh, roce, de, rev_growth, eps_growth, peg, fii, dii, beta, f_score, fcf_yield, momentum all present). Pick the clean non-redundant ones, group them in the UI (Value / Quality-Growth / Special scans), document each rule:
  * GARP — PEG<1 (or lowest) + ROE>15 + positive EPS growth.
  * Dividend Value — high div_yield + cheap value + low D/E (income preset; note div is tax-drag for MTF but valid standalone).
  * 52-Week-Low Value — near 52W low + cheap + quality_flag (contrarian bottom-fish).
  * Turnaround — r_6m>0 + cheap + positive margin/growth (catch the re-rate).
  * Low-Debt Compounders — ROCE>20 + D/E<0.5 + rev_growth>10.
  * Coffee Can — high ROCE + low debt + steady 5yr growth (long-hold quality).
  * FII/DII Accumulation — high FII+DII + cheap (smart-money following).
  * High FCF Yield — top FCF-yield.
  * Contrarian — r_1y<0 + low D/E + positive FCF + cheap.
  Each preset = {label, blurb, filters+sort}.
  EXACT preset set — build ONLY these 12 (user curated; do NOT add others like Coffee Can / Dividend / 52wLow / Low-Debt Compounders):
  CORE: Value (pure value_score sort), Quality-Value (cheap + ROE/low-debt), MTF-Buy-Hold-1yr (flagship, MTF-eligible + beta<1.2, tax-adjusted return), Deep-Value net-net (very low PB + low D/E, asset-cheap).
  NAMED: Graham (PE<15 + PB<1.5 + PE*PB<22.5 + D/E<1), Magic Formula (earnings-yield EBIT/EV + ROCE combined rank), Piotroski (f_score>=7).
  STRATEGY: GARP (PEG<1 + ROE>15 + positive EPS growth), Turnaround (improving margins + positive momentum r_6m>0 + cheap), Contrarian (cheap + beaten-down r_1y<0 + strong balance sheet low D/E + positive FCF), FII/DII Accumulation (high/rising FII+DII + cheap), High FCF-Yield (top FCF-yield percentile).
  Group in UI (Core / Named / Strategy). Each surfaces TOP ~100 (user picks 5). Document each rule on methodology page.
  OUTPUT: each preset applies its filters + sort and the default view shows the TOP 100 (user filters down to 5). The flagship + AI operate on the top-100 shortlist.
  USER DEFAULT FILTER: add a "My Deep Value" preset (make it the DEFAULT on load) = PE < 6 AND PB < 1.5, WITH an auto quality-guard (ROE>12 OR Piotroski f_score>=6 OR D/E<1) to filter obvious value-traps within the cheap universe, sorted by value_score, up to 100 stocks. Pre-fill the filter builder to this on load. Document the guard on the methodology page.
  AI per-stock note should mention which scans a stock passes, using the scan-membership emitted by the scoring phase.
  Each preset = {label, blurb, weights (for sub-score presets) OR filters+sort (for scan presets)}. Wire the scan presets to set the filter builder + sort, not just weights.
- Ensure "equal" resets to 20/20/20/20/20 cleanly.
Update methodology.astro on-site docs: explain the percentile-value method, each preset/scan's exact rule (Graham criteria, Magic Formula, Piotroski), and that value = percentile-normalized 5-factor. Build (npm/pnpm) exit 0, renders. Commit+rebase+push (deploy.yml auto-deploys). Report the preset/scan set + docs.`,
  { label:'site', phase:'Site', schema:OK, effort:'high' }
)

const extra = await agent(
`Add EARNINGS + PLEDGE DATA to the ${REPO} data pipeline (Python, src/nifty_signal/sources/). READ metrics.py + financials.py first. For the top ~200 liquid/value-leader stocks (tiering, keyless — verify endpoints on RELIANCE/HDFCBANK before trusting):
- Latest quarterly result: revenue + net-profit YoY growth, and an earnings-surprise/beat flag if a keyless source (Tickertape quarterly / screener) exposes it.
- Promoter pledge % + pledge TREND (rising pledge = red flag) — promShrPled already fetched; add QoQ change if available.
Fold into the JSON rows + expose as screener columns. Use as a value-trap signal (rising pledge / falling earnings should down-flag a cheap stock). Best-effort/resilient; omit+note if unavailable. Tests green, commit+rebase+push. Return {ok, detail: fields added + sources verified}.`,
  { label:'earnings-pledge', phase:'Data+', schema:OK, effort:'high' }
)

const backtest = await agent(
`Add a BACKTEST to ${REPO} that validates the screener presets historically. READ metrics.py + the data pipeline. Approach (keyless, pragmatic):
- The repo commits data snapshots over time (git-as-DB history in data/). If enough history exists, backtest = "stocks the preset selected N months ago vs their forward return." If history is thin, build a point-in-time backtest using available historical price data (Tickertape/NSE keyless price series): for each preset (esp. "My Deep Value" PE<6/PB<1.5+guard + the flagship), take the names it would have selected at past dates, compute their forward 1-year return, and compare to Nifty 500 over the same window. Report avg return, hit-rate (% beating index), and worst drawdown.
- Store results in data/backtest.json + render a "Backtest / does this work?" section on the site (methodology page or a card) showing each preset's historical 1yr avg return vs Nifty + hit-rate. Clearly label assumptions + "past performance not indicative."
- Keep it in the daily cron (or a weekly one — backtest is heavier). Best-effort. Tests for the return-calc math. Commit+rebase+push. Return {ok, detail: backtest method + sample results per preset + where rendered}.`,
  { label:'backtest', phase:'Backtest', schema:OK, effort:'high' }
)

const tracker = await agent(
`Add a "MY 5" PORTFOLIO TRACKER + CHURN ALERT to ${REPO}. READ the site (web/) + notify/channels.py + scrape.yml.
- Site: let the user mark up to ~5 stocks as "My Holdings" (client-side, localStorage + URL-encode so it persists/shareable, no backend). A "My 5" view shows those stocks with: entry context, current metrics, days held, and a CHURN flag when >12 months held (LTCG-ready → time to rebalance) OR when a holding drops OUT of its buy-screen (thesis broken).
- Cron/Telegram: since the bot exists, add a CHURN ALERT — a weekly (or on-STRONG-BUY) Telegram ping if any tracked holding has crossed 12 months (churn for LTCG) or exited its screen. Holdings list stored where the cron can read it (a committed data/holdings.json the user edits, OR keep it client-only + skip the cron alert if that's cleaner — your call, document it).
- Fits the user's strategy: pick 5, hold ~1yr on MTF, churn annually for LTCG. Document on-site. Tests + build green. Commit+rebase+push. Return {ok, detail: tracker UX + churn-alert wiring}.`,
  { label:'my5-tracker', phase:'Tracker', schema:OK, effort:'high' }
)

const verify = await agent(
`Verify the ${REPO} value+preset rework INCLUDING the new earnings/pledge data, backtest, and my-5 tracker. 1) Trigger cron: export GH_TOKEN=$(gh auth token) && gh workflow run scrape.yml --repo chirag127/oriz-nifty-signal; wait ~60s; confirm success + data has value percentiles + graham/magic/piotroski + earnings/pledge + backtest fields. 2) Confirm deploy.yml ran + nifty.oriz.in 200 + the 12 presets + "My Deep Value" default (PE<6/PB<1.5+guard, 100 stocks) + backtest section + my-5 tracker all render + weights sum to 100. 3) py -m pytest -q + site build green. Return {ok, detail: cron+deploy status, presets live, default filter, backtest, tracker confirmed, any issue}.`,
  { label:'verify', phase:'Verify', schema:OK, effort:'medium' }
)
return { scoring: scoring?.detail, site: site?.detail, extra: extra?.detail, backtest: backtest?.detail, tracker: tracker?.detail, verify: verify?.detail, allOk: [scoring,site,extra,backtest,tracker,verify].every(x=>x?.ok) }
