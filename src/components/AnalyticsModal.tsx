'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, MousePointerClick, Clock, TrendingUp, Activity } from 'lucide-react'

interface ClickLog {
  id: string
  clickedAt: string
  userAgent: string | null
  referer: string | null
}

interface Props {
  urlId: string
  urlData: {
    slug: string
    fullUrl: string
    clicks: number
    createdAt: string
  }
  onClose: () => void
}

export default function AnalyticsModal({ urlId, urlData, onClose }: Props) {
  const [logs, setLogs] = useState<ClickLog[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // ✅ ป้องกัน SSR error
  useEffect(() => {
    setMounted(true)
  }, [])

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

  if (!mounted) return null

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

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        background: 'rgba(7,7,9,0.85)',
        backdropFilter: 'blur(10px)',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-2xl rounded-2xl glass-card overflow-hidden"
        style={{ maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="p-6 border-b border-[var(--border)]">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Activity size={14} className="text-[var(--accent)]" />
                <span className="text-xs tracking-[0.2em] uppercase text-[var(--text-secondary)] tag-mono">
                  Analytics
                </span>
              </div>

              <h3 className="text-xl font-semibold">
                <span className="text-[var(--accent)]">
                  /r/{urlData.slug}
                </span>
              </h3>

              <p className="text-xs text-[var(--text-secondary)] mt-1 truncate max-w-sm">
                {urlData.fullUrl}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="p-6 grid grid-cols-3 gap-4 border-b border-[var(--border)]">
          {[
            {
              icon: <MousePointerClick size={18} />,
              value: urlData.clicks,
              label: 'คลิกทั้งหมด',
            },
            {
              icon: <TrendingUp size={18} />,
              value: avgPerDay,
              label: 'คลิก/วัน',
            },
            {
              icon: <Clock size={18} />,
              value: daysSince,
              label: 'วันที่ผ่านมา',
            },
          ].map((s, i) => (
            <div
              key={i}
              className="rounded-xl p-4 text-center"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="mx-auto mb-2 text-[var(--accent)] flex justify-center">
                {s.icon}
              </div>
              <p className="text-2xl font-semibold">{s.value}</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1 tag-mono">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Logs */}
        <div className="p-6 overflow-y-auto max-h-64">
          <p className="text-xs uppercase mb-4 tag-mono text-[var(--text-secondary)]">
            ✦ คลิกล่าสุด
          </p>

          {loading ? (
            <div className="text-center py-6">
              <div className="w-6 h-6 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin mx-auto" />
            </div>
          ) : logs.length === 0 ? (
            <p className="text-sm text-center py-4 text-[var(--text-secondary)]">
              ยังไม่มีการคลิก
            </p>
          ) : (
            <div className="space-y-2">
              {logs.slice(0, 20).map((log, i) => (
                <div
                  key={log.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50"
                >
                  <span className="text-xs opacity-50 w-4">
                    {i + 1}
                  </span>

                  <div className="flex-1">
                    <span className="text-xs">
                      {parseDevice(log.userAgent)}
                    </span>

                    {log.referer && (
                      <span className="text-xs opacity-50 ml-2 truncate">
                        จาก {log.referer}
                      </span>
                    )}
                  </div>

                  <span className="text-xs opacity-50 whitespace-nowrap">
                    {formatDate(log.clickedAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}