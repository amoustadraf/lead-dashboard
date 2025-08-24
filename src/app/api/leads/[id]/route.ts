import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await req.json()
    const { first_name, last_name, email, company, title, was_contacted, reply_date, email_subject, email_body, email_sent } = body

    if (!first_name || !last_name || !email) {
      return NextResponse.json({ error: "Missing required fields: first_name, last_name, email" }, { status: 400 })
    }

    const updatedLead = await prisma.lead.update({
      where: { id: id },
      data: {
        first_name,
        last_name,
        email,
        company,
        title,
        was_contacted,
        reply_date: reply_date ? new Date(reply_date) : null,
        email_subject,
        email_body,
        email_sent,
      },
    })

    return NextResponse.json(updatedLead, { status: 200 })
  } catch (error) {
    console.error("Failed to update lead:", error)
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 })
  }
}
