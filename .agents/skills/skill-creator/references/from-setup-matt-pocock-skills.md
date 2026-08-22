> Folded from skill `setup-matt-pocock-skills` on 2026-07-08 during skill-compact merge.

---
name: setup-matt-pocock-skills
description: Configure this repo for the engineering skills — set up its issue tracker, triage label vocabulary, and domain doc layout. Run once before first use of the other engineering skills.
disable-model-invocation: true
---

# Setup Matt Pocock's Skills

Adapted for oriz workspace 2026-07-08. `docs/agents/*.md` outputs are per-repo config, not durable knowledge — durable decisions still land in `knowledge/` per [`knowledge-everything-caveman`](../../../../knowledge/rules/agent/knowledge-everything-caveman.md).

Scaffold per-repo config engineering skills assume:

- **Issue tracker** — where issues live (GitHub default; local markdown also supported)
- **Triage labels** — strings for five canonical triage roles
- **Domain docs** — where `CONTEXT.md` and ADRs live, and consumer rules

Prompt-driven, not deterministic. Explore, present, confirm, write.

## Process

### 1. Explore

Read current repo state. Don't assume:

- `git remote -v` and `.git/config` — GitHub repo? Which one?
- `AGENTS.md` and `CLAUDE.md` at repo root — either exist? `## Agent skills` section already?
- `knowledge/` at repo root — workspace-style OKF bundle present?
- `docs/adr/` and any `src/*/docs/adr/` directories
- `docs/agents/` — prior output already exists?
- `.scratch/` — local-markdown convention already in use?

### 2. Present findings and ask

Summarise present/missing. Walk user through three decisions **one at a time** — present section, get answer, next.

Assume user does not know terms. Each section: short explainer (what, why, what changes if picked differently). Show choices + default.

**Section A — Issue tracker.**

> Explainer: Where issues live. Skills `to-issues`, `triage`, `to-prd`, `qa` read/write here — need to know whether to call `gh issue create` or write markdown under `.scratch/`. Pick where you actually track work.

Default posture:

| Situation | Pick |
|---|---|
| `git remote` points at GitHub | GitHub Issues (via `gh` CLI) |
| Solo project / no remote | Local markdown under `.scratch/<feature>/` |

If user picked **GitHub**, ask one follow-up:

> Explainer: OSS repos often get feature requests as PRs — PR is an issue with code. Turn on = `/triage` pulls external PRs into same queue with same labels (collaborators' in-flight PRs untouched). Off if PRs aren't a request surface.

- **PRs as a request surface** — yes / no (default: no). Record in `docs/agents/issue-tracker.md`.

**Section B — Triage label vocabulary.**

> Explainer: `triage` skill moves issues through a state machine via labels. Labels must match strings you've configured. If repo uses different names (e.g. `bug:triage` vs `needs-triage`), map here so skill applies right ones.

Five canonical roles:

- `needs-triage` — maintainer needs to evaluate
- `needs-info` — waiting on reporter
- `ready-for-agent` — fully specified, AFK-ready (agent picks up with no human context)
- `ready-for-human` — needs human implementation
- `wontfix` — will not be actioned

Default: each role's string equals its name. Ask if user wants to override. If tracker has no existing labels, defaults fine.

**Section C — Domain docs.**

> Explainer: Skills (`improve-codebase-architecture`, `diagnosing-bugs`, `tdd`) read domain language + past ADRs. Workspace canon: durable facts land in `knowledge/` as OKF files (see [`knowledge-everything-caveman`](../../../../knowledge/rules/agent/knowledge-everything-caveman.md)).

Confirm layout:

- **Workspace OKF bundle** (default for own repos) — point skills at `knowledge/` per [OKF spec](../../../../knowledge/_okf.md).
- **`docs/adr/` at repo root** — for forks or upstream-compat repos that expect this layout.

### 3. Confirm and edit

Show user draft of:

- `## Agent skills` block to add to `AGENTS.md` / `CLAUDE.md` (see step 4)
- Contents of `docs/agents/issue-tracker.md`, `docs/agents/triage-labels.md`, `docs/agents/domain.md`

Let them edit before writing.

### 4. Write

**Pick the file to edit:**

- If `AGENTS.md` exists, edit it (workspace canon per [`agents-md-three-place-update`](../../../../knowledge/rules/agent/agents-md-three-place-update.md)).
- `CLAUDE.md` is thin per-agent overlay — edit only if `AGENTS.md` absent.
- If neither exists, ask user which to create — don't pick.

If an `## Agent skills` block already exists in chosen file, update in-place rather than append duplicate. Don't overwrite user edits to surrounding sections.

The block:

```markdown
## Agent skills

### Issue tracker

[one-line summary of where issues are tracked, plus whether external PRs are a triage surface]. See `docs/agents/issue-tracker.md`.

### Triage labels

[one-line summary of the label vocabulary]. See `docs/agents/triage-labels.md`.

### Domain docs

[one-line summary of layout — "workspace OKF bundle" or "docs/adr/"]. See `docs/agents/domain.md`.
```

Then write three docs files using seed templates in this skill folder (see `from-setup-matt-pocock-skills-refs/`):

- `issue-tracker-github.md` — GitHub issue tracker
- `issue-tracker-local.md` — local-markdown issue tracker
- `issue-tracker-gitlab.md` — GitLab issue tracker
- `triage-labels.md` — label mapping
- `domain.md` — domain doc consumer rules + layout

### 5. Done

Tell user setup is complete and which engineering skills will read these files. Mention they can edit `docs/agents/*.md` directly later — re-run only if switching issue trackers or restarting from scratch.
