---
name: songwriting-and-ai-music
description: "Songwriting craft and Suno AI music prompts."
tags: [songwriting, music, suno, parody, lyrics, creative]
platforms: [linux, macos, windows]
triggers:
  - writing a song
  - song lyrics
  - music prompt
  - suno prompt
  - parody song
  - adapting a song
  - AI music generation
license: MIT
---

# Songwriting & AI Music Generation

Ported from Hermes-Agent (Nous Research) 2026-07-08. Guidelines, not rules — art breaks rules on purpose.

## 1. Structure

Skeletons: ABABCB (pop/rock), AABA (jazz/ballad), ABAB, AAA (folk/strophic).
Blocks: Intro, Verse, Pre-Chorus, Chorus, Bridge, Outro. Skip any. Structure serves emotion.

## 2. Rhyme, Meter, Sound

Rhyme types (tight → loose): perfect (lean/mean), family (crate/braid), assonance (had/glass), consonance (scene/when), near/slant. Mix them — all perfect = nursery rhyme, all slant = lazy.
Internal rhyme: rhyme within lines. Meter: stressed syllables matter more than count. Say it aloud; stumbles = fix.

## 3. Emotional Arc

Energy map (rough): Intro 2-3, Verse 5-6, Pre-Chorus 7, Chorus 8-9, Bridge varies, Final Chorus 9-10.
Power move = CONTRAST. Whisper before scream. Sparse before dense. Silence is an instrument.
"Whisper → roar → whisper" works for ballads, epics, anthems.

## 4. Lyrics

Show don't tell (usually): "I was sad" flat; "Your hoodie's still on the hook" alive. Plain statement can be power too.
Hook: line people remember. Usually title. Place where it lands hardest (first/last chorus line).
Prosody: stable feelings → settled melody/perfect rhymes/resolved chords. Unstable → wandering/near-rhymes/unresolved. Verse low, chorus high (flip if it serves).
Avoid: autopilot cliches, Yoda-speak for rhyme, flat dynamics, treating first draft as sacred.

## 5. Parody / Adaptation

Map original first: syllables/line, rhyme scheme, stressed syllables, held-note positions.
Fitting: match stressed syllables to same beats; ±1-2 unstressed OK. Held notes → match VOWEL SOUND ("LOOOVE" → "FOOOD" fits, "LIFE" doesn't). Monosyllabic swaps in key spots preserve rhythm. Sing over original — stumble = revise.
Concept strong enough for whole song. Start from hook, build outward. Brainstorm raw material first, fit best into structure. Keep some originals for recognizability.

## 6. Suno Prompts

Style field formula: Genre + Mood + Era + Instruments + Vocal Style + Production + Dynamics.
Bad: "sad rock song." Good: "Cinematic orchestral spy thriller, 1960s Cold War era, smoky sultry female vocalist, big band jazz, brass with trumpets/french horns, sweeping strings, minor key, vintage analog warmth."
Describe the JOURNEY: "Haunting whisper over sparse piano → layers muted brass → full orchestra chorus → verse 2 raw belting → outro strips to lone piano fading."
V4.5+ Style field: up to 1000 chars. No artist names/trademarks — describe sound. Specify BPM/key when preferred. Use Exclude Styles. Unexpected combos = gold ("bossa nova trap", "chiptune jazz"). Build vocal PERSONA not just gender.

Metatags (in [brackets] inside lyrics):
- Structure: [Intro] [Verse] [Pre-Chorus] [Chorus] [Post-Chorus] [Hook] [Bridge] [Interlude] [Instrumental] [Guitar Solo] [Breakdown] [Build-up] [Outro] [End]
- Vocal: [Whispered] [Spoken Word] [Belted] [Falsetto] [Soulful] [Raspy] [Breathy] [Gritty] [Staccato] [Legato] [Vibrato] [Harmonies] [Choir]
- Dynamics: [High Energy] [Building Energy] [Explosive] [Emotional Climax] [Orchestral swell] [Quiet arrangement] [Slow Down]
- Gender: [Female Vocals] [Male Vocals]
- Atmosphere: [Melancholic] [Euphoric] [Nostalgic] [Aggressive] [Dreamy] [Intimate] [Dark Atmosphere]
- SFX: [Vinyl Crackle] [Rain] [Applause] [Static] [Thunder]
Put tags in BOTH style field AND lyrics. Max 5-8 per section. Don't contradict ([Calm]+[Aggressive]).
Custom Mode for serious work. Lyrics limit ~3000 chars (~40-60 lines). Always add structural tags — without them, flat verse/chorus/no arc.

## 7. Phonetics for AI Singers

AI pronounces, doesn't read. Spell as sounds: "through" → "thru". Proper nouns fail most — test early. Hyphenate for syllables: "Re-search".
Delivery: ALL CAPS = louder. "lo-o-o-ove" = sustained. Ellipses = dramatic pauses. "ne-e-ed" = emotional stretch.
Always: spell numbers ("24/7" → "twenty four seven"), space acronyms ("AI" → "A I"), test unusual words in 30-sec clip first. Pronunciation bakes in — fix in lyrics BEFORE generating.

## 8. Workflow

1. Concept/hook first. 2. If adapting, map original. 3. Brainstorm raw material. 4. Draft into structure. 5. Sing aloud, fix stumbles. 6. Build Suno style description with dynamic journey. 7. Add metatags. 8. Generate 3-5 variations. 9. Pick best, Extend/Continue promising sections. 10. Keep happy accidents.
Expect ~3-5 generations per good result. Style drifts on Extend — restate genre/mood.

## 9. Lessons

Dynamic ARC in style field > genre list. Keeping some original lines = emotional weight in parody. Bridge slot = transform imagery, keep emotional function. Monosyllabic swaps in hooks = cleanest rhythm preservation. Strong vocal persona description > any single metatag. Don't be precious — line breaks meter but hits harder, keep it. Craft serves art, not reverse.
