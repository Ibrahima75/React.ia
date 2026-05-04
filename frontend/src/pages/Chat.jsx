import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import api from '../services/api'

import Sidebar from '../components/Sidebar'
import ModelSelector from '../components/ModelSelector'
import QuotaBar from '../components/QuotaBar'
import MessageList from '../components/MessageList'
import MessageInput from '../components/MessageInput'

export default function Chat() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { id } = useParams()

  const [messages, setMessages] = useState([])
  const [selectedModel, setSelectedModel] = useState('gemini-flash')
  const [quotaStatus, setQuotaStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState(id ? parseInt(id) : null)
  const [ttsEnabled, setTtsEnabled] = useState(false)
  const [sttEnabled, setSttEnabled] = useState(true)

  // Load preferences
  useEffect(() => {
    api.get('/preferences/')
      .then(res => {
        setTtsEnabled(res.data.tts_enabled)
        setSttEnabled(res.data.stt_enabled)
      })
      .catch(() => {})
  }, [])

  // Load conversation when route changes
  useEffect(() => {
    const cid = id ? parseInt(id) : null
    setConversationId(cid)
    if (cid) {
      api.get(`/conversations/${cid}/`)
        .then(res => setMessages(res.data.messages || []))
        .catch(() => toast.error('Impossible de charger la conversation'))
    } else {
      setMessages([])
    }
  }, [id])

  const handleNewConversation = async () => {
    // Return null — the sidebar will navigate to /chat and messages will clear
    return null
  }

  const handleSend = async (content, fileContext, fileType) => {
    if (!content && !fileContext) return
    setLoading(true)

    // Optimistically add user message
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      role: 'user',
      contenu: fileContext ? (content || '') + (fileContext ? '\n[Fichier joint]' : '') : content,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempUserMsg])

    try {
      const res = await api.post('/chat/', {
        conversation_id: conversationId,
        model_slug: selectedModel,
        message: content,
        file_context: fileContext,
      })

      // Replace temp message + add real messages
      setMessages(prev => [
        ...prev.filter(m => m.id !== tempUserMsg.id),
        res.data.user_message,
        res.data.assistant_message,
      ])

      if (!conversationId) setConversationId(res.data.conversation_id)
      if (res.data.quota_status) setQuotaStatus(res.data.quota_status)

      if (res.data.model_switched) {
        toast(`🔀 ${t('chat.model_switched', { model: res.data.model_used })}`, { duration: 5000 })
      }
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id))
      toast.error(err.response?.data?.error || 'Erreur lors de l\'envoi')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format) => {
    if (!conversationId) return
    try {
      const res = await api.get(`/conversations/${conversationId}/export/?format=${format}`, {
        responseType: 'blob',
      })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `conversation-${conversationId}.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Erreur lors de l\'export')
    }
  }

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <Sidebar onNewConversation={handleNewConversation} />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-surface-border bg-surface/50 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-brand font-bold text-lg">React IA</span>
            <ModelSelector value={selectedModel} onChange={setSelectedModel} />
          </div>

          <div className="flex items-center gap-4">
            <QuotaBar quotaStatus={quotaStatus} />

            {conversationId && (
              <div className="flex gap-2">
                <button onClick={() => handleExport('json')} className="text-xs text-gray-500 hover:text-gray-300 transition-colors border border-surface-border rounded px-2 py-1">
                  {t('chat.export_json')}
                </button>
                <button onClick={() => handleExport('txt')} className="text-xs text-gray-500 hover:text-gray-300 transition-colors border border-surface-border rounded px-2 py-1">
                  {t('chat.export_txt')}
                </button>
              </div>
            )}

            <div className="w-7 h-7 rounded-full bg-brand/30 flex items-center justify-center text-xs text-brand-light font-semibold">
              {user?.nom?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Messages */}
        <MessageList messages={messages} loading={loading} ttsEnabled={ttsEnabled} />

        {/* Input */}
        <MessageInput
          onSend={handleSend}
          disabled={loading}
          sttEnabled={sttEnabled}
          selectedModel={selectedModel}
        />
      </main>
    </div>
  )
}
