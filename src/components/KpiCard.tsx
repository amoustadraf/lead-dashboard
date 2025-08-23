import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function KpiCard({ title, value }: { title: string; value: string | number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-3xl font-bold">{value}</CardContent>
    </Card>
  )
} 