export const meta = {
  name: 'last-broker-feedback',
  description: 'Send feature-request feedback to ICICI Direct, Kotak Securities, Paytm Money, HDFC Securities, 5paisa — verify support email + MX, then send',
  phases: [{ title: 'Send' }],
}
const BROKERS = [
  { name: 'ICICI Direct', domain: 'icicidirect.com' },
  { name: 'Kotak Securities', domain: 'kotak.com' },
  { name: 'Paytm Money', domain: 'paytmmoney.com' },
  { name: 'HDFC Securities', domain: 'hdfcsec.com' },
  { name: '5paisa', domain: '5paisa.com' },
]
const SCHEMA = { type:'object', additionalProperties:false, properties:{ broker:{type:'string'}, email:{type:'string'}, sent:{type:'boolean'}, messageId:{type:'string'}, note:{type:'string'} }, required:['broker','sent','note'] }
const results = await parallel(BROKERS.map((B)=>()=>
  agent(
`Send feature-request feedback to ${B.name}. Verify support email + MX first; never guess.
STEP 1: find ${B.name}'s official support/feedback/grievance email via perplexity-search web_search (twice, cross-check, company's own site only). Likely domain ${B.domain}. MX-validate via Bash: nslookup -type=mx <domain>. If unverifiable, sent=false note="could not verify".
STEP 2: send from account 'why':
cd C:/g/ws/repos/own/life-cli && uv run python -m life_cli.gtool -A why mail send --to "<addr>" --subject "Feature request / feedback from an investor" --body "<body>"
BODY:
"Hi ${B.name} team,
Prioritised feature-request feedback from an investor comparing multiple broking apps:
1. Fund overlap / portfolio X-ray for mutual funds (Kuvera-style).
2. Rolling returns + deeper MF analytics (expense-ratio history, AUM trend, category percentile, fund-manager tenure).
3. Consolidated net-worth view aggregating external assets (other brokers, FDs, gold, bonds, P2P) - like INDmoney.
4. Full CSV/JSON export of holdings AND transaction history.
5. Free consolidated capital-gains / ITR-ready report across equity + F&O + MF.
6. Family / household portfolio view with consent.
7. Options strategy builder + payoff/Greeks depth (Sensibull level).
8. Transparent per-transaction + monthly charges breakdown, and MTF slab transparency (show effective rate per funded-amount slab up front).
9. Read-only personal API for holdings/transactions.
Thanks. Happy to beta-test.
Chirag Singhal"
Return {broker:"${B.name}", email, sent, messageId, note}. sent=true only if a message id returned.`,
    { label:`fb:${B.name}`, phase:'Send', schema:SCHEMA, effort:'low' }
  )
)).then(r=>r.filter(Boolean))
return { sent: results.filter(r=>r.sent).map(r=>`${r.broker} (${r.email}, ${r.messageId})`), notSent: results.filter(r=>!r.sent).map(r=>`${r.broker}: ${r.note}`) }
