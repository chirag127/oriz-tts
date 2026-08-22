---
name: popular-web-designs
description: 54 real design systems (Stripe, Linear, Vercel, Apple, etc.) as ready-to-use HTML/CSS templates with palette, typography, components, spacing, shadows, and CDN font substitutes. Load when user asks to style a page after a known brand.
version: 1.0.0
author: Hermes Agent + Teknium (design systems sourced from VoltAgent/awesome-design-md)
license: MIT
tags: [design, css, html, ui, web-development, design-systems, templates]
platforms: [linux, macos, windows]
triggers:
  - build a page that looks like
  - make it look like stripe
  - design like linear
  - vercel style
  - create a UI
  - web design
  - landing page
  - dashboard design
  - website styled like
---

# Popular Web Designs

> Ported from Hermes-Agent (Nous Research) 2026-07-08.

54 real-world design systems for HTML/CSS generation. Each template = color palette, typography hierarchy, component styles, spacing, shadows, responsive rules, CDN font substitute, exact CSS values.

## Related skills

- `Codex-design` — design *process* (scoping, variants, verifying). Pair when brand-styled: drives workflow, this supplies vocabulary.
- `design-md` — deliverable is a formal DESIGN.md token spec, not rendered artifact.

## Usage

1. Pick a template from catalog below.
2. Read `templates/<site>.md` — has full spec + a Hermes Implementation Notes block (CDN font, Google Fonts `<link>`, font-family stacks).
3. Apply tokens as CSS custom properties on `:root`; apply typography, components, layout, shadows per template sections.
4. Write HTML file, verify visually.

Note: Hermes-only tool refs in templates (`skill_view`, `write_file`, `browser_vision`, `generative-widgets`, cloudflared tunnel) — treat as guidance. Substitute your runtime's file-write + browser-verify equivalents.

## Font substitution (proprietary → CDN)

Most sites use proprietary fonts. Templates map to Google Fonts substitutes preserving character:

| Proprietary | CDN Substitute |
|---|---|
| Geist / Geist Mono | Geist / Geist Mono (Google Fonts) |
| sohne-var (Stripe) | Source Sans 3 |
| Berkeley Mono | JetBrains Mono |
| Airbnb Cereal / Circular / Pin Sans / CoinbaseSans / UberMove | DM Sans |
| figmaSans / HashiCorp Sans / NVIDIA-EMEA | Inter |
| waldenburgNormal (Sanity) | Space Grotesk |
| IBM Plex / Rubik | Available direct on Google Fonts |

When substituting, follow template weight, size, letter-spacing exactly — those carry more identity than font face.

## Catalog

**AI & ML:** `Codex` `cohere` `elevenlabs` `minimax` `mistral.ai` `ollama` `opencode.ai` `replicate` `runwayml` `together.ai` `voltagent` `x.ai`

**Dev tools:** `cursor` `expo` `linear.app` `lovable` `mintlify` `posthog` `raycast` `resend` `sentry` `supabase` `superhuman` `vercel` `warp` `zapier`

**Infra & cloud:** `clickhouse` `composio` `hashicorp` `mongodb` `sanity` `stripe`

**Design & productivity:** `airtable` `cal` `clay` `figma` `framer` `intercom` `miro` `notion` `pinterest` `webflow`

**Fintech:** `coinbase` `kraken` `revolut` `wise`

**Enterprise & consumer:** `airbnb` `apple` `bmw` `ibm` `nvidia` `spacex` `spotify` `uber`

## Choosing by intent

- **Dev tools / dashboards:** Linear, Vercel, Supabase, Raycast, Sentry
- **Docs / content:** Mintlify, Notion, Sanity, MongoDB
- **Marketing / landing:** Stripe, Framer, Apple, SpaceX
- **Dark UIs:** Linear, Cursor, ElevenLabs, Warp, Superhuman
- **Light / clean:** Vercel, Stripe, Notion, Cal.com, Replicate
- **Playful:** PostHog, Figma, Lovable, Zapier, Miro
- **Premium:** Apple, BMW, Stripe, Superhuman, Revolut
- **Data-dense:** Sentry, Kraken, Cohere, ClickHouse
- **Monospace / terminal:** Ollama, OpenCode, x.ai, VoltAgent
