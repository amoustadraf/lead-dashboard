"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

interface Lead {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  company: string | null
  title: string | null
  was_contacted: boolean | null
  reply_date: Date | null
  email_subject: string | null
  email_body: string | null
  email_sent: boolean | null
}

interface EditLeadDialogProps {
  lead: Lead
  isOpen: boolean
  onClose: () => void
}

export function EditLeadDialog({ lead, isOpen, onClose }: EditLeadDialogProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<Lead>(lead)
  const [initialData, setInitialData] = useState<Lead>(lead)
  const [loading, setLoading] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    setFormData(lead)
    setInitialData(lead)
    setIsDirty(false)
  }, [lead])

  useEffect(() => {
    // Check for dirty state by comparing current formData with initialData
    const dirty = JSON.stringify(formData) !== JSON.stringify(initialData)
    setIsDirty(dirty)
  }, [formData, initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type, checked } = e.target as HTMLInputElement
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      was_contacted: checked,
    }))
  }

  const handleEmailSentChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      email_sent: checked,
    }))
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/leads/${formData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to update lead")
      }

      toast.success("Lead updated successfully!")
      onClose()
      router.refresh()
    } catch (error) {
      console.error("Failed to update lead:", error)
      toast.error("Failed to update lead.")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (isDirty) {
      if (window.confirm("You have unsaved changes. Are you sure you want to close?")) {
        onClose()
      }
    } else {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Lead: {lead.first_name} {lead.last_name}</DialogTitle>
          <DialogDescription>
            Make changes to the lead details here. Click update when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleUpdate} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="first_name" className="text-right">First Name</Label>
            <Input id="first_name" value={formData.first_name || ""} onChange={handleChange} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="last_name" className="text-right">Last Name</Label>
            <Input id="last_name" value={formData.last_name || ""} onChange={handleChange} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <Input id="email" type="email" value={formData.email || ""} onChange={handleChange} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="company" className="text-right">Company</Label>
            <Input id="company" value={formData.company || ""} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">Title</Label>
            <Input id="title" value={formData.title || ""} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email_subject" className="text-right">Email Subject</Label>
            <Input id="email_subject" value={formData.email_subject || ""} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email_body" className="text-right">Email Body</Label>
            <Textarea id="email_body" value={formData.email_body || ""} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="was_contacted" className="text-right">Was Contacted</Label>
            <Checkbox
              id="was_contacted"
              checked={formData.was_contacted || false}
              onCheckedChange={handleCheckboxChange}
              className="col-span-3 text-left"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email_sent" className="text-right">Email Sent</Label>
            <Checkbox
              id="email_sent"
              checked={formData.email_sent || false}
              onCheckedChange={handleEmailSentChange}
              className="col-span-3 text-left"
            />
          </div>
          <Button type="submit" disabled={loading || !isDirty}>
            {loading ? "Updating..." : "Update Lead"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
