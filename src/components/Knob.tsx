import { useCallback, useId, useRef } from 'react'

interface KnobProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  display: string
  onChange: (v: number) => void
}

/**
 * Radio-console rotary knob. Accessible: it's a real slider under the hood
 * (keyboard + screen-reader friendly) but rendered as a rotating dial.
 * Drag vertically or use arrow keys; wheel adjusts too.
 */
export function Knob({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: KnobProps) {
  const id = useId()
  const dragging = useRef<{ startY: number; startVal: number } | null>(null)
  const pct = (value - min) / (max - min)
  const angle = -135 + pct * 270 // -135°..+135°

  const clamp = useCallback(
    (v: number) => Math.min(max, Math.max(min, Math.round(v / step) * step)),
    [max, min, step],
  )

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      ;(e.target as Element).setPointerCapture(e.pointerId)
      dragging.current = { startY: e.clientY, startVal: value }
    },
    [value],
  )
  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const d = dragging.current
      if (!d) return
      const dy = d.startY - e.clientY
      const range = max - min
      onChange(clamp(d.startVal + (dy / 150) * range))
    },
    [clamp, max, min, onChange],
  )
  const onPointerUp = useCallback(() => {
    dragging.current = null
  }, [])

  const onKey = useCallback(
    (e: React.KeyboardEvent) => {
      let next = value
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') next = value + step
      else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') next = value - step
      else if (e.key === 'Home') next = min
      else if (e.key === 'End') next = max
      else return
      e.preventDefault()
      onChange(clamp(next))
    },
    [clamp, max, min, step, value, onChange],
  )

  return (
    <div className="knob">
      <div
        className="knob__dial"
        role="slider"
        tabIndex={0}
        aria-labelledby={id}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={display}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onKeyDown={onKey}
        onWheel={(e) => {
          if (Math.abs(e.deltaY) < 1) return
          onChange(clamp(value + (e.deltaY < 0 ? step : -step)))
        }}
      >
        <span className="knob__ring" style={{ ['--pct' as string]: pct }} />
        <span
          className="knob__pointer"
          style={{ transform: `rotate(${angle}deg)` }}
        />
      </div>
      <span className="knob__label" id={id}>
        {label}
      </span>
      <span className="knob__value">{display}</span>
    </div>
  )
}
