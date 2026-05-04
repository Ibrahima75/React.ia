import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { t } = useTranslation()
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const [isRegister, setIsRegister] = useState(false)
  const [form, setForm] = useState({ nom: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isRegister) {
        await register(form.nom, form.email, form.password)
      } else {
        await login(form.email, form.password)
      }
      navigate('/')
    } catch (err) {
      const msg = err.response?.data?.detail
        || Object.values(err.response?.data || {})[0]
        || 'Erreur de connexion'
      toast.error(Array.isArray(msg) ? msg[0] : msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">
          <span className="text-white">React</span>
          <span className="text-brand-light">IA</span>
        </h1>
        <p className="text-xs text-gray-500 tracking-widest mt-1">INTELLIGENCE LAYER</p>
      </div>

      <div className="w-full max-w-sm bg-surface-card border border-surface-border rounded-2xl p-8 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-1">
          {isRegister ? t('login.register_title') : t('login.title')}
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          {isRegister ? t('login.register_subtitle') : t('login.subtitle')}
        </p>

        <form onSubmit={submit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                {t('login.name')}
              </label>
              <input
                name="nom"
                type="text"
                required
                value={form.nom}
                onChange={handle}
                className="input-field"
                placeholder="Jean Dupont"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              {t('login.email')}
            </label>
            <input
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handle}
              className="input-field"
              placeholder="nom@exemple.com"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {t('login.password')}
              </label>
              {!isRegister && (
                <button type="button" className="text-xs text-brand-light hover:underline">
                  {t('login.forgot')}
                </button>
              )}
            </div>
            <input
              name="password"
              type="password"
              required
              value={form.password}
              onChange={handle}
              className="input-field"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? '...' : isRegister ? t('login.register_submit') : t('login.submit') + ' →'}
          </button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-surface-border" />
          </div>
          <div className="relative flex justify-center text-xs text-gray-500">
            <span className="bg-surface-card px-2">{t('login.or')}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button className="btn-secondary text-sm flex items-center justify-center gap-2">
            <span>☁</span> Google
          </button>
          <button className="btn-secondary text-sm flex items-center justify-center gap-2">
            <span>◈</span> Github
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          {isRegister ? t('login.have_account') : t('login.no_account')}{' '}
          <button
            type="button"
            onClick={() => setIsRegister(r => !r)}
            className="text-brand-light hover:underline font-medium"
          >
            {isRegister ? t('login.sign_in') : t('login.create')}
          </button>
        </p>
      </div>

      <p className="text-gray-700 text-xs mt-8 tracking-widest">PRECISION ENGINEERING</p>
    </div>
  )
}
