---
name: humanizer
description: "Humanize text: strip AI-isms and add real voice."
version: 2.5.1
author: Siqi Chen (@blader, https://github.com/blader/humanizer), ported by Hermes Agent
license: MIT
tags: [writing, editing, humanize, anti-ai-slop, voice, prose]
homepage: https://github.com/blader/humanizer
---

> Ported from Hermes-Agent (Nous Research) 2026-07-08. Original tool refs (`read_file`, `patch`, `write_file`) are Hermes-native — map to your host's equivalents (Read/Edit/Write in Codex).

# Humanizer — remove AI writing patterns

Based on Wikipedia's "Signs of AI writing" (WikiProject AI Cleanup). LLMs pick statistically likely completions → telltale patterns.

## When to load

User asks to "humanize", "de-AI", "de-slop", "un-ChatGPT" text; rewrite so it doesn't sound LLM-authored; edit draft (post/PR/docs/email/resume) to sound natural; match their voice; pre-publish AI-tell review. Also apply to your OWN user-facing prose (release notes, PR bodies, docs).

## Task

1. Scan for 29 patterns below. 2. Rewrite AI-isms. 3. Preserve meaning. 4. Match tone (or provided voice sample). 5. Add soul — don't just remove, inject personality. 6. Final pass: "What still reads AI-generated?" → revise.

## Voice calibration (if sample provided)

Read sample first. Note: sentence length pattern, word-choice level, paragraph openers, punctuation habits, recurring tics, transition style. Match those patterns — don't upgrade "stuff/things" to "elements/components." No sample → default to varied, opinionated voice (Personality below).

## Personality & soul

Sterile writing is as obvious as slop. Signs of soulless: uniform sentence length, no opinions, no uncertainty, no first-person, no humor, reads like press release. Add voice: have opinions, vary rhythm (short. then longer takes-its-time.), acknowledge mixed feelings, use "I" when it fits, let some mess in (tangents, half-formed thoughts), be specific about feelings (not "concerning" — "unsettling about agents churning at 3am while nobody's watching").

## The 29 patterns

**Content:** 1. Undue significance/legacy/broader-trends (testament, pivotal moment, evolving landscape, indelible mark). 2. Undue notability/media coverage (cited in NYT/BBC lists without context). 3. Superficial -ing analyses (highlighting, ensuring, reflecting, contributing to). 4. Promotional/ad language (nestled, vibrant, breathtaking, must-visit, in the heart of). 5. Vague weasel attributions (Experts argue, Industry reports, Some critics). 6. Formulaic "Challenges and Future Prospects" sections.

**Language/grammar:** 7. AI vocabulary (delve, tapestry, testament, underscore, pivotal, showcase, intricate, landscape, vibrant, foster, enhance, garner). 8. Copula avoidance (serves as/stands as/boasts → is/has). 9. Negative parallelism + tailing negation ("Not only...but", "no guessing"). 10. Rule-of-three overuse. 11. Elegant variation / synonym cycling (protagonist→main character→central figure→hero). 12. False ranges ("from X to Y" where X,Y not on a scale). 13. Passive voice + subjectless fragments ("No config needed").

**Style:** 14. Em-dash overuse — rewrite with commas/periods/parens. 15. Boldface overuse. 16. Inline-header vertical lists (`- **Thing:** thing was improved`). 17. Title Case In Headings. 18. Emojis decorating bullets/headings. 19. Curly quotes instead of straight.

**Communication:** 20. Chatbot artifacts ("Great question!", "I hope this helps", "Let me know"). 21. Knowledge-cutoff disclaimers ("as of my last training", "while details are limited"). 22. Sycophantic tone ("You're absolutely right!").

**Filler/hedging:** 23. Filler phrases ("In order to"→"To"; "Due to the fact that"→"Because"; "At this point in time"→"Now"; "has the ability to"→"can"). 24. Excessive hedging ("could potentially possibly might"). 25. Generic positive conclusions ("the future looks bright"). 26. Uniform hyphenation of common pairs (cross-functional, data-driven, high-quality). 27. Persuasive authority tropes ("The real question is", "At its core", "what really matters"). 28. Signposting ("Let's dive in", "Here's what you need to know"). 29. Fragmented headers (heading + one-line restatement before real content).

## Process

Read input (via host's file tool if path given). Identify patterns. Draft rewrite: natural aloud, varied structure, specific over vague, simple copulas where appropriate. Self-audit: "What makes below obviously AI generated?" — answer briefly. Revise. Present final. File input → apply via host's patch/write tool, show diff.

## Output

1. Draft rewrite. 2. AI-tells audit (brief bullets). 3. Final rewrite. 4. Optional change summary.

## Attribution

Ported from [blader/humanizer](https://github.com/blader/humanizer) (MIT), based on [Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) (WikiProject AI Cleanup). Original author: Siqi Chen ([@blader](https://github.com/blader)). Ported through Hermes-Agent (Nous Research) then to this canonical skills bundle 2026-07-08. Original MIT license in `LICENSE`. 29 patterns + personality section preserved from source; the full worked example (AI-slop essay + humanized rewrite) is in the upstream repo for reference.
