export const meta = {
  name: 'fraud-lender-notices',
  description: 'Send identity-fraud notices to ~35 lenders that made unauthorised enquiries on PAN OQVPS7357P — verify each grievance email + MX, cite their specific enquiry dates, send from account why',
  phases: [{ title: 'Notify' }],
}

const PAN = 'OQVPS7357P'
const MOBILE = '+91 74284-49707'

// lender -> {email (blank=lookup), enquiries: "type dates"}
const LENDERS = [
  { name: 'AXIS BANK', email: 'nodal.officer@axis.bank.in,pno@axis.bank.in', enq: 'Business Loan on 2026-08-06, 2026-01-02, 2025-12-20, 2025-11-20, 2024-03-08 (x2)' },
  { name: 'HDFC BANK', email: 'grievance.redressal@hdfc.bank.in,support@hdfc.bank.in', enq: 'Consumer Durable Loan on 2026-05-21, 2026-02-05, 2025-12-29; Business Loan on 2025-08-22, 2025-07-01, 2025-06-12, 2024-12-03' },
  { name: 'ICICI BANK', email: 'customer.care@icici.bank.in,headservicequality@icicibank.com', enq: 'Consumer Durable Loan on 2025-12-31; Business Loan on 2025-07-15, 2025-06-17' },
  { name: 'YES BANK', email: 'yestouch@yes.bank.in,head.grievanceredressal@yes.bank.in', enq: 'Business Loan on 2025-12-28, 2025-12-27, 2025-06-21, 2025-06-15' },
  { name: 'INDUSIND BANK', email: 'reachus@indusind.com,nodal.officer@indusind.com', enq: 'Consumer Durable Loan on 2025-06-21, 2024-11-21, 2023-10-13; Business Loan on 2024-07-01' },
  { name: 'IDFC FIRST BANK', email: 'pno@idfcfirstbank.com,banker@idfcfirstbank.com', enq: 'Consumer Durable Loan on 2025-12-31, 2025-12-24; Credit Card on 2025-12-19; Business Loan on 2025-06-16' },
  { name: 'KOTAK BANK', email: 'nodalofficer@kotak.com', enq: 'Business Loan on 2026-01-05' },
  { name: 'PNB', email: 'care@pnb.co.in', enq: 'Business Loan on 2026-01-06' },
  { name: 'FEDERAL BANK', email: 'contact@federalbank.co.in,support@federalbank.co.in', enq: 'Business Loan on 2026-01-02, 2025-06-16' },
  { name: 'AU SMALL FINANCE BANK', email: 'pno@aubank.in', enq: 'Business Loan on 2026-04-30, 2025-12-31, 2023-10-21' },
  // lookup needed:
  { name: 'RBL BANK', email: '', enq: 'Business Loan on 2026-04-21, 2026-01-05, 2025-06-16, 2024-07-01' },
  { name: 'SBI CARD', email: '', enq: 'Business Loan on 2025-10-31, 2025-07-17' },
  { name: 'BOBCARD (Bank of Baroda cards)', email: '', enq: 'Business Loan on 2025-06-26' },
  { name: 'HSBC', email: '', enq: 'Business Loan on 2025-06-27' },
  { name: 'CITY UNION BANK', email: '', enq: 'Business Loan on 2026-08-05, 2026-04-30' },
  { name: 'INCRED FINANCE', email: '', enq: 'Consumer Durable Loan on 2026-08-04, 2025-12-31' },
  { name: 'TATA CAPITAL (TCL)', email: '', enq: 'Consumer Durable Loan on 2026-02-10, 2026-01-01' },
  { name: 'BAJAJ FINANCE LTD', email: '', enq: 'Consumer Durable Loan on 2025-12-28 (x2); Education Loan on 2025-10-31, 2025-06-30' },
  { name: 'HERO FINCORP', email: '', enq: 'Consumer Durable Loan on 2025-12-31' },
  { name: 'NAVI', email: '', enq: 'Consumer Durable Loan on 2025-12-31' },
  { name: 'KREDITBEE (Krazybee)', email: '', enq: 'Consumer Durable Loan on 2025-12-31' },
  { name: 'FIBE / EARLYSALARY', email: '', enq: 'Consumer Durable Loan on 2025-10-25, 2025-06-20' },
  { name: 'JIO FINANCE (JioCredit)', email: '', enq: 'Credit Card on 2025-12-31' },
]

const SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: { lender: { type: 'string' }, email: { type: 'string' }, mxOk: { type: 'boolean' }, sent: { type: 'boolean' }, messageId: { type: 'string' }, note: { type: 'string' } },
  required: ['lender', 'sent', 'note'],
}

const results = await parallel(LENDERS.map((L) => () =>
  agent(
`Send an IDENTITY-FRAUD notice to lender "${L.name}" about an UNAUTHORISED credit enquiry on the victim's PAN. Verify the grievance email + MX BEFORE sending — never send to a guessed/dead address.

VICTIM: Chirag Singhal, PAN ${PAN}, mobile ${MOBILE}, salaried individual (NO business).
THIS LENDER'S unauthorised enquiries on the report: ${L.enq}

STEP 1 — recipient email:
${L.email ? `Use this verified address: ${L.email}` : `Look it up: use perplexity-search web_search (twice, cross-check) for "${L.name} grievance / nodal officer email official". Accept only an address from the lender's OWN site. Then MX-validate the domain via Bash \`nslookup -type=mx <domain>\`. If you cannot verify a real MX-valid address, DO NOT send — return sent=false, note="could not verify email".`}

STEP 2 — MX-validate the chosen domain(s) (nslookup -type=mx). If no MX, do not send.

STEP 3 — send via life-cli from account 'why':
cd C:/g/ws/repos/own/life-cli && uv run python -m life_cli.gtool -A why mail send --to "<addr>" --subject "Identity fraud — unauthorised credit enquiry on my PAN ${PAN}, I never applied" --body "<body>"
BODY (formal, terse):
"To the ${L.name} Grievance / Nodal Officer,
I am a SALARIED individual (PAN ${PAN}, mobile ${MOBILE}). My credit report shows the following enquiry/enquiries by ${L.name} that I DID NOT make or authorise: ${L.enq}.
I never applied for any loan/card with ${L.name}. My PAN has been misused (I have ~73 unauthorised enquiries across ~35 lenders; I own no business yet ~40 'Business Loan' enquiries appear — clear identity fraud).
Requests: (1) confirm whether any application/account exists in my name from this enquiry and CLOSE it immediately; (2) provide the application documents/KYC you hold for it; (3) do NOT report any such account to the credit bureaus, and withdraw/mark-as-fraud any enquiry/tradeline already reported; (4) confirm in writing. I am filing a cybercrime complaint (cybercrime.gov.in/1930) and have raised disputes with CIBIL (control 11453135092) + CRIF.
Chirag Singhal | PAN ${PAN} | ${MOBILE}"

Return {lender:"${L.name}", email, mxOk, sent, messageId (the id the tool returned), note}. Only report sent=true if the tool returned a message id.`,
    { label: `notify:${L.name}`, phase: 'Notify', schema: SCHEMA, effort: 'low' }
  )
))

const clean = results.filter(Boolean)
return {
  sent: clean.filter(r => r.sent).map(r => `${r.lender} (${r.messageId})`),
  couldNotVerify: clean.filter(r => !r.sent).map(r => `${r.lender}: ${r.note}`),
  totalSent: clean.filter(r => r.sent).length,
}
