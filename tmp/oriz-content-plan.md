# Oriz Blog Fleet — Prioritized Content Calendar

_Synthesized 2026-08-13 from per-category ideas + fleet audit. Ranking formula: **low competition × high search intent × strong, uncopyable oriz angle** (tool/data/lived-experience moat). This is an execution plan, not a survey._

---

## 1. Fill the empty / thin sites first

Post counts (recursive, folder-per-post counted): **career = 0, devtools = 0** (empty, top priority), plus **11 verticals stuck at exactly 3** (ai, health, self-dev, business, marketing, remote-work, education, lifestyle, entertainment, food, travel) and arts/parenting/news/gaming/pets/sports/beauty/hobbies/home-diy/relationships/sustainability also at 3. tech (5) and finance (6) are the only ones with depth. hub (91) is the aggregator — leave it.

**Seed order & the highest-leverage first posts per site:**

| Site | Now | Seed these first (2-3 posts to break out of thinness) |
|---|---|---|
| **devtools.oriz.in** | 0 | (1) "80+ live sites on $0/month: the exact Cloudflare + Astro + GHA fleet architecture"; (2) "Keyless in-browser AI with g4f — no API key, no server"; (3) "Secrets & env-var management for the solo dev (with rotation)" |
| **career.oriz.in** | 0 | (1) "From JEE AIR 11870 to SWE → TCS → SAP: the real early-career engineering roadmap"; (2) "Building side projects with a full-time job: the habits that let one person ship 80 sites"; (3) "Proof-first skills to learn in 2026 (with the repos that back them up)" |
| **health.oriz.in** | 3 | Expand from generic seeds → add data/tool-backed: "Sleep-tracking with screenpipe: what my own screen-time actually did to my sleep"; "A privacy-first health-metrics tracker that never leaves your browser" |
| **tech.oriz.in** | 5 | (1) "I built an MCP server for live Indian stock data — full walkthrough"; (2) "Git as a database: storing hourly time-series without a DB bill"; (3) "Free-tier GitHub Actions as a cron/cloud backend" |
| **arts / parenting** | 3 | Lowest leverage (no tool moat) — defer; seed 2 evergreen each only after career/devtools/tech/finance depth is built |

Career and devtools carry real oriz moats (the fleet, g4f, go-vault, MCP servers, JEE→SAP arc) — seed them **before** growing the generic lifestyle verticals.

---

## 2. Prioritized master table

| Rank | Title | Site | Competition | Unique oriz angle | Priority |
|---|---|---|---|---|---|
| 1 | I Read Every IPO GMP Wrong for a Year — What Grey Market Premium Actually Predicts (live tracker) | finance | medium | ipo.oriz.in hourly GMP analyzer + first-hand GMP-vs-listing backtest nobody else can produce | high |
| 2 | The Real Cost of MTF in India: I Ran the Interest Math on My Own Positions | finance | low | Lived MTF experience + embedded oriz MTF cost/breakeven calculator | high |
| 3 | P2P Lending After the 2024 RBI Rules: Why the "20% Returns" Pitch Falls Apart | finance | low | Lived P2P experience + verified portfolio-lab finding debunking 20% premise | high |
| 4 | How I Run 80+ Live Sites on Cloudflare + Astro for $0/Month (full fleet architecture) | devtools | low | The live, inspectable fleet itself — real bill, GHA minute budgeting, submodule layout | high |
| 5 | Keyless In-Browser AI with g4f: LLM Features, No API Key, No Server, $0 | devtools | low | oz-ai wrapper shipping g4f fleet-wide w/ provider failover + capability ranking | high |
| 6 | Does Market Mood Time the Market? I Tracked India's Fear & Greed Index Hourly for Months | finance | low | mmi.oriz.in keyless Tickertape feed + longitudinal logged dataset republishers lack | high |
| 7 | My CIBIL Was Wrecked by Identity Fraud — The Exact Dispute Playbook That Fixed It | finance | low | Real fraud saga: dispute letters, RBI ombudsman escalation, real timelines | high |
| 8 | Building a Max-Sharpe Portfolio as a Retail Indian Investor (free tool inside) | finance | low | portfolio-lab.oriz.in working MPT studio — paste holdings, get optimized allocation | high |
| 9 | I Built an MCP Server for Live Indian Stock Data — Full Walkthrough | tech | medium | Ties nifty.oriz.in 1900-stock screener to a real, non-toy MCP build with server code | high |
| 10 | Secrets & Env-Var Management for the Solo Dev (Cloudflare + GHA + self-host vault, with rotation) | devtools | low | go-vault + real CLOUDFLARE_API_TOKEN rotation in commit history — India-context, underserved | high |
| 11 | Screening 1,900 NSE Stocks Without Paying for a Terminal | finance | medium | nifty.oriz.in — reader runs the exact filters shown; free, fast, ad-free | high |
| 12 | Free-Tier GitHub Actions as a Cron/Cloud Backend: Scheduled Jobs at $0 | tech | medium | mmi + ipo both run on GHA free minutes w/ git-as-DB — real schedules & minute budgeting | high |
| 13 | Building Production MCP Servers: Auth, Hosting & Cost (beyond the from-scratch tutorial) | devtools | medium | Shipped clear-thought-mcp + codebase-memory + MCP 2.0 Streamable HTTP migration | high |
| 14 | From JEE AIR to First Salary: A Realistic Money Roadmap for India's Fresh Engineers | career | medium | Author's JEE→SWE→TCS→SAP arc with real numbers + oriz SIP/emergency-fund calculators | high |
| 15 | Turning Live Market Data into Free Public Tools Without a Paid Data API | devtools | medium | Build-log of nifty + mmi (keyless api.tickertape.in/mmi/now) + ipo; git-as-DB + hourly GHA | high |
| 16 | Ship a Real Client-Side Tool in a Weekend: Anatomy of an 80-Tool Free Toolsite | tech | low | 80+ shipped browser-only tools — reusable WASM/no-upload/$0 pattern | medium |
| 17 | Git as a Database: Storing Time-Series Data Without a DB Bill | tech | low | ipo + mmi persist hourly snapshots as commits — the pattern, limits, when-it-breaks | medium |
| 18 | TCS on US Stocks & Foreign Remittance for Indian Investors (with calculator) | finance | low | Author invests US stocks + oriz TCS/LRS calculator showing deduction + reclaim | medium |
| 19 | Self-Hosting on Free Tiers vs a ₹300 VPS: India-Latency, INR-Cost Breakdown | devtools | low | India data-residency + latency + INR pricing benchmarked against live fleet edge behavior | medium |
| 20 | Building Side Projects With a Full-Time Job: Habits That Let One Person Ship 80 Sites | career | low | Standardized AGENTS.md per repo, submodule workspace, automation-first — pure lived experience | medium |
| 21 | Astro Content Collections for a Multi-Blog Network: One Codebase, 20+ Sites | tech | low | The 20+ oriz-blog-* repos sharing a design system + syndication registry | medium |
| 22 | Turn Any Astro Site into an Installable Android App with PWABuilder | tech | medium | Real path: shared keystore, in.oriz.<name>, SHA-256 asset-links, PWABuilder-over-Bubblewrap | medium |
| 23 | Concentration-Risk Reality Check Using Your Own Portfolio | finance | low | portfolio-lab + nifty combined — concentration/sector-overlap metrics + author's de-concentration | medium |
| 24 | A Personal Finance Toolkit for Zero Rupees: 80+ Free Client-Side Calculators | finance | medium | The oriz free-tools fleet — privacy-first, runs locally, no data leaves the browser | medium |
| 25 | New Tax Regime for Salaried Techies: When the Old Regime Still Wins | finance | high | Author's TCS→SAP pay context + oriz regime calculator tuned for IT pay (RSUs/HRA/NPS) | medium |

