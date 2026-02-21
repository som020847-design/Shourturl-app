'use client'

import { useUser } from '@clerk/nextjs'
import Hero from '@/components/Hero'
import ShortenForm from '@/components/ShortenForm'
import UrlHistory from '@/components/UrlHistory'
import Dashboard from '@/components/Dashboard'
import { useState } from 'react'

export default function Home() {
  const { isSignedIn } = useUser()
  const [refreshKey, setRefreshKey] = useState(0)

  const handleNewUrl = () => setRefreshKey(k => k + 1)

  return (
    <main className="relative min-h-screen overflow-x-hidden">

      {/* HERO SECTION */}
      <section>
        <Hero />
      </section>

      {/* CONTENT */}
      <section className="w-full max-w-[720px] mx-auto px-5 sm:px-8 pb-32">

        <ShortenForm onSuccess={handleNewUrl} />

        {isSignedIn && (
          <>
            {/* ✅ ใส่ Dashboard ตรงนี้ */}
            <div className="mt-10">
              <Dashboard key={refreshKey} />
            </div>

            {/* History */}
            <div className="mt-10">
              <UrlHistory key={refreshKey} />
            </div>
          </>
        )}

      </section>

    </main>
  )
}