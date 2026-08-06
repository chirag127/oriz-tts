import { describe, expect, it } from 'vitest'
import {
  clampPitch,
  clampRate,
  clampVolume,
  DEFAULT_SETTINGS,
  estimateSeconds,
  loadSettings,
  normalizeSettings,
  saveSettings,
  segmentAtOffset,
  segmentText,
  wordCount,
} from '../src/lib/tts'

describe('segmentText', () => {
  it('splits sentences and preserves offsets', () => {
    const text = 'Hello world. How are you? Fine!'
    const segs = segmentText(text)
    expect(segs).toHaveLength(3)
    expect(segs[0].text).toBe('Hello world.')
    expect(text.slice(segs[0].start, segs[0].end)).toBe('Hello world.')
    expect(segs[1].text).toBe('How are you?')
    expect(segs[2].text).toBe('Fine!')
  })

  it('splits on newlines', () => {
    const text = 'Line one\nLine two'
    const segs = segmentText(text)
    expect(segs.map((s) => s.text)).toEqual(['Line one', 'Line two'])
  })

  it('handles trailing text with no terminator', () => {
    const segs = segmentText('no terminator here')
    expect(segs).toHaveLength(1)
    expect(segs[0].text).toBe('no terminator here')
  })

  it('returns empty for whitespace only', () => {
    expect(segmentText('   \n\t ')).toEqual([])
    expect(segmentText('')).toEqual([])
  })

  it('offsets map back exactly through original text', () => {
    const text = '  Padded.   Second one.  '
    const segs = segmentText(text)
    for (const s of segs) {
      expect(text.slice(s.start, s.end)).toBe(s.text)
    }
  })
})

describe('segmentAtOffset', () => {
  const segs = segmentText('One. Two. Three.')
  it('finds containing segment', () => {
    expect(segmentAtOffset(segs, 0)).toBe(0)
    expect(segmentAtOffset(segs, 6)).toBe(1)
  })
  it('lands whitespace offset on next segment', () => {
    // offset 4 is the space between "One." and "Two."
    expect(segmentAtOffset(segs, 4)).toBe(1)
  })
  it('returns -1 past the end', () => {
    expect(segmentAtOffset(segs, 999)).toBe(-1)
  })
})

describe('wordCount', () => {
  it('counts words', () => {
    expect(wordCount('one two three')).toBe(3)
    expect(wordCount('  spaced   out  ')).toBe(2)
    expect(wordCount('')).toBe(0)
    expect(wordCount('   ')).toBe(0)
  })
})

describe('estimateSeconds', () => {
  it('zero for empty', () => {
    expect(estimateSeconds('', 1)).toBe(0)
  })
  it('scales inversely with rate', () => {
    const text = Array(190).fill('word').join(' ') // ~1 min at rate 1
    const slow = estimateSeconds(text, 1)
    const fast = estimateSeconds(text, 2)
    expect(slow).toBeGreaterThan(fast)
    expect(slow).toBeCloseTo(60, 0)
  })
  it('never below 1s for non-empty', () => {
    expect(estimateSeconds('hi', 2)).toBeGreaterThanOrEqual(1)
  })
})

describe('clamps', () => {
  it('rate 0.5..2', () => {
    expect(clampRate(0.1)).toBe(0.5)
    expect(clampRate(9)).toBe(2)
    expect(clampRate(Number.NaN)).toBe(0.5)
  })
  it('pitch 0..2', () => {
    expect(clampPitch(-1)).toBe(0)
    expect(clampPitch(5)).toBe(2)
  })
  it('volume 0..1', () => {
    expect(clampVolume(-1)).toBe(0)
    expect(clampVolume(5)).toBe(1)
  })
})

describe('settings', () => {
  it('normalizes garbage to defaults', () => {
    expect(normalizeSettings(null)).toEqual(DEFAULT_SETTINGS)
    expect(normalizeSettings({ rate: 99, pitch: -3, volume: 8, voiceURI: 5 })).toEqual({
      voiceURI: null,
      rate: 2,
      pitch: 0,
      volume: 1,
    })
  })

  it('round-trips through a fake Storage', () => {
    const map = new Map<string, string>()
    const store = {
      getItem: (k: string) => map.get(k) ?? null,
      setItem: (k: string, v: string) => void map.set(k, v),
      removeItem: (k: string) => void map.delete(k),
      clear: () => map.clear(),
      key: () => null,
      length: 0,
    } as unknown as Storage

    const s = { voiceURI: 'en-US', rate: 1.5, pitch: 0.8, volume: 0.9 }
    saveSettings(s, store)
    expect(loadSettings(store)).toEqual(s)
  })

  it('load returns defaults on empty store', () => {
    const map = new Map<string, string>()
    const store = {
      getItem: (k: string) => map.get(k) ?? null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      key: () => null,
      length: 0,
    } as unknown as Storage
    expect(loadSettings(store)).toEqual(DEFAULT_SETTINGS)
  })
})
