export const meta = {
  name: 'bank-interest-audit',
  description: 'Ask all 18 banks for savings-account interest calculation statement + confirm correct quarterly crediting per RBI, citing account last-4 + PAN + mobile',
  phases: [{ title: 'Send' }],
}

const PAN = 'OQVPS7357P'
const MOBILE = '+91 74284-49707'

// bank | verified grievance email(s) | account last-4 (from INDmoney)
const BANKS = [
  { name: 'Punjab National Bank', to: 'care@pnb.co.in', accts: 'XX7701, XX1433, XX2196, XX1957' },
  { name: 'Axis Bank', to: 'nodal.officer@axis.bank.in,pno@axis.bank.in', accts: 'XX6741' },
  { name: 'Canara Bank', to: 'hocss1@canarabank.com', accts: 'XX0684' },
  { name: 'Bank of India', to: 'cgro.boi@bankofindia.co.in', accts: 'XX5202' },
  { name: 'Bank of Baroda', to: 'gm.ops.ho@bankofbaroda.com,cs.ho@bankofbaroda.com', accts: 'XX5461' },
  { name: 'Union Bank of India', to: 'customercare@unionbankofindia.bank.in', accts: 'XX0001' },
  { name: 'ICICI Bank', to: 'customer.care@icici.bank.in,headservicequality@icicibank.com', accts: 'XX0131' },
  { name: 'Kotak Mahindra Bank', to: 'nodalofficer@kotak.com', accts: 'XX5999' },
  { name: 'HDFC Bank', to: 'support@hdfc.bank.in,grievance.redressal@hdfc.bank.in', accts: 'XX1111' },
  { name: 'Yes Bank', to: 'yestouch@yes.bank.in,head.grievanceredressal@yes.bank.in', accts: 'XX3102' },
  { name: 'Federal Bank', to: 'contact@federalbank.co.in,support@federalbank.co.in', accts: 'XX7185, XX2841, XX3299' },
  { name: 'IDFC First Bank', to: 'pno@idfcfirstbank.com,banker@idfcfirstbank.com', accts: 'XX2112' },
  { name: 'Indian Overseas Bank', to: 'gm-csd@iob.in', accts: 'XX0777' },
  { name: 'Indian Bank', to: 'nodalofficer@indianbank.bank.in', accts: 'XX3249' },
  { name: 'AU Small Finance Bank', to: 'pno@aubank.in', accts: 'XX7671, XX2823' },
  { name: 'Suryoday Small Finance Bank', to: 'pno@suryodaybank.com,nodalofficer@suryodaybank.com', accts: 'XX9539' },
  { name: 'Slice Small Finance Bank', to: 'customergrievance@slicebank.com,principal.nodalofficer@slicebank.com', accts: 'XX3475' },
]

const SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: { bank: { type: 'string' }, sent: { type: 'boolean' }, messageId: { type: 'string' } },
  required: ['bank', 'sent'],
}

const results = await parallel(BANKS.map((B) => () =>
  agent(
`Send ONE email via life-cli from account 'why' asking ${B.name} for a savings-account interest-calculation statement. Recipients (already verified, use as-is): ${B.to}

Command:
cd C:/g/ws/repos/own/life-cli && uv run python -m life_cli.gtool -A why mail send --to "${B.to}" --subject "Request: savings interest calculation statement + confirm correct quarterly crediting - a/c ${B.accts}" --body "<body>"

BODY:
"Dear ${B.name} Grievance/Nodal Officer,

Account holder: Chirag Singhal. Registered mobile ${MOBILE}. PAN ${PAN}. Account(s) ending: ${B.accts}.

I request the following for my savings account(s) above, per RBI's directive on daily-product-basis interest calculation and quarterly crediting:
1. The interest calculation statement for the last 4 quarters - the applicable interest rate(s), the daily-balance basis used, and the interest amount computed and credited each quarter.
2. Confirmation that savings interest has been correctly computed on daily closing balance and credited at least quarterly, as mandated by RBI.
3. If any interest was under-credited or missed for these account(s), please credit the shortfall with a corrected statement.
4. The current applicable savings interest rate and any slab structure on these account(s).

Please share the interest statement and confirm the crediting. If unresolved, I will escalate to the RBI Ombudsman (CMS portal).

Regards,
Chirag Singhal
Mobile ${MOBILE} | PAN ${PAN}"

Return {bank:"${B.name}", sent, messageId}. Only sent=true if the tool returned a message id.`,
    { label: `interest:${B.name}`, phase: 'Send', schema: SCHEMA, effort: 'low' }
  )
))

const clean = results.filter(Boolean)
return { sent: clean.filter(r => r.sent).map(r => `${r.bank} (${r.messageId})`), total: clean.filter(r => r.sent).length }
