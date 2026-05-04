import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import api from '../services/api'

function StatCard({ label, value, icon }) {
  return (
    <div className="card flex items-center gap-4">
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  )
}

function QuotaProgress({ slug, status }) {
  const rpmPct = status.rpm_limit > 0 ? (status.rpm_used / status.rpm_limit) * 100 : 0
  const rpdPct = status.rpd_limit > 0 ? (status.rpd_used / status.rpd_limit) * 100 : 0
  const color = (pct) => pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-green-500'

  return (
    <div className="p-4 border border-surface-border rounded-xl">
      <p className="text-sm font-semibold text-gray-200 mb-3">{slug}</p>
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>RPM</span><span>{status.rpm_used}/{status.rpm_limit}</span>
          </div>
          <div className="h-1.5 bg-surface-border rounded-full overflow-hidden">
            <div className={`h-full ${color(rpmPct)} transition-all`} style={{ width: `${rpmPct}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>RPD</span><span>{status.rpd_used}/{status.rpd_limit}</span>
          </div>
          <div className="h-1.5 bg-surface-border rounded-full overflow-hidden">
            <div className={`h-full ${color(rpdPct)} transition-all`} style={{ width: `${rpdPct}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { t } = useTranslation()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/')
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
    </div>
  )

  const { stats, requests_per_model, tokens_per_day, recent_errors, quota_status } = data || {}

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Simple sidebar */}
      <aside className="w-56 bg-surface border-r border-surface-border flex flex-col p-4 gap-2">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-6 h-6 rounded-md bg-brand flex items-center justify-center text-xs font-bold text-white">IA</div>
          <span className="text-sm font-semibold text-white">Intelligence Layer</span>
        </div>
        <Link to="/" className="sidebar-item">💬 {t('chat.new_conversation')}</Link>
        <Link to="/settings" className="sidebar-item">⚙ {t('chat.settings')}</Link>
        <Link to="/dashboard" className="sidebar-item active">◈ {t('chat.admin')}</Link>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-6xl">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-white">{t('dashboard.title')}</h1>
              <p className="text-gray-500 text-sm mt-1">{t('dashboard.subtitle')}</p>
            </div>
            <span className="text-sm text-brand-light">React IA</span>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-6">
            <StatCard label={t('dashboard.total_conversations')} value={stats?.total_conversations} icon="💬" />
            <StatCard label={t('dashboard.total_messages')} value={stats?.total_messages} icon="📨" />
            <StatCard label={t('dashboard.active_users')} value={stats?.active_users} icon="👥" />
            <StatCard label={t('dashboard.errors_429')} value={stats?.errors_429} icon="⚠" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Bar chart */}
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">{t('dashboard.requests_per_model')}</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={requests_per_model || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2e3451" />
                  <XAxis dataKey="model__slug" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: '#252a3d', border: '1px solid #2e3451', borderRadius: 8 }} />
                  <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} name="Requêtes" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Line chart */}
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">{t('dashboard.tokens_over_time')}</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={tokens_per_day || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2e3451" />
                  <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: '#252a3d', border: '1px solid #2e3451', borderRadius: 8 }} />
                  <Line type="monotone" dataKey="tokens" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} name="Tokens" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quota status */}
          {quota_status && Object.keys(quota_status).length > 0 && (
            <div className="card mb-6">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">{t('dashboard.quota_status')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Object.entries(quota_status).map(([slug, status]) => (
                  <QuotaProgress key={slug} slug={slug} status={status} />
                ))}
              </div>
            </div>
          )}

          {/* Recent 429 errors */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">{t('dashboard.recent_errors')}</h3>
            {!recent_errors?.length ? (
              <p className="text-gray-600 text-sm">Aucune erreur 429 récente.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 text-left border-b border-surface-border">
                      <th className="pb-2 pr-4">Modèle</th>
                      <th className="pb-2 pr-4">Utilisateur</th>
                      <th className="pb-2 pr-4">Date</th>
                      <th className="pb-2">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent_errors.map(err => (
                      <tr key={err.id} className="border-b border-surface-border/50 text-gray-400">
                        <td className="py-2 pr-4 text-red-400 font-medium">{err.model}</td>
                        <td className="py-2 pr-4">{err.user}</td>
                        <td className="py-2 pr-4 whitespace-nowrap">{new Date(err.created_at).toLocaleString('fr-FR')}</td>
                        <td className="py-2 text-xs truncate max-w-xs">{err.error_message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
