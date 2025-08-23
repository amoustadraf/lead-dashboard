"use client"

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export type TrendPoint = { label: string; count: number }

export function LeadTrendsChart({ title, data }: { title: string; data: TrendPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={24} />
            <Tooltip contentStyle={{ background: "oklch(0.21 0.034 264.665)", border: "none" }} />
            <Line type="monotone" dataKey="count" stroke="currentColor" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
} 