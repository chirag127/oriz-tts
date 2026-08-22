---
name: design-md
description: Author, lint, diff, and export Google's DESIGN.md token spec files. Use when user asks for a DESIGN.md, design tokens, a design-system spec, WCAG contrast validation on a palette, or wants to port a style guide into an agent-consumable format.
license: MIT
---

# design-md — Google DESIGN.md spec authoring

Ported from Hermes-Agent (Nous Research) 2026-07-08.

DESIGN.md is Google's open spec (Apache-2.0, `google-labs-code/design.md`) describing a visual identity for coding agents. YAML front matter = machine-readable tokens; Markdown body = rationale in canonical sections. CLI (`npx @google/design.md`) lints structure + WCAG contrast, diffs versions, exports to Tailwind or W3C DTCG JSON.

## When to use

- DESIGN.md, design tokens, or design-system spec requested
- Consistent UI/brand across projects; lint/diff/export/extend existing DESIGN.md
- WCAG accessibility validation on a palette
- Port style guide to agent-consumable format

For visual inspiration → `popular-web-designs`. For one-off HTML artifact taste → `Codex-design`. This skill is the *formal spec file*.

## Token types

| Type | Format | Example |
|---|---|---|
| Color | quoted hex (sRGB) | `"#1A1C1E"` |
| Dimension | number + unit | `48px`, `-0.02em` |
| Token ref | `{path.to.token}` | `{colors.primary}` |
| Typography | object: `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`, `fontFeature`, `fontVariation` | — |

Component prop whitelist: `backgroundColor`, `textColor`, `typography`, `rounded`, `padding`, `size`, `height`, `width`. Variants = **sibling entries** (`button-primary-hover`), never nested.

## Canonical section order (enforced)

1. Overview (alias: Brand & Style)  2. Colors  3. Typography  4. Layout (alias: Layout & Spacing)  5. Elevation & Depth  6. Shapes  7. Components  8. Do's and Don'ts

Present sections MUST follow order. Duplicate headings reject file. Unknown sections preserved; unknown tokens accepted if value type valid; unknown component props → warning. See `templates/starter.md` for skeleton.

## Authoring workflow

1. Ask/infer brand tone, accent color, typography direction.
2. Write `DESIGN.md` at project root. Always include `name:` + `colors:`.
3. Use token refs (`{colors.primary}`) in `components:`, not raw hex.
4. Lint. Fix broken refs + WCAG failures before returning.
5. Existing project → also write `tailwind.theme.json` or `tokens.json` alongside.

## Lint / diff / export

```bash
npx -y @google/design.md lint DESIGN.md                              # structure + refs + WCAG
npx -y @google/design.md diff DESIGN.md DESIGN-v2.md                 # exit 1 on regression
npx -y @google/design.md export --format tailwind DESIGN.md > tailwind.theme.json
npx -y @google/design.md export --format dtcg DESIGN.md > tokens.json
npx -y @google/design.md spec --rules-only --format json             # inject spec into prompt
```

All commands accept `-` for stdin. `--format json` for structured findings.

### Lint rules (7)

- `broken-ref` (error) — `{colors.missing}` → non-existent token
- `duplicate-section` (error) — same `## Heading` twice
- `invalid-color` / `invalid-dimension` / `invalid-typography` (error)
- `wcag-contrast` (warn/info) — `textColor` vs `backgroundColor` against AA 4.5:1, AAA 7:1
- `unknown-component-property` (warn) — outside whitelist

Call WCAG findings out explicitly when accessibility matters — most load-bearing CLI reason.

## Pitfalls

- **Don't nest variants.** `button-primary.hover` wrong; `button-primary-hover` sibling right.
- **Quote hex.** Unquoted `#` breaks YAML.
- **Quote negative dimensions.** `letterSpacing: "-0.02em"`.
- **Section order enforced.** Reorder user's prose before saving.
- **`version: alpha`** current spec (Apr 2026). Watch for breaking changes.
- **Refs by dotted path.** `{colors.primary}` works; `{primary}` doesn't.

## Source

Repo: https://github.com/google-labs-code/design.md (Apache-2.0). CLI: `@google/design.md` on npm.
