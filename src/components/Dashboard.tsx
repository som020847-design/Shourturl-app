'use client'

import { useEffect, useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts'

type ShortUrl = {
  id: string
  slug: string
  clicks: number
}

const COLORS = ['#ff3b8d', '#00c896', '#3b82f6', '#f59e0b', '#8b5cf6']

export default function Dashboard() {
  const [urls, setUrls] = useState<ShortUrl[]>([])

  useEffect(() => {
    fetch('/api/urls', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setUrls(data))
  }, [])

  const totalClicks = urls.reduce((sum, u) => sum + u.clicks, 0)

  const top = [...urls]
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5)

  const pieData = top.map(u => ({
    name: u.slug,
    value: u.clicks
  }))

  return (
    <div className="mt-20 mb-24 bg-white border-4 border-black shadow-[8px_8px_0px_#000] p-10">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-14">
        <h2 className="text-sm tracking-wide">
          🎮 ANALYTICS
        </h2>

        <span className="text-xs text-gray-600">
          {totalClicks} TOTAL CLICKS
        </span>
      </div>

      {/* ===== DONUT CHART (ไม่มี TOTAL กลางวงแล้ว) ===== */}
      <div className="flex justify-center mb-16">
        <div className="w-[320px] h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                innerRadius={85}
                outerRadius={120}
                paddingAngle={3}
              >
                {pieData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== TABLE ===== */}
      <div className="space-y-3">
        {pieData.map((item, i) => {
          const percent = totalClicks
            ? Math.round((item.value / totalClicks) * 100)
            : 0

          return (
            <div
              key={item.name}
              className="flex justify-between items-center border-2 border-black px-4 py-3 bg-white"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-3 h-3 border border-black shrink-0"
                  style={{ backgroundColor: COLORS[i] }}
                />
                <span className="text-[10px] truncate">
                  {item.name}
                </span>
              </div>

              <span className="text-[10px] font-bold shrink-0">
                {percent}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}