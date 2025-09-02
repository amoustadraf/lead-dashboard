import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { items }: {
      items: Array<{ lead_id: string; subject: string; body: string; score?: number; sources?: Array<{ title: string; url: string }> }>
    } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    let updatedCount = 0;
    for (const item of items) {
      await prisma.lead.update({
        where: { id: item.lead_id },
        data: {
          email_subject: item.subject,
          email_body: item.body,
          // You might want to add an ai_status field to the Lead model in schema.prisma
          // For now, we'll just update the subject and body.
          // ai_status: "draft",
        },
      });
      updatedCount++;
    }

    return NextResponse.json({ updated: updatedCount }, { status: 200 });
  } catch (error: any) {
    console.error("Error saving email drafts:", error);
    return NextResponse.json(
      { error: "Failed to save email drafts", details: error.message },
      { status: 500 }
    );
  }
}
