'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ConfirmSendDialog } from "@/components/ConfirmSendDialog";
import { ProgressModal } from "@/components/ProgressModal";
import { LeadsTable } from "@/components/LeadsTable";
import { Lead, SendEmailItem } from "@/lib/types";
import { fallbackSubject, fallbackBody } from "@/lib/utils";
import { toast } from 'sonner';
import { Input, Textarea, Card, CardContent, CardHeader, CardTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label, Progress } from "@/components/ui";


export default function SendEmailsPage() {
  const [selectedLeads, setSelectedLeads] = useState<Lead[]>([]);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [templateSubject, setTemplateSubject] = useState("");
  const [templateBody, setTemplateBody] = useState("");
  const [useTemplateForMissing, setUseTemplateForMissing] = useState(false);

  const leadsWithDraftsCount = selectedLeads.filter(
    (lead) => lead.email_subject && lead.email_body
  ).length;

  const handleSendAllClick = () => {
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmSend = async (options: { useTemplate: boolean; scheduleAt: Date | null; trackOpens: boolean; batchSize: number; batchDelay: number }) => {
    setIsConfirmDialogOpen(false);
    setUseTemplateForMissing(options.useTemplate);

    const items: SendEmailItem[] = selectedLeads.map((lead) => {
      const subject = options.useTemplate && !lead.email_subject
        ? fallbackSubject(lead)
        : lead.email_subject || fallbackSubject(lead);

      const body = options.useTemplate && !lead.email_body
        ? fallbackBody(lead)
        : lead.email_body || fallbackBody(lead);

      return {
        lead_id: lead.id,
        to: lead.email || null,
        subject,
        body,
        schedule_at: options.scheduleAt?.toISOString() || null,
        track_opens: options.trackOpens,
      };
    });

    try {
      const response = await fetch("/api/emails/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to initiate bulk email send.");
      }

      const data = await response.json();
      setJobId(data.job_id);
      setIsProgressModalOpen(true);
    } catch (error: any) {
      toast.error("Error sending emails", { description: error.message });
      console.error("Error initiating bulk send:", error);
    }
  };

  const handlePersonalizeClick = async () => {
    if (selectedLeads.length === 0) {
      toast.info("Please select leads to personalize.");
      return;
    }
    try {
      const leadIds = selectedLeads.map(lead => lead.id);
      const response = await fetch("/api/personalize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ leadIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to initiate personalization.");
      }

      toast.success("Personalization initiated!", { description: "AI is drafting emails for your selected leads." });
    } catch (error: any) {
      toast.error("Error personalizing emails", { description: error.message });
      console.error("Error initiating personalization:", error);
    }
  };

  const handleRetryFailures = async (failedLeadIds: string[]) => {
    // Re-fetch failed leads and re-send them. This is a simplified retry.
    // In a real application, you might want to fetch the full lead objects again.
    const failedItems: SendEmailItem[] = failedLeadIds.map(leadId => {
      const lead = selectedLeads.find(l => l.id === leadId);
      if (!lead) {
        return null; // Should not happen if failedLeadIds are from selectedLeads
      }
      const subject = useTemplateForMissing && !lead.email_subject
        ? fallbackSubject(lead)
        : lead.email_subject || fallbackSubject(lead);

      const body = useTemplateForMissing && !lead.email_body
        ? fallbackBody(lead)
        : lead.email_body || fallbackBody(lead);

      return {
        lead_id: lead.id,
        to: lead.email || null,
        subject,
        body,
        schedule_at: null, // For retries, we might send immediately
        track_opens: false, // Or keep original setting
      };
    }).filter(Boolean) as SendEmailItem[];

    try {
      const response = await fetch("/api/emails/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: failedItems }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to retry bulk email send.");
      }

      const data = await response.json();
      setJobId(data.job_id); // Update with new job ID for retries
      setIsProgressModalOpen(true);
    } catch (error: any) {
      toast.error("Error retrying emails", { description: error.message });
      console.error("Error retrying bulk send:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="text-2xl font-bold">Send Emails</h1>
        <div className="space-x-2">
          <Button onClick={handlePersonalizeClick} disabled={selectedLeads.length === 0}>
            Personalize with AI ({selectedLeads.length})
          </Button>
          <Button onClick={handleSendAllClick} disabled={selectedLeads.length === 0 || (!useTemplateForMissing && leadsWithDraftsCount !== selectedLeads.length)}>
            Send to all ({selectedLeads.length})
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 flex-grow">
        {/* Audience Column */}
        <Card>
          <CardHeader>
            <CardTitle>Audience</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Selected Leads: {selectedLeads.length}</p>
            <p>With AI Drafts: {leadsWithDraftsCount}</p>
            <p>Will use Template: {selectedLeads.length - leadsWithDraftsCount}</p>
            {/* Add filtering/segmentation options here later */}
          </CardContent>
        </Card>

        {/* Compose Column */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Compose</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subject Template</label>
              <Input
                id="subject"
                value={templateSubject}
                onChange={(e) => setTemplateSubject(e.target.value)}
                placeholder={fallbackSubject({} as Lead)} // Placeholder for template
              />
            </div>
            <div>
              <label htmlFor="body" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Body Template</label>
              <Textarea
                id="body"
                value={templateBody}
                onChange={(e) => setTemplateBody(e.target.value)}
                placeholder={fallbackBody({} as Lead)} // Placeholder for template
                rows={10}
              />
            </div>
            <div>
              <Label htmlFor="email-template-select">Select Template</Label>
              <Select>
                <SelectTrigger id="email-template-select">
                  <SelectValue placeholder="Choose a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="template1">Default Template</SelectItem>
                  <SelectItem value="template2">Follow-up Template</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Preview Column */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Preview (First Selected Lead)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedLeads.length > 0 ? (
              <div className="prose dark:prose-invert">
                <h3 className="text-lg font-semibold">Subject: {selectedLeads[0].email_subject || fallbackSubject(selectedLeads[0])}</h3>
                <p>To: {selectedLeads[0].email}</p>
                <div className="whitespace-pre-wrap">{selectedLeads[0].email_body || fallbackBody(selectedLeads[0])}</div>
              </div>
            ) : (
              <p>Select leads to preview.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="p-4 flex-grow-0">
        <h2 className="text-xl font-bold mb-4">Recipients</h2>
        <LeadsTable 
          onSelectedLeadsChange={setSelectedLeads}
          totalLeads={0} // Placeholder for total leads
          // You might need to pass other props to LeadsTable like onSaved for updates
        />
      </div>

      <ConfirmSendDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={handleConfirmSend}
        selectedLeadCount={selectedLeads.length}
        leadsWithDraftsCount={leadsWithDraftsCount}
      />

      <ProgressModal
        isOpen={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
        jobId={jobId}
        onRetryFailures={handleRetryFailures}
      />
    </div>
  );
}
