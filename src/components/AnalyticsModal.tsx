'use client'

import { useEffect, useState } from 'react'
import { X, MousePointerClick, Clock, TrendingUp, Activity } from 'lucide-react'

interface ClickLog {
  id: string
  clickedAt: string
  userAgent: string | null
  referer: string | null
}

interface Props {
  urlId: string
  urlData: { slug: string; fullUrl: string; clicks: number; createdAt: string }
  onClose: () => void
}

export default function AnalyticsModal({ urlId, urlData, onClose }: Props) {
  const [logs, setLogs] = useState<ClickLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    fetch(`/api/urls/${urlId}/analytics`)
      .then(r => r.json())
      .then(data => {
        if (active) {
          setLogs(data || [])
          setLoading(false)
        }
      })
      .catch(() => active && setLoading(false))

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleEsc)

    return () => {
      active = false
      window.removeEventListener('keydown', handleEsc)
    }
  }, [urlId, onClose])

  const parseDevice = (ua: string | null) => {
    if (!ua) return 'ไม่ทราบ'
    if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS'
    if (/Android/i.test(ua)) return 'Android'
    if (/Windows/i.test(ua)) return 'Windows'
    if (/Mac/i.test(ua)) return 'macOS'
    if (/Linux/i.test(ua)) return 'Linux'
    return 'อื่นๆ'
  }

  const deviceStats = logs.reduce((acc, log) => {
    const d = parseDevice(log.userAgent)
    acc[d] = (acc[d] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const daysSince = Math.max(
    1,
    Math.ceil((Date.now() - new Date(urlData.createdAt).getTime()) / 86400000)
  )

  const avgPerDay =
    urlData.clicks > 0 ? (urlData.clicks / daysSince).toFixed(1) : '0'

  const formatDate = (d: string) =>
    new Date(d).toLocaleString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{
        background: 'rgba(7,7,9,0.85)',
        backdropFilter: 'blur(10px)',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-2xl rounded-2xl glass-card overflow-hidden animate-fade-up"
        style={{ maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="p-6 border-b border-[var(--border)]">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Activity size={14} className="text-[var(--gold)]" />
                <span className="text-xs tracking-[0.2em] uppercase text-[var(--text-secondary)] tag-mono">
                  Analytics
                </span>
              </div>

              <h3
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '1.5rem',
                  fontWeight: 400,
                }}
              >
                <span className="text-[var(--gold)]">/r/{urlData.slug}</span>
              </h3>

              <p className="text-xs text-[var(--text-secondary)] mt-1 opacity-60 truncate max-w-sm">
                {urlData.fullUrl}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="p-6 grid grid-cols-3 gap-4 border-b border-[var(--border)]">
          {[
            { icon: <MousePointerClick size={18} />, value: urlData.clicks, label: 'คลิกทั้งหมด' },
            { icon: <TrendingUp size={18} />, value: avgPerDay, label: 'คลิก/วัน' },
            { icon: <Clock size={18} />, value: daysSince, label: 'วันที่ผ่านมา' },
          ].map((s, i) => (
            <div
              key={i}
              className="rounded-xl p-4 text-center"
              style={{
                background: 'rgba(201,168,76,0.05)',
                border: '1px solid rgba(201,168,76,0.15)',
              }}
            >
              <div className="mx-auto mb-2 text-[var(--gold)] flex justify-center">
                {s.icon}
              </div>
              <p className="text-2xl font-semibold">{s.value}</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1 tag-mono">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Device Stats */}
        {Object.keys(deviceStats).length > 0 && (
          <div className="px-6 py-4 border-b border-[var(--border)]">
            <p className="text-xs tracking-[0.2em] uppercase text-[var(--text-secondary)] mb-4 tag-mono">
              ✦ อุปกรณ์ที่ใช้
            </p>

            <div className="space-y-2">
              {Object.entries(deviceStats)
                .sort((a, b) => b[1] - a[1])
                .map(([device, count]) => {
                  const percent =
                    urlData.clicks > 0
                      ? (count / urlData.clicks) * 100
                      : 0

                  return (
                    <div key={device} className="flex items-center gap-3">
                      <span className="text-xs text-[var(--text-secondary)] w-20 tag-mono">
                        {device}
                      </span>

                      <div
                        className="flex-1 h-1.5 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.05)' }}
                      >
                        <div
                          className="h-full rounded-full btn-gold transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      <span className="text-xs text-[var(--text-secondary)] tag-mono w-6 text-right">
                        {count}
                      </span>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* Recent Logs */}
        <div className="p-6 overflow-y-auto max-h-64">
          <p className="text-xs tracking-[0.2em] uppercase text-[var(--text-secondary)] mb-4 tag-mono">
            ✦ คลิกล่าสุด
          </p>

          {loading ? (
            <div className="text-center py-6">
              <div className="w-6 h-6 rounded-full border-2 border-[var(--gold)] border-t-transparent animate-spin mx-auto" />
            </div>
          ) : logs.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)] text-center py-4 opacity-60">
              ยังไม่มีการคลิก
            </p>
          ) : (
            <div className="space-y-2">
              {logs.slice(0, 20).map((log, i) => (
                <div
                  key={log.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                >
                  <span className="text-[var(--gold)] opacity-40 tag-mono text-xs w-4">
                    {i + 1}
                  </span>

                  <div className="flex-1">
                    <span className="tag-mono text-xs text-[var(--text-secondary)]">
                      {parseDevice(log.userAgent)}
                    </span>

                    {log.referer && (
                      <span className="text-xs text-[var(--text-secondary)] opacity-40 ml-2 truncate">
                        จาก {log.referer}
                      </span>
                    )}
                  </div>

                  <span className="tag-mono text-xs text-[var(--text-secondary)] opacity-50 whitespace-nowrap">
                    {formatDate(log.clickedAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}