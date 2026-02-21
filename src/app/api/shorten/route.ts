import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateReadableSlug } from '@/lib/generateSlug'

export async function POST(req: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json(
      { error: 'กรุณาเข้าสู่ระบบก่อน' },
      { status: 401 }
    )
  }

  const { url } = await req.json()

  if (!url) {
    return NextResponse.json(
      { error: 'กรุณากรอก URL' },
      { status: 400 }
    )
  }

  try {
    new URL(url)
  } catch {
    return NextResponse.json(
      { error: 'URL ไม่ถูกต้อง' },
      { status: 400 }
    )
  }

  try {
    let slug = ""
    let created = false
    let attempts = 0

    while (!created && attempts < 5) {
      slug = generateReadableSlug()

      const existing = await prisma.shortUrl.findUnique({
        where: { slug }
      })

      if (!existing) {
        await prisma.shortUrl.create({
          data: {
            slug,
            fullUrl: url,
            userId,
            clicks: 0
          }
        })

        created = true
      }

      attempts++
    }

    if (!created) {
      return NextResponse.json(
        { error: "ไม่สามารถสร้าง slug ได้ กรุณาลองใหม่" },
        { status: 500 }
      )
    }

    return NextResponse.json({ slug })

  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}