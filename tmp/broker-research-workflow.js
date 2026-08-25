export const meta = {
  name: 'broker-feature-research',
  description: 'Research every major Indian MF app + stock broker, aggregate best features, synthesize what Groww + Pocketful each lack, produce feature-request feedback',
  phases: [{ title: 'Research' }, { title: 'Synthesize' }, { title: 'Send' }],
}

// Each researcher covers a slice of the app landscape (multi-modal sweep — different angle each)
const RESEARCH = [
  { key: 'discount-brokers', q: 'Zerodha Kite, Upstox, Dhan, Angel One, Fyers — standout features 2026: charting, GTT/bracket/cover orders, options strategy builder, API/algo, basket orders, alerts, market depth' },
  { key: 'mf-platforms', q: 'Kuvera, ET Money, Value Research, Coin by Zerodha, Paytm Money — best mutual-fund features 2026: fund overlap/X-ray, rolling returns, tax-loss harvesting, goal planning, SWP/STP, family accounts, model portfolios, expense/AUM history' },
  { key: 'superapps-aggregators', q: 'INDmoney, Jupiter, Cred, Fi, smallcase — best features 2026: net-worth aggregation, spend tracking, external-asset import, alerts, insights, consolidated tax report, family view, US stocks, bonds' },
  { key: 'research-analytics', q: 'Tickertape, Trendlyne, Screener.in, StockEdge, Sensibull — best analytics features 2026: stock scorecard, fundamentals, screeners, options analytics (Sensibull), FII/DII, forensic scores, backtesting, alerts' },
  { key: 'pocketful-current', q: 'Pocketful app (by Pace) India stock broker 2026 — current features, what it offers, brokerage, charting, options, mutual funds, and known limitations / user complaints / missing features' },
  { key: 'groww-current', q: 'Groww app 2026 current features + confirmed limitations across stocks, MF, F&O, portfolio, tax, export, family accounts, API — what it already has vs lacks' },
]

const FIND_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    slice: { type: 'string' },
    features: { type: 'array', items: { type: 'object', additionalProperties: false, properties: {
      feature: { type: 'string' }, apps_that_have_it: { type: 'string' }, why_it_matters: { type: 'string' }
    }, required: ['feature','apps_that_have_it'] } },
  },
  required: ['slice','features'],
}

// Phase 1: parallel research (barrier — need all findings before synthesizing gaps)
const findings = await parallel(RESEARCH.map((r) => () =>
  agent(
`Research this slice of the Indian investing-app landscape and return its STANDOUT features. Use the perplexity-search MCP web_search tool at least twice with different phrasings; cross-check; only report features you can verify. Slice: ${r.key}. Focus: ${r.q}
Return the schema: slice="${r.key}", features=[{feature, apps_that_have_it, why_it_matters}]. List 8-15 concrete features (not vague). Name which apps have each.`,
    { label: `research:${r.key}`, phase: 'Research', schema: FIND_SCHEMA, effort: 'medium' }
  )
)).then(rs => rs.filter(Boolean))

// Phase 2: synthesize per-target gap list + draft the feedback email (one agent, has all findings)
const allFeatures = findings.flatMap(f => (f.features||[]).map(x => `${x.feature} [${x.apps_that_have_it}] — ${x.why_it_matters||''}`))
const groww = findings.find(f => f.slice==='groww-current')
const pocket = findings.find(f => f.slice==='pocketful-current')

const DRAFT_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: { target: { type: 'string' }, subject: { type: 'string' }, body: { type: 'string' } },
  required: ['target','subject','body'],
}

const drafts = await parallel([
  () => agent(
`Write a prioritised feature-request email to GROWW. Below is a master list of standout features across ALL major Indian investing apps (brokers, MF platforms, superapps, analytics tools). Groww's current state: ${JSON.stringify(groww?.features||[]).slice(0,1500)}.
MASTER FEATURE LIST:
${allFeatures.join('\n')}
Pick the features Groww LACKS that would most improve it, group by theme (MF analytics / portfolio+networth / trading / data+reporting / research / support), be specific + name which competitor has each as proof. Terse, professional, impact-ordered. Signed "Chirag Singhal". Return {target:"groww", subject, body}.`,
    { label: 'draft:groww', phase: 'Synthesize', schema: DRAFT_SCHEMA, effort: 'high' }
  ),
  () => agent(
`Write a prioritised feature-request email to POCKETFUL (Indian stock broker by Pace). Pocketful's current state: ${JSON.stringify(pocket?.features||[]).slice(0,1500)}.
MASTER FEATURE LIST (best features across all Indian investing apps):
${allFeatures.join('\n')}
Pocketful is a newer/smaller broker — recommend the highest-leverage features it should add to compete (from the master list), grouped by theme, naming which established app has each as proof. Be realistic for a newer broker (prioritise). Terse, professional, impact-ordered. Signed "Chirag Singhal". Return {target:"pocketful", subject, body}.`,
    { label: 'draft:pocketful', phase: 'Synthesize', schema: DRAFT_SCHEMA, effort: 'high' }
  ),
]).then(ds => ds.filter(Boolean))

// Phase 3: SEND each drafted email — verify support email + MX first, never guess.
const SEND_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: { target: { type: 'string' }, email: { type: 'string' }, sent: { type: 'boolean' }, messageId: { type: 'string' }, note: { type: 'string' } },
  required: ['target','sent','note'],
}

const sends = await parallel(drafts.map((d) => () =>
  agent(
`Send this feature-request email to ${d.target} (an Indian investing app). Verify their support/feedback email + MX BEFORE sending — never guess or send to a dead address.

STEP 1: find ${d.target}'s official support/feedback email via perplexity-search web_search (twice, cross-check, accept only the company's own site). Common patterns: support@<domain>. For Pocketful the domain is pocketful.in (support@pocketful.in). MX-validate via Bash: nslookup -type=mx <domain>. If you cannot verify a real MX-valid address, return sent=false note="could not verify email".
STEP 2: send from account 'why':
cd C:/g/ws/repos/own/life-cli && uv run python -m life_cli.gtool -A why mail send --to "<addr>" --subject ${JSON.stringify(d.subject)} --body "<body below>"
BODY:
${JSON.stringify(d.body)}
(strip any characters that would break the shell; pass the body via the tool.)
Return {target:"${d.target}", email, sent, messageId, note}. sent=true only if the tool returned a message id.`,
    { label: `send:${d.target}`, phase: 'Send', schema: SEND_SCHEMA, effort: 'low' }
  )
)).then(s => s.filter(Boolean))

return {
  researchedSlices: findings.map(f=>f.slice),
  totalFeatures: allFeatures.length,
  sent: sends.filter(s=>s.sent).map(s=>`${s.target} (${s.email}, ${s.messageId})`),
  notSent: sends.filter(s=>!s.sent).map(s=>`${s.target}: ${s.note}`),
}

