"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AddLeadButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      className="flex items-center gap-2 cursor-pointer"
    >
      <Plus className="h-4 w-4" />
      Add Lead
    </Button>
  )
}