export const meta = {
  name: 'blog-fleet-distinct-redesign',
  description: 'Give each of 24 oriz-blog sites a distinct layout+identity, bundle Firebase/series bugfixes, build, deploy, and crawl-test all pages load',
  phases: [
    { title: 'Redesign+Fix' },
    { title: 'Verify' },
  ],
}

const CF_TOKEN = 'cfut_REDACTED_BY_USER_REQUEST'
const REF = 'C:/g/ws/repos/own/oriz-blog-sustainability'

// niche | firebase already stripped? | cf project | live domain
const BLOGS = [
  ['ai', true], ['arts', false], ['beauty', false], ['business', false],
  ['education', false], ['entertainment', true], ['finance', true], ['food', true],
  ['gaming', false], ['health', true], ['hobbies', false], ['home-diy', false],
  ['lifestyle', true], ['marketing', false], ['news', false], ['parenting', false],
  ['pets', false], ['relationships', false], ['remote-work', false], ['self-dev', false],
  ['sports', false], ['sustainability', true], ['tech', true], ['travel', false],
].map(([niche, fbDone]) => ({
  niche,
  fbDone,
  repo: `C:/g/ws/repos/own/oriz-blog-${niche}`,
  project: `oriz-blog-${niche}`,
  domain: `${niche}-blog.oriz.in`,
}))

const VERDICT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    niche: { type: 'string' },
    buildExit: { type: 'integer' },
    deployUrl: { type: 'string' },
    pushed: { type: 'boolean' },
    identity: { type: 'string', description: 'one-line: the distinct layout+identity direction chosen' },
    pagesTested: { type: 'integer' },
    pagesFailed: { type: 'integer' },
    failedUrls: { type: 'array', items: { type: 'string' } },
    notes: { type: 'string' },
  },
  required: ['niche', 'buildExit', 'pushed', 'pagesTested', 'pagesFailed'],
}

