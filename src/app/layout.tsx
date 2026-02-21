import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'react-hot-toast'
import Image from 'next/image'
import './globals.css'

export const metadata: Metadata = {
  title: 'BREVIO — Luxury URL Shortener',
  description:
    'ย่อ URL ให้สั้นกระชับ สวยงาม พร้อม QR Code และ Analytics',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="th">
        <head>
          <link
            href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
            rel="stylesheet"
          />
        </head>

        <body className="relative overflow-x-hidden">
          {/* Background mesh */}
          <div className="bg-mesh absolute inset-0 -z-20" />

          <Image
            src="/flower.png"
            alt="flower"
            width={100}
            height={140}
            className="floating-flower"
          />

          <div className="relative z-10 pb-24">
            {children}
          </div>

          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#13131a',
                color: '#f0ece0',
                border: '1px solid rgba(201,168,76,0.3)',
                fontFamily: "'Press Start 2P', monospace", // 👈 เปลี่ยนตรงนี้ด้วย
                fontSize: '0.75rem',
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  )
}