'use client'

import { useUser } from '@clerk/nextjs'
import Hero from '@/components/Hero'
import ShortenForm from '@/components/ShortenForm'
import UrlHistory from '@/components/UrlHistory'
import { useState } from 'react'

export default function Home() {
  const { isSignedIn } = useUser()
  const [refreshKey, setRefreshKey] = useState(0)

  const handleNewUrl = () => setRefreshKey(k => k + 1)

  return (
    <main className="relative min-h-screen z-10">
      <Hero />

      {/* Content wrapper — กึ่งกลาง ไม่เต็มจอ */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 24px 80px' }}>
        <ShortenForm onSuccess={handleNewUrl} />
        {isSignedIn && <UrlHistory key={refreshKey} />}
      </div>
    </main>
  )
}