const results = await pipeline(
  BLOGS,
  (b) => agent(
`You are redesigning ONE blog site to be structurally + visually DISTINCT from its 23 siblings, then bug-fixing, building, and deploying it. Work ONLY inside ${b.repo}.

NICHE: "${b.niche}" (domain ${b.domain}, CF project ${b.project}).

CONTEXT: 24 oriz-blog-* sites share one Astro engine. Each already has a unique tokens.css palette/voice, BUT they all share the SAME layout skeleton (same header nav shape, same homepage composition, same /series /categories routes, same card grid) — so they read as "similar". Your job: make THIS blog's LAYOUT + STRUCTURE genuinely distinct, fitting the "${b.niche}" niche, while keeping the shared content engine working.

=== STEP 1 — BUGFIXES (mandatory, do first) ===
${b.fbDone ? '- Firebase already stripped on this repo. Skip.' : `- Strip Firebase: copy ${REF}/src/lib/bookmarks.ts OVER ${b.repo}/src/lib/bookmarks.ts (Read ref, Write target, identical). Delete ${b.repo}/src/lib/firebase.ts. In package.json remove the "firebase": line. In src/env.d.ts remove all PUBLIC_FIREBASE_ lines. Verify grep "from './firebase'|firebase/firestore|getFirestore" in src/ is empty.`}
- Series empty-guard: ensure ${b.repo}/src/pages/series/index.astro redirects to /blog/ when there are no multi-part series. Copy the guard from ${REF}/src/pages/series/index.astro (it has \`if (series.length === 0) { return Astro.redirect('/blog/', 302) }\` right after the series.sort line). Apply the same guard if missing.

=== STEP 2 — DISTINCT LAYOUT + IDENTITY (the real work) ===
Design a layout that could ONLY belong to a "${b.niche}" blog. Push structure, not just color. Concretely vary AT LEAST:
- Homepage composition: a hero + section ordering unique to the niche (e.g. news=headline-ticker+latest-first; gaming=arcade-tile-grid; food=recipe-card-first; finance=data/ticker; parenting=age-stage rails). Do NOT reuse the generic hero+card-grid every sibling uses.
- Nav vocabulary: rename nav labels to niche-native words (edit Header.astro + Footer.astro), not generic "Blog/Series/Topics".
- A signature module unique to this blog (one bespoke component in src/components) that reinforces the niche.
- Card/list treatment: a distinct post-list style (not the same row/card as siblings).
- tokens.css: keep/deepen the existing bespoke palette; only adjust if it's not distinct enough. Preserve ALL --color-* alias names so chrome compiles.
CONSTRAINTS: keep the 'blog' content collection + schema + route family (/blog/<slug>/, /categories/, /tags/, /series/) working. Keep BaseLayout mechanism + a11y. Reuse community libraries already in package.json; add a well-maintained one only if it makes it clearly more beautiful (e.g. a lightweight animation/typography lib) — prefer CSS. Every site its OWN look — do not copy a sibling's layout. Responsive 1440 + 390, WCAG AA, reduced-motion aware, no-JS fallback for content.

=== STEP 3 — BUILD ===
cd ${b.repo} && npm install --legacy-peer-deps && npm run build  (must exit 0). If it fails, FIX it. Do not deploy a broken build.

=== STEP 4 — DEPLOY ===
Set env CLOUDFLARE_API_TOKEN=${CF_TOKEN}, then: npx wrangler pages deploy dist --project-name ${b.project} --branch main --commit-dirty=true

=== STEP 5 — COMMIT ===
git add -A && git commit -m "feat(${b.niche}): distinct layout+identity; fix firebase+series" && git push

Use Bash (Git Bash) + Read/Write/Edit. cbm tools for code navigation. Return the schema fields: niche, buildExit (0 if ok), deployUrl, pushed, identity (one line describing the distinct direction), and set pagesTested/pagesFailed to 0 (a separate verifier crawls). notes = anything the verifier should know.`,
    { label: `redesign:${b.niche}`, phase: 'Redesign+Fix', agentType: 'general-implementer', schema: VERDICT_SCHEMA, effort: 'high' }
  ),
  // Verify stage: crawl the deployed sitemap, check every page is 200 + no console crash on 3 sampled pages
  (built, b) => {
    if (!built || built.buildExit !== 0) return built  // skip verify if build failed
    return agent(
`Crawl-test the deployed blog ${b.domain}. Steps (use Bash + curl):
1. Fetch https://${b.domain}/sitemap-0.xml (or sitemap-index.xml → child). Extract all <loc> URLs.
2. For EVERY url, curl -sS -o /dev/null -w "%{http_code}" — collect any that are NOT 200 (allow 3xx that redirect to a 200; follow with -L and check final).
3. Report total pages tested + count of failures + the failing URLs (max 20).
This is read-only. Return schema: niche="${b.niche}", buildExit=${built.buildExit}, deployUrl="${built.deployUrl || ''}", pushed=${built.pushed}, identity=${JSON.stringify(built.identity || '')}, pagesTested=<n>, pagesFailed=<n>, failedUrls=[...], notes=<crawl summary>.`,
      { label: `verify:${b.niche}`, phase: 'Verify', agentType: 'general-purpose', schema: VERDICT_SCHEMA, effort: 'low' }
    )
  }
)

const clean = results.filter(Boolean)
const brokeBuild = clean.filter(r => r.buildExit !== 0)
const pageFails = clean.filter(r => (r.pagesFailed || 0) > 0)
return {
  total: clean.length,
  buildOk: clean.length - brokeBuild.length,
  brokeBuild: brokeBuild.map(r => r.niche),
  pageFails: pageFails.map(r => ({ niche: r.niche, failed: r.pagesFailed, urls: r.failedUrls })),
  identities: clean.map(r => `${r.niche}: ${r.identity}`),
}
