export const meta = {
  name: 'closed-loan-noc-mandate',
  description: 'For each CLOSED loan/card account: ask lender to cancel e-NACH mandate, reverse post-closure/double debits, disclose+refund foreclosure/processing fees, issue NOC/closure certificate. Verify email+MX per lender.',
  phases: [{ title: 'Send' }],
}

const PAN = 'OQVPS7357P'
const MOBILE = '+91 74284-49707'

// closed accounts: lender | known email (blank=lookup) | acct# | closed date
const CLOSED = [
  { name: 'Kotak Mahindra Bank', email: 'nodalofficer@kotak.com', acct: 'SPLN94664759 and 9406420003525715', closed: '2025-12-18 / 2025-12-19' },
  { name: 'AU Small Finance Bank', email: 'pno@aubank.in', acct: '1699258909179200', closed: '2025-12-22' },
  { name: 'Snapmint (Snapmint Financial)', email: '', acct: '3089487501202606', closed: '2026-06-15' },
  { name: 'Fibe / EarlySalary', email: '', acct: 'FIBELAI1011669565', closed: '2026-06-27' },
  { name: 'InCred / Innofin', email: '', acct: 'LOA-G49VK5H4', closed: '2026-05-21' },
  { name: 'mPokket', email: '', acct: 'MKV126269B3ID235819745', closed: '2026-01-18' },
  { name: 'True Credits (TrueBalance)', email: '', acct: 'TBPL01-51231-7047904', closed: '2026-06-25' },
  { name: 'FincFriend', email: '', acct: '206853533', closed: '2026-06-25' },
  { name: 'KOMINVEST (Kissht/OnEMI)', email: '', acct: '2601010611473030WFKD3LIYF', closed: '2026-05-27' },
  { name: 'SBM Bank India', email: '', acct: 'multiple closed cards incl SBM-5-KPE-34397-K3P1AE, SBM-7-MWK-34397-S0YQLA, 806A067C, U84A5M4N7UCJ2X2, U84A5JXEF6A42X5', closed: 'various 2025-2026' },
]

const SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: { lender: { type: 'string' }, email: { type: 'string' }, sent: { type: 'boolean' }, messageId: { type: 'string' }, note: { type: 'string' } },
  required: ['lender', 'sent', 'note'],
}

const results = await parallel(CLOSED.map((L) => () =>
  agent(
`Send ONE closed-loan grievance email to "${L.name}" for the user's CLOSED account. Verify email + MX before sending; never send to a guessed/dead address.

USER: Chirag Singhal, PAN ${PAN}, mobile ${MOBILE}. Closed account: ${L.acct}, closed on ${L.closed}.

STEP 1 recipient:
${L.email ? `Use verified address: ${L.email}` : `Look up "${L.name} grievance / nodal officer email official" via perplexity-search web_search (twice, cross-check, accept only the lender's own site). MX-validate the domain via Bash nslookup -type=mx <domain>. If no verified MX-valid address, DO NOT send; return sent=false note="could not verify email".`}
STEP 2 MX-validate then send from account 'why':
cd C:/g/ws/repos/own/life-cli && uv run python -m life_cli.gtool -A why mail send --to "<addr>" --subject "Closed loan a/c ${L.acct} — cancel e-NACH mandate, issue NOC, disclose/refund charges" --body "<body>"
BODY:
"Dear ${L.name} Grievance/Nodal Officer,
Account holder: Chirag Singhal. Registered mobile ${MOBILE}. PAN ${PAN}.
My loan/card account ${L.acct} was CLOSED on ${L.closed}. For this closed account I request, per RBI norms:
1. CANCEL the e-NACH / auto-debit / standing-instruction mandate immediately, so no further debit occurs. Confirm cancellation in writing.
2. If any EMI/amount was debited AFTER the closure date, or debited twice, REVERSE it and refund with a statement.
3. Disclose the foreclosure/prepayment charges and the processing fee applied on this loan, with the sanction terms; if any charge was not disclosed upfront or is not permitted, refund it.
4. Issue the NO OBJECTION CERTIFICATE (NOC) / loan-closure certificate for this account, and confirm the account is reported as CLOSED with zero balance to the credit bureaus (CIBIL + CRIF).
Please confirm all of the above in writing. If unresolved, I will escalate to the RBI Ombudsman (CMS portal).
Regards,
Chirag Singhal
Mobile ${MOBILE} | PAN ${PAN}"

Return {lender:"${L.name}", email, sent, messageId, note}. sent=true only if the tool returned a message id.`,
    { label: `noc:${L.name}`, phase: 'Send', schema: SCHEMA, effort: 'low' }
  )
))

const clean = results.filter(Boolean)
return {
  sent: clean.filter(r => r.sent).map(r => `${r.lender} (${r.messageId})`),
  couldNotVerify: clean.filter(r => !r.sent).map(r => `${r.lender}: ${r.note}`),
  total: clean.filter(r => r.sent).length,
}
