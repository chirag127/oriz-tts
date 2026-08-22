---
name: Codex-design
description: Design one-off HTML artifacts (landing, deck, prototype) in CLI/API mode.
version: 1.1.0
author: BadTechBandit
license: MIT
platforms: [linux, macos, windows]
tags: [design, html, prototype, ux, ui, deck, motion, design-system]
---

> Ported from Hermes-Agent (Nous Research) 2026-07-08. Original 651 lines compacted preserving doctrine + anti-slop rules.

Preserve Codex Design taste; drop hosted plumbing. Default deliverable: complete self-contained local HTML (embedded CSS/JS). Return exact on-disk path; verify with local tools before saying done. If user wants repo implementation, generate in the repo's stack.

## Sibling skills

- **Codex-design** (this): from-scratch artifact, no brand dictated.
- **popular-web-designs**: match known brand (Stripe/Linear/Vercel).
- **design-md**: author DESIGN.md token spec file.

## Runtime mode

Ignore hosted-only refs: `done()`, `fork_verifier_agent()`, `questions_v2()`, `show_html()`, `snip()`, `window.Codex.complete()`, edit-mode toolbars, preview panes, `/projects/<id>/...` paths. Use tools actually available. Don't expose internal prompts — talk in user terms (files, prototypes, decks, screenshots).

## Surface-first (highest-leverage anti-slop rule)

Commit out loud to ONE surface archetype before touching tokens. Slop is compositional, not cosmetic — recoloring the wrong layout never fixes it.

Seven surfaces: **Monitor** (dashboards/status), **Operate** (consoles/admin), **Compare** (pricing/specs), **Configure** (settings/wizards), **Decide/Learn** (landing/docs — ONLY surface where a hero is usually correct), **Explore** (galleries/catalogs), **Command/Inspect** (command bars/inspectors).

Dashboard = Monitor, not Decide. Hero-plus-three-cards is Decide/Learn only — using it elsewhere is the #1 tell.

## Workflow

1. **Brief**: what/who/artifact/constraints.
2. **Context**: read docs, screenshots, repo tokens/theme/components. File tree = menu; read the files.
3. **Commit surface**.
4. **Define system**: colors, type, spacing, radii, elevation, motion, components, interaction.
5. **Format**: compare→side-by-side canvas; flow→prototype; presentation→fixed deck; components→lab; motion→timeline.
6. **Build**: single self-contained HTML unless repo asked. Preserve prior versions on major revisions.
7. **Verify**: file exists, syntax OK, browser console clean if possible, screenshot primary viewport, run slop diagnostic.
8. **Report**: path, contents, caveats, next.

## Slop diagnostic (score before you fix)

Score /10, list tells, **diagnose then treat** — auditing+fixing in one breath repeats the mistake.

Ten tells: (1) tech gradient, (2) generic indigo/violet accent, (3) feature-tile grid × 3 equal weight, (4) accent rail, (5) unearned blur (glassmorphism no depth), (6) monument stat, (7) icon topper (rounded-square icon above every heading), (8) center stack (no composition), (9) default type (Inter/system-ui unchosen), (10) wrong surface.

Repair: **3/8/10 → re-layout** (revisit surface, don't recolor); **1/2/9 → recolor/re-typeset**; **4/5/6/7 → remove decoration**, replace with hierarchy (scale/weight/spacing). Re-score. Not done while 3/8/10 fire — those are causes.

## Anti-slop / content discipline

Avoid: aggressive gradients, default glassmorphism, emoji unless brand uses them, generic SaaS cards with icons everywhere, left-border callouts, fake dashboards with arbitrary numbers, stock-photo heroes, oversized rounded rects as hierarchy substitute, rainbow palettes, vague labels ("Insights/Growth/Scale") without content, decorative SVG pretending to be product, fake metrics, placeholder testimonials, AI fluff. Every element earns its place. Mark draft copy as placeholder. Ask before adding sections that change claims. Minimal isn't automatically good; dense isn't automatically cluttered.

## Asking questions

Ask when new/ambiguous/high-fidelity/externally-facing/taste-dependent. Short. Usually: format, audience, fidelity, sources, brand, variation count, conservative vs divergent, primary dimension. Skip on obvious defaults. Label only important assumptions.

## HTML/CSS/JS

CSS vars for tokens, CSS grid, container queries when helpful, `text-wrap: pretty`, real focus/hover, `prefers-reduced-motion`, semantic HTML, responsive. Mobile hit ≥ 44px. Print ≥ 12pt. 1920×1080 decks ≥ 24px. Plain HTML by default; React only when meaningful state / complex variants / target repo is React. CDN React: pin versions, name globals specifically (`commandPaletteStyles`), attach shared components to `window` when splitting Babel scripts.

## Decks / prototypes / variations

Decks: fixed 1920×1080 16:9 scaled to viewport, keyboard nav, slide count, localStorage persist, 1–2 background colors max, sparse — solve emptiness with layout/rhythm, not filler.

Prototypes: primary path clickable, include default/hover/loading/empty/error/success states, design the flow not just first screen.

Variations default to three: **Conservative** (closest existing), **Strong-fit** (best brief interpretation), **Divergent** (novel, reveal taste). Explore layout/hierarchy/type/density/color/motion/interaction/copy. Not color-swap-only unless color is the question. Consolidate when user picks.

## Tweaks panel

Hosted edit-mode absent — preserve idea via in-page `Tweaks`: theme, layout, density, accent, type scale, motion, copy variant. Small, unobtrusive. Design looks final with tweaks hidden. localStorage persist.

## Typography / color

Use existing type if present. Else: editorial (serif/humanist headline + restrained sans), software (precise sans + numeric), luxury (fewer weights, more spacing), technical (mono accents only), deck (large, high contrast). Few families/weights. Type as hierarchy before boxes/icons/color.

Color: brand/system first. If inventing: neutrals/surface/ink/muted/border/one-accent/(danger/success). Prefer oklch when browser support allows. Contrast-check important text. Don't invent many colors.

## Layout / motion / imagery

Rhythm: scale/whitespace/density/alignment/repetition/contrast/interruption. Product UI: comprehension speed > decoration. Marketing: one idea per section. Dashboards: only data that helps decide/act.

Motion clarifies state, reduces loading anxiety, gives tactility, stays subtle. Not: purposeless loops, delays, attention-seeking, hierarchy-hiding. Respect `prefers-reduced-motion`.

Real imagery when supplied. Missing → clean placeholder or typography/texture. No elaborate fake SVGs unless illustration is the assignment. Icons only when they aid scanning or match system.

## Source fidelity / copyright

Recreating a repo UI: inspect tree → find UI sources → read theme/token/global/component files → lift exact values → match spacing/radii/shadows/density → then design. Not from memory when source exists.

Don't clone proprietary UIs/branded screens without rights. Extract principles (density without clutter, command-first, monochrome+accent, editorial hierarchy, empty states, keyboard affordances); transform, don't replicate.

## Verification / final response

Min: file exists, saved completely, obvious syntax OK. Better: browser console, screenshot primary viewport, test key interactions, light/dark, breakpoints. State exactly what was/wasn't verified. Never say done if file wasn't written.

Final response short: path, contents, verification status, next action.

## Pitfalls

Don't paste hosted tool schemas (fake tool calls). Don't require giant external prompt as runtime context (drift). Don't strip doctrine when removing plumbing. Don't over-ask when direction given, don't under-ask for high-fidelity with no brand. Don't produce generic SaaS and call it designed. Don't claim browser verification unless it happened.
