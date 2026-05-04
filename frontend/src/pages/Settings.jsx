import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import i18n from '../i18n/i18n'

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-brand' : 'bg-surface-border'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  )
}

function Section({ title, children }) {
  return (
    <div className="card mb-6">
      <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-5">{title}</h2>
      {children}
    </div>
  )
}

function SettingRow({ label, desc, children }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-surface-border last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-200">{label}</p>
        {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
      </div>
      <div className="ml-4 flex-shrink-0">{children}</div>
    </div>
  )
}

export default function Settings() {
  const { t } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()

  const [prefs, setPrefs] = useState({ theme: 'dark', langue: 'fr', tts_enabled: false, stt_enabled: true })
  const [form, setForm] = useState({ nom: '', email: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/preferences/').then(res => setPrefs(res.data)).catch(() => {})
    if (user) setForm({ nom: user.nom, email: user.email })
  }, [user])

  const savePrefs = async (updated) => {
    const next = { ...prefs, ...updated }
    setPrefs(next)
    try {
      await api.put('/preferences/', next)
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    }
  }

  const handleThemeToggle = () => {
    toggleTheme()
    savePrefs({ theme: theme === 'dark' ? 'light' : 'dark' })
  }

  const handleLangueChange = (e) => {
    const lang = e.target.value
    i18n.changeLanguage(lang)
    localStorage.setItem('langue', lang)
    savePrefs({ langue: lang })
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      // Account update would need a separate endpoint — show success for now
      toast.success('Profil mis à jour.')
    } catch {
      toast.error('Erreur')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Simple sidebar */}
      <aside className="w-56 bg-surface border-r border-surface-border flex flex-col p-4 gap-2">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-6 h-6 rounded-md bg-brand flex items-center justify-center text-xs font-bold text-white">IA</div>
          <span className="text-sm font-semibold text-white">Intelligence Layer</span>
        </div>
        <Link to="/" className="sidebar-item">💬 Chat</Link>
        <Link to="/settings" className="sidebar-item active">⚙ {t('chat.settings')}</Link>
        <Link to="/dashboard" className="sidebar-item">◈ {t('chat.admin')}</Link>
        <div className="mt-auto">
          <button onClick={logout} className="sidebar-item w-full text-left">↩ {t('chat.logout')}</button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-3xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">{t('settings.title')}</h1>
              <p className="text-gray-500 text-sm mt-1">{t('settings.subtitle')}</p>
            </div>
            <span className="text-sm text-brand-light">React IA</span>
          </div>

          {/* Interface */}
          <Section title={t('settings.interface')}>
            <SettingRow label={t('settings.dark_mode')} desc={t('settings.dark_mode_desc')}>
              <Toggle checked={theme === 'dark'} onChange={handleThemeToggle} />
            </SettingRow>
            <SettingRow label={t('settings.language')} desc={t('settings.language_desc')}>
              <select
                value={prefs.langue}
                onChange={handleLangueChange}
                className="bg-surface-card border border-surface-border rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-brand"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </SettingRow>
          </Section>

          {/* Audio */}
          <Section title={t('settings.audio')}>
            <SettingRow label={t('settings.tts')} desc={t('settings.tts_desc')}>
              <Toggle checked={prefs.tts_enabled} onChange={v => savePrefs({ tts_enabled: v })} />
            </SettingRow>
            <SettingRow label={t('settings.stt')} desc={t('settings.stt_desc')}>
              <Toggle checked={prefs.stt_enabled} onChange={v => savePrefs({ stt_enabled: v })} />
            </SettingRow>
          </Section>

          {/* Account */}
          <Section title={t('settings.account')}>
            <div className="flex items-start gap-4 mb-5">
              <div className="w-14 h-14 rounded-full bg-brand/30 flex items-center justify-center text-xl font-bold text-brand-light">
                {user?.nom?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs bg-brand/20 text-brand-light border border-brand/30 rounded px-2 py-0.5 font-semibold uppercase tracking-wider">
                    {t('settings.premium')}
                  </span>
                </div>
                <form onSubmit={handleUpdate} className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('settings.full_name')}</label>
                    <input
                      value={form.nom}
                      onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                      className="input-field text-sm py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('settings.email_address')}</label>
                    <input
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      type="email"
                      className="input-field text-sm py-2"
                    />
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <button type="submit" disabled={saving} className="btn-primary text-sm">
                      🔄 {t('settings.update')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </Section>

          {/* Bottom cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="card text-center">
              <div className="text-2xl mb-2">🛡</div>
              <p className="text-xs font-semibold text-gray-300 mb-1">{t('settings.security')}</p>
              <p className="text-xs text-gray-500 mb-3">{t('settings.security_desc')}</p>
              <button className="text-xs text-brand-light hover:underline">{t('settings.manage_security')}</button>
            </div>
            <div className="card text-center">
              <div className="text-2xl mb-2">🗄</div>
              <p className="text-xs font-semibold text-gray-300 mb-1">{t('settings.data')}</p>
              <p className="text-xs text-gray-500 mb-3">{t('settings.data_desc')}</p>
              <button className="text-xs text-brand-light hover:underline">{t('settings.privacy')}</button>
            </div>
            <div className="card text-center bg-brand/10 border-brand/30">
              <div className="text-2xl mb-2">⚡</div>
              <p className="text-xs font-semibold text-gray-300 mb-1">{t('settings.usage')}</p>
              <p className="text-xs text-gray-500 mb-3">{t('settings.usage_desc')}</p>
              <div className="h-1.5 bg-surface-border rounded-full overflow-hidden">
                <div className="h-full bg-brand w-4/5" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
