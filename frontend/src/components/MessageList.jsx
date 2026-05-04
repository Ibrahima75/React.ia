import { useEffect, useRef } from 'react'
import AudioControls from './AudioControls'

function UserMessage({ msg }) {
  return (
    <div className="flex justify-end mb-4">
      <div className="max-w-[70%] bg-brand text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed shadow-lg">
        {msg.contenu}
      </div>
    </div>
  )
}

function AssistantMessage({ msg, ttsEnabled }) {
  const modelName = msg.model_info?.nom || 'IA'

  return (
    <div className="flex gap-3 mb-4">
      <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center flex-shrink-0 mt-1">
        <span className="text-brand-light text-xs">⚡</span>
      </div>
      <div className="flex-1">
        <div className="bg-surface-card border border-surface-border rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-200 leading-relaxed">
          {/* Simple markdown-like bold rendering */}
          {msg.contenu.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
            part.startsWith('**') && part.endsWith('**')
              ? <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>
              : <span key={i}>{part}</span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1.5 px-1">
          <span className="text-xs text-gray-600 bg-surface-card border border-surface-border rounded px-2 py-0.5">
            {modelName}
          </span>
          {ttsEnabled && <AudioControls text={msg.contenu} />}
        </div>
      </div>
    </div>
  )
}

export default function MessageList({ messages, loading, ttsEnabled }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      {messages.map(msg =>
        msg.role === 'user'
          ? <UserMessage key={msg.id} msg={msg} />
          : <AssistantMessage key={msg.id} msg={msg} ttsEnabled={ttsEnabled} />
      )}
      {loading && (
        <div className="flex gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center">
            <span className="text-brand-light text-xs">⚡</span>
          </div>
          <div className="bg-surface-card border border-surface-border rounded-2xl px-4 py-3">
            <div className="flex gap-1 items-center h-5">
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
