# gh CLI basics — shared across github-* skills

Shared boilerplate for the 5 GitHub-family skills (`github-auth`, `github-code-review`, `github-issues`, `github-pr-workflow`, `github-repo-management`). Extracted 2026-07-09 to keep each SKILL.md focused on its unique workflow.

## Auth-method detection

Every op runs one of: `gh` (authed) → `curl + $GITHUB_TOKEN` → fail. Pick per invocation:

```bash
if command -v gh &>/dev/null && gh auth status &>/dev/null; then
  AUTH=gh
else
  AUTH=git
  # $GITHUB_TOKEN from env, else ~/.git-credentials, else Hermes .env (inert outside Hermes)
  [ -z "$GITHUB_TOKEN" ] && [ -f "${HERMES_HOME:-$HOME/.hermes}/.env" ] && \
    GITHUB_TOKEN=$(grep "^GITHUB_TOKEN=" "${HERMES_HOME:-$HOME/.hermes}/.env" | cut -d= -f2 | tr -d '\n\r')
  [ -z "$GITHUB_TOKEN" ] && grep -q github.com ~/.git-credentials 2>/dev/null && \
    GITHUB_TOKEN=$(grep github.com ~/.git-credentials | sed 's|https://[^:]*:\([^@]*\)@.*|\1|' | head -1)
fi
```

Full setup (Method 1: git-only PAT/SSH; Method 2: `gh auth login`) lives in `github-auth/SKILL.md`.

## OWNER / REPO derivation (inside a repo)

```bash
OWNER_REPO=$(git remote get-url origin | sed -E 's|.*github\.com[:/]||; s|\.git$||')
OWNER=${OWNER_REPO%/*}; REPO=${OWNER_REPO#*/}
```

## GH_USER (authed user)

```bash
GH_USER=$(gh api user --jq '.login' 2>/dev/null || \
  curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user | \
    python3 -c "import sys,json;print(json.load(sys.stdin)['login'])")
```

## curl call shape

```bash
curl -s -H "Authorization: token $GITHUB_TOKEN" \
     -H "Accept: application/vnd.github.v3+json" \
     https://api.github.com/<endpoint>
```

Write ops: `-X POST|PATCH|PUT|DELETE -d '<json>'`. Uploads (release assets): `https://uploads.github.com/...`. Topics: `Accept: application/vnd.github.mercy-preview+json`.

## Rate limit — check + backoff

```bash
curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/rate_limit
# Response headers on every call:
#   x-ratelimit-remaining, x-ratelimit-reset (unix epoch)
```

Authed limit: 5000 req/h REST, 30/min search. Unauthed: 60/h. On 403 + `X-RateLimit-Remaining: 0` → sleep until reset. On 429 → honor `Retry-After` header.

## Common env / vars

| Var | Source | Used by |
|---|---|---|
| `GITHUB_TOKEN` | env, git-credentials, `gh auth token`, Hermes `.env` | curl fallback |
| `OWNER`, `REPO` | `git remote get-url origin` | all REST paths |
| `GH_USER` | `gh api user` or `/user` | fork/sync ops |
| `HEAD_SHA` | `gh pr view N --json headRefOid` or PR `head.sha` | inline review comments |

## Error handling

| Status | Meaning | Action |
|---|---|---|
| 401 | Bad/expired token | Re-auth: `gh auth refresh` or regenerate PAT |
| 403 + rate-limit hdr | Rate-limited | Sleep until `x-ratelimit-reset` |
| 403 no rate-limit | Scope missing | Regenerate PAT with `repo`, `workflow`, `read:org` |
| 404 | Repo private or not found | Check auth scope; `gh api /repos/O/R` to confirm |
| 422 | Validation | Response body has `errors[].message` |
| 5xx | GitHub outage | Retry with exponential backoff, cap 3 |

## Pagination

REST returns `Link: <...&page=2>; rel="next"` header. Fetch until absent. Or `gh api --paginate <path>`.

## Idempotency notes

- `gh repo fork` returns immediately, but async — sleep 3s before cloning
- `gh secret set` needs no encryption; curl PUT requires `/actions/secrets/public-key` + PyNaCl `SealedBox`
- Auto-merge only via GraphQL `enablePullRequestAutoMerge` (needs `node_id`), not REST
