'use client'

import { useState } from 'react'
import { useUser, SignInButton } from '@clerk/nextjs'
import { Scissors, Copy, ExternalLink, Lock, Loader2, QrCode } from 'lucide-react'
import toast from 'react-hot-toast'
import QRCode from 'qrcode'
import Image from 'next/image'

interface ShortenResult {
  shortUrl: string
  slug: string
  qrCode: string
}

export default function ShortenForm({ onSuccess }: { onSuccess: () => void }) {
  const { isSignedIn } = useUser()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ShortenResult | null>(null)

  const handleShorten = async () => {
    if (!url.trim()) return toast.error('Please enter a URL first')

    let processedUrl = url.trim()
    if (!/^https?:\/\//i.test(processedUrl)) {
      processedUrl = 'https://' + processedUrl
    }

    try { new URL(processedUrl) }
    catch { return toast.error('Invalid URL') }

    setLoading(true)

    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: processedUrl }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Something went wrong')
      }

      const data = await res.json()
      const shortUrl = `${window.location.origin}/r/${data.slug}`

      const qrCode = await QRCode.toDataURL(shortUrl, {
        width: 300,
        margin: 2,
        color: { dark: '#ff2d78', light: '#ffffff' },
      })

      setResult({ shortUrl, slug: data.slug, qrCode })
      onSuccess()
      toast.success('Short URL created!')
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied!')
  }

  const downloadQR = () => {
    if (!result) return
    const a = document.createElement('a')
    a.href = result.qrCode
    a.download = `qr-${result.slug}.png`
    a.click()
    toast.success('QR Code downloaded!')
  }

  return (
    <div className="animate-fade-up-delay-4">

      <div className="glass-card p-6 mb-4">
        <p className="pixel-font mb-3" style={{ fontSize: '0.5rem', color: 'var(--text-secondary)' }}>
          // PASTE YOUR URL
        </p>

        <input
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && isSignedIn && handleShorten()}
          placeholder="https://your-very-long-url.com"
          className="input-gold w-full px-4 py-3 text-sm mb-3"
        />

        {isSignedIn ? (
          <button
            onClick={handleShorten}
            disabled={loading}
            className="btn-gold w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Scissors size={14} />}
            {loading ? 'WORKING...' : 'SHORTEN IT'}
          </button>
        ) : (
          <SignInButton mode="modal">
            <button className="btn-gold w-full py-3 flex items-center justify-center gap-2">
              <Lock size={14} />
              LOGIN TO SHORTEN
            </button>
          </SignInButton>
        )}
      </div>

      {result && isSignedIn && (
        <div className="glass-card p-6 animate-fade-up">

          <p className="pixel-font mb-3" style={{ fontSize: '0.5rem', color: 'var(--text-secondary)' }}>
            // YOUR SHORT URL
          </p>

          <div
            className="flex items-center gap-2 p-3 mb-5"
            style={{
              background: '#fff0f5',
              border: '2px solid #111',
              boxShadow: '3px 3px 0 #111',
            }}
          >
            {/* ✅ ลิงก์กดได้ */}
            <a
              href={result.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 truncate hover:underline pixel-font"
              style={{ color: 'var(--accent)', fontSize: '0.55rem' }}
            >
              {result.shortUrl}
            </a>

            <button
              onClick={() => copyToClipboard(result.shortUrl)}
              className="p-1.5 hover:bg-pink-50 transition-colors shrink-0"
              style={{ border: '1px solid #111' }}
              title="Copy"
            >
              <Copy size={13} />
            </button>

            {/* ✅ ปุ่มเปิด */}
            <a
              href={result.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 hover:bg-pink-50 transition-colors shrink-0"
              style={{ border: '1px solid #111' }}
              title="Open"
            >
              <ExternalLink size={13} />
            </a>
          </div>

          <div className="divider-gold mb-5" />

          <div className="flex flex-col items-center">
            <p className="pixel-font mb-4" style={{ fontSize: '0.5rem', color: 'var(--text-secondary)' }}>
              // QR CODE
            </p>

            <div
              className="p-4 float-animation"
              style={{
                background: '#fff',
                border: '2px solid #111',
                boxShadow: '5px 5px 0 #111',
              }}
            >
              <Image src={result.qrCode} alt="QR Code" width={160} height={160} />
            </div>

            <button
              onClick={downloadQR}
              className="btn-outline mt-4 px-5 py-2.5 flex items-center gap-2"
            >
              <QrCode size={12} />
              DOWNLOAD QR
            </button>
          </div>

          <div className="divider-gold mt-5 mb-4" />

          <p className="pixel-font mb-1" style={{ fontSize: '0.45rem', color: 'var(--text-secondary)' }}>
            ORIGINAL:
          </p>
          <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
            {url}
          </p>
        </div>
      )}
    </div>
  )
}