import { useEffect, useState } from 'react'
import api from '../services/api'

export default function ModelSelector({ value, onChange }) {
  const [models, setModels] = useState([])

  useEffect(() => {
    api.get('/models/')
      .then(res => {
        setModels(res.data)
        if (res.data.length && !value) onChange(res.data[0].slug)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-surface-card border border-surface-border text-gray-200 text-sm rounded-lg px-3 py-1.5 pr-8 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand"
      >
        {models.map(m => (
          <option key={m.slug} value={m.slug}>{m.nom}</option>
        ))}
      </select>
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▾</span>
    </div>
  )
}
