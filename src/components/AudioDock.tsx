import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useAudioBlobUrl } from '../hooks/useAudioBlobUrl'
import { PlayIcon, PauseIcon } from './PlayerIcons'

const SPEEDS = [0.75, 1, 1.25, 1.5] as const

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

// Minimal docked audio player: play/pause, seek bar, speed control only, as
// specified. Mounted once in the player screen (not remounted per item) so
// the chosen speed persists across items; if the previous item was playing
// when the user navigates, the next item's audio continues automatically.
export function AudioDock({ audioFile }: { audioFile?: string }) {
  const url = useAudioBlobUrl(audioFile)
  const audioRef = useRef<HTMLAudioElement>(null)
  const wasPlayingRef = useRef(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [speedIndex, setSpeedIndex] = useState(1)

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = SPEEDS[speedIndex]
  }, [speedIndex, url])

  useEffect(() => {
    setCurrentTime(0)
    setDuration(0)
    if (url && wasPlayingRef.current && audioRef.current) {
      audioRef.current.play().catch(() => {})
    }
  }, [url])

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) audio.play().catch(() => {})
    else audio.pause()
  }

  function handleSeek(e: ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current
    const time = Number(e.target.value)
    if (audio) audio.currentTime = time
    setCurrentTime(time)
  }

  function cycleSpeed() {
    setSpeedIndex((i) => (i + 1) % SPEEDS.length)
  }

  if (!audioFile) return null

  return (
    <div className="fixed inset-x-0 bottom-0 border-t border-gold-500/30 bg-teal-800 px-4 py-3 text-paper">
      <audio
        ref={audioRef}
        src={url ?? undefined}
        onPlay={() => {
          setIsPlaying(true)
          wasPlayingRef.current = true
        }}
        onPause={() => {
          setIsPlaying(false)
          wasPlayingRef.current = false
        }}
        onEnded={() => {
          setIsPlaying(false)
          wasPlayingRef.current = false
        }}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />
      <div className="mx-auto flex max-w-md items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          disabled={!url}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-500 text-teal-900 disabled:opacity-40"
        >
          {isPlaying ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="ml-0.5 h-4 w-4" />}
        </button>

        <span className="w-9 shrink-0 text-right text-xs tabular-nums text-paper/70">
          {formatTime(currentTime)}
        </span>

        <input
          type="range"
          className="audio-seek min-w-0 flex-1"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          disabled={!url}
          aria-label="Seek"
        />

        <span className="w-9 shrink-0 text-xs tabular-nums text-paper/70">
          {formatTime(duration)}
        </span>

        <button
          type="button"
          onClick={cycleSpeed}
          className="w-12 shrink-0 rounded-full border border-gold-400/50 py-1 text-xs font-medium text-gold-400"
        >
          {SPEEDS[speedIndex]}×
        </button>
      </div>
    </div>
  )
}
