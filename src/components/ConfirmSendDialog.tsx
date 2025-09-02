'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker"; // Assuming you have a DatePicker component

interface ConfirmSendDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options: { useTemplate: boolean; scheduleAt: Date | null; trackOpens: boolean; batchSize: number; batchDelay: number }) => void;
  selectedLeadCount: number;
  leadsWithDraftsCount: number;
}

export function ConfirmSendDialog({
  isOpen,
  onClose,
  onConfirm,
  selectedLeadCount,
  leadsWithDraftsCount,
}: ConfirmSendDialogProps) {
  const [useTemplate, setUseTemplate] = React.useState(false);
  const [scheduleAt, setScheduleAt] = React.useState<Date | null>(null);
  const [trackOpens, setTrackOpens] = React.useState(false);
  const [batchSize, setBatchSize] = React.useState(50);
  const [batchDelay, setBatchDelay] = React.useState(2000);

  const handleConfirm = () => {
    onConfirm({ useTemplate, scheduleAt, trackOpens, batchSize, batchDelay });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Email Send</DialogTitle>
          <DialogDescription>
            You are about to send emails to {selectedLeadCount} selected leads.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p>
            {leadsWithDraftsCount} leads have AI drafts, {selectedLeadCount - leadsWithDraftsCount} will use the template.
          </p>
          <div className="flex items-center space-x-2">
            <Switch
              id="use-template"
              checked={useTemplate}
              onCheckedChange={setUseTemplate}
            />
            <Label htmlFor="use-template">Use template for missing</Label>
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="schedule-at">Schedule Send</Label>
            <DatePicker selected={scheduleAt} onSelect={setScheduleAt} />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="track-opens"
              checked={trackOpens}
              onCheckedChange={setTrackOpens}
            />
            <Label htmlFor="track-opens">Track Opens</Label>
          </div>
          <div className="grid gap-2">
            <h4 className="font-medium leading-none">Advanced Settings</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="batch-size">Batch Size</Label>
                <Input
                  id="batch-size"
                  type="number"
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="batch-delay">Batch Delay (ms)</Label>
                <Input
                  id="batch-delay"
                  type="number"
                  value={batchDelay}
                  onChange={(e) => setBatchDelay(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm}>Send {selectedLeadCount} emails</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
