"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { toast } from "sonner"
import { ArrowDownAZ, ArrowUpAZ, Calendar, Filter, Mail } from "lucide-react"
import { EditLeadDialog } from "@/components/EditLeadDialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import AddLeadButton from "@/components/AddLeadButton"

export type Lead = {
  id: string
  row_number: string | null
  first_name: string | null
  last_name: string | null
  email: string | null
  company: string | null
  title: string | null
  was_contacted: boolean | null
  reply_date: Date | null // Changed from string | null to Date | null
  created_at: string | null
  email_subject: string | null
  email_body: string | null
  email_sent: boolean | null
}

interface LeadsTableProps {
  totalLeads: number
}

type ApiResponse = {
  items: Lead[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
  error?: string
}

type SortKey = "company" | "reply_date" | "first_name" | "created_at"

type StatusFilter = "All" | "Yes" | "No"

export function LeadsTable({ totalLeads }: LeadsTableProps) {
  const [q, setQ] = useState("")
  const [status, setStatus] = useState<StatusFilter>("All")
  const [sortBy, setSortBy] = useState<SortKey>("created_at")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<Lead[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [refreshTick, setRefreshTick] = useState(0)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const query = useMemo(() => {
    const p = new URLSearchParams()
    if (q) p.set("q", q)
    if (status) p.set("status", status)
    p.set("sortBy", sortBy)
    p.set("sortDir", sortDir)
    p.set("page", String(page))
    p.set("pageSize", "20")
    p.set("_", String(refreshTick))
    return p.toString()
  }, [q, status, sortBy, sortDir, page, refreshTick])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/leads?${query}`, { cache: "no-store" })
        const data: ApiResponse = await res.json()
        if (cancelled) return
        if (!res.ok) throw new Error(data?.error || "Failed to load leads")
        setTotal(data.total)
        setHasMore(data.hasMore)
        // Convert reply_date strings to Date objects before setting state
        const processedItems = data.items.map(item => ({
          ...item,
          reply_date: item.reply_date ? new Date(item.reply_date) : null,
        }))
        setItems(prev => (page === 1 ? processedItems : [...prev, ...processedItems]))
      } catch (e: any) {
        toast.error(e.message || "Failed to load leads")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [query, page])

  useEffect(() => {
    function onDashRefresh() {
      setItems([])
      setPage(1)
      setRefreshTick(t => t + 1)
    }
    window.addEventListener("dashboard:refresh", onDashRefresh)
    return () => window.removeEventListener("dashboard:refresh", onDashRefresh)
  }, [])

  function toggleSort(key: SortKey) {
    if (sortBy === key) {
      setSortDir(prev => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(key)
      setSortDir("asc")
    }
    setPage(1)
  }

  function onFilterChange(next: StatusFilter) {
    setStatus(next)
    setPage(1)
  }

  function onSearchChange(val: string) {
    setQ(val)
    setPage(1)
  }

  function onEditLead(lead: Lead) {
    setSelectedLead(lead)
    setIsEditDialogOpen(true)
  }

  function onCloseEditDialog() {
    setIsEditDialogOpen(false)
    setSelectedLead(null)
  }

  // TODO: Implement actual send email functionality
  function onSendEmail(leadId: string) {
    toast.info(`Simulating sending email to lead ${leadId}`)
  }

  function onAddLead() {
    setSelectedLead({
      id: "",
      row_number: null,
      first_name: "",
      last_name: "",
      email: "",
      company: "",
      title: "",
      was_contacted: false,
      reply_date: null,
      created_at: null,
      email_subject: "",
      email_body: "",
      email_sent: false,
    });
    setIsEditDialogOpen(true);
  }


  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search by name, company, or email"
            value={q}
            onChange={e => onSearchChange(e.target.value)}
            className="w-[280px]"
          />
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />
            <select
              value={status}
              onChange={e => onFilterChange(e.target.value as StatusFilter)}
              className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm text-muted-foreground shadow-xs focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="All">All</option>
              <option value="Yes">Contacted</option>
              <option value="No">Pending</option>
            </select>
          </div>
        </div>
        <AddLeadButton onClick={onAddLead} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Name</TableHead>
            <TableHead>
              <button className="inline-flex items-center gap-1" onClick={() => toggleSort("company")}>Company {sortBy === "company" ? (sortDir === "asc" ? <ArrowUpAZ className="size-3" /> : <ArrowDownAZ className="size-3" />) : null}</button>
            </TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>
              <span className="inline-flex items-center gap-1">Status</span>
            </TableHead>
            <TableHead>
              <button className="inline-flex items-center gap-1" onClick={() => toggleSort("reply_date")}>
                Reply {sortBy === "reply_date" ? (sortDir === "asc" ? <ArrowUpAZ className="size-3" /> : <ArrowDownAZ className="size-3" />) : <Calendar className="size-3" />}
              </button>
            </TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((lead, idx) => {
            const fullName = [lead.first_name, lead.last_name].filter(Boolean).join(" ") || "—"
            const contacted = (() => {
              if (typeof lead.was_contacted === "boolean") return lead.was_contacted
              // Removed string handling for was_contacted as it's now boolean | null
              return false
            })()
            const replyDateText = (() => {
              if (!lead.reply_date) return "—"
              const d = new Date(lead.reply_date)
              return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString()
            })()
            const key = lead.ai_table_identifier || `${lead.email ?? "no-email"}-${idx}`
            return (
              <TableRow key={key}>
                <TableCell className="font-medium">{fullName}</TableCell>
                <TableCell>{lead.company || "—"}</TableCell>
                <TableCell>{lead.title || "—"}</TableCell>
                <TableCell>
                  {lead.email ? (
                    <a
                      href={`mailto:${lead.email}`}
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <Mail className="size-3" />
                      {lead.email}
                    </a>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  {contacted ? (
                    <Badge variant={"success"}>Contacted</Badge>
                  ) : (
                    <Badge variant={"warning"}>Pending</Badge>
                  )}
                </TableCell>
                <TableCell>{replyDateText}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditLead(lead)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onSendEmail(lead.id)}
                        disabled={contacted} // Greyed out if already contacted
                      >
                        Send Personalized Email
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <div className="flex items-center justify-center pt-2">
        {hasMore ? (
          <Button onClick={() => setPage(p => p + 1)} disabled={isLoading} variant="outline">
            {isLoading ? "Loading..." : "Load More"}
          </Button>
        ) : (
          <div className="text-xs text-muted-foreground">{totalLeads} leads</div>
        )}
      </div>
      {selectedLead && (
        <EditLeadDialog
          lead={selectedLead}
          isOpen={isEditDialogOpen}
          onClose={onCloseEditDialog}
        />
      )}
    </div>
  )
} 