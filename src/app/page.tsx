import { prisma } from "@/lib/prisma"
import { unstable_noStore as noStore } from "next/cache"
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LeadTrendsChart, type TrendPoint } from "@/components/LeadTrendsChart"
import { LeadsTable } from "@/components/LeadsTable"
import AddLeadButton from "@/components/AddLeadButton"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AddLeadForm } from "@/components/AddLeadForm"

async function getMetrics() {
  noStore()
  console.log("🟢 getMetrics called at", new Date().toISOString())

  try {
    const [total, contacted, replied] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { was_contacted: { equals: true } } }),
      prisma.lead.count({ where: { reply_date: { not: null } } }),
    ])

    const startOfWeek = (() => {
      const d = new Date()
      const day = d.getDay()
      const diff = d.getDate() - day + (day === 0 ? -6 : 1)
      const sow = new Date(d.setDate(diff))
      sow.setHours(0, 0, 0, 0)
      return sow
    })()

    const repliedThisWeek = await prisma.lead.count({ where: { reply_date: { gte: startOfWeek } } })

    const replyRate = total > 0 ? Math.round((replied / total) * 100) : 0

    console.log("📊 Metrics:", { total, contacted, replyRate, repliedThisWeek })

    return { total, contacted, replyRate, repliedThisWeek }
  } catch (err){
    console.error("❌ Error in getMetrics:", err)
    return { total: 0, contacted: 0, replyRate: 0, repliedThisWeek: 0 }
  }
}

async function getTrendData(): Promise<TrendPoint[]> {
  noStore()
  console.log("🟢 getTrendData called at", new Date().toISOString())
  try {
    const rows = await prisma.lead.findMany({ select: { created_at: true } })
    const map = new Map<string, number>()
    for (const r of rows) {
      if (!r.created_at) continue
      const d = new Date(r.created_at)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      map.set(key, (map.get(key) || 0) + 1)
    }
    const sorted = Array.from(map.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([label, count]) => ({ label, count }))
    console.log("📈 Trend data points:", sorted.length)
    return sorted
  } catch (err) {
    console.error("❌ Error in getTrendData:", err)
    return []
  }
}



export default async function Home() {
  console.log("🏠 Home render start", new Date().toISOString(), Math.random())

  const [{ total, contacted, replyRate, repliedThisWeek }, trend] = await Promise.all([
    getMetrics(),
    getTrendData(),
  ])

  console.log("🏠 Home render end", new Date().toISOString())

  return (
    <div className="container mx-auto max-w-7xl p-6 space-y-8">
      <div className="flex justify-end">
        {/* Removed Add Lead Dialog and Button */}
      </div>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Leads</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{total}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Leads Contacted</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{contacted}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reply Rate</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{replyRate}%</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Replied This Week</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{repliedThisWeek}</CardContent>
        </Card>
      </section>

      <section>
        <LeadTrendsChart title="Leads Added per Month" data={trend} />
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold">Leads</h2>
        <LeadsTable totalLeads={total} />
      </section>
      
    </div>
  )
}