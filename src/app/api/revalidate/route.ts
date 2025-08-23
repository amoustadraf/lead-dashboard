import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    revalidatePath("/")
    const res = NextResponse.json({ revalidated: true })
    res.headers.set("Cache-Control", "no-store")
    return res
  } catch (e) {
    return NextResponse.json({ revalidated: false, error: (e as Error)?.message || "error" }, { status: 500 })
  }
}




