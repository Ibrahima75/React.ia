import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import FileUploadModal from './FileUploadModal'
import toast from 'react-hot-toast'

export default function MessageInput({ onSend, disabled, sttEnabled, selectedModel }) {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [fileContext, setFileContext] = useState(null)
  const [recording, setRecording] = useState(false)
  const textareaRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }, [text])

  const handleSend = () => {
    const content = text.trim()
    if (!content && !fileContext) return
    onSend(content, fileContext?.content || '', fileContext?.type || '')
    setText('')
    setFileContext(null)
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSend()
    }
  }

  const startSTT = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error('Speech-to-Text non supporté dans ce navigateur.')
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = localStorage.getItem('langue') === 'en' ? 'en-US' : 'fr-FR'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onresult = e => {
      setText(prev => prev + e.results[0][0].transcript)
      setRecording(false)
    }
    recognition.onerror = () => setRecording(false)
    recognition.onend = () => setRecording(false)
    recognitionRef.current = recognition
    recognition.start()
    setRecording(true)
  }

  const stopSTT = () => {
    recognitionRef.current?.stop()
    setRecording(false)
  }

  const handleFileProcessed = (data) => {
    setFileContext(data)
    toast.success(`Fichier "${data.filename}" joint.`)
  }

  return (
    <div className="border-t border-surface-border p-4">
      {fileContext && (
        <div className="flex items-center gap-2 mb-2 bg-surface-card border border-surface-border rounded-lg px-3 py-2 text-sm">
          <span className="text-brand-light">{fileContext.type === 'image' ? '🖼' : '📄'}</span>
          <span className="text-gray-300 truncate flex-1">{fileContext.filename}</span>
          <button onClick={() => setFileContext(null)} className="text-gray-500 hover:text-red-400">✕</button>
        </div>
      )}

      <div className="flex items-end gap-2 bg-surface-card border border-surface-border rounded-xl px-3 py-2">
        {/* File upload */}
        <button
          onClick={() => setShowUpload(true)}
          className="text-gray-500 hover:text-gray-300 transition-colors p-1 flex-shrink-0"
          title="Joindre un fichier"
        >
          📎
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('chat.placeholder')}
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent text-gray-200 placeholder-gray-600 resize-none focus:outline-none text-sm leading-relaxed"
          style={{ minHeight: '24px' }}
        />

        {/* STT */}
        {sttEnabled && (
          <button
            onClick={recording ? stopSTT : startSTT}
            className={`p-1 flex-shrink-0 transition-colors ${recording ? 'text-red-400 animate-pulse' : 'text-gray-500 hover:text-gray-300'}`}
            title={recording ? 'Arrêter la dictée' : 'Dictée vocale'}
          >
            🎤
          </button>
        )}

        {/* Send */}
        <button
          onClick={handleSend}
          disabled={disabled || (!text.trim() && !fileContext)}
          className="bg-brand hover:bg-brand-dark text-white rounded-lg p-2 flex-shrink-0 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title={t('chat.press_enter')}
        >
          ➤
        </button>
      </div>

      <p className="text-xs text-gray-600 mt-1.5 px-1">
        {t('chat.supports')} · {t('chat.connected')} ●
      </p>

      {showUpload && (
        <FileUploadModal
          selectedModel={selectedModel}
          onFileProcessed={handleFileProcessed}
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  )
}
