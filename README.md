# oriz-tts

Live: **https://tts.oriz.in**

Text-to-speech in your browser. Paste text, pick a voice, dial in rate/pitch/volume, and hear it read aloud — with each sentence highlighting as it's spoken and a neon waveform pulsing in time.

**100% client-side, no upload, no signup.** Runs entirely on the native `window.speechSynthesis` API using the voices already installed on your device. No text ever leaves the browser; no account, no key, no server.

## Features

- Native Web Speech synthesis — every system voice/language, zero downloads
- Voice, rate, pitch, volume controls (radio-console knobs), persisted to `localStorage`
- Highlight-as-spoken sentence tracking
- Animated waveform synced to playback (respects `prefers-reduced-motion`)
- Drag-drop or load a `.txt`/`.md` file
- Word/char count + spoken-duration estimate
- Optional AI rewrite (natural speech / reading level) via `@chirag127/oz-ai` (g4f multi-provider failover, no key) — degrades gracefully; core TTS always works
- Pause / resume / stop transport

> MP3 export is intentionally omitted: the browser SpeechSynthesis API exposes no audio stream, so reliable client-side audio capture isn't possible without a server. This tool stays 100% local instead.

## Stack

Astro (static) + React 19 islands + Tailwind v4. Shared atomic `@chirag127/*` packages (`oz-tokens-base`, `oz-chrome`, `oz-file`, `oz-ai`) for mechanism; bespoke "sound console" theme (deep indigo + neon cyan) for this site's identity.

## Develop

```bash
npm install --legacy-peer-deps
npm run dev      # local dev
npm test         # vitest — pure logic (segmentation, settings, estimates)
npm run build    # static build → dist/
npm run deploy   # build + wrangler pages deploy
```

## License

MIT © 2026 Chirag Singhal
