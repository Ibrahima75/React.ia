import { useState, useRef } from 'react'

export default function AudioControls({ text }) {
  const [playing, setPlaying] = useState(false)
  const utterRef = useRef(null)

  const play = () => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    utterRef.current = new SpeechSynthesisUtterance(text)
    utterRef.current.lang = localStorage.getItem('langue') === 'en' ? 'en-US' : 'fr-FR'
    utterRef.current.rate = 1
    utterRef.current.onend = () => setPlaying(false)
    utterRef.current.onerror = () => setPlaying(false)
    window.speechSynthesis.speak(utterRef.current)
    setPlaying(true)
  }

  const pause = () => {
    window.speechSynthesis.pause()
    setPlaying(false)
  }

  const stop = () => {
    window.speechSynthesis.cancel()
    setPlaying(false)
  }

  if (!window.speechSynthesis) return null

  return (
    <div className="flex items-center gap-1">
      {!playing ? (
        <button onClick={play} title="Lire" className="text-gray-500 hover:text-brand-light transition-colors text-xs">
          ▶
        </button>
      ) : (
        <button onClick={pause} title="Pause" className="text-brand-light text-xs">
          ⏸
        </button>
      )}
      <button onClick={stop} title="Arrêter" className="text-gray-500 hover:text-red-400 transition-colors text-xs">
        ■
      </button>
    </div>
  )
}
