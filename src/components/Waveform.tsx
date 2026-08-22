import { useEffect, useRef, useState } from 'react'

const BARS = 48

/**
 * Signature element: neon waveform bars that pulse while speaking.
 * Idle = flat baseline shimmer. Active = animated bars driven by a cheap
 * sinusoid (no audio analysis needed — SpeechSynthesis exposes no stream).
 * Respects prefers-reduced-motion (falls back to a static bar row).
 */
export function Waveform({ active }: { active: boolean }) {
  const [heights, setHeights] = useState<number[]>(() =>
    Array(BARS).fill(0.12),
  )
  const raf = useRef(0)
  const reduce = useRef(false)

  useEffect(() => {
    reduce.current =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  }, [])

  useEffect(() => {
    if (!active || reduce.current) {
      setHeights(Array(BARS).fill(active ? 0.4 : 0.12))
      cancelAnimationFrame(raf.current)
      return
    }
    let t = 0
    const tick = () => {
      t += 0.08
      setHeights(
        Array.from({ length: BARS }, (_, i) => {
          const phase = i * 0.5
          const base =
            Math.abs(Math.sin(t + phase)) * 0.55 +
            Math.abs(Math.sin(t * 1.7 + phase * 0.3)) * 0.3
          const jitter = Math.random() * 0.15
          return Math.min(1, 0.1 + base + jitter)
        }),
      )
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [active])

  return (
    <div
      className={`waveform${active ? ' waveform--active' : ''}`}
      aria-hidden="true"
    >
      {heights.map((h, i) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length bar row
          key={i}
          className="waveform__bar"
          style={{ transform: `scaleY(${h.toFixed(3)})` }}
        />
      ))}
    </div>
  )
}