---

## 3. Flagship posts (10 highest-leverage, tied to oriz tools/data)

These carry an uncopyable moat (a live tool, a proprietary dataset, or a lived saga) and should be the tent-poles the rest of the fleet cross-links to:

1. **IPO GMP: what it actually predicts** — ipo.oriz.in live tracker + GMP-vs-listing backtest (finance)
2. **80+ sites on $0/month fleet architecture** — the inspectable fleet (devtools)
3. **Max-Sharpe portfolio, free tool inside** — portfolio-lab.oriz.in (finance)
4. **Market Mood hourly for months** — mmi.oriz.in longitudinal dataset (finance)
5. **CIBIL identity-fraud dispute playbook** — real letters + ombudsman timeline (finance)
6. **Keyless in-browser AI with g4f** — oz-ai wrapper, fleet-wide (devtools)
7. **MCP server for live Indian stock data** — nifty.oriz.in + real server code (tech)
8. **Screening 1,900 NSE stocks free** — nifty.oriz.in screener (finance)
9. **Secrets & rotation for the solo dev** — go-vault + real token rotation (devtools)
10. **JEE AIR → SWE → TCS → SAP money/career roadmap** — the arc + oriz calculators (career, seeds an empty site)

---

## 4. Suggested sequencing (what to write first)

**Wave 1 — Break the empty sites + bank the strongest moats (weeks 1-2).**
Seed the two zero-post verticals with their flagships while shipping finance's spikiest winners:
- devtools: #4 (fleet $0), #5 (g4f), #10 (secrets) → site goes 0 → 3.
- career: #14 (JEE→salary roadmap), #20 (side projects w/ full-time job) → site goes 0 → 2.
- finance: #2 (MTF), #3 (P2P) — low-comp, uncopyable, extend the healthiest site.

**Wave 2 — Ride recurring high-intent spikes + deepen tech (weeks 3-4).**
- finance: #1 (IPO GMP) and #6 (MMI) — time near IPO windows / market-sentiment news for the traffic spike.
- tech: #9 (MCP server), #12 (GHA cron) — push tech from 5 → 7 with tool-backed builds.
- finance: #7 (CIBIL fraud), #8 (max-Sharpe) — evergreen, high-trust.

**Wave 3 — Fill remaining depth + medium-priority long-tail (weeks 5-8).**
- finance: #11 (screener), #18 (TCS US stocks), #23, #24.
- devtools: #13 (production MCP), #15 (market-data tools), #19 (free-tier vs VPS).
- tech: #16, #17, #21, #22.
- career: proof-first skills post.
- Only now seed the generic lifestyle verticals (health with tool/data angles first; arts/parenting last — no moat).

**Cross-linking rule:** every vertical post links back to its flagship and to the relevant tool (nifty/mmi/ipo/portfolio-lab), and the hub aggregates — building topical authority across the fleet rather than 20 isolated thin blogs.
