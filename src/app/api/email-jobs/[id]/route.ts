import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params; // Extract the id from the params object

    const emailJob = await prisma.emailJob.findUnique({
      where: { id },
      include: {
        failures: { select: { lead_id: true, error: true } },
      },
    });

    if (!emailJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const { total, sent, failed, status, failures } = emailJob;

    return NextResponse.json(
      {
        total,
        sent,
        failed,
        status,
        failures: failures.map((f) => ({ lead_id: f.lead_id, error: f.error })),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching email job status:", error);
    return NextResponse.json(
      { error: "Failed to fetch job status", details: error.message },
      { status: 500 }
    );
  }
}
