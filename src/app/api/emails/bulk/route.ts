import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Lead } from "@prisma/client";

const BATCH_SIZE = 50;
const BATCH_DELAY_MS = 2000;

interface SendEmailItem {
  lead_id: string;
  to: string | null;
  subject: string;
  body: string;
  schedule_at?: string | null;
  track_opens?: boolean;
}

// Helper function to send a single email
async function sendOne(item: SendEmailItem) {
  if (!process.env.MAILER_URL) {
    throw new Error("MAILER_URL is not defined in environment variables.");
  }

  const response = await fetch(process.env.MAILER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to send email");
  }
}

export async function POST(req: Request) {
  try {
    const { items }: { items: SendEmailItem[] } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    const emailJob = await prisma.emailJob.create({
      data: {
        total: items.length,
        status: "queued",
      },
    });

    // Don't block on the entire send operation, fire and forget the worker
    processEmailsInBackground(emailJob.id, items);

    return NextResponse.json({ job_id: emailJob.id }, { status: 200 });
  } catch (error: any) {
    console.error("Error creating email job:", error);
    return NextResponse.json(
      { error: "Failed to create email job", details: error.message },
      { status: 500 }
    );
  }
}

async function processEmailsInBackground(jobId: string, items: SendEmailItem[]) {
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (item) => {
        try {
          await sendOne(item);

          const updatedLead = await prisma.lead.update({
            where: { id: item.lead_id },
            data: {
              was_contacted: true,
              reply_date: item.schedule_at ? new Date(item.schedule_at) : new Date(),
              email_sent: true,
            },
          });

          await prisma.emailJob.update({
            where: { id: jobId },
            data: {
              sent: {
                increment: 1,
              },
            },
          });
        } catch (error: any) {
          console.error(`Failed to send email for lead ${item.lead_id}:`, error);
          await prisma.emailFailure.create({
            data: {
              job_id: jobId,
              lead_id: item.lead_id,
              error: error.message,
            },
          });
          await prisma.emailJob.update({
            where: { id: jobId },
            data: {
              failed: {
                increment: 1,
              },
            },
          });
        }
      })
    );
    await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
  }

  // Update job status to 'done' or 'error' based on failures
  const job = await prisma.emailJob.findUnique({ where: { id: jobId } });
  if (job) {
    await prisma.emailJob.update({
      where: { id: jobId },
      data: {
        status: job.failed > 0 ? "error" : "done",
      },
    });
  }
}
