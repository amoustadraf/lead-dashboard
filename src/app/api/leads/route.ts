import { NextResponse } from "next/server"
export const dynamic = "force-dynamic"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@/app/generated/prisma"

const MAX_PAGE_SIZE = 20

type SortBy = "first_name" | "last_name" | "company" | "title" | "email" | "reply_date" | "created_at"

function parseParams(url: URL) {
  const q = url.searchParams.get("q")?.trim() ?? ""
  const status = url.searchParams.get("status") ?? "All"
  const sortByRaw = (url.searchParams.get("sortBy") ?? "created_at") as SortBy
  const sortDirRaw = (url.searchParams.get("sortDir") ?? "desc").toLowerCase()
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1) || 1)
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Number(url.searchParams.get("pageSize") ?? MAX_PAGE_SIZE) || MAX_PAGE_SIZE)
  )

  const allowedSortBy = new Set<SortBy>([
    "first_name",
    "last_name",
    "company",
    "title",
    "email",
    "reply_date",
    "created_at",
  ])
  const allowedSortDir = new Set(["asc", "desc"]) // keep as string set for TS ease

  const sortBy: SortBy = allowedSortBy.has(sortByRaw) ? sortByRaw : "created_at"
  const sortDir: "asc" | "desc" = (allowedSortDir.has(sortDirRaw) ? sortDirRaw : "desc") as "asc" | "desc"

  return { q, status, sortBy, sortDir, page, pageSize }
}

export async function GET(req: Request) {
  try {
    console.log("Effective DATABASE_URL:", process.env.DATABASE_URL) // <--- here
    const url = new URL(req.url)
    const { q, status, sortBy, sortDir, page, pageSize } = parseParams(url)

    const where: Prisma.ai_table_sheet1WhereInput = {
      AND: [
        q
          ? {
              OR: [
                { first_name: { contains: q, mode: Prisma.QueryMode.insensitive } },
                { last_name: { contains: q, mode: Prisma.QueryMode.insensitive } },
                { company: { contains: q, mode: Prisma.QueryMode.insensitive } },
                { email: { contains: q, mode: Prisma.QueryMode.insensitive } },
              ],
            }
          : {},
        status === "Yes" ? { was_contacted: { equals: true } } : {},
        status === "No" ? { was_contacted: { equals: false } } : {},
      ],
    }

    const skip = (page - 1) * pageSize
    const take = pageSize

    const orderBy = { [sortBy]: sortDir } as Prisma.ai_table_sheet1OrderByWithRelationInput

    const [total, items] = await Promise.all([
      prisma.ai_table_sheet1.count({ where }),
      prisma.ai_table_sheet1.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
          ai_table_identifier: true,
          row_number: true,
          first_name: true,
          last_name: true,
          email: true,
          company: true,
          title: true,
          was_contacted: true,
          reply_date: true,
          created_at: true,
        },
      }),
    ])

    const res = NextResponse.json({ items, total, page, pageSize, hasMore: skip + items.length < total })
    res.headers.set("Cache-Control", "no-store")
    return res
  } catch (error) {
    console.error("/api/leads error", error)
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 })
  }
} 