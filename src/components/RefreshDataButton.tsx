"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Props = {
  sheetId?: string
  tableName?: string
}

export default function RefreshDataButton({ sheetId = "abc123", tableName = "leads" }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">("idle")
  const [err, setErr] = useState<string>("")
  const router = useRouter()

  const baseUrl = process.env.NEXT_PUBLIC_N8N_URL
  const apiKey = process.env.NEXT_PUBLIC_N8N_API_KEY

  async function handleClick() {
    setState("loading")
    setErr("")
    try {
      if (!baseUrl || !apiKey) {
        setErr("Missing NEXT_PUBLIC_N8N_URL or NEXT_PUBLIC_N8N_API_KEY")
        setState("error")
        return
      }
      const res = await fetch(`${baseUrl}/webhook/run-leads`, {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sheetId, tableName }),
      })
      const text = await res.text()
      if (!res.ok) {
        setErr(`HTTP ${res.status}: ${text}`)
        setState("error")
        return
      }
      // Revalidate dashboard route before refreshing client
      try {
        await fetch("/api/revalidate", { method: "POST", cache: "no-store" })
      } catch {}
      setState("ok")
      router.refresh()
      try {
        window.dispatchEvent(new Event("dashboard:refresh"))
      } catch {}
      setTimeout(() => {
        router.refresh()
        try {
          window.dispatchEvent(new Event("dashboard:refresh"))
        } catch {}
      }, 1000)
      setTimeout(() => setState("idle"), 2000)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Network error"
      setErr(message)
      setState("error")
    }
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={handleClick}
        disabled={state === "loading"}
        className={`rounded-md border px-3 py-2 text-sm ${
          state === "loading" ? "bg-neutral-200 cursor-not-allowed" : "bg-neutral-100 hover:bg-neutral-200"
        }`}
        aria-busy={state === "loading"}
        aria-live="polite"
      >
        <span className="text-black">{state === "loading" ? "Refreshing..." : "Refresh data"}</span>
      </button>
      {state === "error" && <span className="text-red-600 text-sm">{err}</span>}
    </div>
  )
}





