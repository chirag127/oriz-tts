export const meta = {
  name: 'more-broker-feedback',
  description: 'Send feature-request feedback to m.Stock, Angel One, Upstox, Zerodha — verify support email + MX per broker, then send',
  phases: [{ title: 'Send' }],
}

const BROKERS = [
  { name: 'm.Stock (Mirae Asset)', domain: 'mstock.com', note: 'zero-AMC lifetime, MTF 8.99%. Strong on cost.' },
  { name: 'Angel One', domain: 'angelone.in', note: 'MTF 14.99%, AMC ~240/yr, good app + research.' },
  { name: 'Upstox', domain: 'upstox.com', note: 'MTF ~14.99%. Good charts.' },
  { name: 'Zerodha', domain: 'zerodha.com', note: 'Kite is the gold standard for charts + Kite Connect API; AMC 300/yr after yr1, MTF ~14.95%.' },
]
const SCHEMA = { type:'object', additionalProperties:false, properties:{ broker:{type:'string'}, email:{type:'string'}, sent:{type:'boolean'}, messageId:{type:'string'}, note:{type:'string'} }, required:['broker','sent','note'] }

const results = await parallel(BROKERS.map((B)=>()=>
  agent(
`Send feature-request feedback to ${B.name}. Verify support email + MX first; never guess.
STEP 1: find ${B.name}'s official support/feedback email via perplexity-search web_search (twice, cross-check, company's own site only). Domain is likely ${B.domain} (e.g. support@${B.domain}). MX-validate via Bash nslookup -type=mx ${B.domain}. If unverifiable, sent=false note="could not verify".
STEP 2: send from account 'why':
cd C:/g/ws/repos/own/life-cli && uv run python -m life_cli.gtool -A why mail send --to "<addr>" --subject "Feature request / feedback from an investor" --body "<body>"
BODY (tailor lightly to ${B.name}; context: ${B.note}):
"Hi ${B.name} team,
I invest through multiple apps and wanted to share prioritised feedback on features that would make ${B.name} a more complete platform:
1. Fund overlap / portfolio X-ray for mutual funds (like Kuvera) - show underlying-holding overlap across funds.
2. Rolling returns + deeper MF analytics (expense-ratio history, AUM trend, category percentile, fund-manager tenure) - Value Research level.
3. Consolidated net-worth view aggregating external assets (other brokers, FDs, gold, bonds, P2P) into one number - like INDmoney.
4. Full CSV/JSON export of holdings AND transaction history.
5. Free consolidated capital-gains / ITR-ready report across equity + F&O + MF.
6. Family / household portfolio view with consent.
7. Options strategy builder + payoff/Greeks depth (Sensibull level) natively.
8. Transparent per-transaction + monthly charges breakdown (brokerage, DP, GST) in one place.
9. Read-only personal API for holdings/transactions so users can build their own trackers.
Thanks for the platform. Happy to beta-test.
Chirag Singhal"
Return {broker:"${B.name}", email, sent, messageId, note}. sent=true only if a message id returned.`,
    { label:`fb:${B.name}`, phase:'Send', schema:SCHEMA, effort:'low' }
  )
)).then(r=>r.filter(Boolean))

return { sent: results.filter(r=>r.sent).map(r=>`${r.broker} (${r.email}, ${r.messageId})`), notSent: results.filter(r=>!r.sent).map(r=>`${r.broker}: ${r.note}`) }
