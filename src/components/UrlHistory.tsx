'use client'

import { useEffect, useState } from 'react'
import {
  BarChart2,
  Copy,
  ExternalLink,
  Clock,
  MousePointerClick,
  ChevronRight,
} from 'lucide-react'
import toast from 'react-hot-toast'
import AnalyticsModal from './AnalyticsModal'

interface UrlRecord {
  id: string
  slug: string
  fullUrl: string
  clicks: number
  createdAt: string
}

export default function UrlHistory() {
  const [urls, setUrls] = useState<UrlRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/urls')
      .then(r => r.json())
      .then(data => {
        setUrls(data)
        setLoading(false)
      })
      .catch(() => {
        toast.error('Failed to load history')
        setLoading(false)
      })
  }, [])

  const copyToClipboard = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/r/${slug}`)
    toast.success('Copied!')
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
    })

  return (
    <>
      <div className="mt-8 animate-fade-up-delay-5">
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 mb-4"
          style={{ background: '#111' }}
        >
          <h2
            className="pixel-font text-white"
            style={{ fontSize: '0.6rem' }}
          >
            URL HISTORY
          </h2>

          <span
            className="pixel-font text-white"
            style={{ fontSize: '0.45rem' }}
          >
            <span style={{ color: 'var(--accent)' }}>
              {urls.length}
            </span>{' '}
            LINKS
          </span>
        </div>

        {loading ? (
          <div
            className="p-12 text-center"
            style={{
              border: '2px solid #111',
              boxShadow: '4px 4px 0 #111',
            }}
          >
            <div
              className="w-6 h-6 border-4 border-t-transparent animate-spin mx-auto"
              style={{
                borderColor: 'var(--accent)',
                borderTopColor: 'transparent',
              }}
            />
          </div>
        ) : urls.length === 0 ? (
          <div
            className="p-10 text-center"
            style={{
              border: '2px solid #111',
              boxShadow: '4px 4px 0 #111',
            }}
          >
            <p
              className="pixel-font"
              style={{
                fontSize: '0.5rem',
                color: 'var(--text-secondary)',
              }}
            >
              NO LINKS YET
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {urls.map((item, i) => (
              <div
                key={item.id}
                className="glass-card p-4"
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    '24px 1fr auto auto',
                  gap: '12px',
                  alignItems: 'center',
                }}
              >
                {/* Number */}
                <span
                  className="pixel-font opacity-30 text-center"
                  style={{ fontSize: '0.4rem' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>

                {/* URL info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="pixel-font"
                      style={{
                        fontSize: '0.5rem',
                        color: 'var(--accent)',
                      }}
                    >
                      /r/{item.slug}
                    </span>
                  </div>

                  <p
                    className="text-xs truncate"
                    style={{
                      color: 'var(--text-tertiary)',
                      fontSize: '0.7rem',
                    }}
                  >
                    {item.fullUrl}
                  </p>

                  <p
                    className="flex items-center gap-1 mt-1"
                    style={{
                      color: 'var(--text-tertiary)',
                      fontSize: '0.65rem',
                    }}
                  >
                    <Clock size={9} />
                    {formatDate(item.createdAt)}
                  </p>
                </div>

                {/* Clicks badge */}
                <div
                  className="flex items-center gap-1 px-2 py-1 shrink-0"
                  style={{
                    border: '2px solid #111',
                    boxShadow: '2px 2px 0 #111',
                  }}
                >
                  <MousePointerClick
                    size={11}
                    style={{ color: 'var(--accent)' }}
                  />
                  <span
                    className="pixel-font"
                    style={{ fontSize: '0.4rem' }}
                  >
                    {item.clicks}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Copy */}
                  <button
                    onClick={() =>
                      copyToClipboard(item.slug)
                    }
                    className="p-1.5 hover:bg-gray-100 transition-colors"
                    style={{
                      color: '#555',
                      border: '1px solid #ddd',
                    }}
                    title="Copy"
                  >
                    <Copy size={11} />
                  </button>

                  {/* Open Link (FIXED) */}
                  <a
                    href={`${window.location.origin}/r/${item.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 hover:bg-gray-100 transition-colors"
                    style={{
                      color: '#555',
                      border: '1px solid #ddd',
                    }}
                    title="Open"
                  >
                    <ExternalLink size={11} />
                  </a>

                  {/* Analytics */}
                  <button
                    onClick={() =>
                      setSelectedId(item.id)
                    }
                    className="p-1.5 hover:bg-gray-100 transition-colors flex items-center"
                    style={{
                      color: 'var(--accent)',
                      border:
                        '1px solid var(--accent)',
                    }}
                    title="Analytics"
                  >
                    <BarChart2 size={11} />
                    <ChevronRight size={9} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedId && (
        <AnalyticsModal
          urlId={selectedId}
          urlData={
            urls.find(u => u.id === selectedId)!
          }
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  )
}