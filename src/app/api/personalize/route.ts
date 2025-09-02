import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { leadIds }: { leadIds: string[] } = await req.json();

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json(
        { error: "No leadIds provided" },
        { status: 400 }
      );
    }

    // Mark leads as pending for personalization (optional, can be used for UI feedback)
    await prisma.lead.updateMany({
      where: { id: { in: leadIds } },
      data: {
        // You might want to add a specific field for AI personalization status, e.g., ai_status: "pending"
      },
    });

    if (!process.env.N8N_HOOK_URL) {
      return NextResponse.json(
        { error: "N8N_HOOK_URL is not defined" },
        { status: 500 }
      );
    }

    // Call n8n webhook in the background
    fetch(process.env.N8N_HOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ job_id: "personalization-" + Date.now(), leadIds }), // Generate a unique job_id
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: any) {
    console.error("Error personalizing emails:", error);
    return NextResponse.json(
      { error: "Failed to personalize emails", details: error.message },
      { status: 500 }
    );
  }
}
