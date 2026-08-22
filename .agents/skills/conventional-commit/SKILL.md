---
name: conventional-commit
description: Generate Conventional Commits-compliant commit messages from git diff or change description. Use when user says "write commit message", "commit these changes", "conventional commit for X". Enforces imperative mood, lowercase, no period; adds scope in parens; flags BREAKING CHANGE with ! or footer.
license: MIT
---

# conventional-commit — Conventional commit message generator

## Trigger

Fire when the user says: "write commit message", "commit for these changes", "conventional commit". Or invoke explicitly via `/conventional-commit`.

## Process

1. Read git diff (`git diff --staged` if staged, else `git diff HEAD`) or the change description user provided.
2. Classify change:

| Type       | When                      |
| ---------- | ------------------------- |
| `feat`     | new user-visible behavior |
| `fix`      | bug fix                   |
| `docs`     | docs only                 |
| `refactor` | no behavior change        |
| `test`     | tests added/updated       |
| `chore`    | tooling / deps / non-src  |
| `ci`       | CI config                 |
| `perf`     | perf improvement          |
| `build`    | build system              |
| `style`    | formatting only           |

3. Pick scope from touched paths (single top-level dir name, or omit if cross-cutting).
4. Write imperative-mood description ≤72 chars, lowercase, no trailing period.
5. Body only if the "why" isn't obvious from the description. Explain what+why, not how.
6. `BREAKING CHANGE:` footer OR `!` after type when API changes.
7. Emit raw text — no markdown fences.

## Output shape

```
feat(auth): add passkey login flow

Adds WebAuthn ceremony to /login. Fallbacks to password if
platform authenticator absent.

Refs: #4211
```

## Anti-patterns

- ❌ Sentence case description
- ❌ Period at end
- ❌ Past tense ("added X")
- ❌ Explaining the diff line-by-line in the body
- ❌ Multiple types crammed into one commit — split into multiple commits instead

## Provenance

- **Source:** prompts.chat: Conventional Commit Message Generator, harvested 2026-07-03
- **Repository:** [f/awesome-chatgpt-prompts](https://github.com/f/awesome-chatgpt-prompts)
- **License:** CC0 1.0 (prompts.chat)

## See Also

Related git workflows folded into this skill's `references/`:

- **git-guardrails-Codex** ([references/from-git-guardrails-Codex.md](references/from-git-guardrails-Codex.md)) — Set up Codex hooks to block dangerous git commands (reset --hard, clean, branch -D). Triggers: "prevent destructive git operations", "add git safety hooks", "block git reset/clean in Codex".
- **finishing-a-development-branch** ([references/from-finishing-a-development-branch.md](references/from-finishing-a-development-branch.md)) — Guide completion of development work by presenting structured options for merge, PR, or cleanup. Triggers: implementation complete, all tests pass, need to integrate work.
