/**
 * Pure text/segment logic for TTS highlighting. No DOM, no SpeechSynthesis.
 * Unit-tested in tests/tts.test.ts.
 */

export interface Segment {
  /** text of this segment (a sentence-ish chunk) */
  text: string
  /** start char offset in the ORIGINAL full text */
  start: number
  /** end char offset (exclusive) in the original full text */
  end: number
}

/**
 * Split text into speakable segments (sentence-ish) preserving original
 * offsets so the UI can highlight the segment currently being spoken.
 * Splits on sentence terminators (. ! ? …) and hard newlines. Whitespace-only
 * input → no segments.
 */
export function segmentText(text: string): Segment[] {
  const segments: Segment[] = []
  const re = /[^.!?…\n]*(?:[.!?…]+|\n+|$)/g
  let m: RegExpExecArray | null
  // biome-ignore lint/suspicious/noAssignInExpressions: canonical regex exec loop
  while ((m = re.exec(text)) !== null) {
    const raw = m[0]
    if (m.index === re.lastIndex) re.lastIndex++ // guard against zero-width
    if (raw.trim().length === 0) continue
    const leading = raw.length - raw.trimStart().length
    const trailingWs = raw.length - raw.trimEnd().length
    const start = m.index + leading
    const end = m.index + raw.length - trailingWs
    if (end > start) segments.push({ text: text.slice(start, end), start, end })
  }
  return segments
}

/** Find the segment index whose range contains a char offset. -1 if none. */
export function segmentAtOffset(segments: Segment[], offset: number): number {
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i]
    if (offset >= s.start && offset < s.end) return i
  }
  // offset may land in inter-segment whitespace — pick the next segment
  for (let i = 0; i < segments.length; i++) {
    if (segments[i].start >= offset) return i
  }
  return -1
}

/** Word count of a string (Unicode-friendly, collapses whitespace). */
export function wordCount(text: string): number {
  const t = text.trim()
  if (!t) return 0
  return t.split(/\s+/).length
}

/**
 * Estimate spoken duration in seconds.
 * ~190 wpm baseline scaled by rate (0.5–2). Never below 1s for non-empty text.
 */
export function estimateSeconds(text: string, rate: number): number {
  const words = wordCount(text)
  if (words === 0) return 0
  const r = clampRate(rate)
  const secs = (words / 190) * 60 / r
  return Math.max(1, Math.round(secs))
}

export function clampRate(rate: number): number {
  return clamp(rate, 0.5, 2)
}
export function clampPitch(pitch: number): number {
  return clamp(pitch, 0, 2)
}
export function clampVolume(volume: number): number {
  return clamp(volume, 0, 1)
}

function clamp(n: number, lo: number, hi: number): number {
  if (Number.isNaN(n)) return lo
  return Math.min(hi, Math.max(lo, n))
}

export interface TtsSettings {
  voiceURI: string | null
  rate: number
  pitch: number
  volume: number
}

export const DEFAULT_SETTINGS: TtsSettings = {
  voiceURI: null,
  rate: 1,
  pitch: 1,
  volume: 1,
}

const SETTINGS_KEY = 'oriz-tts:settings'

/** Coerce arbitrary parsed JSON into a valid, clamped settings object. */
export function normalizeSettings(raw: unknown): TtsSettings {
  const o = (raw ?? {}) as Record<string, unknown>
  return {
    voiceURI: typeof o.voiceURI === 'string' ? o.voiceURI : null,
    rate: clampRate(typeof o.rate === 'number' ? o.rate : 1),
    pitch: clampPitch(typeof o.pitch === 'number' ? o.pitch : 1),
    volume: clampVolume(typeof o.volume === 'number' ? o.volume : 1),
  }
}

export function loadSettings(store?: Storage): TtsSettings {
  const s = store ?? (typeof localStorage !== 'undefined' ? localStorage : undefined)
  if (!s) return { ...DEFAULT_SETTINGS }
  try {
    const raw = s.getItem(SETTINGS_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    return normalizeSettings(JSON.parse(raw))
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings: TtsSettings, store?: Storage): void {
  const s = store ?? (typeof localStorage !== 'undefined' ? localStorage : undefined)
  if (!s) return
  try {
    s.setItem(SETTINGS_KEY, JSON.stringify(normalizeSettings(settings)))
  } catch {
    // storage full / disabled — non-fatal
  }
}
