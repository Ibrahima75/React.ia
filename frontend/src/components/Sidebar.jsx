import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function Sidebar({ onNewConversation }) {
  const { t } = useTranslation()
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()

  const [conversations, setConversations] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/conversations/')
      .then(res => setConversations(res.data))
      .catch(() => {})
  }, [])

  const handleNew = async () => {
    const conv = await onNewConversation()
    if (conv) {
      setConversations(prev => [conv, ...prev])
      navigate(`/chat/${conv.id}`)
    } else {
      navigate('/chat')
    }
  }

  const handleDelete = async (e, convId) => {
    e.stopPropagation()
    e.preventDefault()
    try {
      await api.delete(`/conversations/${convId}/`)
      setConversations(prev => prev.filter(c => c.id !== convId))
      if (String(id) === String(convId)) navigate('/chat')
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  const filtered = conversations.filter(c =>
    c.titre.toLowerCase().includes(search.toLowerCase())
  )

  const groupConversations = () => {
    const today = [], yesterday = [], older = []
    const now = new Date()
    filtered.forEach(conv => {
      const d = new Date(conv.updated_at)
      const diff = Math.floor((now - d) / 86400000)
      if (diff === 0) today.push(conv)
      else if (diff === 1) yesterday.push(conv)
      else older.push(conv)
    })
    return { today, yesterday, older }
  }

  const { today, yesterday, older } = groupConversations()

  const ConvGroup = ({ label, items }) => items.length === 0 ? null : (
    <div className="mb-3">
      <p className="text-xs text-gray-600 uppercase tracking-wider px-3 mb-1">{label}</p>
      {items.map(conv => (
        <Link
          key={conv.id}
          to={`/chat/${conv.id}`}
          className={`sidebar-item group ${String(id) === String(conv.id) ? 'active' : ''}`}
        >
          <span className="truncate flex-1">{conv.titre}</span>
          <button
            onClick={e => handleDelete(e, conv.id)}
            className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-opacity text-xs"
          >
            ✕
          </button>
        </Link>
      ))}
    </div>
  )

  return (
    <aside className="w-64 bg-surface flex flex-col h-full border-r border-surface-border">
      {/* Header */}
      <div className="p-4 border-b border-surface-border">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center text-xs font-bold text-white">IA</div>
          <div>
            <p className="text-sm font-semibold text-white">Intelligence Layer</p>
            <p className="text-xs text-gray-500">The Digital Curator</p>
          </div>
        </div>
        <button onClick={handleNew} className="btn-primary w-full text-sm">
          {t('chat.new_conversation')}
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pt-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('chat.search')}
          className="input-field text-sm py-2"
        />
      </div>

      {/* Conversation list */}
      <nav className="flex-1 overflow-y-auto p-3 mt-2 space-y-1">
        <ConvGroup label={t('chat.today')} items={today} />
        <ConvGroup label={t('chat.yesterday')} items={yesterday} />
        <ConvGroup label={t('chat.last_7_days')} items={older} />
        {filtered.length === 0 && (
          <p className="text-gray-600 text-xs text-center mt-8">Aucune conversation</p>
        )}
      </nav>

      {/* Bottom nav */}
      <div className="p-3 border-t border-surface-border space-y-1">
        <Link to="/settings" className="sidebar-item">⚙ {t('chat.settings')}</Link>
        <Link to="/dashboard" className="sidebar-item">◈ {t('chat.admin')}</Link>
        <button onClick={logout} className="sidebar-item w-full text-left">
          ↩ {t('chat.logout')}
        </button>
      </div>
    </aside>
  )
}
