import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  clampPitch,
  clampRate,
  clampVolume,
  DEFAULT_SETTINGS,
  estimateSeconds,
  loadSettings,
  saveSettings,
  segmentAtOffset,
  type Segment,
  segmentText,
  type TtsSettings,
  wordCount,
} from '../lib/tts'
import { Waveform } from './Waveform'
import { Knob } from './Knob'

type Status = 'idle' | 'speaking' | 'paused'

const SAMPLE =
  'Welcome to the oriz sound console. Paste any text, pick a voice, then dial in the rate and pitch. The words light up as they are spoken, and the waveform pulses in time. Everything runs in your browser — nothing is ever uploaded.'

export default function TtsStudio() {
  const supported =
    typeof window !== 'undefined' && 'speechSynthesis' in window

  const [text, setText] = useState('')
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [settings, setSettings] = useState<TtsSettings>(DEFAULT_SETTINGS)
  const [status, setStatus] = useState<Status>('idle')
  const [activeSeg, setActiveSeg] = useState(-1)
  const [error, setError] = useState('')
  const [aiState, setAiState] = useState<'idle' | 'thinking' | 'error'>('idle')
  const [aiLevel, setAiLevel] = useState('natural speech')

  const segments = useMemo<Segment[]>(() => segmentText(text), [text])
  const segRef = useRef<Segment[]>(segments)
  segRef.current = segments
  const settingsRef = useRef(settings)
  settingsRef.current = settings
  const queueIdx = useRef(0)

  // load voices (async on some browsers) + saved settings
  useEffect(() => {
    if (!supported) return
    setSettings(loadSettings())
    const load = () => setVoices(window.speechSynthesis.getVoices())
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', load)
      window.speechSynthesis.cancel()
    }
  }, [supported])

  const selectedVoice = useMemo(
    () => voices.find((v) => v.voiceURI === settings.voiceURI) ?? null,
    [voices, settings.voiceURI],
  )

  const persist = useCallback((next: TtsSettings) => {
    setSettings(next)
    saveSettings(next)
  }, [])

  const stop = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.cancel()
    setStatus('idle')
    setActiveSeg(-1)
    queueIdx.current = 0
  }, [supported])

  const speakFrom = useCallback(
    (startIndex: number) => {
      if (!supported) return
      const segs = segRef.current
      if (segs.length === 0) return
      window.speechSynthesis.cancel()
      setError('')
      queueIdx.current = startIndex
      const s = settingsRef.current
      const voice =
        voices.find((v) => v.voiceURI === s.voiceURI) ?? null

      const speakNext = () => {
        const i = queueIdx.current
        if (i >= segs.length) {
          setStatus('idle')
          setActiveSeg(-1)
          return
        }
        const u = new SpeechSynthesisUtterance(segs[i].text)
        if (voice) u.voice = voice
        u.rate = clampRate(s.rate)
        u.pitch = clampPitch(s.pitch)
        u.volume = clampVolume(s.volume)
        u.onstart = () => setActiveSeg(i)
        u.onend = () => {
          queueIdx.current += 1
          speakNext()
        }
        u.onerror = (e) => {
          if (e.error === 'interrupted' || e.error === 'canceled') return
          setError(`Speech error: ${e.error}`)
          setStatus('idle')
          setActiveSeg(-1)
        }
        window.speechSynthesis.speak(u)
      }
      setStatus('speaking')
      speakNext()
    },
    [supported, voices],
  )

  const play = useCallback(() => {
    if (status === 'paused') {
      window.speechSynthesis.resume()
      setStatus('speaking')
      return
    }
    speakFrom(0)
  }, [status, speakFrom])

  const pause = useCallback(() => {
    if (!supported || status !== 'speaking') return
    window.speechSynthesis.pause()
    setStatus('paused')
  }, [supported, status])

  const onFile = useCallback(async (file: File) => {
    setError('')
    try {
      const { readAsText } = await import('@chirag127/oz-file')
      const content = await readAsText(file)
      setText(content)
    } catch {
      setError('Could not read that file. Use a .txt or plain-text file.')
    }
  }, [])

  const [dragOver, setDragOver] = useState(false)
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const f = e.dataTransfer.files?.[0]
      if (f) void onFile(f)
    },
    [onFile],
  )

  const aiRewrite = useCallback(async () => {
    if (!text.trim()) return
    setAiState('thinking')
    setError('')
    try {
      const { complete } = await import('@chirag127/oz-ai')
      const out = await complete(text, {
        system: `Rewrite the user's text to be more natural when read aloud by a text-to-speech voice, tuned for "${aiLevel}". Keep meaning. Expand abbreviations, spell out symbols, fix run-ons, add natural sentence breaks. Return ONLY the rewritten text, no preamble.`,
      })
      if (out?.trim()) {
        setText(out.trim())
        setAiState('idle')
      } else {
        setAiState('error')
      }
    } catch {
      setAiState('error')
    }
  }, [text, aiLevel])

  const stats = useMemo(() => {
    const words = wordCount(text)
    const secs = estimateSeconds(text, settings.rate)
    const mm = Math.floor(secs / 60)
    const ss = secs % 60
    return {
      words,
      chars: text.length,
      dur: secs === 0 ? '0:00' : `${mm}:${String(ss).padStart(2, '0')}`,
    }
  }, [text, settings.rate])

  if (!supported) {
    return (
      <section className="console">
        <div className="notice notice--warn">
          Your browser does not support the Web Speech API
          (<code>speechSynthesis</code>). Try Chrome, Edge, or Safari.
        </div>
      </section>
    )
  }

  const speaking = status === 'speaking'

  return (
    <section className="console" aria-label="Text to speech console">
      <div className="console__deck">
        <Waveform active={speaking} />
      </div>

      {/* text well with highlight overlay */}
      <div
        className={`well${dragOver ? ' well--drag' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        {segments.length > 0 && (
          <div className="well__highlight" aria-hidden="true">
            {segments.map((s, i) => {
              const prevEnd = i === 0 ? 0 : segments[i - 1].end
              return (
                <span key={`${s.start}-${s.end}`}>
                  <span className="well__gap">{text.slice(prevEnd, s.start)}</span>
                  <mark className={i === activeSeg ? 'is-active' : ''}>
                    {s.text}
                  </mark>
                </span>
              )
            })}
            <span className="well__gap">
              {text.slice(segments[segments.length - 1]?.end ?? 0)}
            </span>
          </div>
        )}
        <textarea
          className="well__input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste text here — or drop a .txt file. Then press Speak."
          spellCheck
          aria-label="Text to speak"
        />
        {text.length === 0 && (
          <button
            type="button"
            className="well__sample"
            onClick={() => setText(SAMPLE)}
          >
            Try a sample
          </button>
        )}
      </div>

      <div className="statbar" aria-live="polite">
        <span>{stats.words} words</span>
        <span>{stats.chars} chars</span>
        <span>≈ {stats.dur}</span>
        {activeSeg >= 0 && (
          <span className="statbar__seg">
            line {activeSeg + 1}/{segments.length}
          </span>
        )}
      </div>

      {error && <div className="notice notice--err">{error}</div>}

      {/* transport */}
      <div className="transport" role="group" aria-label="Playback">
        {status !== 'speaking' ? (
          <button
            type="button"
            className="btn btn--primary"
            onClick={play}
            disabled={segments.length === 0}
          >
            {status === 'paused' ? '▶ Resume' : '▶ Speak'}
          </button>
        ) : (
          <button type="button" className="btn" onClick={pause}>
            ❚❚ Pause
          </button>
        )}
        <button
          type="button"
          className="btn"
          onClick={stop}
          disabled={status === 'idle'}
        >
          ■ Stop
        </button>
      </div>

      {/* radio-console knobs */}
      <div className="knobs">
        <Knob
          label="Rate"
          value={settings.rate}
          min={0.5}
          max={2}
          step={0.05}
          display={`${settings.rate.toFixed(2)}×`}
          onChange={(v) => persist({ ...settings, rate: clampRate(v) })}
        />
        <Knob
          label="Pitch"
          value={settings.pitch}
          min={0}
          max={2}
          step={0.05}
          display={settings.pitch.toFixed(2)}
          onChange={(v) => persist({ ...settings, pitch: clampPitch(v) })}
        />
        <Knob
          label="Volume"
          value={settings.volume}
          min={0}
          max={1}
          step={0.05}
          display={`${Math.round(settings.volume * 100)}%`}
          onChange={(v) => persist({ ...settings, volume: clampVolume(v) })}
        />

        <div className="voicebox">
          <label htmlFor="voice">Voice</label>
          <select
            id="voice"
            value={settings.voiceURI ?? ''}
            onChange={(e) =>
              persist({ ...settings, voiceURI: e.target.value || null })
            }
          >
            <option value="">Browser default</option>
            {voices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} — {v.lang}
                {v.default ? ' (default)' : ''}
              </option>
            ))}
          </select>
          <span className="voicebox__hint">
            {voices.length} voice{voices.length === 1 ? '' : 's'} ·{' '}
            {selectedVoice?.lang ?? 'system'}
          </span>
        </div>
      </div>

      {/* file + AI row */}
      <div className="tools">
        <label className="btn btn--ghost">
          ⬆ Load .txt
          <input
            type="file"
            accept=".txt,text/plain,.md"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void onFile(f)
              e.target.value = ''
            }}
          />
        </label>

        <div className="ai">
          <select
            value={aiLevel}
            onChange={(e) => setAiLevel(e.target.value)}
            aria-label="Rewrite target"
          >
            <option value="natural speech">Natural speech</option>
            <option value="a young child (grade 3)">Kid-friendly</option>
            <option value="a formal announcer">Formal announcer</option>
            <option value="short and punchy">Short &amp; punchy</option>
          </select>
          <button
            type="button"
            className="btn btn--ai"
            onClick={aiRewrite}
            disabled={aiState === 'thinking' || !text.trim()}
          >
            {aiState === 'thinking' ? '✦ Thinking…' : '✦ AI rewrite'}
          </button>
        </div>
      </div>
      {aiState === 'error' && (
        <p className="ai__err">
          AI is busy right now — core text-to-speech still works.
        </p>
      )}
    </section>
  )
}
