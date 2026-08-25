export const meta = {
  name: 'cf-rename-dedupe',
  description: 'CF Pages: delete stale domainless duplicate shells + rename the few genuine mismatches to match GitHub repo, verify-before-delete on every live domain',
  phases: [{ title: 'Rename' }, { title: 'Dedupe' }],
}

const CF_TOKEN = 'cfut_REDACTED_BY_USER_REQUEST'
const ACCT = '6a6349fe1568743539433bf10f23ffeb'

// GENUINE renames: project currently holds a live domain but name != target repo name.
// action: create new project(target) -> deploy the repo -> add custom domain to new -> verify 200 -> remove domain from old -> delete old.
const RENAMES = [
  { old: 'me-chirag127', target: 'oriz-me', domain: 'me.oriz.in', repo: 'C:/g/ws/repos/own/oriz-me', pm: 'npm' },
  { old: 'oriz-brand', target: 'oriz-palette-ai', domain: 'brand.oriz.in', repo: 'C:/g/ws/repos/own/oriz-palette-ai', pm: 'npm' },
  { old: 'oriz-play', target: 'oriz-story-dice', domain: 'play.oriz.in', repo: 'C:/g/ws/repos/own/oriz-story-dice', pm: 'npm' },
  { old: 'links-oriz-in', target: 'oriz-links-site', domain: 'links.oriz.in', repo: 'C:/g/ws/repos/own/oriz-links-site', pm: 'npm' },
  { old: 'knowledge-oriz-in', target: 'oriz-knowledge-site', domain: 'knowledge.oriz.in', repo: 'C:/g/ws/repos/own/oriz-knowledge-site', pm: 'npm' },
]

// STALE SHELLS: no custom domain, superseded by a clean-named twin that already holds the domain. Safe to delete (verify domainless first).
const SHELLS = ['oriz-slice-pdf', 'oriz-scribe-text', 'oriz-shift-convert', 'oriz-grid-qr', 'oriz-forge-dev']

const SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    project: { type: 'string' }, action: { type: 'string' },
    status: { type: 'string', enum: ['done', 'skipped', 'failed'] },
    detail: { type: 'string' },
  },
  required: ['project', 'action', 'status', 'detail'],
}

const renameResults = await parallel(RENAMES.map((r) => () =>
  agent(
`CF Pages RENAME with strict verify-before-delete. Project "${r.old}" serves live domain ${r.domain}; rename it to "${r.target}" (matching GitHub repo). Env: CLOUDFLARE_API_TOKEN=${CF_TOKEN}, account ${ACCT}, repo at ${r.repo} (${r.pm}).

SAFE SEQUENCE (do NOT deviate; if any step fails or is ambiguous, STOP and report status=failed/skipped with detail — never delete on doubt):
1. Confirm "${r.target}" does NOT already exist as a project (curl the pages API or wrangler pages project list). If it exists, STOP (skipped, "target name taken").
2. Build the repo: cd ${r.repo} && (${r.pm} install ${r.pm === 'npm' ? '--legacy-peer-deps' : ''} && ${r.pm} run build). Must produce dist/.
3. Deploy to the NEW name: CLOUDFLARE_API_TOKEN=${CF_TOKEN} npx wrangler pages deploy dist --project-name ${r.target} --branch main --commit-dirty=true. This creates the project.
4. Add the custom domain ${r.domain} to the NEW project via CF API:
   curl -X POST "https://api.cloudflare.com/client/v4/accounts/${ACCT}/pages/projects/${r.target}/domains" -H "Authorization: Bearer ${CF_TOKEN}" -H "Content-Type: application/json" --data '{"name":"${r.domain}"}'
   (CF moves the domain from old to new; a domain can attach to the new project.)
5. VERIFY: curl -sS -o /dev/null -w "%{http_code}" -L https://${r.domain} (retry a few times over ~60s for propagation). MUST be 200. If not 200 after retries, STOP (failed, "domain not serving from new project") — do NOT delete the old project; the domain is still recoverable on old.
6. ONLY after confirmed 200: remove the domain from the OLD project + delete the OLD project:
   curl -X DELETE ".../pages/projects/${r.old}/domains/${r.domain}" ... ; then curl -X DELETE ".../pages/projects/${r.old}" ...
7. Update the repo's deploy config to the new project name: in ${r.repo}, sed any --project-name ${r.old} -> ${r.target} in .github/workflows/*.yml + package.json + any *.ps1; commit ("ci: repoint deploy to ${r.target}") + push.

Return {project:"${r.old}", action:"rename->${r.target}", status, detail}. detail = what happened + final HTTP code on ${r.domain}.`,
    { label: `rename:${r.old}`, phase: 'Rename', schema: SCHEMA, effort: 'high' }
  )
))

// Dedupe shells only AFTER renames (avoid API contention). Each: verify domainless + then delete.
const shellResults = await parallel(SHELLS.map((s) => () =>
  agent(
`CF Pages SHELL DELETE with safety check. Project "${s}" is believed to be a stale duplicate with NO custom domain (its live domain, if any, is served by a clean-named twin). Env: CLOUDFLARE_API_TOKEN=${CF_TOKEN}, account ${ACCT}.

1. GET the project: curl -sS "https://api.cloudflare.com/client/v4/accounts/${ACCT}/pages/projects/${s}" -H "Authorization: Bearer ${CF_TOKEN}". Inspect its "domains" array.
2. If "domains" contains ANY *.oriz.in custom domain (anything other than the *.pages.dev): STOP. status=skipped, detail="has live domain <x> — NOT a safe shell, left intact". Do NOT delete.
3. If domains is empty or only the .pages.dev subdomain: it is a safe stale shell. Delete it: curl -X DELETE "https://api.cloudflare.com/client/v4/accounts/${ACCT}/pages/projects/${s}" -H "Authorization: Bearer ${CF_TOKEN}". Confirm success:true.
Return {project:"${s}", action:"delete-shell", status, detail}.`,
    { label: `dedupe:${s}`, phase: 'Dedupe', schema: SCHEMA, effort: 'medium' }
  )
))

const all = [...renameResults, ...shellResults].filter(Boolean)
return {
  renamed: all.filter(r => r.action?.startsWith('rename') && r.status === 'done').map(r => r.project),
  shellsDeleted: all.filter(r => r.action === 'delete-shell' && r.status === 'done').map(r => r.project),
  skipped: all.filter(r => r.status === 'skipped').map(r => `${r.project}: ${r.detail}`),
  failed: all.filter(r => r.status === 'failed').map(r => `${r.project}: ${r.detail}`),
}
