# File structure — decomposition depth

Reference for [`plan/SKILL.md`](./SKILL.md). Load when planning a task with 5+ files or non-obvious decomposition.

## Principles

Design units with clear boundaries and well-defined interfaces. Each file: **one clear responsibility.**

You reason best about code you can hold in context at once, and edits are more reliable when files are focused. Prefer smaller, focused files over large ones that do too much.

**Files that change together should live together.** Split by responsibility, not by technical layer.

In existing codebases, follow established patterns. If the codebase uses large files, don't unilaterally restructure — but if a file you're modifying has grown unwieldy, a split is reasonable.

## Deep modules (Ousterhout)

Per [[deep-modules-over-shallow]]: **narrow interface, thick implementation.**

- Interface = the API a caller sees (function signatures, method names, parameter types)
- Implementation = the code that fulfills the interface

Deep module: interface has few methods, each does substantial work. Shallow module: interface has many methods, each does trivial work.

Prefer deep. The interface is where complexity leaks; make it small.

## When to split

- File exceeds ~500 lines and has clear internal seams
- Two responsibilities that don't share state
- One part is stable, another churns
- Testing needs to mock/stub one part

## When NOT to split

- Under 200 lines
- Sub-parts genuinely share state
- Splitting makes callers navigate 3 files for 1 concept
- Codebase convention is single-file-per-feature

## In the plan

The file structure block goes in the plan header, before Task 1:

```markdown
## File Structure

- `src/auth/session.ts` — session lifecycle: create, refresh, revoke
- `src/auth/token.ts` — JWT sign/verify (isolated from session state)
- `src/auth/index.ts` — public API surface
- `tests/auth/session.test.ts`
- `tests/auth/token.test.ts`
```

Then each Task references files from this map.
