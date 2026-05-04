function QuotaItem({ label, used, limit, color }) {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0
  const statusColor = pct >= 90 ? 'text-red-400' : pct >= 70 ? 'text-yellow-400' : color

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={`font-semibold ${statusColor}`}>{label}</span>
      <span className={statusColor}>{used}/{limit}</span>
    </div>
  )
}

export default function QuotaBar({ quotaStatus }) {
  if (!quotaStatus) return null

  const { rpm_used, rpm_limit, rpd_used, rpd_limit, tpm_limit } = quotaStatus
  const rpmPct = rpm_limit > 0 ? (rpm_used / rpm_limit) * 100 : 0
  const rpdPct = rpd_limit > 0 ? (rpd_used / rpd_limit) * 100 : 0

  return (
    <div className="flex items-center gap-4">
      <QuotaItem
        label="RPM STATUS"
        used={rpm_used}
        limit={rpm_limit}
        color={rpmPct >= 90 ? 'text-red-400' : 'text-green-400'}
      />
      <QuotaItem
        label="TPM QUOTA"
        used={0}
        limit={tpm_limit ? `${Math.round(tpm_limit / 1000)}k` : 0}
        color="text-yellow-400"
      />
      <QuotaItem
        label="RPD LIMIT"
        used={rpd_used}
        limit={rpd_limit}
        color={rpdPct >= 80 ? 'text-red-400' : 'text-yellow-400'}
      />
    </div>
  )
}
