'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress"; // Assuming you have a Progress component
import { EmailJobProgress } from "@/lib/types";

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string | null;
  onRetryFailures: (failedLeadIds: string[]) => void;
}

export function ProgressModal({
  isOpen,
  onClose,
  jobId,
  onRetryFailures,
}: ProgressModalProps) {
  const [progress, setProgress] = React.useState<EmailJobProgress | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && jobId) {
      setIsLoading(true);
      interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/email-jobs/${jobId}`);
          if (!response.ok) {
            throw new Error("Failed to fetch job progress");
          }
          const data: EmailJobProgress = await response.json();
          setProgress(data);

          if (data.status === "done" || data.status === "error") {
            clearInterval(interval);
            setIsLoading(false);
          }
        } catch (error) {
          console.error("Error polling job status:", error);
          clearInterval(interval);
          setIsLoading(false);
        }
      }, 1500); // Poll every 1.5 seconds
    }
    return () => clearInterval(interval);
  }, [isOpen, jobId]);

  const handleRetry = () => {
    if (progress?.failures) {
      onRetryFailures(progress.failures.map(f => f.lead_id));
    }
  };

  const percentage = progress ? (progress.sent + progress.failed) / progress.total * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sending Emails Progress</DialogTitle>
          <DialogDescription>
            {progress?.status === "done" ? "Emails sent successfully!" : progress?.status === "error" ? "Some emails failed to send." : "Sending emails..."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {isLoading && <Progress value={percentage} className="w-full" />}
          <p>Total: {progress?.total ?? 0}</p>
          <p>Sent: {progress?.sent ?? 0}</p>
          <p>Failed: {progress?.failed ?? 0}</p>
          {progress?.failures && progress.failures.length > 0 && (
            <div>
              <h4 className="font-medium leading-none">Failures:</h4>
              <ul className="list-disc pl-5 mt-2 max-h-40 overflow-y-auto">
                {progress.failures.map((failure, index) => (
                  <li key={index}>Lead ID: {failure.lead_id} - Error: {failure.error}</li>
                ))}
              </ul>
              <Button onClick={handleRetry} className="mt-4">Retry Failures</Button>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose} disabled={isLoading}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
